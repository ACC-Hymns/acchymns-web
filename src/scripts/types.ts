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

type Song = {
    number?: string; // Numbers unfortunately can be strings: ex: 403a GH
    title: string;
    notes: string[];
};

type SongList = Record<string, Song>;

type SongReference = Song & {
    stripped_title?: string;
    book: BookSummary;
};

type BookmarkedSong = {
    song: string;
    book: string;
};

// Dictionary of section, and list of numbers for that section
type BookIndex = Record<string, string[]>;

type SearchParams = {
    search: string;
    bookFilters: BookSummary[];
};

export type { BookSummary, Song, SongList, BookmarkedSong, SongReference, BookIndex, SearchParams };
