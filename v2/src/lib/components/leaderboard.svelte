<script lang="ts">
  import * as Tabs from "$lib/components/ui/tabs";
  import type { LeaderboardData } from "src/pages/api/leaderboard/all";
  import { leaderboard_store } from "./get-leaderboard";

  export let leaderboardData: LeaderboardData;
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
            <p class="text-md">
              Quarter Total: {$leaderboard_store[quarter].total}
            </p>
            <ol class="divide-y divide-solid rounded-lg border-2 p-2">
              {#each $leaderboard_store[quarter].data as player, i}
                <li class="p-2 text-xl">
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
