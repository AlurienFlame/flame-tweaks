<script lang="ts">
  import { defaultMinecraftVersion, packVersions } from '$lib/pack-versions';

  let minecraftVersion = defaultMinecraftVersion;
  let showSnapshots = false;
  $: visibleVersions = packVersions.flatMap(pack =>
    showSnapshots ? [...pack.versions, ...pack.snapshots] : pack.versions);

  function toggleSnapshots(event: Event) {
    showSnapshots = (event.currentTarget as HTMLInputElement).checked;
    if (!showSnapshots) {
      const pack = packVersions.find(pack => pack.snapshots.includes(minecraftVersion));
      if (pack) minecraftVersion = pack.versions[0];
    }
  }

  interface Module {
    "id": string;
    "name": string;
    "description": string;
    "hasIcon": boolean;
    "iconUrl": string;
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
    iconUrl: "",
    group: ""
  };

  // Build and download the package from selected modules
  let downloading = false;
  let downloadError = "";
  async function createPackage() {
    downloadError = "";
    downloading = true;
    try {
      const response = await fetch("/api/package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modules: selectedModules.map(m => m.id), minecraftVersion })
      });
      if (!response.ok) throw new Error(await response.text());
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = "FlameTweaks.zip";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      downloadError = error instanceof Error ? error.message : "Download failed";
    } finally {
      downloading = false;
    }
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
  <meta name="description" content="Assorted texture tweaks by AlurienFlame." />
  <meta property="og:title" content="Flame Tweaks" />
  <meta property="og:site_name" content="Flame Tweaks." />
  <meta property="og:type" content="website" />
  <meta property="og:description" content="Assorted texture tweaks by AlurienFlame." />
  <meta property="og:url" content="https://flame-tweaks.netlify.app/" />
  <meta property="og:image" content="https://flame-tweaks.netlify.app/favicon.png" />
  <meta name="twitter:image:alt" content="The Minecraft observer texture, edited to look like it's raising an eyebrow" />
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
              <img src={mod.iconUrl} alt="{mod.name} Icon" />
            {/if}
            {mod.name}
          </label>
        {/each}
      </div>
    {/each}
  </div>

  <!-- Sidebar -->
  <div class="download-panel">
    <label for="minecraft-version">Minecraft version</label>
    <select id="minecraft-version" bind:value={minecraftVersion} disabled={downloading}>
      {#each visibleVersions as version}
        <option value={version}>{version}</option>
      {/each}
    </select>
    <label title="Include compatible snapshots, pre-releases, and release candidates">
      <input type="checkbox" checked={showSnapshots} on:change={toggleSnapshots} disabled={downloading} />
      Show snapshots
    </label>
    {#if downloadError}
      <p role="alert">{downloadError}</p>
    {/if}
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
        <img src={focusedModule.iconUrl} alt="{focusedModule.name} Icon" />
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
