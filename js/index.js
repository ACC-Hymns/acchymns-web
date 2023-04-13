import { getAllBookMetaData, isWebApp } from "../books/index.js"

const bookContainer = document.getElementById("content")
document.getElementById("startbutton").addEventListener('click', () => {
    window.localStorage.setItem("landing_complete", "true");
    document.getElementById("main").classList.remove("hidden");
    document.getElementById("splashscreen").classList.add("hidden");
});

if(window.localStorage.getItem("landing_complete") == "true") {
    document.getElementById("main").classList.remove("hidden");
    document.getElementById("splashscreen").classList.add("hidden");
} else {
    document.getElementById("main").classList.add("hidden");
    document.getElementById("splashscreen").classList.remove("hidden");
}

if (isWebApp) {
    const appSection = document.getElementById("appsection");
    appSection.innerHTML += `
    <a class="app" href='https://play.google.com/store/apps/details?id=com.ChristopherW.acchmns&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'>
        <img class="appbuttonplay" alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png'/>
    </a>
    <a class="app" href="https://apps.apple.com/us/app/acc-hymns/id1634426405">
        <object class="appbuttonapple" data="assets/Appstore_badge.svg"></object>
    </a>`
}

(async () => {
    for (let book of Object.values(await getAllBookMetaData())) {
        let wifiSymbol = `<img class="ionicon booktext--right" style="filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%) contrast(93%); width: 24px" src="assets/wifi.svg">`
        bookContainer.innerHTML += `
            <a href="selection.html?book=${book.name.short}" class="book" style="background: linear-gradient(135deg, ${book.primaryColor}, ${book.secondaryColor})">
                <div class="book_title">${book.name.medium}</div>
                ${book.addOn ? wifiSymbol : ""}
            </div>`
    }
})()
