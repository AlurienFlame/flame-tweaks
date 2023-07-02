<script lang="ts">
  let modules: string;
  let pkg: string;

  import { onMount } from "svelte";

  onMount(async () => {
    let response = await fetch("/api/modules");
    modules = await response.text();
    response = await fetch("/api/package");
    pkg = await response.text();
  });
</script>

<div>
  <h1>Modules</h1>
  {#if modules !== undefined}
    <p>Response: {modules}</p>
  {/if}
  {#if pkg !== undefined}
    <p>Response: {pkg}</p>
  {/if}
</div>
