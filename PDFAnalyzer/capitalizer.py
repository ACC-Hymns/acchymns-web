import json

songs = json.load(open("../public/books/ZGE/songs.json"))
for key, value in songs.items():
    value["title"] = " ".join(w.capitalize() for w in value["title"].split())

    
with open("../public/books/ZGE/songs.json", "w", encoding='utf8') as outfile:
    json.dump(songs, outfile, ensure_ascii=False)