import fs from "fs";
import JSZip from 'jszip';

class Package {
  packageFile: JSZip;
  selectedModules: string[] = [];
  mergedLangFile: { [key: string]: string; } = {};

  constructor() {
    // Create a new folder for the package, copied from the template
    this.packageFile = new JSZip();
    for (let file of fs.readdirSync('./static/packages/template')) {
      this.packageFile.file(file,
        fs.readFileSync(`./static/packages/template/${file}`),
        { compression: file.endsWith(".mcmeta") ? "DEFLATE" : "STORE" }
      );
    }
  }

  addModule(moduleId: string) {
    // Find module name
    let moduleName = fs.readdirSync(`./static/modules/${moduleId}`).find(file => fs.statSync(`./static/modules/${moduleId}/${file}`).isDirectory());

    // Aggregate lang file data
    if (fs.existsSync(`./static/modules/${moduleId}/${moduleName}/assets/minecraft/lang`)) {
      for (let langFilename of fs.readdirSync(`./static/modules/${moduleId}/${moduleName}/assets/minecraft/lang`)) {
        let langFile = fs.readFileSync(`./static/modules/${moduleId}/${moduleName}/assets/minecraft/lang/${langFilename}`);
        let langFileObj: { [key: string]: string; } = JSON.parse(langFile.toString());
        if (Object.keys(this.mergedLangFile).some(key => Object.keys(langFileObj).includes(key))) {
          console.warn(`Lang key overwrite from ${moduleId}:${langFilename}`);
        }
        Object.assign(this.mergedLangFile, langFileObj);
      }
    }

    // Add module folder to package archive
    this.addFolder(`./static/modules/${moduleId}/${moduleName}`, "");
    this.selectedModules.push(moduleId);
  }

  addFolder(from: string, to: string) {
    let fileBlacklist = ["pack.png", "pack.mcmeta"];
    let folderBlacklist = ["/assets/minecraft/lang"];
    if (folderBlacklist.includes(to)) return;
    for (let file of fs.readdirSync(from, { withFileTypes: true })) {
      if (file.isDirectory()) {
        this.addFolder(`${from}/${file.name}`, `${to}/${file.name}`);
      } else {
        if (fileBlacklist.includes(file.name)) continue;
        this.packageFile.file(
          `${to}/${file.name}`,
          fs.readFileSync(`${from}/${file.name}`),
          { "compression": (file.name.endsWith(".json") || file.name.endsWith(".mcmeta")) ? "DEFLATE" : "STORE" }
        );
      }
    }
  }

  async export() {
    // Set lang file
    if (Object.keys(this.mergedLangFile).length) {
      this.packageFile.file(
        "assets/minecraft/lang/en_us.json",
        JSON.stringify(this.mergedLangFile, null, 2),
        { compression: "DEFLATE" }
      );
    }
    // Add module list file
    let selectedPacksTemplate = "Flame Tweaks Resource Pack\nVersion: 1.20\nPacks:\n\t";
    this.packageFile.file(
      "Selected Packs.txt",
      selectedPacksTemplate + this.selectedModules.join("\n\t"),
      { compression: "DEFLATE" }
    );
    // Return a buffer object
    return this.packageFile.generateAsync({ "type": "nodebuffer" });
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
  // Recieves a list of module names and compiles a package with them
  let modules = await request.json();

  if (!modules.length) {
    return new Response("No modules selected", { status: 400 });
  }

  let pkg = new Package();

  modules = Array.from(new Set(modules)); // Remove duplicates
  for (let moduleId of modules) {
    pkg.addModule(moduleId);
  }

  let zipBlob = await pkg.export();

  // TODO: return a filename and other metadata as well
  console.log(`Package created: ${prettyPrintBytes(zipBlob.byteLength)}`);

  let response = new Response(zipBlob);
  response.headers.set("Content-Type", "application/zip");
  return response;
}