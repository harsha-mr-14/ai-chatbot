"""
Core timetable AI chatbot logic for Malnad College of Engineering (MCE Hassan)
III Semester CSE Section C.
"""

import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple
from autocorrect import autocorrect_query

# Ensure UTF-8 output in Windows terminals
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

DATA_FILE = Path(__file__).parent / "data" / "timetable.json"

def load_timetable_data() -> Dict[str, Any]:
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

TIMETABLE = load_timetable_data()

DAYS_MAP = {
    "mon": "Monday",
    "monday": "Monday",
    "tue": "Tuesday",
    "tues": "Tuesday",
    "tuesday": "Tuesday",
    "wed": "Wednesday",
    "wednesday": "Wednesday",
    "thu": "Thursday",
    "thur": "Thursday",
    "thurs": "Thursday",
    "thursday": "Thursday",
    "fri": "Friday",
    "friday": "Friday",
    "sat": "Saturday",
    "saturday": "Saturday",
    "sun": "Sunday",
    "sunday": "Sunday"
}

DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

def parse_time_str(time_str: str) -> Tuple[int, int]:
    """Parse 'HH:MM' into (hours, minutes)"""
    parts = time_str.strip().split(":")
    return int(parts[0]), int(parts[1])

def time_to_minutes(hours: int, minutes: int) -> int:
    return hours * 60 + minutes

def get_current_day_and_time(custom_day: Optional[str] = None, custom_time: Optional[str] = None) -> Tuple[str, str, int]:
    """Returns (day_name, time_str, minutes_from_midnight)"""
    now = datetime.now()
    day = custom_day if custom_day else now.strftime("%A")
    # Normalize day
    day_lower = day.strip().lower()
    day = DAYS_MAP.get(day_lower, day.capitalize())

    if custom_time:
        time_str = custom_time.strip()
    else:
        time_str = now.strftime("%H:%M")

    h, m = parse_time_str(time_str)
    return day, time_str, time_to_minutes(h, m)

def get_status_at(day: str, time_str: str) -> Dict[str, Any]:
    """Given a day and time (HH:MM), returns current class, next class, and status description."""
    day = DAYS_MAP.get(day.lower(), day)
    schedule = TIMETABLE["schedule"].get(day, [])

    h, m = parse_time_str(time_str)
    cur_mins = time_to_minutes(h, m)

    if day == "Sunday":
        return {
            "day": day,
            "time": time_str,
            "state": "weekend",
            "message": "Today is Sunday! No classes scheduled. Enjoy your weekend!",
            "current": None,
            "next": None,
            "current_description": "🎉 Today is Sunday! College is closed and no classes are scheduled. Enjoy your weekend!",
            "next_description": "Classes resume on Monday morning at 8:30 AM with Placement Training I (PT1) in Room EE301."
        }

    current_slot = None
    next_slot = None

    for slot in schedule:
        sh, sm = parse_time_str(slot["start"])
        eh, em = parse_time_str(slot["end"])
        start_mins = time_to_minutes(sh, sm)
        end_mins = time_to_minutes(eh, em)

        if start_mins <= cur_mins < end_mins:
            current_slot = slot
        elif cur_mins < start_mins:
            if next_slot is None:
                next_slot = slot

    if current_slot:
        # Check if it's break or class
        slot_type = current_slot.get("type", "Theory")
        if slot_type == "Break":
            state = "break"
            desc = f"☕ You are currently on **{current_slot['subject']}** ({current_slot['time']})."
        elif slot_type == "Free":
            state = "free"
            desc = f"✨ You have a **Free / Study Period** right now ({current_slot['time']})."
        else:
            state = "class"
            desc = (f"📍 **Current Class:** {current_slot['subject']}\n"
                    f"🏢 **Room / Venue:** {current_slot['room']}\n"
                    f"⏰ **Time:** {current_slot['time']}\n"
                    f"👨‍🏫 **Faculty:** {current_slot.get('faculty', 'Faculty')}")
    else:
        # Before or after college hours
        if cur_mins < time_to_minutes(8, 30):
            state = "before_college"
            desc = f"🌅 College classes haven't started yet. Morning session starts at 8:30 AM."
        elif cur_mins >= time_to_minutes(18, 0):
            state = "after_college"
            desc = f"🌙 All classes for {day} are completed for the day. Have a great evening!"
        else:
            state = "free"
            desc = f"✨ No active class in session right now."

    next_desc = ""
    if next_slot:
        next_type = next_slot.get("type", "Theory")
        if next_type == "Break":
            next_desc = f"☕ **Next up:** {next_slot['subject']} at {next_slot['time']}"
        elif next_type == "Free":
            next_desc = f"✨ **Next up:** Free period at {next_slot['time']}"
        else:
            next_desc = (f"⏭️ **Next Class:** {next_slot['subject']} at {next_slot['time']} "
                         f"in Room **{next_slot['room']}** (Faculty: {next_slot.get('faculty', '-')})")
    else:
        next_desc = "No further classes scheduled for today."

    return {
        "day": day,
        "time": time_str,
        "state": state,
        "current": current_slot,
        "next": next_slot,
        "current_description": desc,
        "next_description": next_desc
    }

