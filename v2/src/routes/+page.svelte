<main class="mx-auto flex min-h-screen max-w-lg flex-col items-center p-2 md:justify-center">
	<header class="mt-16 text-left">
		<h1 class="text-3xl font-semibold">The Womp Womp Counter</h1>
	</header>
	<div class="mt-5 h-full w-full space-y-5">
		<!-- <Card class="w-full">
      <CardContent class="pt-6">
        <Counter
          client:load
          isAuthed={typeof id !== "undefined"}
          id={parseInt(id!)}
          counterData={counterData}
          currentQuarter={leaderboardQuarters[0]}
        />
      </CardContent>
    </Card>
    <Card class="min-h-[450px] w-full">
      <CardHeader>
        <CardTitle class={"text-4xl"}>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Leaderboard
          client:load
          leaderboardData={leaderboardData}
          leaderboardQuarters={leaderboardQuarters}
        />
      </CardContent>
    </Card> -->
	</div>
	<footer class="mx-auto p-2 text-center text-xl">
		<span class="font-serif text-sm italic">&copy; MMXXIV</span>
		<br />
		A
		<a href="https://instagram.com/rileyy.allyn" target="_blank" class="textThing text-blue-400"
			>@rileyy.allyn</a
		> project
	</footer>
</main>
