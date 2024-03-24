import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(({request, cookies, redirect}, next) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('id'); 
    if (query && url.pathname === "/") {
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
        if (query === '2') {
            console.log("maddie requested", query, url, request);
        }
        return redirect('/');
    }
    if (query === '2') {
        console.log("maddie requested", query, url, request);
    }
    return next();
});