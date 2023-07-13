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

    # flattened = song.flatten()

    # measures = flattened.measures(0, 10)
    # print(song.show("text"))

    first_measure = []
    starts_with_rest = True

    for part in song.parts:
        for measure in part.getElementsByClass(music21.stream.Measure):
            if measure.number == 1:
                if len(measure.notesAndRests) == 0:
                    for voice in measure.voices:
                        first_measure.append(list(measure.notesAndRests))

                        note = voice.notesAndRests[0]
                        if note.isChord:
                            first_notes_in_first_measure.extend(list(note.notes))
                            starts_with_rest = False
                        elif note.isNote:
                            first_notes_in_first_measure.append(note)
                            starts_with_rest = False
                else:
                    first_measure.append(list(measure.notesAndRests))

                    note = measure.notesAndRests[0]
                    if note.isChord:
                        first_notes_in_first_measure.extend(list(note.notes))
                        starts_with_rest = False
                    elif note.isNote:
                        first_notes_in_first_measure.append(note)
                        starts_with_rest = False

    if starts_with_rest:
        durations = []
        for part in first_measure:
            durations.append(0)
            for note in part:
                if not note.isRest:
                    break
                durations[-1] += note.duration.quarterLength
        smallest_dur = min(durations)
        for idx, part in enumerate(first_measure):
            if durations[idx] == smallest_dur:
                for note in part:
                    if note.isChord:
                        first_notes_in_first_measure.extend(list(note.notes))
                        break
                    elif note.isNote:
                        first_notes_in_first_measure.append(note)
                        break
    if len(first_notes_in_first_measure) == 0:
        print(first_measure)
    # print(first_notes_in_first_measure)
    first_notes = sorted(first_notes_in_first_measure, key=lambda n: n.pitch.ps, reverse=True)
    
    # print(measure.show("text"))
    # print(len(measures))
    # for measure in song.getElementsByClass(music21.stream.Measure):
    #     print(measure.show("text"))
    #     if measure.number == 1:
    #         for note in measure.notes:
    #             # if note.offset == 0:
    #             print(note)
    
    # all_notes = list(flattened.notes)

    # for i, n in enumerate(all_notes):
    #     if n.isChord:
    #         # print(list(n.notes))
    #         all_notes.extend(list(n.notes))
    #         all_notes[i] = None

    # # print(all_notes)
    # min_offset = min(filter(lambda n: n is not None, all_notes), key=lambda n: n.offset).offset

    # first_measure_notes = list(filter(lambda n: n is not None and n.offset == min_offset, all_notes))
    # first_note_beat = min(first_measure_notes, key=lambda n: n.beat).beat

    # first_notes = sorted(filter(lambda n: n.beat == first_note_beat, first_measure_notes), key=lambda n: n.pitch.ps, reverse=True)
        
    first_notes_names = []
    for note in first_notes:
        if note.nameWithOctave.replace("-", "b") not in first_notes_names:
            first_notes_names.append(note.nameWithOctave.replace("-", "b"))

    # first_notes_names = [n.nameWithOctave.replace("-", "b") for n in first_notes_filtered]
    z[os.path.basename(file).split(".")[0]] = {
        "notes": first_notes_names
    }
    print(os.path.basename(file).split(".")[0], first_notes_names)

with open("first_notes.json", "w", encoding='utf8') as outfile:
    json.dump(z, outfile, ensure_ascii=False)

