#!/bin/bash

URL=""
SESSION="Skill-Bytes"
PANE=1

# Function to check if a process is a descendant of a given parent PID
is_descendant() {
		local child_pid=$1
		local parent_pid=$2
		local current_pid=$child_pid

		while [ -n "$current_pid" ] && [ "$current_pid" != "1" ]; do
				local ppid=$(ps -o ppid= -p $current_pid 2>/dev/null | tr -d ' ')
				if [ "$ppid" = "$parent_pid" ]; then
						return 0  # true
				fi
				current_pid=$ppid
		done
		return 1  # false
}

while true; do
		PANE_PID=$(tmux list-panes -t "$SESSION:0.$PANE" -F "#{pane_pid}" 2>/dev/null | head -1)

		if [ -z "$PANE_PID" ]; then
				echo "Tmux session/window not found"
				sleep 5
				continue
		fi

		# Check specifically if tmole is running as a descendant of this pane's shell
		TMOLE_RUNNING=0
		TMOLE_PIDS=$(pgrep -f "tunnelmole" 2>/dev/null)
		if [[ -n "$TMOLE_PIDS" ]]; then
			TMOLE_RUNNING=1
		fi

		if [ -n "$TMOLE_PIDS" ]; then
		 		for tmole_pid in $TMOLE_PIDS; do
		 				if is_descendant $tmole_pid $PANE_PID; then
		 						TMOLE_RUNNING=1
		 						break
		 				fi
		 		done
		 fi

		if [ $TMOLE_RUNNING -eq 0 ]; then
				echo "No tmole process detected in pane $PANE (PID: $PANE_PID), restarting tmole..."

				# Kill any existing tmole processes that might be orphaned
				pkill -f "tmole 3000" 2>/dev/null
				
				rm -f "/tmp/tmole_output.txt"

				tmux send-keys -t "$SESSION:0.$PANE" "tmole 3000 > /tmp/tmole_output.txt 2>&1" C-m

				sleep 10

				URL=$(grep 'https://.*tunnelmole.net' /tmp/tmole_output.txt 2>/dev/null | tail -1 | awk '{print $1}')

				if [ -n "$URL" ]; then
						echo "Tmole URL: $URL"

						echo "{\"url\": \"$URL\", \"fb_url\": \"https://skill-bytes-fb.netlify.app\"}" > ~/Skill-Bytes-Redirect/redirect.json

						cd ~/Skill-Bytes-Redirect
						
						git add .
						git commit -m "Update redirect url"
						git push origin main
				else
						echo "Warning: Could not extract tmole URL from output"
				fi
		fi

		sleep 5
done
