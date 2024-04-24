<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import type { LeaderboardData } from '$lib/db/leaderboard';
	import { InfoIcon } from 'lucide-svelte';
	import { leaderboard_store } from './get-leaderboard';

	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';

	export let leaderboardData: LeaderboardData;
	export let leaderboardQuarters: string[];
	console.log(leaderboardData);
	console.log(leaderboardQuarters);
	leaderboard_store.init(leaderboardData);
</script>

{#if $leaderboard_store}
	<div class="space-y-4">
		<Tabs.Root value={leaderboardQuarters[0]}>
			<Tabs.List>
				{#each leaderboardQuarters as quarter}
					{#if quarter === 'all_time'}
						<Tabs.Trigger value={quarter}>All Time</Tabs.Trigger>
					{:else}
						<Tabs.Trigger value={quarter}>
							{quarter}
						</Tabs.Trigger>
					{/if}
				{/each}
			</Tabs.List>
			{#each leaderboardQuarters as quarter}
				<Tabs.Content value={quarter}>
					<div class="space-y-4">
						{#if quarter === 'all_time'}
							<Alert>
								<InfoIcon class="h-4 w-4" />
								<AlertTitle>Heads up!</AlertTitle>
								<AlertDescription>
									This feature is still in beta! The all-time leaderboard may not be accurate nor
									auto update!
								</AlertDescription>
							</Alert>
						{/if}
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
