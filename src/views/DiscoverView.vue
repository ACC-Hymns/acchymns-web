<script setup lang="ts">
import { RouterLink, onBeforeRouteLeave, useRoute } from "vue-router";
import { ref, computed, onMounted, watch, nextTick } from "vue";
import NavigationBar from "@/components/NavigationBar.vue";
import BookFilter from "@/components/BookFilter.vue";
import { stripSearchText } from "@/scripts/search";
import { useSessionStorage } from "@vueuse/core";
import { getAllSongMetaData, getAllBookMetaData, getBookDataSummaryFromName } from "@/scripts/book_import";
import { type BookSummary, type Song, type SongSearchInfo, type SearchParams, type BookDataSummary } from "@/scripts/types";
import { known_references, prepackaged_books } from "@/scripts/constants";
import { saveScrollPosition, restoreScrollPosition } from "@/router/scroll";

// Saving position in book
onBeforeRouteLeave((_, from) => {
    saveScrollPosition(from.fullPath);
});

const route = useRoute();
const query_suggestions = ref(["God’s faithfulness", "Forgiveness and grace", "Christmas", "The Holy Trinity", "Victory over sin and death"]);
const search_params = ref({ search: "", bookFilters: [] });
const search_query = ref(search_params.value.search);
const stripped_query = computed(() => {
    return stripSearchText(search_query.value);
});

watch(search_query, new_query => {
    search_params.value.search = new_query;
});

function clearSearchQuery() {
	search_query.value = "";
	search_params.value.bookFilters = [];
}

