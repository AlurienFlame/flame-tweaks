import fs from "fs";

export async function GET() {
  // TODO: Unified types library or just remove typescript already
  interface Module {
    "id": string;
    "name"?: string;
    "description"?: string;
    "hasIcon"?: boolean;
    "group"?: string;
  }

  // Return a list of module metadata
  let moduleMetadataList: Module[] = [];

  // Get a list of folders in the modules directory
  for (let moduleDirName of fs.readdirSync('./static/modules')) {
    let moduleMetadata: Module = {
      id: moduleDirName,
    };
    for (let moduleContent of fs.readdirSync(`./static/modules/${moduleDirName}`)) {
      if (moduleContent === "metadata.json") {
        let extraMetadata = JSON.parse(fs.readFileSync(`./static/modules/${moduleDirName}/metadata.json`, { encoding: "ascii" }));
        moduleMetadata.group = extraMetadata.group;
      } else {
        // If it's not metadata.json, it must be the pack folder
        moduleMetadata.name = moduleContent;
        let packMetadata = JSON.parse(fs.readFileSync(`./static/modules/${moduleDirName}/${moduleContent}/pack.mcmeta`, { encoding: "ascii" }));
        moduleMetadata.description = packMetadata.pack.description;
        moduleMetadata.hasIcon = fs.existsSync(`./static/modules/${moduleDirName}/${moduleContent}/pack.png`);
      }
    }
    moduleMetadataList.push(moduleMetadata);
  }

  return new Response(JSON.stringify(moduleMetadataList, null, 2), {
    headers: { "content-type": "application/json" },
  });
}