def format_day_schedule(day: str) -> str:
    day = DAYS_MAP.get(day.lower(), day)
    schedule = TIMETABLE["schedule"].get(day)
    if not schedule:
        return f"No schedule found for {day}."
    if day == "Sunday":
        return "🎉 **Sunday**: No classes scheduled! It's a holiday."

    lines = [f"📅 **Schedule for {day} (III Sem CSE - Sec C | Room: EE301)**:\n"]
    for item in schedule:
        stype = item.get("type", "")
        if stype == "Break":
            icon = "☕"
            lines.append(f"- **{item['time']}** {icon} *{item['subject']}*")
        elif stype == "Free":
            icon = "🕊️"
            lines.append(f"- **{item['time']}** {icon} *{item['subject']}*")
        elif "Lab" in stype or "Practical" in stype:
            icon = "🧪"
            lines.append(f"- **{item['time']}** {icon} **{item['subject']}** | 📍 Venue: **{item['room']}** | 👨‍🏫 Faculty: {item['faculty']}")
        else:
            icon = "📚"
            code_str = f"[{item['code']}] " if "code" in item else ""
            lines.append(f"- **{item['time']}** {icon} **{code_str}{item['subject']}** | 📍 Room: **{item['room']}** | 👨‍🏫 Faculty: {item['faculty']}")

    return "\n".join(lines)

STOP_WORDS = {
    "who", "is", "are", "the", "for", "of", "in", "at", "to", "a", "an", "on", "when",
    "do", "does", "we", "have", "there", "any", "some", "can", "you", "i", "my", "our",
    "teaches", "teaching", "teacher", "teachers", "faculty", "faculties", "prof", "professor",
    "sir", "madam", "mam", "maam", "class", "classes", "subject", "subjects",
    "tell", "me", "about", "give", "details", "info", "information", "what", "where", "which"
}

SUBJECT_ALIASES = {
    "dsa": ["data structures", "25cs303", "25cs305", "dsa lab", "data structures laboratory"],
    "data structures": ["dsa", "25cs303", "25cs305"],
    "m3": ["mathematics", "maths", "25macs301", "mathematics for computer science"],
    "maths": ["m3", "mathematics", "25macs301"],
    "mathematics": ["m3", "maths", "25macs301"],
    "ddco": ["digital design", "computer organization", "25cs302", "ddco-p"],
    "digital design": ["ddco", "25cs302"],
    "oopj": ["oops with java", "java", "oop", "25cs304", "oopj-p"],
    "java": ["oopj", "oops with java", "25cs304", "oopj-p"],
    "oop": ["oopj", "oops with java", "25cs304"],
    "unix": ["unix and shell programming", "shell", "25cs306", "unix lab"],
    "shell": ["unix", "25cs306"],
    "iot": ["internet of things", "24cs563"],
    "internet of things": ["iot", "24cs563"],
    "scr": ["community", "societal project", "25scr"],
    "pt1": ["placement training", "placement", "aptitude", "25pt1"],
    "placement": ["pt1", "placement training", "25pt1"],
    "excel": ["data analytics with excel", "analytics", "25cs307", "25cs307b/c"],
    "python": ["data visualization with python", "visualization", "25cs307", "25cs307b/c"],
    "dip": ["bridge course", "25bcm301", "m3-dip", "dip maths"],
    "bridge": ["dip", "bridge course mathematics", "25bcm301"]
}

def clean_query(text: str) -> str:
    # Lowercase and remove punctuation except hyphens/slashes
    clean = re.sub(r"[^\w\s\-/]", " ", text.lower())
    return " ".join(clean.split())

def extract_keywords(text: str) -> List[str]:
    cleaned = clean_query(text)
    words = cleaned.split()
    keywords = [w for w in words if w not in STOP_WORDS and len(w) > 1]
    return keywords

GENERIC_WORDS = {"laboratory", "lab", "computer", "science", "engineering", "applications", "department", "studies", "course"}

