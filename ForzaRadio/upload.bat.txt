@echo off
REM =========================================
REM Batch script to upload all MP3s from a specified folder to Internet Archive
REM Fetch metadata from files if available
REM Unique identifier: music_YYYYMMDD_HHMMSS_filename
REM =========================================

REM Set your folder path here (use double backslashes or single forward slashes)
set "MUSIC_FOLDER=C:\Users\vishn\Music"

REM Make sure ffprobe is installed and in PATH

REM Get current date and time
for /f "tokens=1-4 delims=/ " %%a in ("%date%") do (
    set YYYY=%%d
    set MM=%%b
    set DD=%%c
)
for /f "tokens=1-3 delims=:." %%a in ("%time%") do (
    set HH=%%a
    set Min=%%b
    set Sec=%%c
)
if "%HH:~0,1%"==" " set HH=0%HH:~1,1%

REM Loop through all MP3 files in the specified folder
for %%F in ("%MUSIC_FOLDER%\*.mp3") do (
    setlocal enabledelayedexpansion
    set FILENAME=%%~nF
    REM Sanitize ID by replacing spaces with underscores
    set SANITIZED_NAME=!FILENAME: =_!
    set ID=music_!YYYY!!MM!!DD!_!HH!!Min!!Sec!_!SANITIZED_NAME!
    
    REM Fetch metadata using ffprobe
    for /f "tokens=*" %%T in ('ffprobe -v error -show_entries format_tags=title -of default=noprint_wrappers=1:nokey=1 "%%F"') do set TITLE=%%T
    for /f "tokens=*" %%A in ('ffprobe -v error -show_entries format_tags=artist -of default=noprint_wrappers=1:nokey=1 "%%F"') do set ARTIST=%%A

    REM Fallback if metadata not found
    if "!TITLE!"=="" set TITLE=!FILENAME!
    if "!ARTIST!"=="" set ARTIST=Unknown

    REM Upload file with proper quoting to handle spaces
    echo Uploading "%%F" as "!ID!" with title "!TITLE!" and creator "!ARTIST!" ...
    ia upload "!ID!" "%%F" --metadata="title:\"!TITLE!\"" --metadata="creator:\"!ARTIST!\""
    endlocal
)

echo All uploads completed.
pause
