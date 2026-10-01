// Pure helpers over the page model returned by the page script. No browser, no network.

export const FIELDISH = e => !!e && (/^(input:(text|email|password|search|tel|url|number|date|datetime-local|month|week|time|color|range)|textarea)/.test(e.tag) || /\[(textbox|searchbox|combobox)\]/.test(e.tag) || (e.tag.startsWith("div[") && e.value !== undefined));
export const SELECTISH = e => !!e && (e.tag === "select" || !!e.options);
export const FILEISH = e => !!e && e.tag === "input:file";

export function brief(e) {
  if (!e) return "?";
  const name = e.label || e.text || e.placeholder || e.name || e.near || e.href || "";
  return `${e.tag} "${String(name).slice(0, 50)}"`;
}

// Word runs inserted in b relative to a (LCS over words), e.g. "walk the dog", "2 items".
export function insertedText(a, b, max = 300) {
  const A = a.split(" ").slice(0, 600), B = b.split(" ").slice(0, 600), n = A.length, m = B.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const runs = []; let cur = [], i = 0, j = 0;
  while (j < m) {
    if (i < n && A[i] === B[j]) { if (cur.length) { runs.push(cur.join(" ")); cur = []; } i++; j++; }
    else if (i < n && dp[i + 1][j] >= dp[i][j + 1]) i++;
    else { cur.push(B[j]); j++; }
  }
  if (cur.length) runs.push(cur.join(" "));
  return runs.join(" | ").slice(0, max);
}

// What changed between two page models: elements added / removed / changed (value, checked,
// active, sorted), reordering, URL, metrics, and inserted text. Duplicates count (two "Toggle
// Todo" checkboxes are two elements); a change in surrounding text alone is not a change.
export function pageDiff(a, b) {
  if (!a) return undefined;
  const ident = e => `${brief(e)}${e.near && e.near !== (e.label || e.text) ? ` near "${e.near.slice(0, 40)}"` : ""}`;
  const base = e => brief(e);
  const state = e => [e.checked !== undefined ? `checked=${e.checked}` : "", e.value ? `value="${e.value}"` : "", e.active ? "active" : "", e.sorted ? `sorted=${e.sorted}` : ""].filter(Boolean).join(" ");
  const show = e => `${ident(e)}${state(e) ? ` ${state(e)}` : ""}`;
  // pair elements: first same name + same surrounding text, then same name in order.
  // Unpaired ones are added/removed; paired ones may have changed state.
  const left = [...a.elements], d = { added: [], removed: [], changed: [] }, pairs = [], rest = [];
  for (const e of b.elements) {
    const k = left.findIndex(x => ident(x) === ident(e));
    if (k >= 0) pairs.push([left.splice(k, 1)[0], e]); else rest.push(e);
  }
  for (const e of rest) {
    const k = left.findIndex(x => base(x) === base(e));
    if (k >= 0) pairs.push([left.splice(k, 1)[0], e]); else d.added.push(show(e));
  }
  for (const [old, e] of pairs) if (state(old) !== state(e)) d.changed.push(`${ident(e)}: ${state(old) || "(empty)"} -> ${state(e) || "(empty)"}`);
  for (const e of left) d.removed.push(show(e));
  for (const k of ["added", "removed", "changed"]) { if (d[k].length) d[k] = d[k].slice(0, 15); else delete d[k]; }
  if (!d.added && !d.removed) {
    // same elements, different order (drag-and-drop, sorting): show the part that moved
    const ka = a.elements.map(show), kb = b.elements.map(show);
    const first = ka.findIndex((k, i) => k !== kb[i]);
    if (first >= 0 && ka.length === kb.length && !d.changed) {
      let last = ka.length - 1; while (last > first && ka[last] === kb[last]) last--;
      d.reordered = { before: ka.slice(first, Math.min(last + 1, first + 10)), after: kb.slice(first, Math.min(last + 1, first + 10)) };
    }
  }
  if (a.url !== b.url) d.url = `${a.url} -> ${b.url}`;
  for (const k of Object.keys(b.metrics ?? {})) if (a.metrics?.[k] !== b.metrics[k]) (d.metrics ??= {})[k] = `${a.metrics?.[k]} -> ${b.metrics[k]}`;
  const ins = insertedText(a.text, b.text); if (ins) d.new_text = ins;
  return d;
}

export function repeatedElements(elements) {
  const counts = {};
  for (const e of elements) { const k = brief(e); counts[k] = (counts[k] ?? 0) + 1; }
  const rep = Object.entries(counts).filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).slice(0, 10);
  return rep.length ? Object.fromEntries(rep) : undefined;
}

// Compact, line-per-element rendering for clients consuming TAURIGHT snapshots.
export function formatPage(page, { maxElements = 400 } = {}) {
  const lines = [`url: ${page.url}`, `title: ${page.title}`];
  if (page.dialogs?.length) lines.push(`dialogs: ${page.dialogs.join(" || ")}`);
  lines.push(`visible text: ${page.text}`, `elements (${page.elements.length}):`);
  for (const e of page.elements.slice(0, maxElements)) {
    const f = [];
    for (const k of ["label", "text", "placeholder", "name"]) if (e[k]) f.push(`${k === "text" ? "" : k + "="}"${e[k]}"`);
    if (e.value !== undefined && e.value !== "") f.push(`value="${e.value}"`);
    if (e.options) f.push(`options=[${e.options.slice(0, 8).join(", ")}${e.options.length > 8 ? ", …" : ""}]`);
    for (const k of ["checked", "disabled", "busy", "expanded", "active", "hidden", "covered"]) if (e[k] !== undefined) f.push(`${k}=${e[k]}`);
    if (e.sorted) f.push(`sorted=${e.sorted}`);
    if (e.href) f.push(`href=${e.href}`);
    if (e.near && !e.text) f.push(`near="${e.near}"`);
    if (e.frame) f.push(`frame=${e.frame}`);
    lines.push(`[${e.i}] ${e.tag} ${f.join(" ")}`);
  }
  if (page.elements.length > maxElements) lines.push(`… ${page.elements.length - maxElements} more`);
  return lines.join("\n");
}
