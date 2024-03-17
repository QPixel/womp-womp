<script lang="ts">
  import { counter_store } from "./get-counter";
  import {format} from "date-fns";
  import { Button } from "$lib/components/ui/button";

  let didError = false;
  let error = "";
  export const increment = () => {
    counter_store.increment().catch((e) => {
      didError = true;
      error = e.message;
    });
  };
</script>

{#await counter_store.init()}
  <p>Loading</p>
{:then}
  <div class="space-y-4">
    <h1 class="text-2xl font-bold">Riley has Womp Womp'd: {$counter_store.total}</h1>
    <p>Last Updated: {format($counter_store.lastUpdated, "MM/dd 'at' hh:mm a")}</p>
    {#if didError}
      <p class="text-red-500">{error}</p>
    {/if}
    <Button on:click={increment} size="lg" class="w-full bg-red-500 hover:bg-red-300 font-bold text-xl" >Add to the Total</Button>
  </div>
{/await}
