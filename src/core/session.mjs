import { chromium } from "patchright";
import { ENUMERATE } from "./page-script.mjs";
import { brief, repeatedElements, formatPage } from "./page-model.mjs";

const sleep = ms => new Promise(r => setTimeout(r, ms));
const TARGETED = new Set(["click", "type", "press_enter", "select", "hover", "right_click", "drag", "upload"]);
const SAFE_DIALOGS = d => ["alert", "beforeunload"].includes(d.type());
const ACCEPT_DIALOGS = () => true;

export class TaurightBrowser {
  static async launch({ headed = false, slowMo = 0, viewport = { width: 1280, height: 800 }, storageState, browser, userDataDir, channel = process.env.PATCHRIGHT_CHANNEL || "chrome" } = {}) {
    let context, own = false;
    const launchArgs = ["--disable-blink-features=AutomationControlled", "--no-sandbox", "--disable-infobars"];
    const tryLaunch = async ch => {
      const baseOpts = {
        headless: !headed,
        slowMo,
        viewport,
        args: launchArgs,
        ignoreDefaultArgs: ["--enable-automation"],
        ...(ch ? { channel: ch } : {}),
      };
      if (userDataDir) return chromium.launchPersistentContext(userDataDir, baseOpts);
      own = !browser;
      browser ??= await chromium.launch(baseOpts);
      return browser.newContext({ viewport, storageState });
    };
    try {
      try { context = await tryLaunch(channel); }
      catch (error) {
        if (channel && /channel|executable/i.test(String(error?.message))) context = await tryLaunch(undefined);
        else throw error;
      }
    } catch (error) {
      if (/Executable doesn't exist|browserType\.launch/i.test(String(error?.message)) && /install/i.test(String(error?.message))) {
        throw new Error("A compatible Chrome/Chromium browser was not found. TAURIGHT portable releases are designed to use an installed Chrome channel by default.");
      }
      throw error;
    }
    const instance = new TaurightBrowser(browser, context, own);
    instance.page = context.pages()[0] ?? await context.newPage();
    return instance;
  }

  constructor(browser, context, ownBrowser) {
    this.browser = browser;
    this.context = context;
    this.ownBrowser = ownBrowser;
    this.inflight = new Map();
    this.events = [];
    this.frames = new Map();
    this.shown = null;
    this.dialogPolicy = SAFE_DIALOGS;
    this.stats = { snapshots: 0, actions: 0 };
    context.addInitScript(() => {
      window.__taurightMut = performance.now();
      const mo = new MutationObserver(records => {
        if (records.some(r => r.attributeName !== "data-tauright-i")) window.__taurightMut = performance.now();
      });
      const go = () => mo.observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
      document ? go() : addEventListener("DOMContentLoaded", go);
    });
    const track = request => ["fetch", "xhr", "document"].includes(request.resourceType()) && this.inflight.set(request, Date.now());
    const untrack = request => this.inflight.delete(request);
    context.on("request", track);
    context.on("requestfinished", untrack);
    context.on("requestfailed", untrack);
    context.on("page", page => {
      if (this._page && page !== this._page) {
        this.events.push(`new tab opened: ${page.url()}`);
        this.page = page;
      }
    });
  }

  get page() { return this._page; }
  set page(page) {
    this._page = page;
    page.on("dialog", async dialog => {
      const accept = await Promise.resolve(this.dialogPolicy(dialog)).catch(() => false);
      this.events.push(`${dialog.type()} dialog "${dialog.message().slice(0, 100)}" ${accept ? "accepted" : "dismissed"}`);
      await (accept ? dialog.accept() : dialog.dismiss()).catch(() => {});
    });
    page.on("close", () => {
      if (this._page !== page) return;
      const rest = this.context.pages();
      if (rest.length) this._page = rest.at(-1);
    });
  }

  async settle({ quiet = 300, max = 6000 } = {}) {
    const t0 = Date.now();
    while (Date.now() - t0 < max) {
      const now = Date.now();
      const net = [...this.inflight.values()].filter(t => now - t < 5000).length;
      let idle = 0;
      try { idle = await this.page.evaluate(() => document.readyState === "loading" ? 0 : performance.now() - (window.__taurightMut ?? 0)); } catch {}
      if (net === 0 && idle >= quiet) return Date.now() - t0;
      await sleep(75);
    }
    return Date.now() - t0;
  }

  async open(url) {
    const t0 = Date.now();
    await this.page.goto(url, { waitUntil: "commit", timeout: 30000 });
    await this.page.waitForLoadState("domcontentloaded", { timeout: 15000 }).catch(() => {});
    await this.settle();
    return { url: this.page.url(), title: await this.page.title(), ms: Date.now() - t0 };
  }

