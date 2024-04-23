<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { format } from 'date-fns';
	import type { CounterData } from '$lib/db/counter';
	import { counter_store } from './get-counter';
	import { leaderboard_store } from './get-leaderboard';

	export let isAuthed: boolean;
	export let id: number | null;
	export let counterData: CounterData;
	export let currentQuarter: string;

	let didError = false;
	let error = '';
	export const increment = async () => {
		await counter_store
			.increment()
			.then((resolved_username) => {
				leaderboard_store.update_local(id!, resolved_username, currentQuarter);
			})
			.catch((e: Error) => {
				didError = true;
				error = e.message;
				return '';
			});
	};
	counter_store.init(counterData);
</script>

<div class="flex flex-col justify-center space-y-4">
	<h1 class="w-full text-3xl font-semibold text-center">
		Riley has said
		<br class="md:hidden" />Womp Womp
	</h1>
	<h1
		class="data-[funny-number=true]:rainbow-text mx-auto w-fit rounded-lg border px-9 py-2 text-center text-3xl font-semibold text-red-500"
		data-funny-number={$counter_store.total == 69}
	>
		{$counter_store.total} times
	</h1>
	<p class="text-center">
		Last Updated: {format($counter_store.last_updated, "MM/dd 'at' hh:mm a")} by
		{$counter_store.resolved_username}
	</p>
	{#if didError}
		<p class="text-red-500">{error}</p>
	{/if}
	{#if isAuthed}
		<Button
			on:click={increment}
			size="lg"
			class="w-full text-xl font-bold bg-red-500 hover:bg-red-300"
			disabled={didError}>Add to the Total</Button
		>
	{/if}
</div>
