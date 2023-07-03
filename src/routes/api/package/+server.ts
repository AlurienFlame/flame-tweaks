import fs from "fs";
import JSZip from 'jszip';

class Package {
  packageFile: JSZip;
  selectedModules: string[] = [];

  constructor() {
    // Create a new folder for the package, copied from the template
    this.packageFile = new JSZip();
    for (let file of fs.readdirSync('./static/packages/template')) {
      this.packageFile.file(file, fs.readFileSync(`./static/packages/template/${file}`));
    }
  }

  addModule(moduleId: string) {
    // TODO: Merge lang files
    // Add module folder to package archive
    this.addFolder(`./static/modules/${moduleId}`, "/");
    this.selectedModules.push(moduleId);
  }

  addFolder(from: string, to: string) {
    for (let file of fs.readdirSync(from, { withFileTypes: true })) {
      if (file.isDirectory()) {
        this.addFolder(`${from}/${file.name}`, `${to}/${file.name}`);
      } else {
        this.packageFile.file(`${to}/${file.name}`, fs.readFileSync(`${from}/${file.name}`));
      }
    }
  }

  async export() {
    // Add module list file
    let selectedPacksTemplate = "Flame Tweaks Resource Pack\nVersion: 1.20\nPacks:\n\t"
    this.packageFile.file("Selected Packs.txt", selectedPacksTemplate + this.selectedModules.join("\n\t"));
    // Return a buffer object
    return this.packageFile.generateAsync({ "type": "nodebuffer"})
  }
}

export async function POST({ request }: { request: Request; }) {
  // Recieves a list of module names and compiles a package with them
  let modules = await request.json();
  let pkg = new Package();

  for (let moduleId of modules) {
    pkg.addModule(moduleId);
  }

  let zipBlob = await pkg.export();

  // // TODO: return a filename and other metadata as well
  return new Response(zipBlob);
}