document.body.onload = addElement;


function addElement () {
    const currentDiv = document.getElementById("songs");
    for(var i = 0; i < 124; i++) {
        const newButton = document.createElement("a");
        newButton.setAttribute('onclick', `loadSong(${i + 1}, "HG")`);
        
        const newDiv = document.createElement("div");
        newDiv.classList.add("song-btn");
        
        const newContent = document.createTextNode(`${i + 1}`);

        newDiv.appendChild(newContent);
        
        newButton.appendChild(newDiv);

        currentDiv.appendChild(newButton);
    }
}
