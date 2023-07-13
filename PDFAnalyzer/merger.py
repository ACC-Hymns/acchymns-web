# I want to merge two json files together
import json

with open("../public/books/ZHR/songs.json", "r", encoding='utf8') as infile:
    songs1 = json.load(infile)

with open("first_notes.json", "r", encoding='utf8') as infile:
    songs2 = json.load(infile)

for key, value in songs1.items():
    if key in songs2:
        value["notes"] = songs2[key]["notes"]
    
with open("songs.json", "w", encoding='utf8') as outfile:
    json.dump(songs1, outfile, ensure_ascii=False)