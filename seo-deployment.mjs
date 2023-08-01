// This script is for generating index.html files
// with meta tags filled out for each page for SEO
// This script should be run before deployment for web (and really only web)

import fs from "node:fs";
import { parse } from "node-html-parser";
import dotenv from "dotenv";
dotenv.config();
import process from "node:process";
if (process.env.VITE_BASE_URL == undefined) {
    process.env.VITE_BASE_URL = "/";
}

// Assume you're looking at the preview site
if (process.env.SEO_URL == undefined) {
    process.env.SEO_URL = "https://localhost:4173";
}

// Site navigation
// / <- home
// /selection/* <- book selection
// /topical/* <- topical & alphabetical index
// /search <- search
// /bookmarks <- bookmarks
// /settings <- settings
// /settings/about <- about
// /settings/about/attributions <- attributions
// /settings/about/changelog <- changelog
// /settings/help <- help
// /settings/options <- options
// /settings/import <- import books
// /display/*/* <- display song

function generateMetaTags(title, description, url_rel, image_rel, type) {
    return `
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="https://acchymns.app/${url_rel}" />
    <meta property="og:image" content="${process.env.SEO_URL}${process.env.VITE_BASE_URL}${image_rel}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:site_name" content="ACCHymns" />
    `;
}

const dist_dir = "dist";
const index_html = fs.readFileSync(`${dist_dir}/index.html`, "utf-8");

// Generate index.html for all pages

// / <- home
{
    const dup = parse(index_html);
    const head = dup.getElementsByTagName("head")[0];
    head.insertAdjacentHTML("beforeend", generateMetaTags("ACC Hymns", "A website for hymnbooks used by various ACC churches", "", "assets/icons/180x180.png", "website"));
    fs.writeFileSync(`${dist_dir}/index.html`, dup.toString());
}

// /selection/* <- book selection
const books = ["ZH", "GH", "JH", "HG", "CH", "HZ", "ZG", "ZGE", "ZHJ", "ZHSP", "ZHG", "ZHH", "ZHR", "HS", "PC", "ARF", "ARFR"];
fs.mkdirSync(`${dist_dir}/selection`, { recursive: true });
for (const book of books) {
    const dup = parse(index_html);
    const head = dup.getElementsByTagName("head")[0];
    const summary = JSON.parse(fs.readFileSync(`public/books/${book}/summary.json`, "utf-8"));
    head.insertAdjacentHTML(
        "beforeend",
        generateMetaTags(
            summary.name.long,
            `${summary.name.medium} available online and for download via the app store`,
            `selection/${book}`,
            `assets/icons/180x180.png`, // We can replace this with some kind of custom image for each book
            "music.album"
        )
    );
    fs.writeFileSync(`${dist_dir}/selection/${book}`, dup.toString());
}

// /display/*/* <- display song
for (const book of books) {
    const summary = JSON.parse(fs.readFileSync(`public/books/${book}/summary.json`, "utf-8"));
    const song_list = JSON.parse(fs.readFileSync(`public/books/${book}/songs.json`, "utf-8"));
    fs.mkdirSync(`${dist_dir}/display/${book}`, { recursive: true });
    for (const song of Object.keys(song_list)) {
        const dup = parse(index_html);
        const head = dup.getElementsByTagName("head")[0];

        head.insertAdjacentHTML(
            "beforeend",
            generateMetaTags(
                song_list[song].title,
                `#${song} from ${summary.name.medium} available online and for download via the app store`,
                `display/${book}/${song}`,
                `assets/icons/180x180.png`, // We can replace this with some kind of custom image for each book
                "music.song"
            )
        );
        fs.writeFileSync(`${dist_dir}/display/${book}/${song}`, dup.toString());
    }
}

// /search <- search
{
    const dup = parse(index_html);
    const head = dup.getElementsByTagName("head")[0];
    head.insertAdjacentHTML(
        "beforeend",
        generateMetaTags("ACC Hymns Search", "Search for all of your favorite hymns from the Zion's Harp, Gospel Hymns, Junior Hymnal, and many more!", "search", "assets/icons/180x180.png", "website")
    );
    fs.writeFileSync(`${dist_dir}/search`, dup.toString());
}

// /bookmarks <- bookmarks
{
    const dup = parse(index_html);
    const head = dup.getElementsByTagName("head")[0];
    head.insertAdjacentHTML("beforeend", generateMetaTags("ACC Hymns Bookmarks", "View your bookmarks from the ACC Hymns app", "bookmarks", "assets/icons/180x180.png", "website"));
    fs.writeFileSync(`${dist_dir}/bookmarks`, dup.toString());
}

// /topical/* <- topical & alphabetical index
fs.mkdirSync(`${dist_dir}/topical`, { recursive: true });
for (const book of books) {
    const dup = parse(index_html);
    const head = dup.getElementsByTagName("head")[0];
    const summary = JSON.parse(fs.readFileSync(`public/books/${book}/summary.json`, "utf-8"));
    head.insertAdjacentHTML(
        "beforeend",
        generateMetaTags(`${summary.name.long} Topical Index`, `View the topical and alphabetical index for ${summary.name.medium}`, `topical/${book}`, "assets/icons/180x180.png", "music.playlist")
    );
    fs.writeFileSync(`${dist_dir}/topical/${book}`, dup.toString());
}
