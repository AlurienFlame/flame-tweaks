export const packVersions = [
  {
    format: "97.1",
    versions: ["26.3"],
    snapshots: ["26.3-rc-3", "26.3-rc-2", "26.3-rc-1", "26.3-pre-3", "26.3-pre-2", "26.3-pre-1"]
  },
  {
    format: "46",
    versions: ["1.21.4"],
    snapshots: ["1.21.4-rc3", "1.21.4-rc2", "1.21.4-rc1", "1.21.4-pre3", "1.21.4-pre2", "1.21.4-pre1"]
  }
];

export const defaultMinecraftVersion = "26.3";

export function packFormatFor(version: string): string | undefined {
  return packVersions.find(pack => pack.versions.includes(version) || pack.snapshots.includes(version))?.format;
}

export function packMetadata(format: string, description: string) {
  if (!packVersions.some(pack => pack.format === format)) {
    throw new Error("Unsupported pack format");
  }
  const [major, minor] = format.split(".").map(Number);
  return major < 65
    ? { pack: { pack_format: major, description } }
    : { pack: { min_format: [major, minor], max_format: [major, minor], description } };
}
