import { error } from '@sveltejs/kit';

export async function load({ fetch }) {
  let modules = await fetch("/api/modules").then((r: Response) => r.json());
  return { modules };
}