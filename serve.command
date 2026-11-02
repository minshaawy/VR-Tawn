#!/bin/bash
# Double-click this file to run Tawuniya VR locally (no internet needed). Keep the window open while you use the site.
cd "$(dirname "$0")"
PORT=8090
( sleep 1; open "http://localhost:$PORT/" ) &
echo "Tawuniya VR is running at http://localhost:$PORT/  (close this window to stop)"
python3 -m http.server $PORT --bind 127.0.0.1
