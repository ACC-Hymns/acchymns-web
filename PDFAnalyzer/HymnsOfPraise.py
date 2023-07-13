from pypdf import PdfReader
import re
import json

pages = {}

count = 1

def visitor_body(page_num):
    regex = re.compile("(\d+?)(\/a|\/b)?\. (.+?)(\?|\.|\!)")
    def internals(text, cm, tm, font_dict, font_size):
        global count
        result = regex.match(text)      
        # if result:
        #     print(count, int(result.group(1)), len(result.group(2))) 
        if result and abs(int(result.group(1)) - count) <= 1:
            res = result.group(3) + result.group(4)
            y = tm[5]

            item = result.group(1)
            if result.group(2) is not None:
                item += result.group(2)[1]
                if result.group(2) == "/a":
                    count -= 1
            print(item, text, cm[5], tm[5], y > 630)
            
            pages[item] = {
                "title": res,
                "page_num": page_num,
                "starts_at_top": y > 630
            }

            count += 1

            # if text.split('.')[0] in pages:
            #     pages[text.split('.')[0] + "b"] = {
            #         "page_num": page_num,
            #         "starts_at_top": y > 610
            #     }
            # else:
    return internals


reader = PdfReader("example.pdf")
for idx, page in enumerate(reader.pages):
    page.extract_text(visitor_text=visitor_body(idx))

# Writing to sample.json
with open("internal.json", "w") as outfile:
    outfile.write(json.dumps(pages))

songs = {}

for key, value in pages.items():
    songs[key] = {
        "title": value["title"].strip()
    }

# Writing to sample.json
with open("songs.json", "w", encoding='utf8') as outfile:
    json.dump(songs, outfile, ensure_ascii=False)
