"""
Terminal CLI Chatbot for Malnad College of Engineering (MCE Hassan)
III Semester CSE Section C - Timetable & Class Assistant.
"""

import sys
from chatbot_core import answer_query, get_current_day_and_time, get_status_at

# Ensure UTF-8 output in Windows PowerShell / CMD
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stdin.reconfigure(encoding="utf-8")
    except Exception:
        pass

def print_banner():
    day, time_str, _ = get_current_day_and_time()
    status = get_status_at(day, time_str)
    
    print("=" * 65)
    print("🎓  MALNAD COLLEGE OF ENGINEERING, HASSAN")
    print("     Department of Computer Science & Engineering")
    print("     III Semester CSE - Section C | Room: EE301")
    print("     AI CLASSROOM, TIMETABLE & FACULTY BOT")
    print("=" * 65)
    print(f"🕒 System Date & Time: {day}, {time_str}")
    if status.get("current"):
        c = status["current"]
        print(f"🟢 NOW IN PROGRESS: {c['subject']} | Room: {c.get('room', '-')} ({c.get('time', '-')})")
    else:
        print(f"⚪ STATUS: {status['current_description'].replace('*', '')}")
    print("-" * 65)
    print("Quick examples to try:")
    print("  • 'Where is my class right now?'   • 'What's next?'")
    print("  • 'Monday schedule'                • 'Who teaches Data Structures?'")
    print("  • 'Where is Unix Lab?'             • 'Batch details for Friday'")
    print("  • 'Break timings'                  • 'Who is our HOD?'")
    print("Type 'exit' or 'quit' to close.")
    print("=" * 65 + "\n")

def main():
    print_banner()
    while True:
        try:
            user_input = input("Student 👤: ").strip()
            if not user_input:
                continue
            if user_input.lower() in ["exit", "quit", "q"]:
                print("\nGoodbye! Have a productive study day at MCE! 🎓✨\n")
                break

            response = answer_query(user_input)
            print(f"\nBot 🤖:\n{response}\n")
            print("-" * 50)
        except (KeyboardInterrupt, EOFError):
            print("\nExiting. Goodbye! 🎓\n")
            break

if __name__ == "__main__":
    main()
