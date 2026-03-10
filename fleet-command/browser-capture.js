#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// MEGA CLAW — Browser Capture Service
// Captures Chrome screenshots via CDP every 30 seconds
// Serves them over HTTP for Fleet Command Dashboard
// ═══════════════════════════════════════════════════════════════

const http = require("http");
const fs = require("fs");
const path = require("path");

const CDP_PORT = process.env.CDP_PORT || 18800;
const SERVE_PORT = process.env.CAPTURE_PORT || 18792;
const INTERVAL = 30000; // 30 seconds
const CAPTURE_PATH = path.join(
  process.env.HOME || "/tmp",
  ".openclaw",
  "workspace",
  "browser-capture.jpg"
);

let latestScreenshot = null;

async function captureScreenshot() {
  try {
    // Connect to Chrome CDP
    const resp = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const targets = await resp.json();

    // Find the first visible page
    const page = targets.find(
      (t) => t.type === "page" && t.url && !t.url.startsWith("devtools://")
    );
    if (!page) {
      console.log("[capture] No active page found");
      return;
    }

    // Connect via WebSocket
    const wsUrl = page.webSocketDebuggerUrl;
    if (!wsUrl) return;

    const ws = new (require("ws"))(wsUrl);

    await new Promise((resolve, reject) => {
      ws.on("open", () => {
        // Send screenshot command
        ws.send(
          JSON.stringify({
            id: 1,
            method: "Page.captureScreenshot",
            params: {
              format: "jpeg",
              quality: 60,
              captureBeyondViewport: false,
            },
          })
        );
      });

      ws.on("message", (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id === 1 && msg.result && msg.result.data) {
          latestScreenshot = Buffer.from(msg.result.data, "base64");
          // Also save to file
          fs.writeFileSync(CAPTURE_PATH, latestScreenshot);
          const now = new Date().toLocaleTimeString();
          console.log(
            `[capture] ${now} — Screenshot saved (${(latestScreenshot.length / 1024).toFixed(0)}KB)`
          );
        }
        ws.close();
        resolve();
      });

      ws.on("error", (err) => {
        console.log("[capture] WS error:", err.message);
        reject(err);
      });

      setTimeout(() => {
        ws.close();
        reject(new Error("timeout"));
      }, 10000);
    });
  } catch (err) {
    console.log("[capture] Error:", err.message);
  }
}

// HTTP server to serve the screenshot
const server = http.createServer((req, res) => {
  // CORS headers for dashboard access
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

  if (req.url === "/screenshot" || req.url === "/screenshot.jpg") {
    if (latestScreenshot) {
      res.writeHead(200, {
        "Content-Type": "image/jpeg",
        "Content-Length": latestScreenshot.length,
      });
      res.end(latestScreenshot);
    } else {
      res.writeHead(204);
      res.end();
    }
  } else if (req.url === "/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        service: "mega-claw-capture",
        hasScreenshot: !!latestScreenshot,
        screenshotSize: latestScreenshot
          ? latestScreenshot.length
          : 0,
        cdpPort: CDP_PORT,
        interval: INTERVAL / 1000,
      })
    );
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(SERVE_PORT, "0.0.0.0", () => {
  console.log(`\n🦞 Mega Claw Browser Capture`);
  console.log(`   Serving on http://0.0.0.0:${SERVE_PORT}/screenshot`);
  console.log(`   CDP target: http://127.0.0.1:${CDP_PORT}`);
  console.log(`   Interval: ${INTERVAL / 1000}s\n`);

  // Initial capture
  captureScreenshot();

  // Periodic capture
  setInterval(captureScreenshot, INTERVAL);
});
