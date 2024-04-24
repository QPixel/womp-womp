import type { CounterData } from "$lib/db/counter";
import { writable } from "svelte/store";

function getCounter() {
  const { subscribe, update, set } = writable<CounterData>({
    total: 0,
    last_updated: new Date(),
    updated_by: 0,
    resolved_username: "Unknown",
  });

  return {
    subscribe,
    update,
    init: (data: CounterData) => {
      set(data);
    },
    increment: async () => {
      const data = await fetch("/api/counter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async (res) => {
        if (!res.ok) {
          const message = await res.text();
          throw new Error(message);
        }
        return res;
      });
      const json = (await data.json()) as CounterData;
      if (json.total === undefined || json.last_updated === undefined) {
        throw new Error("Invalid response");
      }
      update(() => {
        return {
          total: json.total,
          last_updated: new Date(json.last_updated),
          updated_by: json.updated_by,
          resolved_username: json.resolved_username,
        };
      });
      return json.resolved_username;
    },
  };
}

export const counter_store = getCounter();
