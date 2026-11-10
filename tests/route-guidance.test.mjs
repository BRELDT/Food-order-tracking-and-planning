import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function view({reviewed = true, final = false, maps = false, empty = false} = {}) {
  class Element {
    constructor() { this.children = []; this.dataset = {}; this.textContent = ''; }
    append(...nodes) { this.children.push(...nodes); }
    replaceChildren() { this.children = []; }
    setAttribute() {}
    addEventListener() {}
  }
  const nodes = new Map();
  const get = id => { if (!nodes.has(id)) nodes.set(id, new Element()); return nodes.get(id); };
  const route = { eventName: 'DEV TEST route', deliveryDate: '2026-11-26', totalMeals: 3,
    startAddressStatus: reviewed ? 'Confirmed' : 'Needs Review', isFinal: final, mapsEnabled: maps,
    unresolved: reviewed ? [] : [{recipientId: 'synthetic-stop'}],
    stops: empty ? [] : [{recipientId: 'synthetic-stop', stop: 1, recipientName: 'Synthetic Recipient',
      address: '100 Synthetic Lane', meals: 3, runningMeals: 3, addressStatus: reviewed ? 'Confirmed' : 'Needs Review'}] };
  const source = fs.readFileSync('apps-script/AdminClient.html', 'utf8');
  const helpers = source.slice(source.indexOf('  const el ='), source.indexOf('  const addressCall ='));
  const render = source.slice(source.indexOf('  function renderRoute()'), source.indexOf('  function renderSettings()'));
  vm.runInNewContext(helpers + render + '\nrenderRoute();', {
    document: {createElement: () => new Element()}, $: get, route, routeUnsaved: false, clearDeliveryPdf: () => {},
    readonly: () => false, addressReviewed: status => status === 'Confirmed',
    dateLabel: value => value, mapsUrl: () => 'https://maps.example.test/', matchMedia: () => ({matches: false}) });
  return nodes;
}
test('reviewed addresses explain the required save step while optimization remains disabled', () => {
  const nodes = view();
  assert.match(nodes.get('routeStatus').textContent, /All addresses are reviewed.*Save Manual Order/);
  assert.match(nodes.get('routingAvailability').textContent, /optimization is off/);
  assert.equal(nodes.get('saveRoute').disabled, false);
  assert.equal(nodes.get('printRoute').disabled, true);
  assert.equal(nodes.get('optimizeRoute').disabled, true);
});
test('a saved reviewed manual route can print without paid optimization', () => {
  const nodes = view({final: true});
  assert.equal(nodes.get('printRoute').disabled, false);
  assert.equal(nodes.get('optimizeRoute').disabled, true);
  assert.match(nodes.get('routeStatus').textContent, /You can print/);
});
test('unresolved addresses remain visible and stop printing; empty routes cannot optimize or print', () => {
  const nodes = view({reviewed: false, maps: true});
  assert.match(nodes.get('routeStatus').textContent, /recipient address.*Pickup address needs review/);
  assert.equal(nodes.get('optimizeRoute').disabled, true);
  assert.equal(nodes.get('printRoute').disabled, true);
  const empty = view({empty: true, final: true, maps: true});
  assert.equal(empty.get('printRoute').disabled, true);
  assert.equal(empty.get('optimizeRoute').disabled, true);
  assert.equal(empty.get('saveRoute').disabled, true);
});
