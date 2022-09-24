import { SONG_BOOKS, webApp } from "../books/index.js"

const bookContainer = document.getElementById("content")

for (let book of Object.values(SONG_BOOKS)) {
    bookContainer.innerHTML += `
        <a href="selection.html?book=${book.name.short}">
            <div class="book" style="background: linear-gradient(135deg, ${book.primaryColor}, ${book.secondaryColor})">
                <div class="book_title">${book.name.long}</div>
            </div>
        </a>`
}

const appSection = document.getElementById("appsection");

if(webApp)
    appSection.innerHTML += `
<a class="app" href='https://play.google.com/store/apps/details?id=com.ChristopherW.acchmns&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'>
    <img class="appbuttonplay" alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png'/>
</a>
<a class="app" href="https://apps.apple.com/us/app/acc-hymns/id1634426405">
    <object class="appbuttonapple" data="./assets/Appstore_badge.svg"></object>
</a>
`