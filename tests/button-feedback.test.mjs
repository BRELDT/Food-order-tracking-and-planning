import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Local DOM/controller adapters; no live browser or Apps Script requests.
function harness() {
  const nodes = new Map(), clicks = [];
  const node = (text = '') => ({ textContent: text, disabled: false, attributes: new Map(),
    setAttribute(name, value) { this.attributes.set(name, value); },
    getAttribute(name) { return this.attributes.get(name) ?? null; },
    removeAttribute(name) { this.attributes.delete(name); },
  });
  for (const id of ['adminEvents', 'showArchived', 'adminMessage']) nodes.set(id, node());
  const ctx = vm.createContext({ window: {}, document: { addEventListener: (name, fn) => clicks.push(fn) },
    setTimeout: () => 1, queueMicrotask, busy: false, sessionClosed: false, $: id => nodes.get(id) });
  vm.runInContext(fs.readFileSync('address-entry.js', 'utf8'), ctx);
  ctx.MealButtonFeedback = ctx.window.MealButtonFeedback;
  const source = fs.readFileSync('apps-script/AdminClient.html', 'utf8');
  vm.runInContext(source.slice(source.indexOf('  async function task('), source.indexOf('  const dateLabel =')), ctx);
  return { ctx, nodes, node, click: button => {
    let stopped = false;
    clicks[0]({ target: { closest: () => button }, preventDefault: () => { stopped = true; }, stopImmediatePropagation() {} });
    return stopped;
  }};
}

test('all button clicks get visible acknowledgement; pending buttons block another click and restore accessibility labels', async () => {
  const h = harness(), button = h.node('Approve Selected');
  button.setAttribute('aria-label', 'Approve chosen referrals');
  assert.equal(h.click(button), false);
  assert.equal(button.getAttribute('data-click-feedback'), 'true');
  assert.equal(h.ctx.MealButtonFeedback.current(), button);
  const finish = h.ctx.MealButtonFeedback.begin(button);
  assert.equal(button.getAttribute('aria-busy'), 'true');
  assert.equal(button.getAttribute('aria-disabled'), 'true');
  assert.match(button.getAttribute('aria-label'), /Loading/);
  assert.equal(h.click(button), true);
  // Backend-rendered disabled state must not be overwritten when feedback ends.
  button.disabled = true;
  finish();
  assert.equal(button.getAttribute('aria-busy'), null);
  assert.equal(button.getAttribute('aria-disabled'), null);
  assert.equal(button.getAttribute('aria-label'), 'Approve chosen referrals');
  assert.equal(button.disabled, true);
});

test('admin task shows loading immediately, prevents repeated work, and clears feedback on failure', async () => {
  const h = harness(), button = h.node('Save Referral');
  let reject, extraCalls = 0;
  const waiting = new Promise((_, fail) => { reject = fail; });
  const task = h.ctx.task(() => waiting, button);
  assert.equal(button.getAttribute('aria-busy'), 'true');
  assert.equal(h.nodes.get('adminMessage').textContent, 'Working…');
  await h.ctx.task(() => { extraCalls++; }, button);
  assert.equal(extraCalls, 0);
  reject(new Error('Synthetic save failed'));
  await task;
  assert.equal(button.getAttribute('aria-busy'), null);
  assert.equal(h.nodes.get('adminMessage').textContent, 'Synthetic save failed');
  assert.equal(h.nodes.get('adminEvents').disabled, false);
});

test('delegated dynamic buttons retain loading through completion and return to their normal label', async () => {
  const h = harness(), button = h.node('Refresh');
  h.click(button);
  let resolve;
  const waiting = new Promise(done => { resolve = done; });
  const task = h.ctx.task(() => waiting);
  await Promise.resolve();
  assert.equal(button.getAttribute('aria-busy'), 'true');
  resolve(); await task;
  assert.equal(button.getAttribute('aria-busy'), null);
  assert.equal(button.textContent, 'Refresh');
  assert.equal(h.nodes.get('adminMessage').textContent, '');
});
