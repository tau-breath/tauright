import { spawn } from "node:child_process";

const child = spawn(process.execPath, ["bin/tauright-mcp.mjs"], {
  cwd: new URL(".", import.meta.url),
  env: { ...process.env, TAURIGHT_HEADED: "0", TAURIGHT_AUTO_UPDATE: "0" },
  stdio: ["pipe", "pipe", "pipe"],
});

let stderr = "";
child.stderr.on("data", d => stderr += d);
setTimeout(() => child.kill("SIGTERM"), 1500);
child.on("exit", code => {
  if (code && code !== 0) {
    console.error(stderr || `TAURIGHT MCP exited with ${code}`);
    process.exit(code);
  }
  console.log("TAURIGHT MCP boot smoke test: OK");
});
