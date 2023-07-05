<script lang="ts">
  interface Module {
    "id": string;
    "name": string;
    "description": string;
    "hasIcon"?: boolean;
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

<!-- TODO: Font -->
<svelte:head>
  <title>Flame Tweaks</title>
</svelte:head>

<div class="container">
  <header>
    <img src="/favicon.png" alt="Flame Tweaks Logo" />
    <h1>Flame Tweaks</h1>
  </header>

  <!-- Module Selection -->
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
            {#if mod.hasIcon}
              <!-- TODO: Animated icons for some modules -->
              <img src="/modules/{mod.id}/pack.png" alt="{mod.name} Icon" />
            {/if}
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
    <button class="download-button" on:click={createPackage} disabled={!selectedModules.length}>Download</button>
    <b>{focusedModule?.name}</b>
    {#if focusedModule.hasIcon}
      <!-- TODO: Examples -->
      <img src="/modules/{focusedModule.id}/pack.png" alt="{focusedModule.name} Icon" />
    {/if}
    <p>{focusedModule?.description}</p>
  </div>
</div>

<style>
  header {
    display: flex;
    align-items: center;
    gap: 2rem;
    grid-column-start: 1;
    grid-column-end: 3;
  }
  header > img {
    image-rendering: crisp-edges;
    width: 4rem;
    height: 4rem;
  }
  header > img:hover {
    transform: rotate(360deg);
    transition: transform 1s ease-out;
  }
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
    display: flex;
    flex-direction: column;
    justify-content: end;
    align-items: center;
    gap: 0.5rem;
    user-select: none;
  }

  .module:hover {
    filter: brightness(0.9);
  }

  .module > img {
    image-rendering: crisp-edges;
    width: 4rem;
    height: 4rem;
  }

  .download-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .download-panel > img {
    image-rendering: crisp-edges;
    width: 8rem;
    height: 8rem;
  }

  .download-button {
    border: none;
    background-color: #ddd;
    color: black;
    font-weight: bold;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
  }

  .download-button:hover {
    filter: brightness(0.9);
  }

  .download-button:active {
    filter: brightness(0.8);
    transform: translateY(0.1rem);
  }

  .selected-modules {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
</style>
