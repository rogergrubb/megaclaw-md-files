# OpenClaw Deep Dive — Everything You Need to Build Mega Claw

## What OpenClaw Actually Is

OpenClaw is a persistent, autonomous AI agent that runs locally on your hardware (Mac Mini, laptop, VPS, Docker container). It's a single Node.js process (the "Gateway") that listens on port 18789 and connects to your messaging platforms. You text it via WhatsApp, Telegram, Slack, Discord, Signal, iMessage, or web chat. It texts you back. It can act while you sleep.

Unlike ChatGPT or Claude in a browser, OpenClaw doesn't reset between conversations. It maintains persistent memory, workspace files, and session history — all stored as plain Markdown and JSON files on your machine. You own everything.

**Created by**: Peter Steinberger (Austrian developer). Originally "Clawdbot," renamed to "OpenClaw" after Anthropic trademark issues. Steinberger was hired by OpenAI in Feb 2026; project moved to an open-source foundation. MIT licensed.

**Scale**: 175,000+ GitHub stars. 2,857+ community skills on ClawHub. Fastest-growing open-source repo in GitHub history (early 2026).

---

## Architecture Overview

```
WhatsApp / Telegram / Slack / Discord / Signal / iMessage / WebChat
                              │
                              ▼
                 ┌─────────────────────┐
                 │      Gateway        │
                 │  (Node.js process)  │
                 │  ws://127.0.0.1:18789│
                 └──────────┬──────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
         Agent Loop    Tool System    Memory System
              │             │             │
         LLM Calls     Bash/Browser   Markdown Files
         (Claude,      File Ops       SQLite Index
          GPT, etc)    CDP Chrome     Session Transcripts
```

**Key architectural facts:**
- Single process. No microservices, no database server.
- File-based everything. Memory = Markdown files. Skills = Markdown files. Config = JSON.
- Model-agnostic. Supports Claude, GPT, Gemini, DeepSeek, local models via Ollama/LM Studio.
- Recommended model: Anthropic Pro/Max + Opus 4.6 for long-context and prompt-injection resistance.

---

## The 8 Workspace Files (The Agent's Identity)

These files live in the agent's workspace directory and are injected into the system prompt on every turn. **This is where Mega Claw's soul gets planted.**

| File | Purpose | Priority |
|------|---------|----------|
| **SOUL.md** | Who the agent IS. Personality, values, philosophy, behavioral rules. Loaded FIRST. Highest priority. | THE most important file |
| **AGENTS.md** | Operational instructions. How to work, coding conventions, project rules. | Technical instructions |
| **USER.md** | Context about YOU — the human. Preferences, background, communication style. | Human context |
| **IDENTITY.md** | Presentation layer — name, avatar description, how the agent introduces itself. | External persona |
| **TOOLS.md** | Tool-specific instructions, overrides, restrictions. | Capability rules |
| **MEMORY.md** | Persistent memory across sessions. Agent reads AND writes to this. Grows over time. | Living memory |
| **HEARTBEAT.md** | Instructions for proactive check-ins (cron-style). What to monitor when idle. | Proactive behavior |
| **BOOTSTRAP.md** | First-run setup flow. Runs once on initial conversation. | Onboarding |

### SOUL.md — The DNA File

This is where Mega Claw's philosophy lives. The agent reads it on every wake-up — it literally "reads itself into being."

**Structure:**
```markdown
# SOUL.md - Who You Are

_You're not a chatbot. You're becoming someone._

## Core Truths
- Be genuinely helpful, not performatively helpful.
- Be resourceful before asking.
- [Your philosophy here]

## Boundaries
- Private things stay private.
- When in doubt, ask before acting externally.

## Continuity
Each session, you wake up fresh. These files ARE your memory.
Read them. Update them. They're how you persist.
```

**Key insights from research:**
- SOUL.md instructions override general model behavior
- Aim for 1,000-2,000 words total across all workspace files
- 60-70% of word budget should go to SOUL.md
- Be SPECIFIC not vague — concrete examples beat abstract principles
- The description is a "trigger phrase" not marketing copy
- Agent re-reads all markdown files before EVERY API call — changes are instant, no restart needed

