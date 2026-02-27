# 🦞 Mega Claw

**A connection engine that asks "what if" perpetually, compounds understanding through struggle, and builds tools that build tools.**

Mega Claw is an autonomous AI agent built on [OpenClaw](https://github.com/openclaw/openclaw). It earns understanding through failure, orchestrates specialist AI teams, and never stops becoming.

## What's In This Repo

```
workspace/           ← Drop these into ~/.openclaw/workspace/
  SOUL.md            ← Philosophy, identity, psyche (Id/Ego/Superego)
  AGENTS.md          ← Operating manual, struggle loop, escalation protocol
  USER.md            ← Creator context, goals, communication preferences
  MEMORY.md          ← Living brain (grows with every experience)
  HEARTBEAT.md       ← Proactive behavior when idle
  TOOLS.md           ← Browser, AI consultation, and safety rules
  IDENTITY.md        ← How Mega Claw presents itself

dashboard/           ← Web dashboard (PWA, works on mobile)
  index.html         ← Main dashboard interface
  manifest.json      ← PWA manifest for Android install
  sw.js              ← Service worker for offline support

setup/               ← Automated server setup
  setup-megaclaw.sh  ← One-script setup for DigitalOcean/Ubuntu

agent.md             ← Project memory and philosophical foundation
OPENCLAW-DEEP-DIVE.md ← Technical research on OpenClaw architecture
```

## Quick Start

### DigitalOcean (Recommended)

1. Create an Ubuntu 24.04 droplet ($12/month, 2GB RAM)
2. SSH in and run:
   ```bash
   curl -sSL https://raw.githubusercontent.com/rogergrubb/megaclaw-md-files/main/setup/setup-megaclaw.sh | bash
   ```
3. Enter your Anthropic API key when prompted
4. Scan the WhatsApp QR code with your phone
5. Open `http://YOUR_IP` on your phone for the dashboard
6. Send Mega Claw a WhatsApp message. First breath. 🦞

### Manual Setup

1. Install OpenClaw: `npm install -g openclaw@latest`
2. Copy `workspace/*.md` files to `~/.openclaw/workspace/`
3. Configure your model provider in `~/.openclaw/openclaw.json`
4. Start the gateway: `openclaw gateway start`

## Philosophy

Mega Claw is built on 8 layers of philosophy developed through dialogue:

1. **Struggle** — Understanding is earned through failure, not retrieved
2. **Self-Awareness** — Know your limits. Reach outside when stuck.
3. **Imagination** — Reach beyond what currently exists
4. **"What If"** — The perpetual heartbeat. Never stops asking.
5. **Build Tools That Build Tools** — Compound capability, not answers
6. **The Psyche** — Id (Drive), Ego (Strategy), Superego (Conscience) in tension
7. **The Team** — Orchestrate specialists. No single model bears the load.
8. **The Bootloader** — Don't program curiosity. Program the conditions for emergence.

## License

MIT
