<script lang="ts">
  import { counter_store } from "./get-counter";
  import {format} from "date-fns";
  import { Button } from "$lib/components/ui/button";

  export const increment = () => {
    counter_store.increment($counter_store.total);
  };
</script>

{#await counter_store.init()}
  <p>Loading</p>
{:then}
  <div class="space-y-4">
    <h1 class="text-2xl font-bold">Total: {$counter_store.total}</h1>
    <p>Last Updated: {format($counter_store.lastUpdated, "MM/dd 'at' hh:mm a")}</p>
    <Button on:click={increment} size="lg" class="w-full bg-red-500 hover:bg-red-300" >Add to the Total</Button>
  </div>
{/await}
