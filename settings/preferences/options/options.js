function ToggleSongInverted(element){
    window.localStorage.setItem("songInverted", element.checked);
}
//function TogglePinchAndPan(element){
//    window.localStorage.setItem("pinchandpan", element.checked);
//}

if(window.localStorage.getItem("songInverted") == "true")
    document.getElementById('songInverted').checked = true;
else
    document.getElementById('songInverted').checked = false;
/*
if(window.localStorage.getItem("pinchandpan") == undefined)
    window.localStorage.setItem("pinchandpan", "true");
if(window.localStorage.getItem("pinchandpan") == "true")
    document.getElementById('pinchandpan').checked = true;
else
    document.getElementById('pinchandpan').checked = false;*/