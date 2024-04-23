import { getQuarters } from '$lib/db/quarter';
import { getCounterData } from '$lib/db/counter';
import { getLeaderboard } from '$lib/db/leaderboard'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ platform, params }) => {
    if (!platform?.env) {
        throw new Error('Missing env');
    }

    return {
        leaderboard: await getLeaderboard(platform.env),
        counter: await getCounterData(platform.env),
        quarters: await getQuarters(platform.env),
        id: params.id ? parseInt(params.id) : null,
    };
}