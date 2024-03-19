<script lang="ts">
  import { counter_store } from "./get-counter";
  import { format } from "date-fns";
  import { Button } from "$lib/components/ui/button";
  import { leaderboard_store } from "./get-leaderboard";

  export let isAuthed: boolean;
  export let id: number | undefined;
  let didError = false;
  let error = "";
  export const increment = () => {
    counter_store.increment().catch((e) => {
      didError = true;
      error = e.message;
    });
    leaderboard_store.update_local(id!);
  };
</script>

{#await counter_store.init()}
  <p>Loading</p>
{:then}
  <div class="space-y-4 flex flex-col justify-center">
    <h1 class="text-3xl font-semibold w-full text-center">
      Riley has said
      <br class="md:hidden"/>Womp Womp
    </h1>
    <h1 class="text-red-500 text-center text-3xl font-semibold rounded-lg border px-9 py-2 w-fit mx-auto">{$counter_store.total} times</h1>
    <p class="text-center">
      Last Updated: {format($counter_store.lastUpdated, "MM/dd 'at' hh:mm a")} by {$counter_store.resolved_username}
    </p>
    {#if didError}
      <p class="text-red-500">{error}</p>
    {/if}
    {#if isAuthed}
      <Button
        on:click={increment}
        size="lg"
        class="w-full bg-red-500 hover:bg-red-300 font-bold text-xl"
        disabled={didError}>Add to the Total</Button
      >
    {/if}
  </div>
{/await}
