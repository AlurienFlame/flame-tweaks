<script lang="ts">
  interface Module {
    "id": string;
    "name": string;
    "description": string;
  }
  interface Group {
    "name": string;
    "modules": Module[];
  }
  import groups from "$lib/modules";
  let checkboxValues: { [key: string]: boolean } = {};
  let modules: Module[] = groups.flatMap((g: Group) => g.modules);
  let selectedModules: Module[] = [];
  $: selectedModules = modules.filter((m) => checkboxValues[m.id]);

  let focusedModule: Module = {
    id: "",
    name: "",
    description: ""
  };

  let pkg: Blob | undefined;
  async function createPackage() {
    pkg = undefined;
    let response = await fetch("/api/package", { method: "POST", body: JSON.stringify(selectedModules.map((m) => m.id)) });
    pkg = await response.blob();

    // Download
    let url = URL.createObjectURL(pkg);
    let link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "FlameTweaks.zip");
    link.click();
  }
</script>

<svelte:head>
  <title>Flame Tweaks</title>
</svelte:head>

<!-- Module Selection -->
<div class="container">
  <div class="modules-panel">
    {#each groups as group}
      <h3>{group.name}</h3>
      <div class="group">
        {#each group.modules as mod}
          <input class="module-checkbox" type="checkbox" id={mod.id} bind:checked={checkboxValues[mod.id]} />
          <label
            class="module"
            for={mod.id}
            title={mod.description}
            on:mouseover={() => {
              focusedModule = mod;
            }}
            on:focus={() => {
              focusedModule = mod;
            }}
          >
            {mod.name}
          </label>
        {/each}
      </div>
    {/each}
  </div>

  <!-- Download Package -->
  <div class="download-panel">
    <b>Selected</b>
    <div class="selected-modules">
      {#each selectedModules as mod}
        <div>
          {mod.name}
        </div>
      {/each}
    </div>
    <button on:click={createPackage}>Download</button>
    <b>{focusedModule?.name}</b>
    <p>{focusedModule?.description}</p>
  </div>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: 5fr 1fr;
    margin: 2rem 15%;
    gap: 1rem;
  }
  @media (max-width: 600px) {
    .container {
      grid-template-columns: 1fr;
      margin: 2rem 1rem;
    }
  }

  .modules-panel {
    display: flex;
    flex-direction: column;
  }

  .group {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .module-checkbox {
    display: none;
  }

  .module-checkbox:checked + .module {
    filter: brightness(0.8);
  }

  .module {
    padding: 1rem;
    border-radius: 0.5rem;
    background-color: #ddd;
    cursor: pointer;
    transition: filter 0.2s;
  }

  .module:hover {
    filter: brightness(0.9);
  }

  .download-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .selected-modules {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
</style>
