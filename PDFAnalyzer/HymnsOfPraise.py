from pypdf import PdfReader
import re
import json

body = set()

pages = {}

def visitor_body(page_num):
    regex = re.compile("(\d+?\..+?)")
    def internals(text, cm, tm, font_dict, font_size):
        if regex.match(text) and text.isupper() and len(text) > 7 and text not in body:
            body.add(text)
            
            y = tm[5]
            print(text)

            if text.split('.')[0] in pages:
                pages[text.split('.')[0] + "b"] = {
                    "page_num": page_num,
                    "starts_at_top": y > 610
                }
            else:
                pages[text.split('.')[0]] = {
                    "page_num": page_num,
                    "starts_at_top": y > 610
                }
    return internals


reader = PdfReader("example.pdf")
for idx, page in enumerate(reader.pages):
    page.extract_text(visitor_text=visitor_body(idx))

# Writing to sample.json
with open("internal.json", "w") as outfile:
    outfile.write(json.dumps(pages))

songs = {}
 

count = 1
for idx, title in enumerate(sorted(list(body), key=lambda x: int(x.split('.')[0]))):

    if int(title.split('.')[0]) != count:
        print("Missed:", int(title.split('.')[0]) - count, "!")
        count = int(title.split('.')[0])
    print(title)
    if title.split('.')[0] in songs:
        songs[title.split('.')[0] + "b"] = {
            "title": title.split('.')[1].strip()
        }
    else:  
        songs[title.split('.')[0]] = {
            "title": title.split('.')[1].strip()
        }
    count += 1

# Serializing json
json_object = json.dumps(songs)
 
# Writing to sample.json
with open("songs.json", "w") as outfile:
    outfile.write(json_object)