def search_faculty(query: str) -> Optional[str]:
    cleaned = clean_query(query)
    keywords = extract_keywords(query)
    
    # Expand aliases
    expanded_terms = set(keywords)
    for kw in keywords:
        if kw in SUBJECT_ALIASES:
            for alias in SUBJECT_ALIASES[kw]:
                expanded_terms.add(alias)
                for w in alias.split():
                    if w not in GENERIC_WORDS:
                        expanded_terms.add(w)

    scored_matches = []
    for fac in TIMETABLE["faculty_directory"]:
        name_lower = fac["name"].lower()
        subj_lower = fac["subject"].lower()
        code_lower = fac.get("course_code", "").lower()

        score = 0
        # Direct query in name or subject
        if cleaned in name_lower or name_lower in cleaned:
            score += 100
        if cleaned in subj_lower:
            score += 90

        # Term scoring
        for term in expanded_terms:
            if term in GENERIC_WORDS:
                continue
            # Exact token in name
            if re.search(r"\b" + re.escape(term) + r"\b", name_lower):
                score += 50
            elif term in name_lower and len(term) > 3:
                score += 25

            # Exact token in course code
            if term in code_lower:
                score += 45

            # Exact token in subject
            if re.search(r"\b" + re.escape(term) + r"\b", subj_lower):
                score += 40
            elif term in subj_lower and len(term) > 3:
                score += 15

        if score > 20:
            scored_matches.append((score, fac))

    if not scored_matches:
        return None

    # Sort by score descending
    scored_matches.sort(key=lambda x: x[0], reverse=True)
    top_score = scored_matches[0][0]

    # Keep matches within a reasonable margin of the top score
    filtered = [fac for score, fac in scored_matches if score >= max(35, top_score * 0.6)]

    seen = set()
    dedup = []
    for m in filtered:
        if m["name"] not in seen:
            seen.add(m["name"])
            dedup.append(m)

    res = ["👨‍🏫 **Faculty Details Found:**\n"]
    for f in dedup:
        res.append(f"• **{f['name']}** ({f.get('designation', 'Faculty')}, {f.get('department', 'CSE')})")
        res.append(f"  - Subject: **{f['subject']}**")
        if "course_code" in f:
            res.append(f"  - Course Code: `{f['course_code']}`")
        if "assistants" in f:
            res.append(f"  - Assisting Faculty: {f['assistants']}")
        res.append("")
    return "\n".join(res)

def search_subject(query: str) -> Optional[str]:
    cleaned = clean_query(query)
    keywords = extract_keywords(query)
    expanded_terms = set(keywords)
    for kw in keywords:
        if kw in SUBJECT_ALIASES:
            for alias in SUBJECT_ALIASES[kw]:
                expanded_terms.add(alias)
                for w in alias.split():
                    if w not in GENERIC_WORDS:
                        expanded_terms.add(w)

    scored_matches = []
    for c in TIMETABLE["courses"]:
        code_lower = c["code"].lower()
        short_lower = c["short_name"].lower()
        title_lower = c["title"].lower()

        score = 0
        if cleaned in title_lower or title_lower in cleaned:
            score += 100
        if cleaned in short_lower or short_lower == cleaned:
            score += 90
        if cleaned in code_lower:
            score += 90

        for term in expanded_terms:
            if term in GENERIC_WORDS:
                continue
            if term == short_lower or re.search(r"\b" + re.escape(term) + r"\b", short_lower):
                score += 50
            if term in code_lower:
                score += 45
            if re.search(r"\b" + re.escape(term) + r"\b", title_lower):
                score += 35

        if score > 25:
            scored_matches.append((score, c))

    if not scored_matches:
        return None

    scored_matches.sort(key=lambda x: x[0], reverse=True)
    top_score = scored_matches[0][0]
    filtered = [c for score, c in scored_matches if score >= max(35, top_score * 0.6)]

    seen = set()
    dedup = []
    for m in filtered:
        if m["code"] not in seen:
            seen.add(m["code"])
            dedup.append(m)

    res = ["📚 **Course Details:**\n"]
    for c in dedup:
        res.append(f"### {c['title']} (`{c['code']}` / **{c['short_name']}**)")
        res.append(f"- **Type:** {c['type']}")
        res.append(f"- **Faculty:** {c['faculty']}")
        res.append(f"- **Default Room / Venue:** **{c['room']}**")
        if "timing_hint" in c:
            res.append(f"- **Scheduled Timing:** {c['timing_hint']}")
        if "description" in c:
            res.append(f"- **Overview:** {c['description']}")
        res.append("")
    return "\n".join(res)

