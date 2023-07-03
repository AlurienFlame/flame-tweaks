<script lang="ts">
  import modules from "$lib/modules";
  let selected: Record<string, boolean> = {};
  $: selectedModules = Object.keys(selected).filter((k) => selected[k]);

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

<!-- Module Selection -->
<div class="column">
  {#each modules as group}
    <h3>{group.name}</h3>
    {#each group.modules as mod}
      <label for={mod.id}> {mod.name} </label>
      <input type="checkbox" id={mod.id} bind:checked={selected[mod.id]} />
    {/each}
  {/each}
</div>

<!-- Download Package -->
<button on:click={createPackage}>Create Package</button>
{#if pkg !== undefined}
  <a href={URL.createObjectURL(pkg)} download="FlameTweaks.zip">Download</a>
{/if}

<style>
  .column {
    display: flex;
    flex-direction: column;
  }
</style>
