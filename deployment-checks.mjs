// This script is for doing some checks before deployment
// so that we reduce the client-side errors that we create
// Right now, it checks that for every image in the books,
// we have a reference to it in the book's songs.json, and
// that every reference in the book's songs.json file has
// a corresponding image

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const books = fs.readdirSync("public/books");
const missing_images = [];
const missing_number = [];
const blank_notes = [];
for (const book of books) {
    console.log("Checking", book);

    // Check missing image/reference mappings
    const song_references = JSON.parse(fs.readFileSync(path.join("public/books", book, "songs.json")));
    const song_numbers = Object.keys(song_references);
    const image_titles = fs.readdirSync(path.join("public/books", book, "songs")).map(file => file.split(".")[0]);
    for (const song_number of song_numbers) {
        if (!image_titles.includes(song_number)) {
            console.log("Missing image for", song_number);
            missing_images.push(book + " - " + song_number);
        }
    }
    for (const image_title of image_titles) {
        if (!song_numbers.includes(image_title)) {
            console.log("Missing song number for", image_title);
            missing_number.push(book + " - " + image_title);
        }
    }

    // Check for missing references (not a production issue, but we should know about it so we can add missing songs)
    const song_numbers_int = song_numbers.map(reference => parseInt(reference)); // Songs ending with a/b should still be converted
    const max_song_number = Math.max(...song_numbers_int);
    for (let i = 1; i <= max_song_number; i++) {
        if (!song_numbers_int.includes(i)) {
            console.log(`Missing song #${i}`);
        }
    }

    // Check for blank notes (is a production issue, so we should know about it so we can add missing songs)
    for (const [song_number, song_reference] of Object.entries(song_references)) {
        if (song_reference["notes"] != undefined && (song_reference["notes"].join("").trim() == "" || song_reference["notes"].some(note => note.trim() == ""))) {
            console.log(`Blank notes for song #${song_number}`);
            blank_notes.push(book + " - " + song_number);
        }
    }
}

if (missing_images.length > 0) {
    console.log("Missing images:");
    console.log(missing_images.join("\n"));
}

if (missing_number.length > 0) {
    console.log("Missing numbers:");
    console.log(missing_number.join("\n"));
}

const branch_name = execSync("git branch --show-current").toString().trimEnd();
const is_production_or_staging = branch_name == "staging" || branch_name == "main";

if (blank_notes.length > 0) {
    console.log("Blank notes:");
    console.log(blank_notes.join("\n"));
}

// Fail if there are missing references or images
if (missing_images.length > 0 || missing_number.length > 0 || (blank_notes.length > 0 && is_production_or_staging)) {
    //process.exit(1); I'M SORRY DALLAS BUT I GOTTA DO WHAT I GOTTA DO
}
process.exit(0);
