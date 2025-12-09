#!/bin/bash

URL=""
SESSION="Skill-Bytes"
PANE=1

while true; do
		PANE_PID=$(tmux list-panes -t "$SESSION:0.$PANE" -F "#{pane_pid}" 2>/dev/null | head -1)

		if [ -z "$PANE_PID" ]; then
				echo "Tmux session/window not found"
				sleep 5
				continue
		fi

		CHILD_PROCS=$(pgrep -P $PANE_PID | wc -l)

		if [ "$CHILD_PROCS" -eq 0 ]; then
				echo "No active processes, restarting tmole..."

				pkill -f "tmole 3000"
				
				rm "/tmp/tmole_output.txt"

				tmux send-keys -t "$SESSION:0.$PANE" "tmole 3000 > /tmp/tmole_output.txt 2>&1" C-m

				sleep 10

				URL=$(grep 'https://.*tunnelmole.net' /tmp/tmole_output.txt | tail -1 | awk '{print $1}')

				echo "Tmole URL: $URL"

				echo "{\"url\": \"$URL\", \"fb_url\": \"https://skill-bytes-fb.netlify.app\"}" > ~/Skill-Bytes-Redirect/redirect.json

				cd ~/Skill-Bytes-Redirect
				
				git add .
				git commit -m "Update redirect url"
				git push origin main

				echo "export const BACKEND_URL = \"$URL\";" > ~/Skill-Bytes-Frontend/src/pages/config.jsx

				cd ~/Skill-Bytes-Frontend
				git add .
				git commit -m "Update redirect url"
				git push origin main

				

		fi

		sleep 5
done
