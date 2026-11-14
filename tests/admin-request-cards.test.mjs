import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('apps-script/AdminClient.html', 'utf8');
test('four siblings render as safe, independent cards with the correct status actions', async () => {
  class Element {
    constructor(tag) { this.tag = tag; this.children = []; this.dataset = {}; this.textContent = ''; }
    append(...nodes) { this.children.push(...nodes); }
    replaceChildren() { this.children = []; }
    addEventListener(name, fn) { this[name] = fn; }
  }
  const calls = [], cards = new Element('div');
  const recipients = ['Pending', 'Approved', 'Rejected', 'Pending'].map((Status, i) => ({
    RecipientID: 'synthetic-' + i, Version: i + 1, ReferralID: 'same-group',
    OrganizationName: 'Synthetic Organization', SubmittedAt: '2026-10-01T12:00:00Z',
    RecipientName: i ? 'Recipient ' + i : '<script>Synthetic</script>',
    Address: 'Address ' + i, MealCount: i + 2, Status,
    AddressStatus: i ? 'Confirmed' : 'Needs Review', DuplicateFlag: i === 1,
  }));
  const helpers = source.slice(source.indexOf('  const el ='), source.indexOf('  const addressCall ='));
  const renderer = source.slice(source.indexOf('  const statusActions ='), source.indexOf('  function field('));
  vm.runInNewContext(helpers + '\n' + renderer + '\nrenderRequests();', {
    document: { createElement: tag => new Element(tag) }, $: () => cards,
    dashboard: { recipients, canDeleteRejectedRecipient: true }, readonly: () => false,
    addressReviewed: status => status === 'Confirmed',
    task: fn => fn(), rpc: (action, p) => calls.push(JSON.parse(JSON.stringify({ action, p }))), refresh: () => {},
  });
  const walk = node => [node, ...node.children.flatMap(walk)];
  const all = walk(cards);
  assert.equal(cards.children.length, 4);
  assert.equal(all.filter(node => node.tag === 'script').length, 0);
  for (const r of recipients) {
    const children = walk(cards.children.find(c => c.children.some(x => x.tag === 'h3' && x.textContent === r.RecipientName)));
    const checkbox = children.find(n => n.tag === 'input');
    assert.equal(checkbox.dataset.recipientId, r.RecipientID);
    assert.equal(checkbox.dataset.status, r.Status);
    assert.ok(children.some(n => n.textContent === r.Address));
    assert.ok(children.some(n => n.textContent === r.MealCount + ' meals · Synthetic Organization'));
    const buttons = children.filter(n => n.tag === 'button');
    const has = text => buttons.some(n => n.textContent === text);
    assert.equal(has('Approve'), r.Status === 'Pending');
    assert.equal(has('Reject'), r.Status !== 'Rejected');
    assert.equal(has('Return to Pending'), r.Status !== 'Pending');
    assert.equal(has('Permanently Delete'), r.Status === 'Rejected');
    if (r.RecipientID === 'synthetic-0') await buttons.find(n => n.textContent === 'Approve').click();
  }
  assert.deepEqual(calls, [{ action: 'statuses', p: {
    recipients: [{ recipientId: 'synthetic-0', version: 1 }], status: 'Approved',
  } }]);
});

function reviewHarness(check) {
  const nodes = new Map(['referralDialog', 'referralHeading', 'saveReferral', 'editorMessage'].map(id => [id, {open: true, textContent: '', disabled: false}]));
  const ctx = vm.createContext({readonly: () => false, $: id => nodes.get(id),
    referralAddressControls: [{check}, {check: () => assert.fail('Never review another recipient')}], editing: null,
    openReferral: r => { ctx.editing = r; }, rpc: () => assert.fail('Review must not save before administrator chooses Save') });
  vm.runInContext(source.slice(source.indexOf('  async function reviewRecipientAddress('), source.indexOf('  function editorPayload(')), ctx);
  return {ctx, nodes};
}
test('Google review checks just this recipient and waits for an explicit save', async () => {
  const h = reviewHarness(async () => true);
  await h.ctx.reviewRecipientAddress({RecipientID: 'synthetic-recipient'});
  assert.equal(h.nodes.get('saveReferral').textContent, 'Save Reviewed Address');
  assert.equal(h.nodes.get('saveReferral').disabled, false);
  assert.match(h.nodes.get('editorMessage').textContent, /still needs review/);
});
test('choosing Edit leaves the single address available for correction without saving', async () => {
  const h = reviewHarness(async () => false);
  await h.ctx.reviewRecipientAddress({RecipientID: 'synthetic-recipient'});
  assert.match(h.nodes.get('editorMessage').textContent, /Changes have not been saved/);
  assert.equal(h.nodes.get('saveReferral').disabled, false);
});
test('late Google response cannot overwrite the editor of a sibling', async () => {
  let h;
  h = reviewHarness(async () => { h.ctx.editing = {RecipientID: 'sibling'}; return true; });
  await h.ctx.reviewRecipientAddress({RecipientID: 'synthetic-recipient'});
  assert.doesNotMatch(h.nodes.get('editorMessage').textContent, /save your choice/);
});
