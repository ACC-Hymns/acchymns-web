let displayedImages = [];
// Change image dynamically if dark/light mode changes
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (_) => {
    for (let element of displayedImages) {
        invertSongColor(element);
    }
});

function invertSongColor(element) {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        if (window.localStorage.getItem("songInverted") == "true") {
            element.style.filter = "invert(92%)";
        } else {
            element.style.filter = "invert(0%)";
        }
    }
}
