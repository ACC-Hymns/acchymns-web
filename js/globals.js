const songViewImage = document.getElementById('songimage');

function ToggleSongInverted(element){
    console.log(element.checked);
    storage.setItem("songInverted", element.checked);
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    const newColorScheme = event.matches ? "dark" : "light";
    if(newColorScheme == "dark")
        songViewImage.style.filter = "invert(92%)";
    else
        songViewImage.style.filter = "invert(0%)";
});
