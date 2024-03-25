import { writable } from "svelte/store";
import type { LeaderboardData } from "src/pages/api/leaderboard";

function getLeaderboard() {
    const { subscribe, set, update } = writable<LeaderboardData>([]);

    return {
        subscribe,
        init: (data: any) => {
            set(data);
        },
        update_local: (id: number, resolved_username = "") => {
            update((v) => {
                if (v.length === 0) {
                    return [{
                        updated_by: id,
                        total: 1,
                        resolved_username: resolved_username !== "" ? resolved_username : "Unknown",
                    }];
                }

                if (!v.some((entry) => entry.updated_by === id)){
                    v.push({
                        updated_by: id,
                        total: 1,
                        resolved_username: resolved_username !== "" ? resolved_username : "Unknown",
                    })
                    return v.sort((a, b) => b.total - a.total);
                }

                return v.map((entry) => {
                    if (entry.updated_by === id) {
                        return {
                            ...entry,
                            total: entry.total + 1,
                        };
                    }
                    return entry;
                }).sort((a, b) => b.total - a.total);
            });
        }
    }
}

export const leaderboard_store = getLeaderboard();