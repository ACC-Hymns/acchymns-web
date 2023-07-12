import glob
import music21
import os
import json

directory = "C:\\Users\\Dallas\\Documents\\ACCHymnsMusicFiles\\ZHR\\musicxml"
files = glob.glob(directory + "\\*.musicxml")

z = {}

for file in files:
    song = music21.converter.parse(file)

    first_notes_in_first_measure = []

    flattened = song.flatten()
    all_notes = list(flattened.notes)

    for i, n in enumerate(all_notes):
        if n.isChord:
            # print(list(n.notes))
            all_notes.extend(list(n.notes))
            all_notes[i] = None

    # print(all_notes)
    min_offset = min(filter(lambda n: n is not None, all_notes), key=lambda n: n.offset).offset

    first_measure_notes = list(filter(lambda n: n is not None and n.offset == min_offset, all_notes))
    first_note_beat = min(first_measure_notes, key=lambda n: n.beat).beat

    first_notes = sorted(filter(lambda n: n.beat == first_note_beat, first_measure_notes), key=lambda n: n.pitch.ps, reverse=True)
        
    first_notes_filtered = []
    for note in first_notes:
        if note not in first_notes_filtered:
            first_notes_filtered.append(note)

    first_notes_names = [n.nameWithOctave.replace("-", "b") for n in first_notes_filtered]
    z[os.path.basename(file).split(".")[0]] = {
        "notes": first_notes_names
    }
    print(os.path.basename(file).split(".")[0], first_notes_names)

with open("first_notes.json", "w", encoding='utf8') as outfile:
    json.dump(z, outfile, ensure_ascii=False)

