import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(({request, cookies, redirect}, next) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('id');
    if (query) {
        cookies.set('id', query, {
            path: '/',
            expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365),
        });
        cookies.set('triedToIncrement', '0', {
            path: '/',
        
        });
        cookies.set('resetAt', new Date(new Date().getTime() + 1000 * 60 * 60 * 24).toISOString(), {
            path: '/',

        });
        return redirect('/');
    }
    return next();
});