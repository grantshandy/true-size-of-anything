<script lang="ts">
  import Map from "./Map.svelte";
  import { boundaries, search, type Place } from "./nominatim";

  let searchTerms = $state("");
  let loading = $state(false);
  let results: Place[] | string | null = $state(null);

  const executeSearch = async () => {
    loading = true;

    try {
      results = await search(searchTerms);
    } catch (ex) {
      results = `${ex}`;
    }

    loading = false;
  };

  const addBoundary = (place: Place) => {
    searchTerms = "";
    boundaries.set(place);
    results = null;
  };
</script>

<main class="w-full space-y-3 p-4">
  <h1 class="text-3xl">Size Comparison</h1>

  <div class="join-horizontal join">
    <input
      type="text"
      placeholder="Query"
      class="input join-item"
      bind:value={searchTerms}
    />
    <button class="btn join-item" onclick={executeSearch}>Search</button>
  </div>
  {#if loading}
    <span class="loading loading-md loading-spinner"></span>
  {/if}

  {#if typeof results == "string"}
    <div role="alert" class="alert alert-error">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 shrink-0 stroke-current"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>Error: {results}</span>
    </div>
  {:else if results != null && typeof results == "object"}
    <table class="table">
      <thead>
        <tr>
          <th></th>
          <th>Name</th>
          <th>Type</th>
          <th>Select</th>
        </tr>
      </thead>
      <tbody>
        {#each results as result, i}
          <tr>
            <th>{i + 1}</th>
            <td>
              <span class="font-bold">{result.name}</span>
              <br />
              <span class="text-xs">{result.display_name}</span>
            </td>
            <td>{result.type}</td>
            <td>
              <button class="link" onclick={() => addBoundary(result)}
                >Add</button
              >
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}

  <Map />
</main>
