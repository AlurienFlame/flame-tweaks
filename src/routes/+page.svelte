<script lang="ts">
  let modules: string[];
  let pkg: string;

  import { onMount } from "svelte";

  onMount(async () => {
    let response = await fetch("/api/modules");
    modules = await response.json();
    response = await fetch("/api/package");
    pkg = await response.text();
  });
</script>

<svelte:head>
    <title>Flame Tweaks</title> 
</svelte:head>
<h1>Modules</h1>
{#if modules !== undefined}
  <p>Modules: {modules.join(", ")}</p>
{/if}
{#if pkg !== undefined}
  <p>Package: {pkg}</p>
{/if}
