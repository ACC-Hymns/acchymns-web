from pypdf import PdfWriter, PdfReader
import argparse
import glob
import os

if __name__ == "__main__":
    argparser = argparse.ArgumentParser(description="Crop Hungarian PDFs")
    argparser.add_argument("input", help="Input PDF")

    args = argparser.parse_args()

    for pdf in glob.glob(args.input):
        reader = PdfReader(pdf)
        print("Cropping " + pdf)
        writer = PdfWriter()
        for page in reader.pages:

            width, height = page.mediabox.width, page.mediabox.height
            horizontal_crop, vertical_crop_top, vertical_crop_bottom = width * 0.16, height * 0.12, height * 0.09

            page.mediabox.lower_left = (
                page.mediabox.left + horizontal_crop,
                page.mediabox.bottom + vertical_crop_bottom,
            )
            page.mediabox.upper_right = (
                page.mediabox.right - horizontal_crop,
                page.mediabox.top - vertical_crop_top,
            )
            writer.add_page(page)

        print("Writing " + os.path.join(os.path.dirname(pdf), "cropped_" + os.path.basename(pdf)))
        with open(os.path.join(os.path.dirname(pdf), "cropped_" + os.path.basename(pdf)), "wb") as output_pdf_file:
            writer.write(output_pdf_file)