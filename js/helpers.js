function getFullBook(bookShort) {
    switch(bookShort) {
        case "ZH":
            return "Zion's Harp";
        case "GH":
            return "Gospel Hymns";
        case "HG":
            return "Higher Ground";
        case "JH":
            return "Junior Hymnal";
    }
}

function getClassFromBook(bookShort) {
    switch (bookShort) {
        case "ZH":
            return "book-zionsharp";
        case "GH":
            return "book-gospelhymns";
        case "HG":
            return "book-higherground";
        case "JH":
            return "book-juniorhymnal";
    }
}

export {
    getFullBook,
    getClassFromBook
};