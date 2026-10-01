#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { taurightPaths } from "../src/core/paths.mjs";

const { TaurightBrowser } = await import("../src/core/session.mjs");

const sessions = new Map();
const paths = taurightPaths();
const DEFAULT_SESSION = process.env.TAURIGHT_DEFAULT_SESSION || "tau";
let activeSession = DEFAULT_SESSION;
const headedDefault = process.env.TAURIGHT_HEADED === "1";

const text = obj => ({ content: [{ type: "text", text: typeof obj === "string" ? obj : JSON.stringify(obj, null, 1) }] });
const fail = error => ({ isError: true, content: [{ type: "text", text: String(error?.message ?? error).split("\n")[0] }] });
const wrap = fn => async args => { try { return await fn(args ?? {}); } catch (error) { return fail(error); } };

function cleanName(name, label = "session") {
  const value = String(name || "").trim();
  if (!/^[a-zA-Z0-9._-]{1,64}$/.test(value)) throw new Error(`${label} must match [a-zA-Z0-9._-] and be 1-64 chars`);
  return value;
}

function sessionName(name) {
  return cleanName(name || activeSession || DEFAULT_SESSION);
}

function canonicalProfileFor(name, explicitProfile, profileKey) {
  if (explicitProfile) return resolve(explicitProfile);
  if (profileKey) return resolve(paths.profileRoot, "shared", cleanName(profileKey, "profile_key"));
  if (name === DEFAULT_SESSION && process.env.TAURIGHT_PROFILE) return resolve(process.env.TAURIGHT_PROFILE);
  return resolve(paths.profileRoot, name);
}

function copyProfileOnce(source, lane) {
  mkdirSync(source, { recursive: true });
  if (existsSync(lane)) return false;
  mkdirSync(lane, { recursive: true });
  cpSync(source, lane, {
    recursive: true,
    force: true,
    filter: src => !/[\\/](SingletonLock|SingletonCookie|SingletonSocket|lockfile)$/i.test(src),
  });
  return true;
}

function createSession(name, { headed = headedDefault, profile, profileKey, sharedProfile = false } = {}) {
  name = sessionName(name);
  if (sessions.has(name)) return sessions.get(name);

  const canonicalProfile = canonicalProfileFor(name, profile, profileKey);
  const sameProfileOpen = [...sessions.values()].some(record => record.canonicalProfile === canonicalProfile);
  const useLane = !!profileKey || sharedProfile || sameProfileOpen;
  const userDataDir = useLane ? resolve(paths.laneRoot, name) : canonicalProfile;
  const seeded = useLane ? copyProfileOnce(canonicalProfile, userDataDir) : false;
  mkdirSync(userDataDir, { recursive: true });

  const record = {
    name,
    profile: userDataDir,
    canonicalProfile,
    lane: useLane,
    seeded,
    headed: !!headed,
    createdAt: new Date().toISOString(),
    promise: null,
  };
  record.promise = TaurightBrowser.launch({ headed: record.headed, userDataDir })
    .catch(error => { sessions.delete(name); throw error; });
  sessions.set(name, record);
  return record;
}

async function browser(name) {
  return await createSession(sessionName(name)).promise;
}

async function closeSession(name) {
  name = sessionName(name);
  const record = sessions.get(name);
  if (!record) return false;
  sessions.delete(name);
  await (await record.promise.catch(() => null))?.close();
  return true;
}

async function tabInfo(browserInstance) {
  const pages = browserInstance.context.pages();
  return Promise.all(pages.map(async (page, index) => ({
    index,
    active: page === browserInstance.page,
    url: page.url(),
    title: await page.title().catch(() => ""),
  })));
}

const server = new McpServer({ name: "tauright", version: "0.2.1" });
const sessionField = z.string().optional().describe("Named TAURIGHT session; omitted = active session");

