import { generateSongPreview } from "./og-image-generation.mjs";
import fs from "node:fs";

const og_png = await generateSongPreview("Zion's Harp", "#494949", "#000000");
await fs.writeFileSync(`seo/song_preview.png`, og_png);