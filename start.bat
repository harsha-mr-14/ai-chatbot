@echo off
title MCE Hassan CSE Timetable AI Chatbot
echo ============================================================
echo   MALNAD COLLEGE OF ENGINEERING, HASSAN
echo   Department of Computer Science & Engineering
echo   III Sem CSE - Section C (Room EE301) AI Assistant
echo ============================================================
echo.
echo Starting local web server on port 8000...
start "" http://localhost:8000
py server.py 8000
pause
