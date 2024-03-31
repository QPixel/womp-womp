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
                let newData = v[current_quarter];
                 console.log(newData);
                if (!newData.some((entry) => entry.updated_by === id)) {
                    newData.push({
                        updated_by: id,
                        total: 1,
                        resolved_username: resolved_username !== "" ? resolved_username : "Unknown",
                    });
                    v[current_quarter] = newData.sort((a, b) => b.total - a.total);
                }

                if (newData.some((entry) => entry.updated_by === id)) {
                    console.log("updating");
                    newData = newData.map((entry) => {
                        console.log(entry);
                        if (entry.updated_by === id) {
                            console.log("updating", entry, id);
                            return {
                                ...entry,
                                total: entry.total + 1,
                            };
                        }
                        return entry;
                    });
                    console.log(newData);
                    v[current_quarter] = newData.sort((a, b) => b.total - a.total);
                }
                console.log(v);
                return v;
            })
        }
    }
}

export const leaderboard_store = getLeaderboard();