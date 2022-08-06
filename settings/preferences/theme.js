function ToggleSongInverted(element){
    window.localStorage.setItem("songInverted", element.checked);
}

if(window.localStorage.getItem("songInverted") == "true")
    document.getElementById('songInverted').checked = true;
else
    document.getElementById('songInverted').checked = false;