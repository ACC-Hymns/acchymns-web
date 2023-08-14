type ScrollPosition = {
    top: number;
    left: number;
};

const scroll_positions = new Map<string, ScrollPosition>();

export function saveScrollPosition(path: string) {
    scroll_positions.set(path, {
        top: window.scrollY,
        left: window.scrollX,
    });
}

export function restoreScrollPosition(path: string) {
    const position = scroll_positions.get(path);
    if (position) {
        window.scrollTo(position);
    }
}
