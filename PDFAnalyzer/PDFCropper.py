import json
from pypdf import PdfReader, PdfWriter

data = sorted(json.load(open("internal.json")).items(), key=lambda v: v[1]["page_num"]) 

print(data)
reader = PdfReader("example.pdf")

for idx, (key, value) in enumerate(data):
    # length = value.page_num 
    
    if idx + 1 >= len(data):
        length = 1
        print(key, length)
    else:
        next_key, next_val = data[idx + 1]
        if next_val["page_num"] == value["page_num"]:
            length = 1
        elif next_val["starts_at_top"]:
            length = next_val["page_num"] - value["page_num"]
        else:
            length = next_val["page_num"] - value["page_num"] + 1
        print(key, length, next_val["page_num"], value["page_num"])
        
    writer = PdfWriter()
    print(f"Printing #{key}")
    for i in range(value["page_num"], value["page_num"] + length):
        print("Adding page", i)
        writer.add_page(reader.pages[i])
    
    with open(f"songs/{key}.pdf", "wb") as output_pdf:
        writer.write(output_pdf)

    print("Wrote File")