function sendRequest() {
	console.log(search_params.value.bookFilters)
	return {
    "prompt": "i stood outside the gate",
    "allowed_hymnals": [
        "GH"
    ],
    "top_matches": [
        {
            "type": "TITLE",
            "hymn_title": "I Stood Outside the Gate",
            "hymn_number": "85",
            "hymnal_id": "GH",
            "similarity": 0.7977935062935403,
            "verses": [
                {
                    "verse_number": 1,
                    "verse_text": "I stood outside the gate, A poor, wayfaring child; Within my heart there beat A tempest loud and wild; A fear oppressed my soul, That I might be too late; And oh, I trembled sore, And prayed outside the gate.",
                    "similarity": 0.6019980164959913
                },
                {
                    "verse_number": 3,
                    "verse_text": "In Mercy's guise I knew The Saviour long abused, Who often sought my heart, And wept when I refused; Oh! what a blest return For all my years of sin! I stood outside the gate, And Jesus let me in.",
                    "similarity": 0.3375135298019633
                }
            ]
        },
        {
            "type": "TITLE",
            "hymn_title": "The Gate Ajar for Me",
            "hymn_number": "12",
            "hymnal_id": "GH",
            "similarity": 0.4698562935481165,
            "verses": [
                {
                    "verse_number": 1,
                    "verse_text": "There is a gate that stands ajar, And through its portals gleaming, A radiance from the Cross afar, The Savior's love revealing.",
                    "similarity": 0.36572214873846276
                },
                {
                    "verse_number": 2,
                    "verse_text": "That gate ajar stands free for all Who seek through it salvation; The rich and poor, the great and small, Of every tribe and nation.",
                    "similarity": 0.3756502263442286
                },
                {
                    "verse_number": 4,
                    "verse_text": "Beyond the river's brink we'll lay The cross that here is given, And bear the crown of life away, And love Him more in heaven. O depth of mercy! can it be That gate was left ajar for me? For me (for me), for me (for me)? Was left ajar for me?",
                    "similarity": 0.2825199861288026
                }
            ]
        },
        {
            "type": "TITLE",
            "hymn_title": "I Am Sweeping Thro' the Gate",
            "hymn_number": "666",
            "hymnal_id": "GH",
            "similarity": 0.4694231140087269,
            "verses": [
                {
                    "verse_number": 1,
                    "verse_text": "I am now a child of God, for I'm washed in Jesus' blood; I am watching and I'm longing while I wait. Soon on wings of love I'll fly, to my home beyond the sky, To my welcome, as I'm sweeping thro' the gate.",
                    "similarity": 0.269471769963459
                },
                {
                    "verse_number": 2,
                    "verse_text": "Oh! the blessed Lord of light, He upholds me by His might; And His arms enfold, and comfort while I wait. I am leaning on His breast, Oh! The sweetness of His rest, Hallelujah, I am sweeping thro' the gate.",
                    "similarity": 0.27053157060763056
                },
                {
                    "verse_number": 3,
                    "verse_text": "I am sweeping thro' the gate where the blessed for me wait; Where the weary workers rest forevermore; Where the strife of earth is done, and the crown of life is won, Oh, the glory of that city just before!",
                    "similarity": 0.34551297568586226
                },
                {
                    "verse_number": 4,
                    "verse_text": "Burst are all my prison bars; and I soar beyond the stars, To my Father's house, the bright and blest estate. Lo! the morn eternal breaks, and the song immortal wakes, Robed in whiteness I am sweeping thro' the gate. In the blood of yonder Lamb, washed from ev'ry stain I am; Robed in whiteness, clad in brightness,I am sweeping thro' the gate",
                    "similarity": 0.31098136471259186
                }
            ]
        },
        {
            "type": "TITLE",
            "hymn_title": "The Open Gate",
            "hymn_number": "769",
            "hymnal_id": "GH",
            "similarity": 0.4543497755299655,
            "verses": [
                {
                    "verse_number": 1,
                    "verse_text": "I've heard them sing again and again Of a gate that stands ajar, Of a sunny clime, and golden plain, And a sinless land afar But when I have passed the chilly tide, And enter my home above, I believe the gate will open wide, On its golden hinge of love.",
                    "similarity": 0.3622794940633307
                },
                {
                    "verse_number": 2,
                    "verse_text": "A welcome home at the open gate, From a land of angels bright, Do these for the ransom'd spirits wait, As it gains the land of light. We may not know the joy untold, The bliss of the other side, But when I come to the gate of gold, I believe 'twill open wide.",
                    "similarity": 0.36781168094267197
                },
                {
                    "verse_number": 3,
                    "verse_text": "The sinner's friend as he reaches down, With a Saviour's wondrous love, Who prepares a mansion, robe, and crown, In his shining courts above, Will gather his flock into the fold, To the fold beyond the tide, As they near the gate, the gate of gold, I believe 'twill open wide. It will open wide, yes open wide; I'll pass thro' its portals free, And rest in peace on the other side, It will open wide for me.",
                    "similarity": 0.28803051099137783
                }
            ]
        },
        {
            "type": "TITLE",
            "hymn_title": "Waiting at the Door",
            "hymn_number": "487",
            "hymnal_id": "GH",
            "similarity": 0.43050720134060033,
            "verses": [
                {
                    "verse_number": 1,
                    "verse_text": "I am waiting for the Master, Who will bid me rise and come To the glory of His presence, To the gladness of His home.",
                    "similarity": 0.22898970801728502
                },
                {
                    "verse_number": 3,
                    "verse_text": "Many friends that traveled with me Reached that portal long ago; One by one they left me battling With the dark and crafty foe.",
                    "similarity": 0.2726296106546554
                },
                {
                    "verse_number": 4,
                    "verse_text": "Yes, their pilgrimage was shorter, And their triumphs sooner won; Oh, how lovingly they'll greet me When the toils of life are done. They are watching at the portal, They are waiting at the door; Waiting only for my coming, All the loved ones gone before.",
                    "similarity": 0.2190322162329841
                }
            ]
        },
        {
            "type": "TITLE",
            "hymn_title": "The Eastern Gate",
            "hymn_number": "815",
            "hymnal_id": "GH",
            "similarity": 0.4093874335301604,
            "verses": [
                {
                    "verse_number": 1,
                    "verse_text": "I will meet you in the morning, Just inside the Eastern Gate, Then be ready, faithful pilgrim, Lest with you it be too late.",
                    "similarity": 0.3668299891951741
                },
                {
                    "verse_number": 2,
                    "verse_text": "If you hasten off to glory, Linger near the Eastern Gate, For I'm coming in the morning, So you'll not have long to wait.",
                    "similarity": 0.30481858116609994
                },
                {
                    "verse_number": 3,
                    "verse_text": "Keep your lamps all trimmed and burning, For the Bridegroom watch and wait, He'll be with us at the meeting, Just inside the Eastern Gate.",
                    "similarity": 0.25290602771685833
                },
                {
                    "verse_number": 4,
                    "verse_text": "O the joys of that glad meeting With the saints who for us wait, What a blessed, happy meeting, Just inside the Eastern Gate. I will meet you, in the morning, I will meet you, in the morning, Just inside the Eastern Gate over there; I will meet you, in the morning, I will meet you, in the morning, I will meet you in the morning, over there.",
                    "similarity": 0.34689060533928806
                }
            ]
        },
        {
            "type": "VERSE",
            "hymn_title": "He Is so Precious to Me",
            "hymn_number": "397b",
            "hymnal_id": "GH",
            "similarity": 0.38638139930480003,
            "verses": [
                {
                    "verse_number": 2,
                    "verse_text": "He stood at my heart's door in sunshine and rain, And patiently waited an entrance to gain; What shame that so long He entreated in vain, For He is so precious to me.",
                    "similarity": 0.38638139930480003
                },
                {
                    "verse_number": 3,
                    "verse_text": "I stand on the mountain of blessing at last, No cloud in the heavens a shadow to cast; His smile is upon me, the valley is past, For He is so precious to me.",
                    "similarity": 0.23955424409807854
                }
            ]
        },
        {
            "type": "VERSE",
            "hymn_title": "Waiting",
            "hymn_number": "256",
            "hymnal_id": "GH",
            "similarity": 0.377265434399208,
            "verses": [
                {
                    "verse_number": 3,
                    "verse_text": "Only waiting till the angels Open wide the pearly gate, At whose portals long I've lingered, Weary, poor, and desolate: Even now I hear their footsteps, And their voices far away; If they call me, I am waiting, Only waiting to obey.",
                    "similarity": 0.377265434399208
                }
            ]
        },
        {
            "type": "VERSE",
            "hymn_title": "Not Far From the Kingdom",
            "hymn_number": "299",
            "hymnal_id": "GH",
            "similarity": 0.3699539547666866,
            "verses": [
                {
                    "verse_number": 1,
                    "verse_text": "Not far, not far from the Kingdom, Yet in the shadow of sin; How many are coming and going! How few there are entering in!",
                    "similarity": 0.24272784934005448
                },
                {
                    "verse_number": 2,
                    "verse_text": "Not far, not far from the Kingdom, Where voices whisper and wait; Too timid to enter in boldly, So linger still outside the gate.",
                    "similarity": 0.3699539547666866
                },
                {
                    "verse_number": 4,
                    "verse_text": "Not far, not far from the Kingdom, 'Tis only a little space; But oh, you may still be for ever Shut out from yon heavenly place! How few there are entering in! How few there are entering in! How many are coming and going! How few there are entering in!",
                    "similarity": 0.2631477455239311
                }
            ]
        },
        {
            "type": "VERSE",
            "hymn_title": "Carried by the Angels",
            "hymn_number": "389",
            "hymnal_id": "GH",
            "similarity": 0.33664083700010683,
            "verses": [
                {
                    "verse_number": 1,
                    "verse_text": "Sitting by the gateway of a palace fair, Once a child of God was left to die; By the world neglected, wealth would nothing share; See the change awaiting there on high.",
                    "similarity": 0.33664083700010683
                }
            ]
        }
    ]
}
}

