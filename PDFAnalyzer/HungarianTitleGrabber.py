from pypdf import PdfWriter, PdfReader
import argparse
import glob
import re
import json
import os

pages = {}

def visitor_body(page_num):
    regex = re.compile("\d+\.\s*(.+?)\.\.\..*")
    def internals(text, cm, tm, font_dict, font_size):
        # print(text, text.startswith(page_num + "."), regex.match(text))
        if regex.match(text):
            # print(page_num, regex.split(text)[1])
            pages[page_num] = {
                "title": regex.split(text)[1]
            }
            
            # print(text)

            # if text.split('.')[0] in pages:
            #     pages[text.split('.')[0] + "b"] = {
            #         "page_num": page_num,
            #         "starts_at_top": y > 610
            #     }
            # else:
            #     pages[text.split('.')[0]] = {
            #         "page_num": page_num,
            #         "starts_at_top": y > 610
            #     }
    return internals

if __name__ == "__main__":
    argparser = argparse.ArgumentParser(description="Crop Hungarian PDFs")
    argparser.add_argument("input", help="Input PDF")

    args = argparser.parse_args()
    i = 1
    for pdf in sorted(glob.glob(args.input), key=lambda x: int(os.path.basename(x).split('.')[0])):
        while i != int(os.path.basename(pdf).split('.')[0]):
            print(i)
            i += 1
        reader = PdfReader(pdf)

        # print("Reading " + pdf)
        
        for page in reader.pages:
            page.extract_text(visitor_text=visitor_body(os.path.basename(pdf).split('.')[0]))
        
        if os.path.basename(pdf).split('.')[0] not in pages:
            pages[os.path.basename(pdf).split('.')[0]] = {
                "title": ""
            }
        i += 1

    
    # Writing to sample.json
    with open("internal.json", "w", encoding="utf-8") as outfile:
        outfile.write(json.dumps(pages, ensure_ascii=False))
    
    print(len(pages))