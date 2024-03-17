import { writable } from "svelte/store";

function getCounter() {
    const { subscribe, update, set} = writable({
        total: 0,
        lastUpdated: new Date(),
    });

    return {
        subscribe,
        init: async () => {
            const data = await fetch('/api/counter');
            const json = await data.json();
            set(json);
        },
        update,
        increment: async () => {
            const data = await fetch('/api/counter', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
            }).then(async (res) =>{
                if (!res.ok) {
                    let message = await res.text();
                    throw new Error(message);
                }
                return res;
            });
            const json = await data.json();
            update(() => {
                return {
                    total: json.total,
                    lastUpdated: new Date(json.lastUpdated),
                }
            });
        }
    }
}

export const counter_store = getCounter();