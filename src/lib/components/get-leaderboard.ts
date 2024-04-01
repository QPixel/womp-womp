import { writable } from "svelte/store";
import type { LeaderboardData } from "src/pages/api/leaderboard/all";


function getLeaderboard() {
    const { subscribe, set, update } = writable<LeaderboardData>();

    return {
        subscribe,
        init: (data: LeaderboardData) => {
            set(data);
        },
        update_local: (id: number, resolved_username = "", current_quarter = "") => {
            update((v) => {
                
                if (!v[current_quarter] || !v[current_quarter].data) {
                    v[current_quarter].data = [];
                }

                let newData = v[current_quarter].data;
                if (!newData.some((entry) => entry.updated_by === id)) {
                    newData.push({
                        updated_by: id,
                        total: 1,
                        resolved_username: resolved_username !== "" ? resolved_username : "Unknown",
                    });
                    v[current_quarter].data = newData.sort((a, b) => b.total - a.total);
                    v[current_quarter].total = v[current_quarter].total + 1;
                }

                if (newData.some((entry) => entry.updated_by === id)) {
                    newData = newData.map((entry) => {
                        if (entry.updated_by === id) {
                            return {
                                ...entry,
                                total: entry.total + 1,
                            };
                        }
                        return entry;
                    });
                    v[current_quarter].data = newData.sort((a, b) => b.total - a.total);
                    v[current_quarter].total = v[current_quarter].total + 1;
                }
                return v;
            })
        }
    }
}

export const leaderboard_store = getLeaderboard();