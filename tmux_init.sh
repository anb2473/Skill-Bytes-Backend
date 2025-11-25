#!/bin/bash

SESSION="Skill-Bytes"
tmux new-session -d -s $SESSION -n editor
tmux split-window -v -t $SESSION:0.0

# run docker container in pane 0
tmux send-keys -t $SESSION:0.0 "cd ~/Skill-Bytes-Backend" C-m
tmux send-keys -t $SESSION:0.0 "docker compose up" C-m

# run tmole in pane 1
tmux send-keys -t $SESSION:0.1 "tmole 3000" C-m
