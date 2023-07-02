import fse from 'fs-extra';
import zip from "zip-local";

class Package {
  packageFolder = `./static/packages/${Date.now()}`;

  constructor() {
    // Create a new folder for the package
    fse.copySync(`./static/packages/template`, this.packageFolder);
  }

  addModule(moduleId: string) {
    // TODO: Merge lang files
    // TODO: Add a text file listing the modules in the package
    // Copy the modules into the package folder
    fse.copySync(`./static/modules/${moduleId}`, `${this.packageFolder}`);
  }

  export() {
    // Zip the package folder
    return zip.sync.zip(this.packageFolder).compress().memory();
  }

  cleanUp() {
    // Clean up the package folder
    fse.removeSync(this.packageFolder);
  }
}

export async function POST({ request }: { request: Request; }) {
  // Recieves a list of module names and compiles a package with them
  let modules = await request.json();
  let pkg = new Package();

  for (let moduleId of modules) {
    pkg.addModule(moduleId);
  }

  let zipBlob = pkg.export();

  pkg.cleanUp();

  // TODO: return a filename and other metadata as well
  return new Response(zipBlob);
}