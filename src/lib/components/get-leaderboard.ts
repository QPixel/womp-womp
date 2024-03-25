import { writable } from "svelte/store";

function getLeaderboard() {
    const { subscribe, set, update } = writable<{
        updatedBy: number;
        total: number;
        resolved_username: string;
    }[]>([]);

    return {
        subscribe,
        init: (data: any) => {
            set(data);
        },
        update_local: (id: number, resolved_username = "") => {
            update((v) => {
                if (v.length === 0) {
                    return [{
                        updatedBy: id,
                        total: 1,
                        resolved_username: resolved_username !== "" ? resolved_username : "Unknown",
                    }];
                }

                if (!v.some((entry) => entry.updatedBy === id)){
                    v.push({
                        updatedBy: id,
                        total: 1,
                        resolved_username: resolved_username !== "" ? resolved_username : "Unknown",
                    })
                    return v.sort((a, b) => b.total - a.total);
                }

                return v.map((entry) => {
                    if (entry.updatedBy === id) {
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