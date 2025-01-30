import fs from "node:fs";
import { hashElement } from "folder-hash";

const options = {
    folders: { exclude: [".*", "node_modules", "test_coverage"] },
    files: { include: ["*.js", "*.json", "*.png", "*.pdf", "*.jpg"] },
};

async function run() {
    let book_hashes = [];
    let books_to_hash = fs.readdirSync("public/books");
    for (var book_id in books_to_hash) {
        let book = books_to_hash[book_id];
        let result = await hashElement(`public/books/${book}`, options);
        book_hashes.push(result);
        fs.writeFileSync(`public/books/${book}/.signature`, JSON.stringify(result, null, "\t"));
    }
    fs.writeFileSync("public/book_signatures.json", JSON.stringify(book_hashes, null, "\t"));
}

run();
