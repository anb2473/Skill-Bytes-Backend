#!/bin/bash

URL=""

while true; do
		PANE_PID=$(tmux list-panes -t SKill-Bytes:1 -F "#{pane_pid}" 2>/dev/null | head -1)

		if [ -z "$PANE_PID" ]; then
				echo "Tmux session/window not found"
				sleep 5
				continue
		fi

		CHILD_PROCS=$(pgrep -P $PANE_PID | wc -l)

		if [ "CHILD_PROCS" -eq 0 ]; then
				echo "No active processes, restarting tmole..."

				pkill -f "tmole 3000"
				
				tmole 3000 > /tmp/tmole_output.txt 2>&1 &
				TMOLE_PID=$!

				sleep 3

				URL=$(grep -oE 'https://[^ ]+' /tmp/tmole_output.txt)

				echo "Tmole URL: $URL"

				echo "{\n	\"url\": \"$URL\"\n}" > "~/Skill-Bytes-Redirect/redirect.json"

				cd ~/Skill-Bytes-Redirect
				
				git add .
				git commit -m "Update redirect url"
				git push origin main

				echo "export const BACKEND_URL = \"$URL\";" > "~/Skill-Bytes-Frontend/config.jsx"

				cd ~/Skill-Bytes-Frontend
				git add .
				git commit -m "Update redirect url"
				git push origin main

				

				rm /tmp/tmole_output.txt
		fi

		sleep 5
