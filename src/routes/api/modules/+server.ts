import fs from 'fs';

export function GET({ url }: { url: URL; }) {
  // Read in all folders in static/modules and return their names as an array
  let files = fs.readdirSync('./static/modules');
  return new Response(JSON.stringify(files));
}