<script lang="ts">
  let modules: string[];
  let selected: Record<string, boolean> = {};
  $: selectedModules = Object.keys(selected).filter((k) => selected[k]);

  import { onMount } from "svelte";

  onMount(async () => {
    let response = await fetch("/api/modules");
    modules = await response.json();
  });

  let pkg: Blob | undefined;
  async function createPackage() {
    pkg = undefined;
    let response = await fetch("/api/package", { method: "POST", body: JSON.stringify(selectedModules) });
    pkg = await response.blob();
  }
</script>

<svelte:head>
  <title>Flame Tweaks</title>
</svelte:head>

<h1>Modules</h1>

<!-- Module Selection -->
<form>
  {#each modules || [] as m}
    <label for={m}>{m}</label>
    <input type="checkbox" id={m} value={m} bind:checked={selected[m]} />
  {/each}
</form>

<!-- Download Package -->
<button on:click={createPackage}>Create Package</button>
{#if pkg !== undefined}
  <a href={URL.createObjectURL(pkg)} download="package.zip">Download</a>
{/if}
