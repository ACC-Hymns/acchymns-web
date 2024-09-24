// This script is for compressing the json files
// which describe each book. It's also used to remove
// books which are add-ons, and don't come by default
// This script is run on the capacitor:copy:after hook: https://capacitorjs.com/docs/cli/hooks

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

// These are where the json files end up after `npx cap sync`
const bundled_books = ["ZH", "GH", "JH"];
const mappings = {
    ios: "ios/App/App/public/books",
    android: "android/app/src/main/assets/public/books",
    web: "dist/books",
};

// When running, capacitor injects these env variables
const target_dir = path.join(process.env.CAPACITOR_ROOT_DIR, mappings[process.env.CAPACITOR_PLATFORM_NAME]);

const books = fs.readdirSync(target_dir);
for (const book of books) {
    if (process.env.CAPACITOR_PLATFORM_NAME == "web" || bundled_books.includes(book)) {
        // Minify the json files if we're on the web, or if this book is supposed to be bundled on mobile
        const book_files = fs.readdirSync(path.join(target_dir, book));
        for (const file of book_files) {
            const file_path = path.join(target_dir, book, file);
            // Minify the json files
            if (file.endsWith(".json")) {
                const json = JSON.parse(fs.readFileSync(file_path).toString());
                fs.writeFileSync(file_path, JSON.stringify(json));
            }
        }
        console.log(book, "included & minified");
    } else {
        // Don't include book in final bundle if deploying to android or ios
        fs.rmSync(path.join(target_dir, book), { recursive: true });
        console.log(book, "removed from bundle");
    }
}
