<script lang="ts">
  import { search, type Place } from "./nominatim";

  let {
    onResult,
    error = $bindable(),
  }: { onResult: (place: Place) => void; error: string | null } = $props();

  let searchTerms = $state("");
  let loading = $state(false);
  let results: Place[] | null = $state(null);

  const executeSearch = async () => {
    loading = true;

    try {
      results = await search(searchTerms);
    } catch (ex) {
      error = `fetching results: ${ex}`;
    }

    loading = false;
  };

  const fireResult = (place: Place) => {
    searchTerms = "";
    results = null;
    onResult(place);
  };
</script>

<div class="max-h-full w-full space-y-3 overflow-y-auto">
  <div class="flow-root w-full space-x-3">
    <div class="join-horizontal join">
      <input
        type="text"
        placeholder="Query"
        class="input input-sm join-item grow"
        bind:value={searchTerms}
        onkeydown={(e) => e.key === "Enter" && executeSearch()}
      />
      <button class="btn join-item btn-sm" onclick={executeSearch}
        >Search</button
      >
    </div>

    {#if loading}
      <span class="loading float-right loading-md loading-spinner"></span>
    {/if}
  </div>

  {#if results != null && typeof results == "object"}
    <div class="max-h-full">
      {#if results.length == 0}
        <p>No Results Found.</p>
      {:else}
        <table class="table w-full">
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
                  <button class="link" onclick={() => fireResult(result)}
                    >Add</button
                  >
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  {/if}
</div>
