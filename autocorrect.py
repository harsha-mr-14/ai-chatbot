"""
Intelligent Auto-Correction and Fuzzy Query Normalizer for MCE Hassan CSE Timetable Bot.
Handles typos, phonetic misspellings, SMS abbreviations, and intent extraction.
"""

import re
from typing import Tuple, List, Dict, Set

# Slang & abbreviation direct replacement dictionary
SLANG_AND_TYPOS: Dict[str, str] = {
    # Pronouns & question words
    "wat": "what",
    "wht": "what",
    "whr": "where",
    "wer": "where",
    "wen": "when",
    "wn": "when",
    "whos": "who is",
    "whois": "who is",
    "rn": "right now",
    "nxt": "next",
    "pls": "please",
    "plz": "please",
    "u": "you",
    "ur": "your",
    "r": "are",

    # Informal / Hinglish markers
    "kahan": "where is",
    "kaha": "where is",
    "kidhar": "where is",
    "kab": "when is",
    "kitne": "what time is",
    "baje": "o clock",
    "khali": "free",
    "konsa": "which",
    "kon": "who",

    # Days
    "mondy": "monday",
    "mnday": "monday",
    "monady": "monday",
    "tuesdy": "tuesday",
    "tuseday": "tuesday",
    "tueasday": "tuesday",
    "tues": "tuesday",
    "wensday": "wednesday",
    "wednsday": "wednesday",
    "wednesdy": "wednesday",
    "wed": "wednesday",
    "thursdy": "thursday",
    "thurday": "thursday",
    "thrusday": "thursday",
    "thurs": "thursday",
    "firday": "friday",
    "fridya": "friday",
    "fri": "friday",
    "satrday": "saturday",
    "saterday": "saturday",
    "satday": "saturday",
    "sat": "saturday",
    "sundya": "sunday",
    "sundy": "sunday",
    "tday": "today",
    "tody": "today",
    "tmrw": "tomorrow",
    "tommorow": "tomorrow",
    "tomorow": "tomorrow",
    "tomoro": "tomorrow",

    # Intents & Concepts
    "fre": "free",
    "fee": "free",
    "priod": "period",
    "priods": "periods",
    "perid": "period",
    "peroids": "periods",
    "clss": "class",
    "clas": "class",
    "classes": "classes",
    "sedule": "schedule",
    "shedule": "schedule",
    "schedual": "schedule",
    "skedule": "schedule",
    "schedul": "schedule",
    "timetbl": "timetable",
    "time-table": "timetable",
    "timetable": "timetable",
    "timmings": "timings",
    "timngs": "timings",
    "timmngs": "timings",
    "timin": "timing",
    "tyme": "time",

    # Faculty & Teachers
    "facaultys": "faculty",
    "facaulty": "faculty",
    "facalty": "faculty",
    "facultiy": "faculty",
    "faculties": "faculty",
    "techr": "teacher",
    "techrs": "teachers",
    "proffesor": "professor",
    "proff": "professor",
    "prof": "professor",
    "mam": "madam",
    "maam": "madam",

    # Venues & Rooms
    "clasroom": "classroom",
    "clasrooms": "classrooms",
    "romm": "room",
    "romms": "rooms",
    "veneu": "venue",
    "venew": "venue",
    "locaton": "location",
    "locatn": "location",
    "honeywel": "honeywell",
    "honey well": "honeywell",
    "hwlab": "h/w lab",
    "cslab4": "cslab-4",
    "cslab2": "cslab-2",
    "e301": "ee301",
    "ee-301": "ee301",

    # Subjects & Codes
    "datastructures": "data structures",
    "datastructure": "data structures",
    "ds": "dsa",
    "jaava": "java",
    "jav": "java",
    "oops": "oopj",
    "oop": "oopj",
    "unx": "unix",
    "linx": "unix",
    "pytn": "python",
    "pythn": "python",
    "excl": "excel",
    "exel": "excel",
    "anlytics": "analytics",
    "visulization": "visualization",
    "mathe": "maths",
    "math": "maths",
    "math3": "m3",
    "dco": "ddco",
    "ddc": "ddco",

    # Breaks
    "brek": "break",
    "lnch": "lunch",
    "lunc": "lunch",
    "intervl": "interval",
    "reces": "recess",

    # Teaching & Faculty Names
    "teching": "teaching",
    "techer": "teacher",
    "roop": "roopa",
    "rupa": "roopa",
    "sruthi": "shruthi",
    "shruti": "shruthi",
    "ayesha": "ayeesha",
    "aisha": "ayeesha",
    "bimbha": "bimba",
    "lib": "library",
    "dept": "department",
    "lec": "lecture",
    "lecs": "lectures",
    "sub": "subject",
    "subs": "subjects",

    # Themes & Modes
    "daark": "dark",
    "drk": "dark",
    "theam": "theme",
    "theem": "theme"
}

# Standard English words that should never be fuzzy-replaced by domain jargon
COMMON_ENGLISH_WORDS: Set[str] = {
    "list", "all", "tell", "show", "give", "take", "takes", "get", "got", "go", "going",
    "is", "are", "was", "were", "be", "been", "being",
    "who", "what", "where", "when", "why", "how", "which",
    "do", "does", "did", "have", "has", "had",
    "a", "an", "the", "and", "or", "but", "if", "not", "no", "yes",
    "in", "on", "at", "to", "for", "with", "from", "by", "about", "as", "of",
    "i", "me", "my", "mine", "we", "us", "our", "ours",
    "you", "your", "yours", "he", "him", "his", "she", "her", "hers", "they", "them", "their",
    "any", "some", "every", "all", "each", "both", "either", "neither",
    "can", "could", "will", "would", "shall", "should", "may", "might", "must",
    "please", "help", "details", "info", "name", "names", "now", "here", "there",
    "good", "bad", "new", "old", "first", "last", "next", "after", "before"
}

