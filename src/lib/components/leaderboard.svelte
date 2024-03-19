<script lang="ts">
  import { leaderboard_store } from "./get-leaderboard";
</script>

{#await leaderboard_store.init()}
  <p>Loading</p>
{:then}
  {#if $leaderboard_store.length !== 0}
    <div class="space-y-4">
      <ol class="divide-solid divide-y border-2 rounded-lg p-2">
        {#each $leaderboard_store as player, i}
          <li class="text-xl p-2">
            {i + 1}. {player.resolved_username} - {player.total}
          </li>
        {/each}
      </ol>
    </div>
  {:else}
    <p>No players have been added to the leaderboard yet.</p>
  {/if}
{:catch error}
  <p class="text-red-500">{error.message}</p>
{/await}
