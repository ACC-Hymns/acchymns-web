type BookSummary = {
    name: {
        short: string;
        medium: string;
        long: string;
    };
    primaryColor: string;
    secondaryColor: string;
    fileExtension: string;
    numOfSongs: number;
    addOn: boolean;
    indexAvailable: boolean;
    srcUrl?: string;
};

enum BookSourceType {
    BUNDLED,
    HIDDEN,
    PREVIEW,
    IMPORTED,
    DOWNLOADED,
}

type BookDataSummary = {
    id: string; // e.g. ZH
    status: BookSourceType;
    src: string; // URL, can either be local, raw.github or a converted "file://"
    name?: {
        short: string;
        medium: string;
        long: string;
    };
    primaryColor?: string;
    secondaryColor?: string;
};

type Song = {
    title: string;
    number?: string; // Numbers unfortunately can be strings: e.g. 403a GH
    notes?: string[];
    first_line?: string;
};

// Song List is a dictionary of song number to song
type SongList = Record<string, Song>;

type SongReference = {
    book: string;
    number: string;
};

type SongSearchInfo = Song & {
    stripped_title?: string;
    stripped_first_line?: string;
    book: BookSummary;
};

// Dictionary of section, and list of numbers for that section
type BookIndex = Record<string, string[]>;

type SearchParams = {
    search: string;
    bookFilters: string[]; // Short names of books
};

type BookSignature = {
    name: string;
    hash: string;
    parent?: BookSignature;
    children?: BookSignature[];
};

type DownloadPromise = {
    cancel: () => Promise<void>;
    promise: Promise<void>;
};

type UpdatePackage = {
    book_short: string;
    book_summary?: BookSummary;
    paths: string[];
};

type BibleVerse = {
    text: string;
    num: number;
};

type BibleChapter = {
    verses: BibleVerse[];
    num: number;
};

type BibleBook = {
    name: string;
    chapters: BibleChapter[];
};

type Bible = {
    version: string;
    books: BibleBook[];
};

type DiscoverMatch = {
    type: "VERSE" | "TITLE";
    hymn_title: string;
    hymn_number: string;
    hymnal_id: string;
    similarity: number;
    verses?: {
        verse_number: number;
        verse_text: string;
        similarity: number;
    }[] | undefined;
}

type DiscoverResult = {
    prompt: string;
    allowed_hymnals: string[];
    top_matches: DiscoverMatch[];
}

export type {
    BookSummary,
    Song,
    SongList,
    SongSearchInfo,
    SongReference,
    BookIndex,
    SearchParams,
    BibleVerse,
    BibleChapter,
    BibleBook,
    Bible,
    BookSignature,
    UpdatePackage,
    DownloadPromise,
    BookDataSummary,
    DiscoverMatch,
    DiscoverResult,
};
export { BookSourceType };