# Vocabulary for Levenshtein fuzzy distance matching
COLLEGE_VOCABULARY = [
    # Days
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
    "today", "tomorrow",
    # Intents
    "free", "period", "periods", "schedule", "timetable", "routine",
    "timing", "timings", "class", "classes", "room", "rooms", "classroom",
    "venue", "venues", "faculty", "teacher", "teachers", "professor",
    "lab", "labs", "laboratory", "practical", "practicals", "break", "lunch",
    "interval", "start", "starts", "finish", "finishes", "batch", "batches",
    "hod", "coordinator",
    # Subjects
    "dsa", "ddco", "oopj", "java", "unix", "python", "excel", "iot",
    "mathematics", "maths", "bridge", "placement", "project",
    # Names
    "roopa", "ayeesha", "siddiqa", "bimba", "prasad", "shruthi",
    "chandrika", "sindhu", "nithyashree", "prakruthi", "krishna", "swaroop",
    "shashi", "ananda", "babu", "vinod", "shobha",
    # Rooms
    "ee301", "cslab", "honeywell",
    # Theme
    "dark", "light", "theme", "mode"
]

def levenshtein_distance(s1: str, s2: str) -> int:
    """Computes the Levenshtein edit distance between two strings."""
    if len(s1) > len(s2):
        s1, s2 = s2, s1
    distances = range(len(s1) + 1)
    for i2, c2 in enumerate(s2):
        distances_ = [i2 + 1]
        for i1, c1 in enumerate(s1):
            if c1 == c2:
                distances_.append(distances[i1])
            else:
                distances_.append(1 + min((distances[i1], distances[i1 + 1], distances_[-1])))
        distances = distances_
    return distances[-1]

def find_best_fuzzy_match(word: str, max_distance: int = 2) -> Tuple[str, bool]:
    """Finds the closest match in COLLEGE_VOCABULARY if edit distance <= max_distance."""
    if len(word) <= 2 or word in COMMON_ENGLISH_WORDS:
        return word, False

    best_match = word
    best_dist = 999

    for vocab in COLLEGE_VOCABULARY:
        # Avoid matching completely different short words
        if abs(len(word) - len(vocab)) > 2:
            continue
        dist = levenshtein_distance(word, vocab)
        if dist < best_dist and dist <= max_distance:
            # For 3-letter words only allow distance 1
            if len(word) == 3 and dist > 1:
                continue
            best_dist = dist
            best_match = vocab

    if best_match != word and best_dist <= max_distance:
        return best_match, True
    return word, False

def autocorrect_query(query: str) -> Tuple[str, bool, List[Tuple[str, str]]]:
    """
    Cleans, normalizes, and auto-corrects typos in student questions.
    Returns: (corrected_query, was_corrected, list_of_corrections)
    """
    if not query:
        return query, False, []

    # Preserve punctuation separation for words
    raw = query.strip()
    words = re.findall(r"[\w/]+|[^\w\s]", raw.lower())

    corrected_words = []
    corrections = []

    for token in words:
        # If it's punctuation, keep as is
        if not re.match(r"^[\w/]+$", token):
            corrected_words.append(token)
            continue

        # Check direct slang / typo dictionary
        if token in SLANG_AND_TYPOS:
            replacement = SLANG_AND_TYPOS[token]
            corrected_words.append(replacement)
            if replacement != token:
                corrections.append((token, replacement))
            continue

        # Check Levenshtein fuzzy distance against college vocabulary
        fuzzy_replacement, was_fuzzy = find_best_fuzzy_match(token)
        if was_fuzzy:
            corrected_words.append(fuzzy_replacement)
            corrections.append((token, fuzzy_replacement))
        else:
            corrected_words.append(token)

    # Reconstruct text cleanly
    reconstructed = " ".join(corrected_words)
    # Fix punctuation spacing: " ?" -> "?"
    reconstructed = re.sub(r"\s+([?,.!'])", r"\1", reconstructed)
    # Collapse duplicate spaces
    reconstructed = re.sub(r"\s+", " ", reconstructed).strip()

    was_corrected = len(corrections) > 0
    return reconstructed, was_corrected, corrections

if __name__ == "__main__":
    test_cases = [
        "mondy fre priods",
        "tuesdy sedule plz",
        "whos teching dsa",
        "where is honeywel lab",
        "facaultys list",
        "brek timmings",
        "are there any fre priods on wensday",
        "wat clss rn",
        "when does roop mam take clas",
        "which romm for ee301"
    ]
    print("Testing Auto-Correction Engine:")
    print("=" * 60)
    for t in test_cases:
        corrected, changed, diffs = autocorrect_query(t)
        arrow = " ➔ " if changed else " (No change) "
        diff_str = f" [{', '.join([f'{a}->{b}' for a, b in diffs])}]" if diffs else ""
        print(f"Original : {t}")
        print(f"Corrected: {corrected}{diff_str}")
        print("-" * 60)
