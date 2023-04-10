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
    title?: string;
    notes?: string[];
};

type SongList = {
    [song_number: string]: Song;
};

const UnknownSongList: SongList = {};

export type { BookSummary, Song, SongList };
export { UnknownBookSummary, UnknownSongList };
