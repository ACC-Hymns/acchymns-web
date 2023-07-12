// This script is for doing some checks before deployment
// so that we reduce the client-side errors that we create
// Right now, it checks that for every image in the books,
// we have a reference to it in the book's songs.json, and
// that every reference in the book's songs.json file has
// a corresponding image

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const books = fs.readdirSync("public/books");
const missing_images = [];
const missing_references = [];
for (const book of books) {
    console.log("Checking", book);
    const song_references = Object.keys(JSON.parse(fs.readFileSync(path.join("public/books", book, "songs.json"))));
    const image_titles = fs.readdirSync(path.join("public/books", book, "songs")).map(file => file.split(".")[0]);
    for (const song_reference of song_references) {
        if (!image_titles.includes(song_reference)) {
            console.log("Missing image for", song_reference);
            missing_images.push(book + " - " + song_reference);
        }
    }
    for (const image_title of image_titles) {
        if (!song_references.includes(image_title)) {
            console.log("Missing song reference for", image_title);
            missing_references.push(book + " - " + image_title);
        }
    }
}

if (missing_images.length > 0) {
    console.log("Missing images:");
    console.log(missing_images.join("\n"));
}

if (missing_references.length > 0) {
    console.log("Missing references:");
    console.log(missing_references.join("\n"));
}

if (missing_images.length > 0 || missing_references.length > 0) {
    process.exit(1);
}
process.exit(0);
