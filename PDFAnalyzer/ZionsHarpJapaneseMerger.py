from pypdf import PdfWriter, PdfReader
import os

print(os.listdir("songs"))

pdf_files = {}

for filename in os.listdir("songs"):
    print(filename[4:-4])
    if filename[4:-4] not in pdf_files:
        pdf_files[filename[4:-4]] = [filename]
    else:
        pdf_files[filename[4:-4]].append(filename)


for key, value in pdf_files.items():
    merger = PdfWriter()
    for filename in value:
        with open(f"songs/{filename}", "rb") as input_pdf:
            merger.append(fileobj=input_pdf)
    print(f"Writing: joined/{key}.pdf")
    with open(f"joined/{key}.pdf", "wb") as output_pdf:
        merger.write(output_pdf)

odd = True
for filename in os.listdir("joined"):
    writer = PdfWriter()
    reader = PdfReader(f"joined/{filename}")
    print("Cropping " + filename, "- is odd:", odd)
    for page in reader.pages:
        horizontal_crop = page.mediabox.width * 0.10

        if odd:
            page.mediabox.right = page.mediabox.right - page.mediabox.width * 0.11
            # page.mediabox.left = page.mediabox.left + page.mediabox.width * 0.06
        else:
            page.mediabox.right = page.mediabox.right - page.mediabox.width * 0.02
            page.mediabox.left = page.mediabox.left + page.mediabox.width * 0.09
        writer.add_page(page)
        odd = not odd
    
    with open(os.path.join("cropped", filename), "wb") as output_pdf_file:
        writer.write(output_pdf_file)

# merger.append(fileobj=input1)
# with open("document-output.pdf", "wb") as output:
#     merger.write(output)