function handleSubmission() {
	clearSearchQuery();
}

const available_songs = ref<SongSearchInfo[]>([]);
const available_books = ref<BookSummary[]>([]);
const book_data_summaries = ref<Map<string, BookDataSummary>>(new Map<string, BookDataSummary>());

onMounted(async () => {
    const BOOK_METADATA = await getAllBookMetaData();
    const SONG_METADATA = await getAllSongMetaData();
    available_books.value.push(...Object.values(BOOK_METADATA));
    for (const book of Object.keys(SONG_METADATA)) {
        for (const song_number of Object.keys(SONG_METADATA[book])) {
            let song: Song = SONG_METADATA[book][song_number];

            if (song.title == undefined) song.title = "";

            available_songs.value.push({
                title: song?.title ?? "",
                number: song_number,
                book: BOOK_METADATA[book],
                stripped_title: stripSearchText(song?.title ?? ""),
                stripped_first_line: stripSearchText(song?.first_line ?? ""),
            } as SongSearchInfo);
        }
    }

    prepackaged_books.concat(Object.keys(known_references)).forEach(async book => {
        let book_data: BookDataSummary | undefined = await getBookDataSummaryFromName(book);
        if (book_data == undefined) return;
        book_data_summaries.value.set(book, book_data);
    });

    // Restoring position in book
    await nextTick();
    // The v-for for song buttons now should be active, so we can scroll to the saved position
    restoreScrollPosition(route.fullPath);
});

</script>