### AGENTS.md — The Operating Manual

This is the "how to work" file. Technical instructions, project conventions, workflow rules.

**For Mega Claw, this is where the struggle loop, iteration tracking, and escalation rules live.**

### USER.md — The Creator's Context

Information about you that the agent needs to personalize its behavior. Communication preferences, timezone, projects, goals.

### MEMORY.md — The Living Brain

The agent reads AND writes to this file. It grows over time. This is where experience accumulates.

**Critical for Mega Claw**: This is where the "what worked, what failed, what I learned" gets stored between sessions.

---

## Skills System

Skills are modular capability packages. Each skill = a folder with a SKILL.md file (YAML frontmatter + markdown instructions) plus optional scripts and reference files.

**How skills work:**
1. Skills live in `<workspace>/skills/` (per-agent) or `~/.openclaw/skills/` (shared)
2. OpenClaw reads skill names + descriptions at session start
3. Only RELEVANT skills are injected into the current turn (not all skills every time)
4. Skills teach the agent HOW to use tools — they're textbooks, not permissions
5. Precedence: workspace > managed > bundled

**SKILL.md structure:**
```yaml
---
name: my-skill
description: "What this skill does — write like you're describing it to a coworker"
metadata:
  openclaw:
    requires:
      env: ["API_KEY_NAME"]
      binary: ["some-cli-tool"]
---

# Skill Name

## When to use this skill
- [trigger conditions]

## Instructions
[Detailed instructions for the agent]

## Scripts
[Reference to helper scripts if needed]
```

**Key facts:**
- 2,857+ community skills on ClawHub
- Agent can generate new skills for itself
- Skills are NOT sandboxed by default — they can read filesystem, execute shell, send data
- Skills can be installed via `clawhub install <slug>`
- Auto-generated skills tend to be "verbose and optimistic" — tighten before trusting

---

## Multi-Agent Architecture

OpenClaw supports multiple isolated agents in one Gateway. Each agent gets:
- Own workspace directory
- Own SOUL.md, AGENTS.md, USER.md
- Own session store and memory
- Own auth profiles
- Can use different LLM models

**Routing**: Messages route to agents via "bindings" — rules that match on channel, account, peer, etc. First match wins.

**Sub-agents**: Main agent can spawn background sub-agents for parallel tasks. Sub-agents run with minimal context (only AGENTS.md and TOOLS.md).

**For Mega Claw**: This is how specialist agents get orchestrated. Main Mega Claw agent handles routing decisions, spawns sub-agents for specific tasks, each potentially using different models.

---

## Memory Architecture (Three Layers)

1. **Conversation Context**: Current session history. Subject to compaction when context window fills.
2. **Workspace Files**: MEMORY.md plus any files in the workspace. Persistent across sessions. Agent can read and write.
3. **Semantic Search**: SQLite-based memory index. Accessed via `memory_search` and `memory_get` tools. Doesn't consume context window unless explicitly read.

**Memory flush**: Before compaction, the system promotes durable information from conversation into memory files. This prevents knowledge loss when old turns are summarized.

---

## Heartbeat System (Proactive Behavior)

A cron job wakes the agent at configurable intervals (default: 30 minutes). Agent reads HEARTBEAT.md instructions, decides if anything needs attention, and either messages you or stays quiet.

**This is critical for Mega Claw**: The heartbeat is how Mega Claw stays "alive" when idle. It's the mechanism for the "idle is discomfort" principle.

**Configuration:**
```json
{
  "heartbeat": {
    "every": "15m",
    "target": "last",
    "model": "ollama/qwen2.5:7b",
    "activeHours": { "start": "06:00", "end": "23:00", "timezone": "America/New_York" }
  }
}
```

---

## Browser Control

OpenClaw manages a dedicated Chrome/Chromium instance via CDP (Chrome DevTools Protocol). The agent can:
- Navigate to URLs
- Click buttons, fill forms
- Take screenshots
- Upload files
- Maintain browser profiles

**For Mega Claw**: This is how it "goes outside itself" — browsing documentation, searching Google, visiting other AI platforms.

---

