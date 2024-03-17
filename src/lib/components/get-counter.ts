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
            }).then((res) =>{
                if (res.status === 401) {
                    throw new Error('You must be logged in to increment');
                }
                if (res.status === 400) {
                    throw new Error("You've tried to increment too many times");
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