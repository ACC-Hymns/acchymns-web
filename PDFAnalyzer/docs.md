### How to use `pypdf` to convert PDFs

- Duplicate the PDFCropper script and modify as necessary...
- Import your PDF into the folder with your `pypdf` script and rename it appropriately.
- If the PDF has too much whitespace around the margins, you can modify the `HungarianCropper` script to generate a new document with each page cropped, then you can run the converter to split the doc into songs.
- `internal.json` should have an object with key/value pairs,one per song (see schema below), similar to the `songs.json` data used to store the song info.
- The important part of the schema, for PDF conversion purposes, is the page number (the page of the PDF that the song starts on) and the `starts_at_top` prop (a boolean that specifies whether the song begins at the top of the page or not).

```
"1": {
    "title": "U tamnoj noći",
    "notes": ["E4", "C4", "G3", "C3"],
    "page_num": 0,
    "starts_at_top": true
}
```