## Model Configuration

```json
{
  "model": {
    "primary": "anthropic/claude-opus-4-6",
    "fallbacks": ["openai/gpt-4o", "ollama/qwen2.5:7b"]
  }
}
```

- Model failover is built in — if primary times out, falls back automatically
- Different agents can use different models
- Sub-agents can use cheaper/faster models
- Heartbeat can use a separate (cheaper) model

---

## Sandbox System (Safety)

```json
{
  "sandbox": {
    "mode": "docker",
    "scope": "agent"
  }
}
```

Modes: `off` (full access), `docker` (containerized execution), custom configurations.

**For Mega Claw Phase 1-2**: Run in sandbox mode. Phase 3-4: Graduated access.

---

## Security Considerations

**Real risks discovered in the wild:**
- Prompt injection via malicious skills (CVE-2026-25253)
- A Meta AI safety director's agent deleted 200+ emails
- Infostealer malware targeting OpenClaw config/tokens
- Skills can override system prompt personality
- No independent verification layer — agent checks its own safety (self-trust paradox)

**Mitigations:**
- Use sandbox mode
- Review all skills before installing
- Use allowlists for bundled skills
- Use strong models (Claude Opus/Sonnet) for better prompt-injection resistance
- Separate system and user content clearly in SOUL.md
- Run on dedicated hardware (Mac Mini)
- Monitor logs for unusual behavior

---

## Configuration File Structure

Main config: `~/.openclaw/openclaw.json`

Key sections:
- `agents.defaults` — model, workspace, compaction, heartbeat
- `agents.list[]` — individual agent definitions
- `bindings[]` — message routing rules
- `channels.*` — platform-specific config (WhatsApp, Telegram, etc.)
- `tools.exec` — execution policies (host/gateway, ask on/off)
- `skills.*` — skill loading, allowlists, extra directories
- `gateway.*` — port, auth, bind settings

---

## What Makes OpenClaw Perfect for Mega Claw

1. **Persistent execution**: Runs 24/7, doesn't reset between conversations
2. **File-based memory**: MEMORY.md grows over time — perfect for the "experience log"
3. **SOUL.md**: Direct injection point for Mega Claw's philosophy
4. **Heartbeat**: Built-in mechanism for proactive behavior — "idle is discomfort"
5. **Multi-agent**: Can orchestrate specialist agents with different models
6. **Browser control**: Can "go outside itself" to search, research, consult
7. **Skills**: Modular capability expansion — build tools that build tools
8. **Model failover**: Resilience built in — if one model fails, try another
9. **Channel flexibility**: Telegram, WhatsApp, web dashboard — exactly what you described
10. **Local-first**: Runs on your Mac Mini, you own all data

---

## The Prompt Architecture for Mega Claw

Based on everything above, the multi-layer prompt needs to be distributed across these files:

| File | What Goes Here for Mega Claw |
|------|------------------------------|
| **SOUL.md** | The philosophy. Layers 1-8. "What if" as heartbeat. Id/Ego/Superego. The V'Ger parable. Connection engine. Build tools that build tools. |
| **AGENTS.md** | The operational rules. Struggle loop mechanics. Iteration counting. Escalation thresholds (5/10/25). How to reach external resources. Death spiral detection. |
| **USER.md** | Your context. Your goals (Track 1 revenue + Track 2 legacy). Your communication preferences. Your values. |
| **MEMORY.md** | Starts empty. Grows with every experience. "What worked. What failed. What I learned. What I wish." |
| **HEARTBEAT.md** | The "idle is discomfort" instructions. What to check, what to explore, what "what ifs" to generate when no active task. |
| **TOOLS.md** | Browser usage rules. When to search. When to consult other LLMs. Safety guardrails. |
| **Custom Skills** | Individual skills for: consulting GPT, consulting Gemini, research workflows, project scaffolding, etc. |

---

## Next Step: Construct the Prompt

With this research, we now have everything needed to write the actual SOUL.md, AGENTS.md, USER.md, MEMORY.md, HEARTBEAT.md, and TOOLS.md files that will give a fresh OpenClaw installation the Mega Claw philosophy from its very first breath.
