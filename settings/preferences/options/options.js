function ToggleSongInverted(element){
    window.localStorage.setItem("songInverted", element.checked);
}
function ToggleStaggered(element){
    window.localStorage.setItem("staggered", element.checked);
}
function ChangePlaybackInterval(element){
    window.localStorage.setItem("playbackInterval", (element.value / 10));
    document.getElementById('playbackIntervalValue').innerHTML = `${element.value * 100} ms`;
}
function ChangePlaybackDuration(element){
    window.localStorage.setItem("playbackDuration", (element.value / 10));
    document.getElementById('playbackDurationValue').innerHTML = `${element.value / 10} sec`;
}

if(window.localStorage.getItem("songInverted") == "true")
    document.getElementById('songInverted').checked = true;
else
    document.getElementById('songInverted').checked = false;

if(window.localStorage.getItem("staggered") == undefined)
    window.localStorage.setItem("staggered", "true");
if(window.localStorage.getItem("staggered") == "true")
    document.getElementById('staggered').checked = true;
else
    document.getElementById('staggered').checked = false;

if(window.localStorage.getItem("playbackInterval") == undefined)
    window.localStorage.setItem("playbackInterval", 0.25);
document.getElementById('playbackInterval').value = parseFloat(window.localStorage.getItem("playbackInterval")) * 10;
document.getElementById('playbackIntervalValue').innerHTML = `${document.getElementById('playbackInterval').value * 100} ms`;
if(window.localStorage.getItem("playbackDuration") == undefined)
    window.localStorage.setItem("playbackDuration", 3);
document.getElementById('playbackDuration').value = parseFloat(window.localStorage.getItem("playbackDuration")) * 10;
document.getElementById('playbackDurationValue').innerHTML = `${document.getElementById('playbackDuration').value / 10} sec`;
