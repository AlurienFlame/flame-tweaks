<script lang="ts">
  let modules: string[];
  let pkg: Blob;

  import { onMount } from "svelte";

  onMount(async () => {
    let response = await fetch("/api/modules");
    modules = await response.json();
    response = await fetch("/api/package", { method: "POST", body: JSON.stringify(modules) });
    pkg = await response.blob();
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
  <a href={URL.createObjectURL(pkg)} download="package.zip">Download</a>
{/if}
