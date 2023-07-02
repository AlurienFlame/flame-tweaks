import fs from 'fs';
import fse from 'fs-extra';
import zip from "zip-local";

export async function POST({ request }: { request: Request; }) {
  // Recieves a list of module names and compiles a package with them
  let modules = await request.json();

  // Create a new folder for the package
  let packageFolder = `./static/packages/${Date.now()}`;
  fse.copySync(`./static/packages/template`, packageFolder);

  // Copy the modules into the package folder
  for (let module of modules) {
    fse.copySync(`./static/modules/${module}`, `${packageFolder}`);
  }

  // TODO: Add a text file listing the modules in the package

  // Zip the package folder
  let zipped = zip.sync.zip(packageFolder).compress().memory();

  // Clean up the package folder
  fse.removeSync(packageFolder);

  // TODO: return a name as well
  return new Response(zipped);
}