def get_batches_info() -> str:
    batches = TIMETABLE["batches_25CS307BC"]
    res = [
        "📊 **Batch Details for Friday (11:00 AM - 1:00 PM)**:",
        "**Course: 25CS307B/C - Data Analytics with Excel / Data Visualization with Python**\n",
        "📗 **Data Analytics with Excel:**"
    ]
    for b in batches["excel"]["batches"]:
        res.append(f"- **Batch {b['batch']}**: 📍 Venue: **{b['venue']}** | 👨‍🏫 Faculty: `{b['faculty']}`")

    res.append("\n📘 **Data Visualization with Python:**")
    for b in batches["python"]["batches"]:
        res.append(f"- **Batch {b['batch']}**: 📍 Venue: **{b['venue']}** | 👨‍🏫 Faculty: `{b['faculty']}`")

    return "\n".join(res)

def get_venues_info() -> str:
    venues = TIMETABLE["venues"]
    res = ["🏛️ **Classrooms & Laboratories Directory:**\n"]
    for v in venues:
        res.append(f"- **{v['name']}** (*{v['type']}*): {v['description']}")
    return "\n".join(res)

def get_all_faculty_list() -> str:
    res = ["👨‍🏫 **Complete Faculty & Staff Directory (III Sem CSE - Sec C):**\n"]
    for f in TIMETABLE["faculty_directory"]:
        res.append(f"- **{f['name']}** — {f['subject']} ({f.get('designation', 'Faculty')})")
    res.append(f"\n🏛️ **Head of Department:** {TIMETABLE['college']['hod']['name']}")
    res.append("📋 **Timetable Coordinators:** " + ", ".join([c['name'] for c in TIMETABLE['college']['timetable_coordinators']]))
    return "\n".join(res)

def get_breaks_info() -> str:
    return (
        "⏰ **Daily Break Timings (MCE Hassan):**\n\n"
        "1. ☕ **Morning Tea Break:** `10:30 AM - 11:00 AM` (30 minutes)\n"
        "2. 🍽️ **Lunch Break:** `1:00 PM - 2:00 PM` (1 hour)\n\n"
        "Class hours run from **8:30 AM to 6:00 PM** (Monday to Friday) and **8:30 AM to 1:00 PM** on Saturday."
    )

def get_day_free_periods(day: str) -> str:
    day = DAYS_MAP.get(day.lower(), day)
    schedule = TIMETABLE["schedule"].get(day, [])

    if day == "Sunday":
        return "🎉 **Sunday**: The entire day is a college holiday! You have no classes all day."

    free_slots = []
    for item in schedule:
        if item.get("type") == "Free":
            free_slots.append(item)

    res = [f"🕊️ **Free Periods on {day} (III Sem CSE - Sec C):**\n"]
    if free_slots:
        for idx, slot in enumerate(free_slots, 1):
            res.append(f"{idx}. ⏰ **{slot['time']}**: {slot['subject']}")
    else:
        res.append("There are no designated free study periods during lecture hours on this day.")

    # Helpful context about breaks
    res.append("\n*☕ Morning Break is 10:30 AM – 11:00 AM, and 🍽️ Lunch Break is 1:00 PM – 2:00 PM.*")
    return "\n".join(res)

def get_day_labs(day: str) -> str:
    day = DAYS_MAP.get(day.lower(), day)
    schedule = TIMETABLE["schedule"].get(day, [])

    if day == "Sunday":
        return "Sunday is a holiday. No labs or practicals scheduled."

    labs = [item for item in schedule if "Lab" in item.get("type", "") or "Practical" in item.get("type", "")]

    if not labs:
        return f"🧪 **Labs on {day}:**\nThere are **no lab or practical sessions** on {day}! You only have theory classes and designated free study hours."

    res = [f"🧪 **Lab / Practical Sessions on {day} (Sec C):**\n"]
    for lab in labs:
        code_str = f"[{lab['code']}] " if "code" in lab else ""
        res.append(f"• **{code_str}{lab['subject']}**")
        res.append(f"  - ⏰ **Timing:** {lab['time']}")
        res.append(f"  - 📍 **Venue:** **{lab['room']}**")
        res.append(f"  - 👨‍🏫 **Faculty:** {lab.get('faculty', '-')}")
        res.append("")
    return "\n".join(res)

