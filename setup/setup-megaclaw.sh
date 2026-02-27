#!/bin/bash
# ============================================================
# Mega Claw — Full Automated Setup
# Run this on a fresh Ubuntu 24.04 DigitalOcean droplet
# ============================================================

set -e

echo ""
echo "🦞 =============================================="
echo "   MEGA CLAW — First Breath Setup"
echo "   Connection Engine · What If · Always Becoming"
echo "🦞 =============================================="
echo ""

# ---- Config ----
OPENCLAW_DIR="$HOME/.openclaw"
WORKSPACE_DIR="$OPENCLAW_DIR/workspace"
DASHBOARD_DIR="/var/www/megaclaw-dashboard"
DOMAIN_OR_IP=""

# ---- Gather inputs ----
echo "I need a few things to get Mega Claw alive."
echo ""

read -p "🔑 Anthropic API Key: " ANTHROPIC_API_KEY
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "❌ Anthropic API key is required. Exiting."
    exit 1
fi

echo ""
echo "📱 WhatsApp Setup"
echo "   Mega Claw will connect to your WhatsApp."
echo "   You'll scan a QR code in a moment."
echo ""

# ---- System Dependencies ----
echo "📦 Installing system dependencies..."
apt-get update -qq
apt-get install -y -qq curl wget git nginx certbot python3-certbot-nginx unzip jq > /dev/null 2>&1

# ---- Node.js 22 ----
echo "📦 Installing Node.js 22..."
if ! command -v node &> /dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 22 ]; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - > /dev/null 2>&1
    apt-get install -y -qq nodejs > /dev/null 2>&1
fi
echo "   Node $(node -v) installed"

# ---- Install OpenClaw ----
echo "📦 Installing OpenClaw..."
npm install -g openclaw@latest > /dev/null 2>&1
echo "   OpenClaw $(openclaw --version 2>/dev/null || echo 'installed')"

# ---- Create workspace ----
echo "📁 Creating Mega Claw workspace..."
mkdir -p "$WORKSPACE_DIR"
mkdir -p "$OPENCLAW_DIR/skills"

# ---- Clone Mega Claw files from GitHub ----
echo "📥 Pulling Mega Claw DNA from GitHub..."
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"
git clone --quiet https://github.com/rogergrubb/megaclaw-md-files.git
cp megaclaw-md-files/workspace/*.md "$WORKSPACE_DIR/"
rm -rf "$TEMP_DIR"
echo "   SOUL.md ✓  AGENTS.md ✓  USER.md ✓  MEMORY.md ✓"
echo "   HEARTBEAT.md ✓  TOOLS.md ✓  IDENTITY.md ✓"

# ---- Configure OpenClaw ----
echo "⚙️  Configuring OpenClaw..."

cat > "$OPENCLAW_DIR/openclaw.json" << OCEOF
{
  "model": {
    "primary": "anthropic/claude-opus-4-6",
    "fallbacks": ["anthropic/claude-sonnet-4-5-20250929"]
  },
  "providers": {
    "anthropic": {
      "apiKey": "${ANTHROPIC_API_KEY}"
    }
  },
  "heartbeat": {
    "enabled": true,
    "intervalMinutes": 20,
    "model": "anthropic/claude-sonnet-4-5-20250929"
  },
  "gateway": {
    "port": 18789,
    "auth": {
      "enabled": true
    }
  },
  "channels": {
    "whatsapp": {
      "enabled": true
    }
  },
  "browser": {
    "enabled": true,
    "headless": true
  }
}
OCEOF

echo "   Config written to $OPENCLAW_DIR/openclaw.json"

# ---- Setup Dashboard ----
echo "🖥️  Setting up Mega Claw Dashboard..."
mkdir -p "$DASHBOARD_DIR"

# Pull dashboard files (we'll create these inline if github doesn't have them yet)
if [ -d "megaclaw-md-files/dashboard" ]; then
    cp -r megaclaw-md-files/dashboard/* "$DASHBOARD_DIR/"
fi

# ---- Nginx config for dashboard ----
cat > /etc/nginx/sites-available/megaclaw << 'NGINXEOF'
server {
    listen 80;
    server_name _;

    # Dashboard
    location / {
        root /var/www/megaclaw-dashboard;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy OpenClaw Gateway API
    location /api/ {
        proxy_pass http://127.0.0.1:18789/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # OpenClaw Control UI
    location /control/ {
        proxy_pass http://127.0.0.1:18789/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/megaclaw /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t > /dev/null 2>&1 && systemctl restart nginx

# ---- Systemd service for OpenClaw ----
echo "🔧 Creating OpenClaw system service..."
cat > /etc/systemd/system/openclaw.service << 'SVCEOF'
[Unit]
Description=Mega Claw (OpenClaw Gateway)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root
ExecStart=/usr/bin/openclaw gateway start
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
SVCEOF

systemctl daemon-reload
systemctl enable openclaw

# ---- Firewall ----
echo "🔒 Configuring firewall..."
ufw allow 22/tcp > /dev/null 2>&1
ufw allow 80/tcp > /dev/null 2>&1
ufw allow 443/tcp > /dev/null 2>&1
ufw --force enable > /dev/null 2>&1

# ---- Start OpenClaw ----
echo ""
echo "🦞 =============================================="
echo "   Starting Mega Claw..."
echo "🦞 =============================================="
echo ""

# Start the gateway (this will trigger WhatsApp QR code)
echo "Starting OpenClaw Gateway..."
echo "⚠️  A QR code will appear below."
echo "📱 Open WhatsApp on your phone → Settings → Linked Devices → Link a Device"
echo "   Then scan the QR code."
echo ""

# Start in foreground first so user can see QR code
# After WhatsApp is linked, Ctrl+C and it will run as service
openclaw gateway start &
GATEWAY_PID=$!

echo ""
echo "⏳ Waiting for WhatsApp QR code..."
echo "   (It should appear above within 30 seconds)"
echo ""
echo "After scanning the QR code and seeing 'WhatsApp connected':"
echo "   Press Ctrl+C to continue setup"
echo ""

# Wait for user to scan QR
wait $GATEWAY_PID 2>/dev/null || true

# Now start as service
systemctl start openclaw

echo ""
echo "🦞 =============================================="
echo "   🎉 MEGA CLAW IS ALIVE"
echo "🦞 =============================================="
echo ""
echo "   Dashboard: http://$(curl -s ifconfig.me)"
echo "   OpenClaw UI: http://$(curl -s ifconfig.me)/control/"
echo "   WhatsApp: Send a message to start!"
echo ""
echo "   Status: systemctl status openclaw"
echo "   Logs:   journalctl -u openclaw -f"
echo ""
echo "   First breath complete. Zero to One."
echo ""
