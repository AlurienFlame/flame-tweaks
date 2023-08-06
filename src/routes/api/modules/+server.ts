import fs from "fs";

function snakeToTitleCase(str: string) {
  return str.replace(/_/g, " ").replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

export async function GET() {
  interface Module {
    "id": string;
    "name": string;
    "description": string;
    "hasIcon"?: boolean;
  }

  // Return a list of module metadata
  let moduleMetadataList: Module[] = [];

  // Get a list of folders in the modules directory
  for (let dirName of fs.readdirSync('./static/modules')) {
    let packMetadata = JSON.parse(fs.readFileSync(`./static/modules/${dirName}/pack.mcmeta`, { encoding: "ascii" }));
    let moduleMetadata: Module = {
      id: dirName,
      name: snakeToTitleCase(dirName), // Get into title case from snake case
      description: packMetadata.pack.description,
      hasIcon: fs.existsSync(`./static/modules/${dirName}/pack.png`),
    };
    moduleMetadataList.push(moduleMetadata);
  }

  return new Response(JSON.stringify(moduleMetadataList, null, 2), {
    headers: { "content-type": "application/json" },
  });
}