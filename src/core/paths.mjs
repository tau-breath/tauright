import { homedir, platform } from "node:os";
import { join, resolve } from "node:path";
import { mkdirSync } from "node:fs";

export function defaultDataRoot() {
  if (process.env.TAURIGHT_DATA_ROOT) return resolve(process.env.TAURIGHT_DATA_ROOT);
  if (platform() === "win32") return resolve(process.env.LOCALAPPDATA || join(homedir(), "AppData", "Local"), "TAURIGHT");
  if (platform() === "darwin") return resolve(homedir(), "Library", "Application Support", "TAURIGHT");
  return resolve(process.env.XDG_DATA_HOME || join(homedir(), ".local", "share"), "tauright");
}

export function taurightPaths() {
  const dataRoot = defaultDataRoot();
  const profileRoot = resolve(process.env.TAURIGHT_PROFILE_ROOT || join(dataRoot, "profiles"));
  const laneRoot = resolve(process.env.TAURIGHT_RUNTIME_ROOT || join(dataRoot, "lanes"));
  const stateRoot = resolve(process.env.TAURIGHT_STATE_ROOT || join(dataRoot, "state"));
  for (const p of [dataRoot, profileRoot, laneRoot, stateRoot]) mkdirSync(p, { recursive: true });
  return { dataRoot, profileRoot, laneRoot, stateRoot };
}
