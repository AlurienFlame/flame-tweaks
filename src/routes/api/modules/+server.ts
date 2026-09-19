import fs from "fs";
import { defaultMinecraftVersion, packFormatFor } from '$lib/pack-versions';

export async function GET() {
  // TODO: Unified types library or just remove typescript already
  interface Module {
    "id": string;
    "name"?: string;
    "description"?: string;
    "hasIcon"?: boolean;
    "iconUrl"?: string;
    "group"?: string;
  }

  // Return a list of module metadata
  let moduleMetadataList: Module[] = [];

  // Get a list of folders in the modules directory
  for (let moduleDirName of fs.readdirSync('./static/modules')) {
    let moduleMetadata: Module = {
      id: moduleDirName,
    };
    const moduleRoot = `./static/modules/${moduleDirName}`;
    const versionPath = `/modules/${moduleDirName}/versions/${packFormatFor(defaultMinecraftVersion)}`;
    const packName = fs.readdirSync(`./static${versionPath}`)
      .find(file => fs.statSync(`./static${versionPath}/${file}`).isDirectory());
    const packPath = `${versionPath}/${packName}`;
    const extraMetadata = JSON.parse(fs.readFileSync(`${moduleRoot}/metadata.json`, { encoding: "ascii" }));
    const packMetadata = JSON.parse(fs.readFileSync(`./static${packPath}/pack.mcmeta`, { encoding: "ascii" }));
    moduleMetadata.group = extraMetadata.group;
    moduleMetadata.name = packName;
    moduleMetadata.description = packMetadata.pack.description;
    moduleMetadata.hasIcon = fs.existsSync(`./static${packPath}/pack.png`);
    moduleMetadata.iconUrl = `${packPath}/pack.png`;
    moduleMetadataList.push(moduleMetadata);
  }

  return new Response(JSON.stringify(moduleMetadataList, null, 2), {
    headers: { "content-type": "application/json" },
  });
}