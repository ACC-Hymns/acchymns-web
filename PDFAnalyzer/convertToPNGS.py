# STEP 1
# import libraries
import fitz
import io
from PIL import Image
  
# STEP 2
# file path you want to extract images from

song_count = 818

def convert(song_number):

    file = f"{song_number}.pdf"
    images_list = []
    
    # open the file
    pdf_file = fitz.open(file)
    
    # STEP 3
    # iterate over PDF pages
    for page_index in range(len(pdf_file)):
    
        # get the page itself
        page = pdf_file[page_index]
        image_list = page.get_images()
    
        # printing number of images found in this page
        if image_list:
            print(
                f"[+] Found a total of {len(image_list)} images in page {page_index}")
        else:
            print("[!] No images found on page", page_index)
        for image_index, img in enumerate(page.get_images(), start=1):
    
            # get the XREF of the image
            xref = img[0]
    
            # extract the image bytes
            base_image = pdf_file.extract_image(xref)
            image_bytes = base_image["image"]
    
            # get the image extension
            image_ext = base_image["ext"]
            image_width = base_image["width"]
            image_height = base_image["height"]
            image_mode = "L"
            crop_start_height = page.cropbox_position.y
            crop_bottom = page.rect.y1
            page_height = page.mediabox.y1

            print(f"Mode: {image_mode}, Width: {image_width}, Height: {image_height}")
            image_cropbox_start_height = round(crop_start_height/page_height*image_height)
            image_cropbox_height_inverse = round(crop_bottom/page_height*image_height)
            image_cropbox_height = image_height - image_cropbox_height_inverse
            image_crop_bottom = image_cropbox_start_height + image_cropbox_height_inverse
            print(f"PRE CORRECTION({0},{image_cropbox_start_height},{image_width},{image_crop_bottom})")
            if image_crop_bottom == 0:
                image_crop_bottom = image_height
            if image_crop_bottom > image_height:
                image_crop_bottom = image_height
            simg = Image.open(io.BytesIO(image_bytes))
            print(f"({0},{image_cropbox_start_height},{image_width},{image_crop_bottom})")
            simg = simg.crop((0, image_cropbox_start_height, image_width, image_crop_bottom))
            images_list.append(simg)

    temp_height = 0
    total_height = 0

    for i in images_list:
        total_height += i.height


    final_img = Image.new("L", (images_list[0].width, total_height))
    for image_to_combine in images_list:
        final_img.resize((image_to_combine.width, final_img.height + image_to_combine.height))
        final_img.paste(image_to_combine, (0, temp_height))
        temp_height += image_to_combine.height

    final_img.save(f"{song_number}.png")

for i in range(song_count):
    convert(i + 1)