<template>
    <h1 class="pagetitle">Discover</h1>
	<div class="songlist">
        <RouterLink
            v-for="song in limited_search_results"
            :key="song.title + song.number + song.book.name.short"
            :to="`/display/${song.book.name.short}/${song.number}`"
            class="song"
            :style="`background: linear-gradient(135deg, ${song.book.primaryColor}, ${song.book.secondaryColor})`"
        >
            <div>
                <div class="song__title">{{ song.title }}</div>
                <div class="book__title">{{ song.book.name.medium }}</div>
            </div>
            <div class="booktext--right">
                <div class="song__number">#{{ song.number }}</div>
            </div>
        </RouterLink>
    </div>
	<div class="content-footer">
		<div v-if="search_query.length == 0" class="suggestions-wrapper">
			<button v-for="suggestion in query_suggestions" class="suggestion-pill">
				{{ suggestion }}
			</button>
		</div>
		<div class="prompt-input-wrapper" :class="{ 'prompt-input-wrapper-outline': search_query.length > 0 }">
			<div class="prompt-input">
				<img class="sparkles-icon" src="/assets/sparkles.svg"/>
				<input v-model="search_query" placeholder="Enter any topic, theme or lyrics..." aria-label="Discover site content" />
			</div>
			<div class="prompt-menu">
				<BookFilter
					class="book-filter"
					:books="available_books"
					:selected-books="search_params.bookFilters"
					:dropdown-above="true"
					@update:selectedBooks="search_params.bookFilters = $event"
				/>
				<button v-if="search_query.length > 0" class="submit-prompt" @click="handleSubmission()">
					<img class="ionicon-md arrow-icon" src="/assets/arrow-up-outline.svg"/>
				</button>
			</div>
		</div>
	</div>

    <NavigationBar current_page="discover" />
</template>

<style scoped>
	@import "@/assets/css/search.css";
	@import "@/assets/css/song.css";

	.content-footer {
		justify-self: center;
		position: fixed;
		bottom: 0;
		margin-bottom: 80px;
		max-width: 700px;
		left: 50%;
		width: 100%;
		-moz-transform: translate(-50%, 0); /* Firefox */
		-ms-transform: translate(-50%, 0);  /* IE 9 */
		-webkit-transform: translate(-50%, 0); /* Safari and Chrome*/
		-o-transform: translate(-50%, 0); /* Opera */
		transform: translate(-50%, 0);
	}

	.prompt-input-wrapper {
		margin: 0 15px;
		padding: 20px;
		background-color: var(--div-color);
		border-radius: 18px;
		box-shadow: var(--box-shadow);
		border: 3px solid transparent
	}

	.prompt-input-wrapper-outline {
		border: 3px solid transparent;
		border-radius: 12px;
		background:
			linear-gradient(var(--div-color), var(--div-color)) padding-box,
			conic-gradient(from var(--angle), #94ABFF, #C95EFF, #94ABFF) border-box;
		animation: rotate 3s linear infinite;
		background-origin: border-box;
		background-clip: padding-box, border-box;
	}

	@keyframes rotate {
		to {
			--angle: 1turn;
		}
	}

	@property --angle {
		syntax: "<angle>";
		initial-value: 0turn;
		inherits: false;
	}


	.prompt-input {
		display: flex;
		align-items: center;
	}

	.sparkles-icon {
		width: 16px;
		height: 16px;
	}

	.prompt-menu {
		margin-top: 10px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.submit-prompt {
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 60px;
		border: var(--border-color);
		width: 46px;
		height: 46px;
	}

	.arrow-icon {
		filter: var(--change-svg-filter)
	}

	.suggestions-wrapper {
		margin: 0 0 15px 0;
		gap: 10px;
		display: flex;
		flex-wrap: nowrap; 
		overflow: auto;
		-ms-overflow-style: none;
  		scrollbar-width: none;
		
		&:after {
			content: "";
			position: absolute;
			z-index: 0;
			top: 0;
			right: 0;
			bottom: 150px;
			pointer-events: none;
			background-image: linear-gradient(to right, rgba(255, 255, 255, 0), var(--background) 85%);
			width: 15px;
		}
		&:before {
			content: "";
			position: absolute;
			top: 0;
			left: 0;
			bottom: 150px;
			pointer-events: none;
			background-image: linear-gradient(to left, rgba(255, 255, 255, 0), var(--background) 85%);
			width: 15px;
		}
	}

	.suggestions-wrapper::-webkit-scrollbar {
		display: none;
	}

	.suggestion-pill {
		flex: 0 0 auto;
		padding: 0px 18px;
		border-radius: 18px;
		background-color: var(--pill-color);
		color: var(--subtext-color);
		transition: opacity 0.2s ease;
		opacity: 100%;

		&:first-child {
			margin-left: 15px;
		}
	}

	.suggestion-pill:active {
		opacity: 50%;
	}
</style>
