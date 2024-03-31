import { db, Womps } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
	const rawData = `[{"last_updated":"2024-03-17T07:00:00.000Z","id":0,"updated_by":0,"quarter_id":"24-Q1"},{"last_updated":"2024-03-17T22:55:00.000Z","id":1,"updated_by":0,"quarter_id":"24-Q1"},{"last_updated":"2024-03-17T22:55:00.000Z","id":2,"updated_by":42069,"quarter_id":"24-Q1"},{"last_updated":"2024-03-17T22:55:00.000Z","id":3,"updated_by":42069,"quarter_id":"24-Q1"},{"last_updated":"2024-03-17T22:55:00.000Z","id":4,"updated_by":42069,"quarter_id":"24-Q1"},{"last_updated":"2024-03-17T22:55:00.000Z","id":5,"updated_by":42069,"quarter_id":"24-Q1"},{"last_updated":"2024-03-17T22:55:00.000Z","id":6,"updated_by":42069,"quarter_id":"24-Q1"},{"last_updated":"2024-03-17T22:55:00.000Z","id":7,"updated_by":42069,"quarter_id":"24-Q1"},{"last_updated":"2024-03-18T18:35:00.000Z","id":8,"updated_by":1,"quarter_id":"24-Q1"},{"last_updated":"2024-03-19T18:45:52.792Z","id":9,"updated_by":2,"quarter_id":"24-Q1"},{"last_updated":"2024-03-19T18:45:53.906Z","id":10,"updated_by":2,"quarter_id":"24-Q1"},{"last_updated":"2024-03-19T22:00:18.874Z","id":11,"updated_by":2,"quarter_id":"24-Q1"},{"last_updated":"2024-03-20T02:10:00.000Z","id":12,"updated_by":3,"quarter_id":"24-Q1"},{"last_updated":"2024-03-20T16:22:30.990Z","id":13,"updated_by":2,"quarter_id":"24-Q1"},{"last_updated":"2024-03-20T18:28:00.000Z","id":14,"updated_by":3,"quarter_id":"24-Q1"},{"last_updated":"2024-03-22T05:49:33.092Z","id":15,"updated_by":3,"quarter_id":"24-Q1"},{"last_updated":"2024-03-23T02:16:20.973Z","id":16,"updated_by":2,"quarter_id":"24-Q1"},{"last_updated":"2024-03-24T22:28:16.454Z","id":17,"updated_by":2,"quarter_id":"24-Q1"},{"last_updated":"2024-03-24T22:28:18.382Z","id":18,"updated_by":2,"quarter_id":"24-Q1"},{"last_updated":"2024-03-24T22:28:20.473Z","id":19,"updated_by":2,"quarter_id":"24-Q1"},{"last_updated":"2024-03-24T22:28:21.822Z","id":20,"updated_by":2,"quarter_id":"24-Q1"},{"last_updated":"2024-03-25T00:04:41.366Z","id":21,"updated_by":2,"quarter_id":"24-Q1"},{"last_updated":"2024-03-26T02:47:09.804Z","id":22,"updated_by":2,"quarter_id":"24-Q1"},{"last_updated":"2024-03-26T02:47:15.774Z","id":23,"updated_by":2,"quarter_id":"24-Q1"},{"last_updated":"2024-03-27T02:19:24.630Z","id":24,"updated_by":2,"quarter_id":"24-Q1"},{"last_updated":"2024-03-27T17:27:47.296Z","id":25,"updated_by":2,"quarter_id":"24-Q1"},{"last_updated":"2024-03-27T22:47:31.414Z","id":26,"updated_by":3,"quarter_id":"24-Q1"},{"last_updated":"2024-03-28T20:02:17.662Z","id":27,"updated_by":3,"quarter_id":"24-Q1"},{"last_updated":"2024-03-29T03:59:55.278Z","id":28,"updated_by":3,"quarter_id":"24-Q1"},{"last_updated":"2024-03-29T04:37:13.238Z","id":29,"updated_by":3,"quarter_id":"24-Q1"},{"last_updated":"2024-03-30T00:49:30.364Z","id":30,"updated_by":3,"quarter_id":"24-Q1"},{"last_updated":"2024-03-30T05:43:09.993Z","id":31,"updated_by":3,"quarter_id":"24-Q1"}]`
	let data = JSON.parse(rawData);
	data.map((entry: any) => {
		entry.last_updated = new Date(entry.last_updated);
	})
	console.log(data);
	await db.insert(Womps).values(data);
}