server.registerTool("browser_session_create", {
  title: "Create TAURIGHT session",
  description: "Create/reuse a persistent browser session. profile_key creates a persistent lane cloned once from one shared canonical profile, allowing the same logical profile to run concurrently without Chrome profile-lock collisions.",
  inputSchema: {
    session: z.string(),
    headed: z.boolean().optional(),
    profile: z.string().optional().describe("Canonical profile path"),
    profile_key: z.string().optional().describe("Shared logical profile name"),
    shared_profile: z.boolean().optional().describe("Force this session to use a persistent lane cloned from the canonical profile"),
  },
}, wrap(async ({ session, headed, profile, profile_key, shared_profile }) => {
  const name = sessionName(session);
  const existed = sessions.has(name);
  const record = createSession(name, { headed: headed ?? headedDefault, profile, profileKey: profile_key, sharedProfile: !!shared_profile });
  await record.promise;
  return text({
    session: name,
    existed,
    profile: record.profile,
    canonical_profile: record.canonicalProfile,
    lane: record.lane,
    seeded_from_canonical: record.seeded,
    headed: record.headed,
  });
}));

server.registerTool("browser_sessions", {
  title: "List TAURIGHT sessions",
  description: "List active sessions. Persistent profiles/lanes remain on disk after a session closes.",
  inputSchema: {},
}, wrap(async () => text({
  active: activeSession,
  data_root: paths.dataRoot,
  profile_root: paths.profileRoot,
  lane_root: paths.laneRoot,
  sessions: [...sessions.values()].map(r => ({
    name: r.name,
    active: r.name === activeSession,
    profile: r.profile,
    canonical_profile: r.canonicalProfile,
    lane: r.lane,
    headed: r.headed,
    created_at: r.createdAt,
  })),
})));

server.registerTool("browser_session_use", {
  title: "Use TAURIGHT session",
  description: "Set the active named session used by calls that omit session.",
  inputSchema: { session: z.string() },
}, wrap(async ({ session }) => {
  const name = sessionName(session);
  await browser(name);
  activeSession = name;
  return text({ active: activeSession });
}));

server.registerTool("browser_session_close", {
  title: "Close TAURIGHT session",
  description: "Close one browser process/context without deleting its persistent profile or lane.",
  inputSchema: { session: sessionField },
}, wrap(async ({ session }) => {
  const name = sessionName(session);
  const closed = await closeSession(name);
  if (name === activeSession) activeSession = DEFAULT_SESSION;
  return text({ session: name, closed, active: activeSession });
}));

server.registerTool("browser_status", {
  title: "TAURIGHT status",
  description: "Show session, tabs, profile persistence and Patchright stable-update status.",
  inputSchema: { session: sessionField },
}, wrap(async ({ session }) => {
  const name = sessionName(session);
  const b = await browser(name);
  const record = sessions.get(name);
  return text({
    session: name,
    profile: record?.profile,
    canonical_profile: record?.canonicalProfile,
    lane: record?.lane,
    headed: record?.headed,
    url: b.page.url(),
    title: await b.page.title().catch(() => ""),
    tabs: await tabInfo(b),
    patchright: { version: "1.63.0", update_policy: "pinned-with-tauright-release" },
    stats: b.stats,
    data_root: paths.dataRoot,
  });
}));

server.registerTool("browser_open", {
  title: "Open URL",
  description: "Navigate the selected persistent session to an absolute URL.",
  inputSchema: { url: z.string(), session: sessionField },
}, wrap(async ({ url, session }) => {
  const b = await browser(session);
  const result = await b.open(url);
  const page = await b.snapshot();
  return text({ ...result, session: sessionName(session), elements: page.elements.length, visible_text: page.text.slice(0, 500) });
}));

server.registerTool("browser_snapshot", {
  title: "Fast page snapshot",
  description: "Compact visible text and numbered interactive elements using TAURIGHT's local page scanner. No model/API call.",
  inputSchema: { session: sessionField },
}, wrap(async ({ session }) => text(await (await browser(session)).snapshotText())));

server.registerTool("browser_act", {
  title: "Act on snapshot element",
  description: "Direct local action on an element number from the latest snapshot. No model/API call.",
  inputSchema: {
    action: z.enum(["click", "type", "press_enter", "press_key", "select", "hover", "right_click", "drag", "upload", "scroll", "back", "forward"]),
    element: z.number().int().optional(),
    value: z.string().optional(),
    key: z.string().optional(),
    destination: z.number().int().optional(),
    accept_dialog: z.boolean().optional(),
    session: sessionField,
  },
}, wrap(async ({ accept_dialog, session, ...args }) => text(await (await browser(session)).actOn({ ...args, acceptDialog: !!accept_dialog }))));

