
/** @type {import("prettier").Config} */
const config = {
    plugins: ["prettier-plugin-svelte", "prettier-plugin-astro", "prettier-plugin-tailwindcss", "@ianvs/prettier-plugin-sort-imports"],
    tailwindConfig: "./tailwind.config.mjs",
    tailwindFunctions: ["cn", "cva"],
    overrides: [
        { 
            "files": "*.svelte", 
            "options": { "parser": "svelte" } 
        },
        {
            "files": "*.astro",
            "options": { "parser": "astro" }
        }
    ],
    importOrderParserPlugins: ["typescript", "decorators-legacy"],
}

module.exports = config