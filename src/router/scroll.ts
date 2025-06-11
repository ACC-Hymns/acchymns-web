type ScrollPosition = {
    top: number;
    left: number;
};

const scroll_positions = new Map<string, ScrollPosition>();
const groups_opened = new Map<string, number[]>();

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

export function removeScrollPosition(path: string) {
    scroll_positions.delete(path);
}

export function saveGroupOpened(path: string, ids: number[]) {
    groups_opened.set(path, ids);
}

export function getGroupOpened(path: string) {
    const position = groups_opened.get(path);
    return position;
}

export function removeGroupOpened(path: string) {
    groups_opened.delete(path);
}
