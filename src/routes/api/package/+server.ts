import fs from 'fs';
import fse from 'fs-extra';
import zip from "zip-local";

export async function POST({ request }: { request: Request; }) {
  // Recieves a list of module names and compiles a package with them
  let modules = await request.json();

  // Create a new folder for the package
  let packageFolder = `/home/lucien/dev/flame-tweaks/static/packages/${Date.now()}`;
  fs.mkdirSync(packageFolder);

  // Copy the modules into the package folder
  for (let module of modules) {
    fse.copySync(`/home/lucien/dev/flame-tweaks/static/modules/${module}`, `${packageFolder}/${module}`);
  }

  // Zip the package folder
  let zipped = zip.sync.zip(packageFolder).compress().memory();

  // Clean up the package folder
  fse.removeSync(packageFolder);

  return new Response(zipped);
}