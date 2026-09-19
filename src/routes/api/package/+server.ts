import fs from "fs";
import JSZip from 'jszip';
import { packFilenameFor, packFormatFor, packMetadata } from '$lib/pack-versions';

function compressionFor(filename: string) {
  return filename.endsWith(".json") || filename.endsWith(".mcmeta") || filename.endsWith(".ogg") || filename == "ender_pearl.png" ? "DEFLATE" : "STORE";
}

class Package {
  packageFile: JSZip;
  selectedModules: string[] = [];
  mergedLangFile: { [key: string]: string; } = {};

  constructor(public minecraftVersion: string, public packFormat: string) {
    // Create a new folder for the package, copied from the template
    this.packageFile = new JSZip();
    for (let file of fs.readdirSync('./static/packages/template')) {
      if (file === 'pack.mcmeta') continue;
      // Add file to package
      this.packageFile.file(file,
        fs.readFileSync(`./static/packages/template/${file}`, {encoding: "base64"}),
        {
          compression: compressionFor(file),
          base64: true,
          unixPermissions: 0o664,
        }
      );
    }
  }

  addModule(moduleId: string) {
    const moduleRoot = `./static/modules/${moduleId}/versions/${this.packFormat}`;
    let moduleName = fs.readdirSync(moduleRoot).find(file => fs.statSync(`${moduleRoot}/${file}`).isDirectory());

    // Aggregate lang file data
    if (fs.existsSync(`${moduleRoot}/${moduleName}/assets/minecraft/lang`)) {
      for (let langFilename of fs.readdirSync(`${moduleRoot}/${moduleName}/assets/minecraft/lang`)) {
        let langFile = fs.readFileSync(`${moduleRoot}/${moduleName}/assets/minecraft/lang/${langFilename}`);
        let langFileObj: { [key: string]: string; } = JSON.parse(langFile.toString());
        if (Object.keys(this.mergedLangFile).some(key => Object.keys(langFileObj).includes(key))) {
          console.warn(`Lang key overwrite from ${moduleId}:${langFilename}`);
        }
        Object.assign(this.mergedLangFile, langFileObj);
      }
    }

    // Add module folder to package archive
    this.addFolder(`${moduleRoot}/${moduleName}`, "");
    this.selectedModules.push(moduleId);
  }

  addFolder(from: string, to: string) {
    let fileBlacklist = ["pack.png", "pack.mcmeta"];
    let folderBlacklist = ["assets/minecraft/lang"];
    if (folderBlacklist.includes(to)) return;
    for (let file of fs.readdirSync(from, { withFileTypes: true })) {
      const toPath = to ? `${to}/${file.name}` : file.name;
      if (file.isDirectory()) {
        this.addFolder(`${from}/${file.name}`, toPath);
      } else {
        if (fileBlacklist.includes(file.name)) continue;
        // Add file to package
        this.packageFile.file(
          toPath,
          fs.readFileSync(`${from}/${file.name}`, {encoding: "base64"}),
          {
            compression: compressionFor(file.name),
            base64: true,
            unixPermissions: 0o664,
          }
        );
      }
    }
  }

  async export() {
    const template = JSON.parse(fs.readFileSync('./static/packages/template/pack.mcmeta', 'utf8'));
    this.packageFile.file("pack.mcmeta", JSON.stringify(packMetadata(this.packFormat, template.pack.description), null, 2));
    // Set lang file
    if (Object.keys(this.mergedLangFile).length) {
      this.packageFile.file(
        "assets/minecraft/lang/en_us.json",
        JSON.stringify(this.mergedLangFile, null, 2),
        { compression: "DEFLATE" }
      );
    }
    // Add module list file
    let selectedPacksTemplate = `Flame Tweaks Resource Pack\nVersion: ${this.minecraftVersion}\nPack format: ${this.packFormat}\nPacks:\n\t`;
    this.packageFile.file(
      "Selected Packs.txt",
      selectedPacksTemplate + this.selectedModules.join("\n\t"),
      { compression: "DEFLATE" }
    );
    // Return a buffer object
    return this.packageFile.generateAsync({ platform: "UNIX", type: "nodebuffer" });
  }
}

function prettyPrintBytes(bytes: number) {
  let units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (bytes > 1024) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

export async function POST({ request }: { request: Request; }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  if (!body || !Array.isArray(body.modules) || !body.modules.length ||
      !body.modules.every((id: unknown) => typeof id === "string")) {
    return new Response("Select at least one valid module", { status: 400 });
  }
  const format = packFormatFor(body.minecraftVersion);
  if (!format) return new Response("Unsupported Minecraft version", { status: 400 });

  const availableModules = fs.readdirSync('./static/modules', { withFileTypes: true })
    .filter(entry => entry.isDirectory()).map(entry => entry.name);
  const modules = Array.from(new Set<string>(body.modules));
  if (modules.some(id => !availableModules.includes(id))) {
    return new Response("Unknown module", { status: 400 });
  }
  let pkg = new Package(body.minecraftVersion, format);
  for (let moduleId of modules) {
    pkg.addModule(moduleId);
  }

  let zipBlob = await pkg.export();

  // TODO: return a filename and other metadata as well
  console.log(`Package created: ${prettyPrintBytes(zipBlob.byteLength)}`);

  let response = new Response(zipBlob);
  response.headers.set("Content-Type", "application/zip");
  response.headers.set("Content-Disposition", `attachment; filename="${packFilenameFor(body.minecraftVersion)}"`);
  return response;
}