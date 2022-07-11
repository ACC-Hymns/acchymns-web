document.body.onload = addElement;

function pad(n, length) {
  var len = length - (''+n).length;
  return (len > 0 ? new Array(++len).join('0') : '') + n
}

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

function addElement () {
    var div = document.getElementById("menu");
    var title = document.getElementById("titlenumber");
    const newText = document.createTextNode(`#${currentSongNumber}`);
    title.appendChild(newText);
    var newImage = document.createElement("img");
    newImage.src = `./songs/ZH/${pad(currentSongNumber, 3)}.png`;
    
    insertAfter(div, newImage);
}
