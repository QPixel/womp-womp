<script lang="ts">
  import { counter_store } from "./get-counter";
  import { format } from "date-fns";
  import { Button } from "$lib/components/ui/button";
  import { leaderboard_store } from "./get-leaderboard";
  import type { CounterData } from "src/pages/api/counter";

  export let isAuthed: boolean;
  export let id: number | undefined;
  export let serverData: CounterData;

  let didError = false;
  let error = "";
  export const increment = async () => {
    await counter_store.increment().then((resolved_username) => {
      leaderboard_store.update_local(id!, resolved_username);
    }).catch((e) => {
      didError = true;
      error = e.message;
      return "";
    });
  };
  counter_store.init(serverData);
</script>


<div class="space-y-4 flex flex-col justify-center">
  <h1 class="text-3xl font-semibold w-full text-center">
    Riley has said
    <br class="md:hidden"/>Womp Womp
  </h1>
  <h1 class="text-red-500 text-center text-3xl font-semibold rounded-lg border px-9 py-2 w-fit mx-auto">{$counter_store.total} times</h1>
  <p class="text-center">
    Last Updated: {format($counter_store.last_updated, "MM/dd 'at' hh:mm a")} by {$counter_store.resolved_username}
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
