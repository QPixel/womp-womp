import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ request, cookies }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("id");
    const idRegex = url.pathname.match(/\/([\d]+)/g);
    if (idRegex) {
        if (
            !cookies.get("id") ||
            !cookies.get("triedToIncrement") ||
            !cookies.get("resetAt")
        ) {
            cookies.set("id", idRegex[0].replace("/", ""), {
                path: "/",
                expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365),
            });
            cookies.set("triedToIncrement", "0", {
                path: "/",
                expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365),
            });
            cookies.set(
                "resetAt",
                new Date(new Date().getTime() + 1000 * 60 * 60 * 24).toISOString(),
                {
                    path: "/",
                    expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365),
                },
            );
        }
    }
    if (query && url.pathname === "/") {
        cookies.set("id", query, {
            path: "/",
            expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365),
        });
        cookies.set("triedToIncrement", "0", {
            path: "/",
        });
        cookies.set(
            "resetAt",
            new Date(new Date().getTime() + 1000 * 60 * 60 * 24).toISOString(),
            {
                path: "/",
            },
        );
        return redirect("/");
    }
    return {
    };
};
