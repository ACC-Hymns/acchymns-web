import { getSongSrc } from "./song-loader.js";
import { getAllBookMetaData } from "../books/index.js";

function mobileOrTablet() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

const panzoomContainer = document.getElementById('panzoomContainer');
panzoom(panzoomContainer, {
    beforeWheel: (e) => {
        return !e.shiftKey;
    },
    maxZoom: 3,
    minZoom: (mobileOrTablet() ? 1 : 0.25),
    bounds: true,
    boundsPadding: 0.5
});

let pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/external/pdf.worker.js';

let displayedImages = [];
// Change image dynamically if dark/light mode changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    for (let element of displayedImages) {
        invertSongColor(element);
    }
});

function invertSongColor(element) {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        if(window.localStorage.getItem("songInverted") == "true") {
            element.style.filter = "invert(92%)";
        } else {
            element.style.filter = "invert(0%)";
        }
    }
}

async function displaySongPDF(songSrc) {
    let pdfDoc = await pdfjsLib.getDocument(songSrc).promise;
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++){
        // Create canvas element to render PDF onto
        let canvas = document.createElement("canvas");
        canvas.classList.add("song_img");
        invertSongColor(canvas);
        panzoomContainer.appendChild(canvas);
        displayedImages.push(canvas);
        
        // Grab current page
        let page = await pdfDoc.getPage(pageNum);
        let viewport = page.getViewport({scale: 5});
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render PDF page into canvas context
        let ctx = canvas.getContext('2d');
        await page.render({
            canvasContext: ctx,
            viewport: viewport
        }).promise;
    }
}

async function displaySongImg(songSrc) {
    displayedImages = [];
    let img = document.createElement("img");
    img.classList.add("song_img");
    invertSongColor(img);
    panzoomContainer.appendChild(img);
    displayedImages.push(img);
    img.setAttribute('src', songSrc);
    img.onerror = () => {
        img.src = "assets/wifi_off.svg";
        img.style.width = "50%";
        img.style.height = "50%";
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            img.style.filter = "invert(92%)";
        }
    }
}

async function displaySong(bookName, songNum) {
    displayedImages = [];
    const searchContent = document.getElementById('content');
    searchContent.classList.add('hidden');
    const BOOK_METADATA = await getAllBookMetaData()

    const songViewTitle = document.getElementById('titlenumber');
    songViewTitle.innerHTML = `#${songNum}`;
    
    const songSrc = getSongSrc(bookName, songNum, BOOK_METADATA);

    const songView = document.getElementById('songview');
    songView.classList.remove('hidden');
    if (BOOK_METADATA[bookName].fileExtension != "pdf") {
        displaySongImg(songSrc)
    } else {
        displaySongPDF(songSrc);
    }
}

const urlParams = new URLSearchParams(window.location.search);
const bookName = urlParams.get("book");
const songNum = urlParams.get("song");
if (bookName != null && songNum != null){
    displaySong(bookName, songNum);
}

export {
    displaySong
};