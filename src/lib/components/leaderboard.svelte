<script lang="ts">
  import { leaderboard_store } from "./get-leaderboard";
  import * as Tabs from "$lib/components/ui/tabs";

  export let leaderboardData: any;
  export let leaderboardQuarters: string[];
  leaderboard_store.init(leaderboardData);

</script>

{#if $leaderboard_store}
<div class="space-y-4">
  <Tabs.Root value={leaderboardQuarters[0]}>
    <Tabs.List>
      {#each leaderboardQuarters as quarter}
        <Tabs.Trigger value={quarter}>{quarter}</Tabs.Trigger>
      {/each}
    </Tabs.List>
    {#each leaderboardQuarters as quarter}
      <Tabs.Content value={quarter}>
        <div class="space-y-4">
          <ol class="divide-solid divide-y border-2 rounded-lg p-2">
            {#each $leaderboard_store[quarter] as player, i}
              <li class="text-xl p-2">
                {i + 1}. {player.resolved_username} - {player.total}
              </li>
            {/each}
          </ol>
        </div>
      </Tabs.Content>
    {/each}
  </Tabs.Root>
</div>
{:else}
  <p>No players have been added to the leaderboard yet.</p>
{/if}