server.registerTool("browser_tabs", {
  title: "List tabs",
  description: "List all tabs in a session and mark the active one.",
  inputSchema: { session: sessionField },
}, wrap(async ({ session }) => text({ session: sessionName(session), tabs: await tabInfo(await browser(session)) })));

server.registerTool("browser_tab_new", {
  title: "New tab",
  description: "Open a new tab, optionally navigate it, and make it active.",
  inputSchema: { url: z.string().optional(), session: sessionField },
}, wrap(async ({ url, session }) => {
  const b = await browser(session);
  const page = await b.context.newPage();
  b.page = page;
  if (url) await b.open(url);
  return text({ session: sessionName(session), tabs: await tabInfo(b) });
}));

server.registerTool("browser_tab_switch", {
  title: "Switch tab",
  description: "Switch active tab by zero-based index.",
  inputSchema: { index: z.number().int().min(0), session: sessionField },
}, wrap(async ({ index, session }) => {
  const b = await browser(session);
  const pages = b.context.pages();
  if (!pages[index]) throw new Error(`tab ${index} does not exist; available: 0-${Math.max(0, pages.length - 1)}`);
  b.page = pages[index];
  await b.page.bringToFront().catch(() => {});
  return text({ index, url: b.page.url(), title: await b.page.title().catch(() => ""), tabs: await tabInfo(b) });
}));

server.registerTool("browser_tab_close", {
  title: "Close tab",
  description: "Close a tab by index, or the active tab when omitted. Keeps the session alive.",
  inputSchema: { index: z.number().int().min(0).optional(), session: sessionField },
}, wrap(async ({ index, session }) => {
  const b = await browser(session);
  const pages = b.context.pages();
  const target = index == null ? b.page : pages[index];
  if (!target) throw new Error(`tab ${index} does not exist`);
  if (pages.length === 1) await target.goto("about:blank");
  else await target.close();
  const rest = b.context.pages();
  if (!rest.includes(b.page)) b.page = rest.at(-1);
  return text({ tabs: await tabInfo(b) });
}));

server.registerTool("browser_reload", {
  title: "Reload page",
  description: "Reload active tab and wait for it to settle.",
  inputSchema: { session: sessionField },
}, wrap(async ({ session }) => {
  const b = await browser(session);
  const t0 = Date.now();
  await b.page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
  await b.settle();
  return text({ url: b.page.url(), title: await b.page.title().catch(() => ""), ms: Date.now() - t0 });
}));

server.registerTool("browser_wait", {
  title: "Wait",
  description: "Wait up to 30 seconds, then settle and return the current page.",
  inputSchema: { ms: z.number().int().min(0).max(30000).default(1000), session: sessionField },
}, wrap(async ({ ms, session }) => {
  const b = await browser(session);
  await new Promise(resolve => setTimeout(resolve, ms));
  await b.settle({ max: Math.min(8000, Math.max(1000, ms)) });
  return text({ waited_ms: ms, url: b.page.url(), title: await b.page.title().catch(() => "") });
}));

server.registerTool("browser_screenshot", {
  title: "Screenshot",
  description: "Screenshot the active tab.",
  inputSchema: { full_page: z.boolean().optional(), session: sessionField },
}, wrap(async ({ full_page, session }) => {
  const buffer = await (await browser(session)).screenshot({ fullPage: !!full_page });
  return { content: [{ type: "image", data: buffer.toString("base64"), mimeType: "image/png" }] };
}));

server.registerTool("browser_close", {
  title: "Close browser session",
  description: "Compatibility alias for browser_session_close.",
  inputSchema: { session: sessionField },
}, wrap(async ({ session }) => {
  const name = sessionName(session);
  return text({ session: name, closed: await closeSession(name) });
}));

const shutdown = async () => {
  await Promise.allSettled([...sessions.keys()].map(closeSession));
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
await server.connect(new StdioServerTransport());
