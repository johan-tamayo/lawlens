#!/usr/bin/env sh

# Common functions for git hooks

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

activate_venv() {
  if [ -d "venv/bin" ]; then
    . venv/bin/activate
  fi
}

