#!/usr/bin/env bash
# ============================================================
#  install-bluetooth.sh
#  Auto-installs & starts Bluetooth on Kali Linux
#  Usage:
#     curl -sL <YOUR_RAW_LINK> | sudo bash
#  Or:
#     sudo bash install-bluetooth.sh
# ============================================================

set -euo pipefail

# ---------- Colors ----------
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; NC='\033[0m'

log()  { echo -e "${CYAN}[*]${NC} $*"; }
ok()   { echo -e "${GREEN}[+]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err()  { echo -e "${RED}[-]${NC} $*" >&2; }

# ---------- Root check ----------
if [[ $EUID -ne 0 ]]; then
  err "Root privileges required."
  echo "Run with:  curl -sL <link> | sudo bash"
  exit 1
fi

# ---------- OS sanity check ----------
if ! command -v apt-get >/dev/null 2>&1; then
  err "This script targets Debian/Kali (apt not found)."
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

# ---------- 1) Update ----------
log "Updating package lists..."
apt-get update -y >/dev/null 2>&1 || warn "apt-get update had warnings, continuing."

# ---------- 2) Install aptitude ----------
if command -v aptitude >/dev/null 2>&1; then
  ok "aptitude already installed, skipping."
else
  log "Installing aptitude..."
  apt-get install -y aptitude
fi

# ---------- 3) Install bluetooth stack ----------
log "Installing bluetooth package via aptitude..."
# -y ke saath, agar aptitude fail ho jaye to apt-get fallback
if ! aptitude install -y bluetooth; then
  warn "aptitude failed, trying apt-get fallback..."
  apt-get install -y bluetooth
fi

if ! command -v bluetoothctl >/dev/null 2>&1; then
  err "Bluetooth stack install nahi hua (bluetoothctl missing)."
  exit 1
fi
ok "Bluetooth package installed."

# ---------- 4) Enable (systemd) ----------
if command -v systemctl >/dev/null 2>&1; then
  log "Enabling bluetooth service (boot pe auto-start)..."
  systemctl enable bluetooth >/dev/null 2>&1 || warn "Enable failed (ignored)."
fi

# ---------- 5) Start ----------
log "Starting bluetooth service..."
started=0
if [ -x /etc/init.d/bluetooth ]; then
  /etc/init.d/bluetooth start && started=1 || true
fi
if [ "$started" -eq 0 ]; then
  systemctl start bluetooth 2>/dev/null && started=1 || true
fi
if [ "$started" -eq 0 ]; then
  service bluetooth start 2>/dev/null && started=1 || true
fi

if [ "$started" -eq 1 ]; then
  ok "Bluetooth service started."
else
  warn "Service start ambiguous — check manually below."
fi

# ---------- 6) Status ----------
echo
log "Current Bluetooth status:"
echo "--------------------------------------------"
if [ -x /etc/init.d/bluetooth ]; then
  /etc/init.d/bluetooth status || true
elif command -v systemctl >/dev/null 2>&1; then
  systemctl status bluetooth --no-pager || true
fi
echo "--------------------------------------------"

# ---------- 7) Adapter info ----------
echo
log "Detected Bluetooth adapters:"
if command -v bluetoothctl >/dev/null 2>&1; then
  bluetoothctl list 2>/dev/null || warn "No adapter found (check hardware / hci0)."
fi

ok "Done. Use 'bluetoothctl' to pair devices."