def get_day_start_or_end(day: str, is_start: bool) -> str:
    day = DAYS_MAP.get(day.lower(), day)
    schedule = TIMETABLE["schedule"].get(day, [])

    if day == "Sunday":
        return "Sunday is a holiday. College is closed."

    # Filter out free and break at start/end
    actual_classes = [item for item in schedule if item.get("type") not in ["Break", "Free"]]
    if not actual_classes:
        return f"No scheduled classes on {day}."

    if is_start:
        first = actual_classes[0]
        # Check if first slot is preceded by a free slot
        pre_free = any(item.get("start") == "08:30" and item.get("type") == "Free" for item in schedule)
        if pre_free:
            return (f"🌅 **Class Start Time on {day}:**\n"
                    f"Your first class starts at **{first['start']} AM** with **{first['subject']}** in Room **{first['room']}**.\n"
                    f"*(Note: 8:30 AM – 9:30 AM is a free period!)*")
        return (f"🌅 **Class Start Time on {day}:**\n"
                f"College starts at **{first['start']} AM** with **{first['subject']}** in Room **{first['room']}** (Faculty: {first.get('faculty', '-')}).")
    else:
        last = actual_classes[-1]
        if day in ["Wednesday", "Thursday"]:
            return (f"🌙 **Class Finish Time on {day}:**\n"
                    f"Your classes finish at **{last['end']}** after **{last['subject']}** (Room {last['room']})!\n"
                    f"🎉 **The entire afternoon (2:00 PM – 6:00 PM) is OFF!**")
        elif day == "Saturday":
            return (f"🌙 **Class Finish Time on Saturday:**\n"
                    f"Classes finish at **1:00 PM** after **Mathematics (M3)**.\n"
                    f"🎉 **Saturday afternoon is a half-day off for the weekend!**")
        else:
            return (f"🌙 **Class Finish Time on {day}:**\n"
                    f"Classes conclude at **{last['end']}** with **{last['subject']}**.")

def get_subject_weekly_schedule(subject_query: str) -> Optional[str]:
    cleaned = clean_query(subject_query)
    keywords = extract_keywords(subject_query)
    expanded = set(keywords)
    for kw in keywords:
        if kw in SUBJECT_ALIASES:
            for alias in SUBJECT_ALIASES[kw]:
                expanded.add(alias)
                for w in alias.split():
                    if w not in GENERIC_WORDS:
                        expanded.add(w)

    # Find matching course
    matched_course = None
    for c in TIMETABLE["courses"]:
        code_lower = c["code"].lower()
        short_lower = c["short_name"].lower()
        title_lower = c["title"].lower()

        if any(kw == short_lower or kw in code_lower for kw in expanded):
            matched_course = c
            break
        elif short_lower in cleaned or code_lower in cleaned or any(kw in title_lower.split() for kw in expanded if kw not in GENERIC_WORDS):
            matched_course = c
            break

    if not matched_course:
        return None

    # Search all occurrences across days
    occurrences = []
    c_code = matched_course["code"].lower()
    c_short = matched_course["short_name"].lower()

    for day in DAYS_ORDER[:-1]: # Mon-Sat
        slots = TIMETABLE["schedule"].get(day, [])
        for slot in slots:
            scode = (slot.get("code") or "").lower()
            ssubj = slot.get("subject", "").lower()
            if c_code in scode or c_short in ssubj or scode == c_code:
                occurrences.append((day, slot))

    if not occurrences:
        return None

    res = [f"📅 **Weekly Schedule for {matched_course['title']} ({matched_course['short_name']} / `{matched_course['code']}`):**\n",
           f"👨‍🏫 **Faculty:** {matched_course['faculty']}\n"]

    for day, slot in occurrences:
        res.append(f"• **{day}**: ⏰ **{slot['time']}** | 📍 Room: **{slot['room']}** | ({slot.get('type', 'Theory')})")

    return "\n".join(res)

