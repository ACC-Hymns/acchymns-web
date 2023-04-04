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

const unknown: BookSummary = {
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

export type { BookSummary };
export { unknown };
