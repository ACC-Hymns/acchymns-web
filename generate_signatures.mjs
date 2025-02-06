import { promises as fs } from "node:fs";
import { hashElement } from "folder-hash";

const options = {
    folders: { exclude: [".*", "node_modules", "test_coverage"] },
    files: { include: ["*.js", "*.json", "*.png", "*.pdf", "*.jpg"], exclude: [".*"] },
};

async function run() {
    const result = await hashElement(`public/books`, options);
    await fs.writeFile("public/book_signatures.json", JSON.stringify(result.children, null, "\t"));
    await Promise.all(
        result.children.map(
            async book_folder => await fs.writeFile(`public/books/${book_folder.name}/.signature`, JSON.stringify(book_folder, null, "\t")),
        ),
    );
}

run();
