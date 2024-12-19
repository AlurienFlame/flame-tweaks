<!-- FIXME: Resource pack only works when unzipped | it looks like it's a problem with image encoding settings, because the lang file works fine -->
<!-- Works when decompressed and recompressed by Ark, so it's a problem with how we're compressing. -->
<script lang="ts">
  interface Module {
    "id": string;
    "name": string;
    "description": string;
    "hasIcon": boolean;
    "group": string;
  }

  export let data;
  let modules: Module[] = data.modules;

  // Build groups
  let groups: { [name: string]: Module[] } = {};
  for (let module of modules) {
    if (!Object.keys(groups).includes(module.group)) {
      groups[module.group] = [];
    }
    groups[module.group].push(module);
  }

  // List currently selected modules
  let checkboxValues: { [key: string]: boolean } = {};
  let selectedModules: Module[] = [];
  $: selectedModules = modules.filter((m: Module) => checkboxValues[m.id]);

  // And metadata about the module currently being hovered
  let focusedModule: Module = {
    id: "",
    name: "",
    description: "",
    hasIcon: false,
    group: ""
  };

  // Build and download the package from selected modules
  let downloading = false;
  let pkg: Blob | undefined;
  async function createPackage() {
    pkg = undefined;
    downloading = true;
    let response = await fetch("/api/package", { method: "POST", body: JSON.stringify(selectedModules.map((m) => m.id)) });
    downloading = false;
    pkg = await response.blob();

    // Download
    let url = URL.createObjectURL(pkg);
    let link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "FlameTweaks.zip");
    link.click();
  }

  function toggleAllPicked(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    let allPicked = selectedModules.length === modules.length;
    for (let module of modules) {
      checkboxValues[module.id] = !allPicked;
    }
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
    <a href="https://github.com/AlurienFlame/flame-tweaks" target="_blank" rel="noopener noreferrer"> Source </a>
    <a href="https://github.com/AlurienFlame/flame-tweaks/issues" target="_blank" rel="noopener noreferrer"> Report an Issue </a>
  </header>

  <!-- Module Selection -->
  <div class="modules-panel">
    <button class="button w-fit" on:click={toggleAllPicked}>{selectedModules.length === modules.length ? "Unpick" : "Pick"} All</button>
    {#each Object.entries(groups).sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)) as [groupName, modules]}
      <h3>{groupName}</h3>
      <div class="group">
        {#each modules as mod}
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
              <img src="/modules/{mod.id}/{mod.name}/pack.png" alt="{mod.name} Icon" />
            {/if}
            {mod.name}
          </label>
        {/each}
      </div>
    {/each}
  </div>

  <!-- Sidebar -->
  <div class="download-panel">
    {#if selectedModules.length}
      <!-- List of Selected Modules -->
      <b>Selected</b>
      <div class="selected-modules">
        {#each selectedModules as mod}
          <div>
            {mod.name}
          </div>
        {/each}
      </div>
      <button class="button" on:click={createPackage} disabled={!selectedModules.length || downloading}>Download{downloading ? "ing..." : ""}</button>
    {/if}
    {#if focusedModule}
      <!-- Focused Module Info and Preview -->
      <b>{focusedModule.name}</b>
      {#if focusedModule.hasIcon}
        <!-- TODO: Examples -->
        <img src="/modules/{focusedModule.id}/{focusedModule.name}/pack.png" alt="{focusedModule.name} Icon" />
      {/if}
      <p>{focusedModule.description}</p>
    {/if}
  </div>
</div>

<style>
  :global(body) {
    font-family: sans-serif;
    margin: 0;
    padding: 0;
  }
  img {
    image-rendering: crisp-edges;
  }
  header {
    display: flex;
    align-items: center;
    gap: 2rem;
    grid-column-start: 1;
    grid-column-end: 3;
  }
  header > img {
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
    width: 4rem;
    height: 4rem;
  }

  .download-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .download-panel > img {
    width: 8rem;
    height: 8rem;
  }

  .button {
    border: none;
    background-color: #ddd;
    color: black;
    font-weight: bold;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
  }
  .w-fit {
    width: fit-content;
  }

  .button:hover {
    filter: brightness(0.9);
  }

  .button:active {
    filter: brightness(0.8);
    transform: translateY(0.1rem);
  }

  .selected-modules {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
</style>
