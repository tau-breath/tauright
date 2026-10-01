import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

function runNpm(args, options = {}) {
  const common = {
    cwd: PACKAGE_ROOT,
    encoding: "utf8",
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  };
  if (process.platform === "win32") {
    const command = `npm ${args.join(" ")}`;
    return execFileSync(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", command], common);
  }
  return execFileSync("npm", args, common);
}

function installedVersion() {
  try {
    return JSON.parse(readFileSync(resolve(PACKAGE_ROOT, "node_modules", "patchright", "package.json"), "utf8")).version;
  } catch {
    return null;
  }
}

function stable(v) {
  return /^\d+\.\d+\.\d+$/.test(String(v || ""));
}

function latestStable() {
  const raw = runNpm(["view", "patchright", "dist-tags.latest", "--json"], {
    timeout: Number(process.env.TAURIGHT_UPDATE_TIMEOUT_MS || 12000),
  }).trim();
  const parsed = JSON.parse(raw);
  if (!stable(parsed)) throw new Error(`npm latest is not a stable semver: ${parsed}`);
  return parsed;
}

export function updatePatchrightStable({ force = false } = {}) {
  const enabled = process.env.TAURIGHT_AUTO_UPDATE !== "0";
  const current = installedVersion();
  if (!enabled && !force) return { enabled: false, installed: current, updated: false };
  try {
    const latest = latestStable();
    if (current === latest) return { enabled: true, installed: current, latest, updated: false };
    runNpm([
      "install", `patchright@${latest}`,
      "--no-save", "--package-lock=false", "--ignore-scripts", "--no-audit", "--no-fund",
    ], {
      timeout: Number(process.env.TAURIGHT_UPDATE_INSTALL_TIMEOUT_MS || 90000),
    });
    return { enabled: true, installed: current, latest, updated: true, active: latest };
  } catch (error) {
    const strict = process.env.TAURIGHT_UPDATE_STRICT === "1";
    const result = { enabled: true, installed: current, updated: false, error: String(error?.message || error).split("\n")[0] };
    if (strict) throw Object.assign(new Error(`Patchright stable update failed: ${result.error}`), { result });
    return result;
  }
}
