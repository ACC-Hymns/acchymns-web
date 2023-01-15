function ToggleSongInverted(element){
    window.localStorage.setItem("songInverted", element.checked);
}
function ToggleStaggered(element){
    window.localStorage.setItem("staggered", element.checked);
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