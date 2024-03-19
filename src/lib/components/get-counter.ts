import { writable } from "svelte/store";

function getCounter() {
    const { subscribe, update, set } = writable({
        total: 0,
        lastUpdated: new Date(),
        updatedBy: 0,
        resolved_username: '',
    });

    return {
        subscribe,
        init: async () => {
            const data = await fetch('/api/counter');
            const json = await data.json();
            set({
                ...json,
            });
        },
        update,
        increment: async () => {
            const data = await fetch('/api/counter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
            }).then(async (res) => {
                if (!res.ok) {
                    let message = await res.text();
                    throw new Error(message);
                }
                return res;
            });
            const json = await data.json();
            if (json.total === undefined || json.lastUpdated === undefined) {
                throw new Error('Invalid response');
            }
            update((v) => {
                return {
                    total: json.total,
                    lastUpdated: new Date(json.lastUpdated),
                    updatedBy: json.updatedBy,
                    resolved_username: v.resolved_username,
                }
            });
        }
    }
}

export const counter_store = getCounter();