def get_faculty_weekly_schedule(faculty_query: str) -> Optional[str]:
    cleaned = clean_query(faculty_query)
    keywords = extract_keywords(faculty_query)

    # Search for faculty member
    matched_fac = None
    for fac in TIMETABLE["faculty_directory"]:
        name_lower = fac["name"].lower()
        if any(part in cleaned for part in name_lower.split() if len(part) > 3):
            matched_fac = fac
            break

    if not matched_fac:
        return None

    # Find when this faculty member has classes
    fac_name_parts = [p.lower() for p in matched_fac["name"].split() if len(p) > 3]
    sessions = []

    for day in DAYS_ORDER[:-1]:
        slots = TIMETABLE["schedule"].get(day, [])
        for slot in slots:
            f_in_slot = slot.get("faculty", "").lower()
            if any(part in f_in_slot for part in fac_name_parts):
                sessions.append((day, slot))

    res = [f"👨‍🏫 **Lecture & Lab Schedule for {matched_fac['name']}:**",
           f"**Designation:** {matched_fac.get('designation', 'Faculty')} | **Dept:** {matched_fac.get('department', 'CSE')}",
           f"**Subject:** {matched_fac['subject']}\n"]

    if sessions:
        res.append("**Weekly Classes:**")
        for day, slot in sessions:
            res.append(f"• **{day}**: ⏰ **{slot['time']}** — **{slot['subject']}** (Room: **{slot['room']}**)")
    else:
        res.append(f"Handles: **{matched_fac['subject']}** (Lab/Batch or administrative coordination).")

    return "\n".join(res)

def answer_query(query: str, simulated_day: Optional[str] = None, simulated_time: Optional[str] = None) -> str:
    """Intelligent NLP processor for student queries with auto-correction and fuzzy intent recognition"""
    raw_query = query.strip()
    if not raw_query:
        return "Hi there! 👋 I am your **MCE CSE Class Assistant**. How can I help you today? You can ask about your current class, room location, timings, faculty, or lab venues."

    # Auto-correct query
    corrected_q, was_corrected, corrections = autocorrect_query(raw_query)
    q = corrected_q.strip().lower()

    # Helper to prepend correction note if applicable
    def with_note(text: str) -> str:
        if was_corrected and len(corrections) > 0:
            return f"💡 *Understood as: \"{corrected_q}\"*\n\n{text}"
        return text

