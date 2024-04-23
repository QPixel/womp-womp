// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {

		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env?: {
				WOMP_KV: KVNamespace;
				WOMP_DB: D1Database;
			};
		}
	}
}

export type ENV = NonNullable<App.Platform["env"]>;

export {

};
