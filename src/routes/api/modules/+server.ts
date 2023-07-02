import { error } from '@sveltejs/kit';

export function GET({ url }: { url: URL; }) {
  return new Response(`Hello from ${url.pathname}!`);
}