  async snapshot() {
    const main = this.page.mainFrame();
    const frames = [main, ...main.childFrames().filter(f => !f.isDetached())];
    let start = 0;
    const elements = [];
    let base;
    this.frames = new Map();
    for (const [n, frame] of frames.entries()) {
      let result;
      try { result = await frame.evaluate(ENUMERATE, { start, frame: n || undefined }); } catch { continue; }
      if (n === 0) base = result;
      else if (!result.elements.length) continue;
      for (const e of result.elements) this.frames.set(e.i, frame);
      elements.push(...result.elements);
      start = result.next;
    }
    const snapshot = {
      url: base?.url ?? this.page.url(),
      title: base?.title ?? "",
      text: base?.text ?? "",
      metrics: { ...base?.metrics, elements: elements.length },
      elements,
    };
    const repeated = repeatedElements(elements);
    if (repeated) snapshot.repeated_elements = repeated;
    if (base?.dialogs?.length) snapshot.dialogs = base.dialogs;
    this.stats.snapshots++;
    return snapshot;
  }

  async snapshotText() {
    await this.settle();
    this.shown = await this.snapshot();
    return formatPage(this.shown);
  }

  locate(i) {
    const frame = this.frames.get(i) ?? this.page.mainFrame();
    return frame.locator(`[data-tauright-i="${i}"]`).first();
  }

  currentElement(i, current) {
    const old = this.shown ?? current;
    const path = value => { try { const u = new URL(value); return u.origin + u.pathname; } catch { return value; } };
    if (path(old.url) !== path(current.url)) throw new Error(`the page changed since element ${i} was listed; take a new snapshot`);
    const was = old.elements.find(e => e.i === i);
    if (!was) throw new Error(`element ${i} is not in the latest snapshot; take a new snapshot`);
    const identities = [e => `${brief(e)}|${e.near ?? ""}|${e.frame ?? ""}`, e => `${brief(e)}|${e.frame ?? ""}`];
    for (const identity of identities) {
      const before = old.elements.filter(e => identity(e) === identity(was));
      const after = current.elements.filter(e => identity(e) === identity(was));
      if (after.length === before.length) return after[before.indexOf(was)];
    }
    throw new Error(`element ${i} (${brief(was)}) is no longer uniquely identifiable; take a new snapshot`);
  }

  async act({ tool, target, value, key, destination }) {
    const t0 = Date.now();
    const needsTarget = TARGETED.has(tool) || (tool === "press_key" && target != null);
    if (needsTarget && target == null) throw new Error(`${tool} needs a target element`);
    const loc = needsTarget ? this.locate(target) : null;
    const options = { timeout: 4000 };
    switch (tool) {
      case "click": await loc.click(options); break;
      case "right_click": await loc.click({ button: "right", ...options }); break;
      case "type": {
        if (value == null) throw new Error("no value to type");
        const v = String(value);
        await loc.fill("", options);
        if (v.length <= 120) await loc.pressSequentially(v, { delay: 5, ...options });
        else await loc.fill(v, options);
        const got = await loc.inputValue({ timeout: 1000 }).catch(() => null);
        if (got !== null && got !== v) await loc.fill(v, options);
        break;
      }
      case "press_enter": await loc.press("Enter", options); break;
      case "press_key": loc ? await loc.press(key ?? "Escape", options) : await this.page.keyboard.press(key ?? "Escape"); break;
      case "select": await loc.selectOption({ label: String(value ?? "") }, options).catch(() => loc.selectOption(String(value ?? ""), options)); break;
      case "hover": await loc.hover(options); break;
      case "drag": {
        if (destination == null) throw new Error("drag needs a destination element");
        await loc.dragTo(this.locate(destination), options);
        break;
      }
      case "upload": {
        if (value == null) throw new Error("no file path to upload");
        await loc.setInputFiles(String(value), options);
        break;
      }
      case "scroll": await this.page.mouse.wheel(0, Number(value) || 700); break;
      case "back": await this.page.goBack({ timeout: 10000 }).catch(() => {}); break;
      case "forward": await this.page.goForward({ timeout: 10000 }).catch(() => {}); break;
      default: throw new Error(`unknown action ${tool}`);
    }
    this.stats.actions++;
    return Date.now() - t0;
  }

  async actOn({ action, element, value, key, destination, acceptDialog = false }) {
    const current = element != null || destination != null ? await this.snapshot() : null;
    const el = element == null ? undefined : this.currentElement(element, current);
    if (TARGETED.has(action) && !el) throw new Error(`${action} needs an element`);
    const dest = destination == null ? undefined : this.currentElement(destination, current).i;
    this.dialogPolicy = acceptDialog ? ACCEPT_DIALOGS : SAFE_DIALOGS;
    let ms;
    try { ms = await this.act({ tool: action, target: el?.i, value, key, destination: dest }); }
    finally { this.dialogPolicy = SAFE_DIALOGS; }
    await this.settle();
    const events = this.events.splice(0);
    return { action, element: brief(el), ms, url: this.page.url(), title: await this.page.title().catch(() => ""), ...(events.length ? { events } : {}) };
  }

  async screenshot({ path, fullPage = false } = {}) { return this.page.screenshot({ path, fullPage }); }
  async close() {
    await this.context.close().catch(() => {});
    if (this.ownBrowser) await this.browser.close().catch(() => {});
  }
}
