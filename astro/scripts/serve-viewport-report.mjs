#!/usr/bin/env node
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportDir = path.join(root, "viewport-scroll-report");
const port = Number(process.env.REPORT_PORT ?? 5199);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".webm": "video/webm",
  ".png": "image/png",
  ".zip": "application/zip",
  ".json": "application/json",
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url?.split("?")[0] ?? "/");
  const rel = urlPath === "/" ? "index.html" : urlPath.replace(/^\//, "");
  const file = path.normalize(path.join(reportDir, rel));

  if (!file.startsWith(reportDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const ext = path.extname(file);
  res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

server.listen(port, "127.0.0.1", () => {
  const url = `http://127.0.0.1:${port}/`;
  console.log(`Report server: ${url}`);
  spawn("brave-browser", [url], { detached: true, stdio: "ignore" }).unref();
});

process.on("SIGINT", () => {
  server.close();
  process.exit(0);
});
