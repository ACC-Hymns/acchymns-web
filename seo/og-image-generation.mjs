// This generates open graph images for all the songs in each book, and each book.
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { html } from "satori-html";
import fs from "node:fs";

// Get template for song_preview
const song_preview_template = fs.readFileSync("seo/song_preview.html", "utf-8");
const font = fs.readFileSync("seo/Lato-Regular.woff");

// Replace icon with base64 encoded icon
const rendered_template = song_preview_template.replace("{{icon}}", "data:image/png;base64,");
fs.writeFileSync("seo/song_preview_rendered.html", rendered_template);
const svg = await satori(html(rendered_template), {
    width: 1200,
    height: 630,
    fonts: [
        {
            name: "Lato",
            data: font,
            weight: 400,
            style: "normal",
        },
    ],
});

const resvg = new Resvg(svg, {
    width: 1200,
    height: 630,
});
const data = resvg.render();
const png = data.asPng();

fs.writeFileSync("seo/song_preview.png", png);