def _compute_answer(q: str, query: str, simulated_day: Optional[str] = None, simulated_time: Optional[str] = None) -> str:
    """Core intent matching and logic calculation"""
    # Greetings
    if re.search(r"^(hi|hello|hey|hola|namaste|good morning|good afternoon|good evening)\b", q):
        return (
            "Hello! 👋 Welcome to the **MCE Hassan CSE Class & Timetable Assistant**!\n\n"
            "I can help you with:\n"
            "- 📍 **Where is my class right now?**\n"
            "- ⏭️ **What is my next class?**\n"
            "- 📅 **Schedule for today or any specific day** (e.g., *'Tuesday schedule'*)\n"
            "- 👨‍🏫 **Faculty details** (e.g., *'Who teaches DSA?'* or *'Dr. Roopa'*)\n"
            "- 🧪 **Lab venues & rooms** (e.g., *'Where is Unix Lab?'* or *'Where is EE301?'*)\n"
            "- 📊 **Excel / Python batches** (e.g., *'Show batch details'*)\n"
            "- ⏰ **Break timings**\n\n"
            "What would you like to know?"
        )

    # Current class / Where am I / Right now
    if any(k in q for k in ["right now", "current class", "where is my class", "where should i go", "what class now", "class now", "where am i supposed to be", "where to go", "where am i"]):
        day, time_str, _ = get_current_day_and_time(simulated_day, simulated_time)
        status = get_status_at(day, time_str)
        ans = [f"🕒 **Current Time:** {time_str} on **{day}**\n"]
        ans.append(status["current_description"])
        ans.append("")
        ans.append(status["next_description"])
        return "\n".join(ans)

    # Next class
    if any(k in q for k in ["next class", "what is next", "what's next", "after this", "upcoming class"]):
        day, time_str, _ = get_current_day_and_time(simulated_day, simulated_time)
        status = get_status_at(day, time_str)
        ans = [f"🕒 **Time:** {time_str} on **{day}**\n"]
        ans.append(status["next_description"])
        return "\n".join(ans)

    # Break timings
    if any(k in q for k in ["break", "lunch", "interval", "tea break", "recess", "lunch time"]):
        return get_breaks_info()

    # Day specific queries (e.g. "Monday free periods", "Wednesday labs", "classes on Thursday", "today schedule")
    target_day = None
    if "today" in q:
        day, _, _ = get_current_day_and_time(simulated_day, simulated_time)
        target_day = day
    elif "tomorrow" in q:
        day, _, _ = get_current_day_and_time(simulated_day, simulated_time)
        idx = DAYS_ORDER.index(day) if day in DAYS_ORDER else 0
        target_day = DAYS_ORDER[(idx + 1) % 7]
    else:
        for key, dname in DAYS_MAP.items():
            if re.search(r"\b" + key + r"\b", q):
                target_day = dname
                break

    if target_day:
        # 1. Day + Free periods specifically
        if any(k in q for k in ["free", "off", "leisure", "vacant", "empty", "no class", "gap"]):
            return get_day_free_periods(target_day)

        # 2. Day + Labs / practicals specifically
        if any(k in q for k in ["lab", "labs", "practical", "practicals"]):
            return get_day_labs(target_day)

        # 3. Day + Start time
        if any(k in q for k in ["start", "starts", "begin", "begins", "first class"]):
            return get_day_start_or_end(target_day, is_start=True)

        # 4. Day + End / Finish time
        if any(k in q for k in ["end", "ends", "finish", "finishes", "over", "last class"]):
            return get_day_start_or_end(target_day, is_start=False)

        # 5. Day + Specific Subject (e.g. "DSA on Wednesday", "Maths on Monday")
        day_schedule = TIMETABLE["schedule"].get(target_day, [])
        matched_day_slots = []
        kw_list = [kw for kw in extract_keywords(q) if kw not in DAYS_MAP]

        if kw_list:
            for slot in day_schedule:
                scode = (slot.get("code") or "").lower()
                ssubj = slot.get("subject", "").lower()
                # Check keywords against slot with word boundary
                for kw in kw_list:
                    if re.search(r"\b" + re.escape(kw) + r"\b", scode) or re.search(r"\b" + re.escape(kw) + r"\b", ssubj):
                        matched_day_slots.append(slot)
                        break
                    elif kw in SUBJECT_ALIASES:
                        if any(re.search(r"\b" + re.escape(a) + r"\b", scode) or re.search(r"\b" + re.escape(a) + r"\b", ssubj) for a in SUBJECT_ALIASES[kw]):
                            matched_day_slots.append(slot)
                            break

        if matched_day_slots and not any(k in q for k in ["schedule", "timetable", "all classes", "full"]):
            res = [f"📅 **{target_day} Class Timing:**\n"]
            for slot in matched_day_slots:
                res.append(f"• **{slot['subject']}**")
                res.append(f"  - ⏰ **Time:** {slot['time']}")
                res.append(f"  - 📍 **Room / Venue:** **{slot['room']}**")
                res.append(f"  - 👨‍🏫 **Faculty:** {slot.get('faculty', '-')}")
                res.append(f"  - 🏷️ **Type:** {slot.get('type', 'Theory')}\n")
            return "\n".join(res)

        # 6. Entire Day Schedule
        if not any(k in q for k in ["faculty", "teacher", "prof", "hod", "who teaches"]):
            return format_day_schedule(target_day)

    # General free periods (across the week)
    if any(k in q for k in ["free period", "free periods", "free time", "off period", "off periods", "when are we free"]):
        return (
            "✨ **Free / Off Periods Overview (Across the Week):**\n\n"
            "• **Monday:** 12:00 PM – 1:00 PM (Study Hour) & 4:00 PM – 6:00 PM (After Unix Lab)\n"
            "• **Tuesday:** 4:00 PM – 6:00 PM (Regular students; M3-DIP in CS305 for lateral entry)\n"
            "• **Wednesday:** 8:30 AM – 9:30 AM, 12:00 PM – 1:00 PM, and **Entire Afternoon (2:00 PM – 6:00 PM) OFF!**\n"
            "• **Thursday:** **Entire Afternoon (2:00 PM – 6:00 PM) OFF!**\n"
            "• **Friday:** 2:00 PM – 5:00 PM (Free afternoon; DIP Maths 5:00 – 6:00 PM in SA101)\n"
            "• **Saturday:** **1:00 PM onwards (Weekend Half-Day OFF!)**\n"
            "• **Sunday:** Full Holiday (No classes)"
        )

    # Specific subject or faculty weekly schedule (e.g. "When is DSA?", "When does Dr. Roopa take class?", "Maths timings", "Mrs. Shruthi schedule")
    if any(k in q for k in ["when", "timing", "timings", "schedule", "routine", "classes"]):
        fac_weekly = get_faculty_weekly_schedule(q)
        if fac_weekly:
            return fac_weekly

        subj_weekly = get_subject_weekly_schedule(q)
        if subj_weekly:
            return subj_weekly

    # Batch queries (Excel / Python)
    if any(k in q for k in ["batch", "batches", "excel", "python", "25cs307", "data analytics", "data visualization"]):
        return get_batches_info()

    # Lab and Rooms queries
    if any(k in q for k in ["room", "venue", "lab", "labs", "where is", "location"]):
        # Check specific room query
        for v in TIMETABLE["venues"]:
            if v["name"].lower() in q:
                return f"📍 **{v['name']}** ({v['type']}):\n{v['description']}"
        # If asks where is unix lab or dsa lab
        if "unix" in q:
            return "🧪 **Unix and Shell Programming Laboratory (UNIX Lab)** is conducted in **CSLAB-4** on **Monday from 2:00 PM to 4:00 PM**. Faculty: Mrs. Nithyashree R, Mrs. M B Prakruthi, and Mr. Krishna Swaroop."
        if "dsa" in q:
            return "🧪 **Data Structures Laboratory (DSA Lab)** is held in **Honeywell Lab** on **Tuesday from 2:00 PM to 4:00 PM**. Faculty: Ms. Bimba Prasad, Dr. Chandrika J, and Mrs. Sindhu K S."
        if "oopj" in q or "java" in q:
            return "🧪 **OOPs with Java Practical (OOPJ-P)** is held in **CSLAB-2** on **Thursday from 8:30 AM to 10:30 AM**. Faculty: Mrs. Shruthi K R & Team."
        if "ddco" in q or "hardware" in q:
            return "🧪 **Digital Design Practical (DDCO-P)** is conducted in **H/W Lab (Hardware Lab)** on **Saturday from 8:30 AM to 10:30 AM**. Faculty: Mrs. Ayeesha Siddiqa & Team."
        if "ee301" in q:
            return "🏢 **Room EE301** is the designated main classroom for **III Semester CSE Section C**, located on the 3rd floor of the Electrical & Electronics Block. All regular theory lectures take place here."
        if any(k in q for k in ["all rooms", "list rooms", "all labs", "venues", "rooms"]):
            return get_venues_info()

    # Faculty queries
    if any(k in q for k in ["faculty", "teacher", "sir", "madam", "prof", "hod", "who teaches", "who is", "coordinator"]):
        if "hod" in q or "head" in q:
            hod = TIMETABLE["college"]["hod"]
            return f"🏛️ **Head of Department (CSE):** {hod['name']} ({hod['title']})"
        if "coordinator" in q:
            coords = TIMETABLE["college"]["timetable_coordinators"]
            return "📋 **Timetable Coordinators:**\n" + "\n".join([f"- **{c['name']}** ({c['role']})" for c in coords])
        if any(k in q for k in ["all faculty", "faculty list", "teachers list", "faculties"]):
            return get_all_faculty_list()

        fac_result = search_faculty(q)
        if fac_result:
            return fac_result

    # Check subject match directly
    subj_result = search_subject(q)
    if subj_result:
        return subj_result

    # Check faculty name directly
    fac_result = search_faculty(q)
    if fac_result:
        return fac_result

    # General fallback
    return (
        f"I'm not completely certain about '{query}', but here is what I can help you with:\n\n"
        "• 🕊️ Ask **'Monday free periods'** or **'Wednesday free time'**\n"
        "• 📍 Ask **'Where is my class right now?'** or **'Next class'**\n"
        "• 📅 Ask for day schedules, e.g., **'Monday timetable'** or **'Thursday classes'**\n"
        "• 👨‍🏫 Ask about faculty, e.g., **'Who teaches Data Structures?'** or **'When does Dr. Roopa take class?'**\n"
        "• 🧪 Ask about labs/rooms, e.g., **'Where is Honeywell Lab?'** or **'Thursday labs'**\n"
        "• 📊 Ask **'Show batch details'** for Friday Python & Excel\n"
        "• ⏰ Ask **'When are the breaks?'**"
    )

def answer_query(query: str, simulated_day: Optional[str] = None, simulated_time: Optional[str] = None) -> str:
    """Intelligent NLP processor for student queries with auto-correction and fuzzy comprehension"""
    raw_query = query.strip()
    if not raw_query:
        return "Hi there! 👋 I am your **MCE CSE Class Assistant**. How can I help you today? You can ask about your current class, room location, timings, faculty, or lab venues."

    corrected_q, was_corrected, corrections = autocorrect_query(raw_query)
    q = corrected_q.strip().lower()

    ans = _compute_answer(q, raw_query, simulated_day, simulated_time)

    if was_corrected and len(corrections) > 0 and q != raw_query.lower():
        return f"💡 *Understood as: \"{corrected_q}\"*\n\n{ans}"
    return ans

if __name__ == "__main__":
    print("Testing Timetable Chatbot Core...")
    print(answer_query("Where is my class right now?", simulated_day="Tuesday", simulated_time="11:15"))
    print("\n" + "="*50 + "\n")
    print(answer_query("Who teaches DSA?"))
