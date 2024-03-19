import { writable } from "svelte/store";

function getLeaderboard() {
    const { subscribe, set, update } = writable<{
        updatedBy: number;
        total: number;
        resolved_username: string;
    }[]>([]);

    return {
        subscribe,
        init: async () => {
            const data = await fetch('/api/leaderboard');
            if (!data.ok) {
                throw new Error('Failed to fetch leaderboard');
            }
            const json = await data.json();
            set(json);
        },
        update_local: (id: number) => {
            update((v) => {
                return v.map((entry) => {
                    if (entry.updatedBy === id) {
                        return {
                            ...entry,
                            total: entry.total + 1,
                        };
                    }
                    return entry;
                });
            });
        }
    }
}

export const leaderboard_store = getLeaderboard();