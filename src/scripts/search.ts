function stripSearchText(text: string) {
    return text
        .replace(/[.,/#!$%^&*;:{}=\-_'"`~()]/g, "")
        .replace(/s{2,}/g, " ")
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
}

export { stripSearchText };