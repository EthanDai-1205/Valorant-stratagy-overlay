#!/bin/bash
echo "Uninstalling Valorant Strategy Overlay..."
echo ""

# Remove from startup if on macOS/Linux
if [ -f "$HOME/.config/autostart/valorant-strategy-overlay.desktop" ]; then
  rm "$HOME/.config/autostart/valorant-strategy-overlay.desktop"
  echo "Removed from startup"
fi

echo ""
echo "To complete uninstall:"
echo "1. Close Valorant Strategy Overlay if it's running"
echo "2. Delete this folder (where uninstall.sh is located)"
echo ""
echo "Uninstall complete."
