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
    addOn?: boolean;
    srcUrl?: string;
};

const UnknownBookSummary: BookSummary = {
    name: {
        short: "UK",
        medium: "Unknown",
        long: "Unknown",
    },
    primaryColor: "#000000",
    secondaryColor: "#000000",
    fileExtension: "",
    numOfSongs: 0,
};

type Song = {
    number?: string; // Numbers unfortunately can be strings: ex: 403a GH
    title: string;
    notes: string[];
};

type SongList = {
    [song_number: string]: Song;
};

const UnknownSongList: SongList = {};

type SongReference = Song & {
    stripped_title?: string;
    book: BookSummary;
};

type BookmarkedSong = {
    song: string;
    book: string;
};

type BookIndex = {
    [section: string]: string[]; // Dictionary of section, and list of numbers for that section
};
const UnknownBookIndex: BookIndex = {};

export type { BookSummary, Song, SongList, BookmarkedSong, SongReference, BookIndex };
export { UnknownBookSummary, UnknownSongList, UnknownBookIndex };
