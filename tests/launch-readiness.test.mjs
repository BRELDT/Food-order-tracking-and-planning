import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import vm from 'node:vm';
import {harness, createEvent, payload, approve, editPayload} from './harness.mjs';
const ok = r => { assert.equal(r.ok, true, JSON.stringify(r)); return r.data; };

test('a closed Thanksgiving placeholder needs no invented pickup address or capacity; opening requires both', () => {
  const h = harness();
  const input = {eventName: 'Thanksgiving 2026', deliveryDate: '2026-11-26', status: 'Closed', capacity: 0, startAddress: ''};
  const event = ok(h.admin('saveEvent', input));
  assert.equal(h.ctx.publicEvents_().length, 0);
  for (const change of [{status:'Open'}, {status:'Open', capacity:100}, {status:'Open', startAddress:'1 Synthetic Road'}]) {
    const before = h.snapshot();
    assert.equal(h.admin('saveEvent', {...input, ...change, eventId:event.EventID, version:event.Version}).error.code, 'INVALID');
    assert.equal(h.snapshot(), before);
  }
});

test('event creation retries reuse the permanent ID and never create another event or audit entry', () => {
  const h = harness();
  const input = {eventName:'Thanksgiving 2026', deliveryDate:'2026-11-26', capacity:10, startAddress:'1 Synthetic Road', status:'Closed', creationId:crypto.randomUUID()};
  const first = ok(h.admin('saveEvent', input)), before = h.snapshot();
  assert.deepEqual(ok(h.admin('saveEvent', input)), first);
  assert.equal(h.snapshot(), before);
  assert.equal(h.admin('saveEvent', {...input, capacity:11}).error.code, 'IDEMPOTENCY');
  assert.equal(h.snapshot(), before);
});

test('organization names matching Object properties produce independent accurate report rows', () => {
  const h = harness(), event = createEvent(h, 30);
  for (const name of ['constructor','toString','hasOwnProperty']) ok(h.public(payload(event.EventID,[2],{organizationName:name})));
  const report = ok(h.admin('reports', {eventId:event.EventID}));
  assert.equal(report.organizations.length, 3);
  assert.equal(report.totals.currentlyReservedMeals, 6);
  assert.ok(report.organizations.every(o => o.referrals === 1 && o.currentMeals === 2));
});

test('event-specific report capacity and status counts follow approval, rejection and edits', () => {
  const h = harness(), event = createEvent(h, 30);
  const a = ok(h.public(payload(event.EventID,[2,3]))), b = ok(h.public(payload(event.EventID,[4])));
  ok(approve(h,[a.referralId]));
  let r = ok(h.admin('reports',{eventId:event.EventID})).totals;
  assert.equal(r.pendingReferrals,1); assert.equal(r.approvedReferrals,1); assert.equal(r.rejectedReferrals,0);
  assert.equal(r.capacity,30); assert.equal(r.currentlyReservedMeals,9); assert.equal(r.remainingCapacity,21);
  const ref = h.get('REFERRALS').find(x => x.ReferralID === b.referralId);
  ok(h.admin('statuses',{status:'Rejected', referrals:[{referralId:ref.ReferralID, version:ref.Version}]}));
  const edit = editPayload(h,a.referralId); edit.recipients[0].mealCount = 3; ok(h.admin('editReferral',edit));
  r = ok(h.admin('reports',{eventId:event.EventID})).totals;
  assert.equal(r.pendingReferrals,0); assert.equal(r.rejectedReferrals,1);
  assert.equal(r.currentlyReservedMeals,6); assert.equal(r.remainingCapacity,24);
  assert.equal(r.rejectedMeals,4); assert.equal(r.originallyRequestedMeals,9);
});

test('server rejects email autofill and malformed recipients without reserving meals', () => {
  const h = harness(), event = createEvent(h), p = payload(event.EventID,[2]);
  const before = h.snapshot(); p.recipients[0].address = 'recipient@example.test';
  assert.equal(h.public(p).error.code, 'INVALID');
  p.recipients = [null]; assert.equal(h.public(p).error.code, 'INVALID');
  assert.equal(h.snapshot(), before);
});

test('future audit entries omit private recipient and organization values while preserving quantities and versions', () => {
  const h = harness(), event = createEvent(h);
  const receipt = ok(h.admin('createReferral', payload(event.EventID,[2])));
  const p = editPayload(h,receipt.referralId);
  p.recipients[0].notes = 'PRIVATE_INTERNAL_SENTINEL';
  p.recipients[0].dietaryRestrictions = 'PRIVATE_DIETARY_SENTINEL';
  p.recipients[0].address = 'PRIVATE_ADDRESS_SENTINEL';
  p.organizationName = 'PRIVATE_ORGANIZATION_SENTINEL';
  p.organizationEmail = 'private-contact@example.test';
  p.recipients[0].mealCount = 3;
  ok(h.admin('editReferral',p));
  const audit = JSON.stringify(h.get('AUDITLOG'));
  for (const marker of ['PRIVATE_', 'private-contact@example.test', '202-555-0101']) assert.ok(!audit.includes(marker));
  const entry = h.get('AUDITLOG').findLast(x => x.Action === 'Recipient Edited');
  assert.equal(JSON.parse(entry.NewValue).MealCount,3);
  assert.equal(JSON.parse(entry.NewValue).Version,2);
  assert.equal(h.get('RECIPIENTS')[0].Notes,'PRIVATE_INTERNAL_SENTINEL');
});

test('admin receipt recovery requires authorization, returns minimal data, and public recovery never reveals admin submissions', () => {
  const h = harness(), event = createEvent(h), p = payload(event.EventID,[2]);
  const receipt = ok(h.admin('createReferral',p)), before = h.snapshot();
  assert.deepEqual(ok(h.admin('submissionReceipt',{submissionId:p.submissionId})).receipt,receipt);
  assert.equal(h.snapshot(),before);
  assert.equal(ok(h.admin('submissionReceipt',{submissionId:crypto.randomUUID()})).receipt,null);
  h.state.active = h.state.effective = 'unapproved@example.test';
  assert.equal(h.admin('submissionReceipt',{submissionId:p.submissionId}).error.code,'FORBIDDEN');
  h.state.active = h.state.effective = '';
  assert.equal(JSON.parse(h.ctx.doGet({parameter:{action:'submissionReceipt',submissionId:p.submissionId}}).text).data.receipt,null);
});

function createController(sharedStorage = new Map()) {
  const source = fs.readFileSync('apps-script/AdminClient.html','utf8');
  const begin = source.indexOf('  const pendingCreates =');
  const end = source.indexOf('  async function task(',begin);
  const requests = [], ctx = vm.createContext({crypto:crypto.webcrypto, TextEncoder, Uint8Array,
    sessionStorage:{getItem:k=>sharedStorage.get(k),setItem:(k,v)=>sharedStorage.set(k,v),removeItem:k=>sharedStorage.delete(k)},
    rpc:async(action,p)=>{ requests.push({action,p}); if(ctx.failure) throw ctx.failure; return {saved:true}; }
  });
  vm.runInContext(source.slice(begin,end),ctx);
  return {ctx, requests, storage:sharedStorage};
}

test('admin uncertain creates preserve only hashes/IDs across reload and retry with the same ID', async () => {
  const h = createController();
  const input = {eventId:'event-1',organizationName:'PRIVATE_NAME',recipients:[{address:'PRIVATE_ADDRESS',mealCount:2,addressReceipt:'temporary-proof'}]};
  h.ctx.failure = new Error('lost response');
  await assert.rejects(h.ctx.createOnce('createReferral',input),/lost response/);
  const id = h.requests[0].p.submissionId, persisted = [...h.storage.values()].join('');
  assert.ok(!persisted.includes('PRIVATE_')); assert.ok(!persisted.includes('temporary-proof'));
  const reload = createController(h.storage);
  await assert.rejects(reload.ctx.createOnce('createReferral',{...input,organizationName:'different'}),/unconfirmed/);
  assert.equal(reload.requests.length,0);
  await reload.ctx.createOnce('createReferral',input);
  assert.equal(reload.requests[0].p.submissionId,id);
  assert.equal(h.storage.size,0);
});

test('a definitive admin validation failure permits a corrected new request', async () => {
  const h = createController(); h.ctx.failure = Object.assign(new Error('invalid'),{code:'INVALID'});
  await assert.rejects(h.ctx.createOnce('saveEvent',{capacity:-1}));
  assert.equal(h.storage.size,0);
  h.ctx.failure = null; await h.ctx.createOnce('saveEvent',{capacity:10});
  assert.ok(h.requests[1].p.creationId);
  assert.notEqual(h.requests[0].p.creationId,h.requests[1].p.creationId);
});

test('delivery PDF requires an approved identity and a current finalized route', () => {
  const h = harness(), event = createEvent(h, 30);
  const input = payload(event.EventID, [2, 5]);
  input.recipients[0].recipientName = 'Ana <Rivera> & Family';
  input.recipients[0].notes = 'DO_NOT_PRINT_PRIVATE_NOTE';
  input.recipients[0].deliveryInstructions = 'Ring twice';
  const submitted = ok(h.admin('createReferral', input));
  ok(approve(h, [submitted.referralId]));
  const request = () => {
    const route = h.get('EVENTS').find(e => e.EventID === event.EventID);
    return {eventId: event.EventID, routeVersion: route.RouteVersion};
  };
  assert.equal(h.admin('deliveryPdf', request()).error.code, 'CONFLICT');
  h.seed(s => {
    const route = s.EVENTS.find(e => e.EventID === event.EventID);
    route.StartAddressStatus = 'Confirmed';
    route.RouteNeedsReview = false;
    s.RECIPIENTS.forEach((r, i) => {
      r.AddressStatus = 'Confirmed';
      r.RoutePosition = i + 1;
    });
  });
  const current = request();
  let markup = '';
  h.state.convertPdf = (html, mime) => {
    assert.equal(mime, 'application/pdf');
    markup = html;
    return Buffer.from('%PDF-1.7');
  };
  const before = h.snapshot();
  assert.equal(h.admin('deliveryPdf', {...current, routeVersion: current.routeVersion - 1}).error.code, 'CONFLICT');
  h.state.active = h.state.effective = 'unapproved@example.test';
  for (const action of ['dashboard', 'reports', 'route', 'deliveryPdf', 'saveEvent', 'editReferral']) {
    assert.equal(h.admin(action, current).error.code, 'FORBIDDEN');
  }
  h.state.active = '';
  assert.equal(h.admin('deliveryPdf', current).error.code, 'AUTH');
  assert.equal(JSON.parse(h.ctx.doGet({parameter:{action:'deliveryPdf'}}).text).error.code, 'FORBIDDEN');
  assert.equal(markup, '');
  h.state.active = h.state.effective = 'admin-two@example.test';
  const pdf = ok(h.admin('deliveryPdf', current));
  assert.equal(pdf.filename, 'delivery-sheet-2026-11-26.pdf');
  assert.equal(Buffer.from(pdf.base64, 'base64').toString(), '%PDF-1.7');
  assert.match(markup, /@page \{ size: letter/);
  assert.match(markup, /2 Stops · 7 Meals/);
  assert.match(markup, /Ana &lt;Rivera&gt; &amp; Family/);
  assert.match(markup, /Ring twice/);
  assert.doesNotMatch(markup, /DO_NOT_PRINT_PRIVATE_NOTE/);
  h.state.convertPdf = () => Buffer.from('not a PDF');
  assert.equal(h.admin('deliveryPdf', current).error.code, 'PDF');
  assert.equal(h.snapshot(), before);
});

test('expired public events are hidden and reject new referrals, but preserve existing receipts and admin access', () => {
  const h = harness(), event = createEvent(h, 20);
  h.state.publicDate = event.DeliveryDate;
  assert.equal(h.ctx.publicEvents_()[0].eventId, event.EventID);
  const input = payload(event.EventID, [2]);
  const receipt = ok(h.public(input));
  h.state.publicDate = '2026-11-27';
  assert.equal(h.ctx.publicEvents_().length, 0);
  const before = h.snapshot();
  assert.equal(h.public(payload(event.EventID, [2])).error.code, 'CLOSED');
  assert.equal(JSON.parse(h.ctx.doPost({postData:{contents:JSON.stringify({action:'addressPreview',eventId:event.EventID})}}).text).error.code, 'CLOSED');
  assert.equal(ok(h.public(input)).referralId, receipt.referralId);
  assert.equal(ok(h.admin('dashboard', {eventId:event.EventID})).reserved, 2);
  assert.equal(h.snapshot(), before);
});

test('local HTTP preview serves the confirmation helper and exercises real public submission/receipt dispatch', async () => {
  const {spawn} = await import('node:child_process');
  const server = spawn(process.execPath,['tools/dev-server.mjs','0'],{stdio:['ignore','pipe','pipe']});
  try {
    const origin = await new Promise((resolve,reject) => {
      server.stdout.on('data', chunk => {
        const match = String(chunk).match(/http:\/\/127\.0\.0\.1:\d+/);
        if(match) resolve(match[0]);
      });
      server.on('error',reject); server.on('exit',code => reject(new Error('preview exited '+code)));
    });
    const asset = await fetch(origin+'/submission-confirmation.js');
    assert.equal(asset.status,200); assert.match(await asset.text(),/MealSubmission/);
    const events = await (await fetch(origin+'/api?action=events')).json();
    assert.equal(events.ok,true);
    const event = events.data.find(e=>e.remaining===15), p = payload(event.eventId,[1,2]);
    const submitted = await (await fetch(origin+'/api',{method:'POST',body:JSON.stringify({action:'submit',...p})})).json();
    assert.equal(submitted.ok,true);
    const recovered = await (await fetch(origin+'/api?action=submissionReceipt&submissionId='+p.submissionId)).json();
    assert.deepEqual(recovered.data.receipt,submitted.data);
    const retry = await (await fetch(origin+'/api',{method:'POST',body:JSON.stringify({action:'submit',...p})})).json();
    assert.deepEqual(retry.data,submitted.data);
    const after = await (await fetch(origin+'/api?action=events')).json();
    assert.equal(after.data.find(e=>e.eventId===event.eventId).remaining,12);
    assert.equal((await fetch(origin+'/apps-script/Store.gs')).status,404);
  } finally { server.kill(); }
});

test('a later authorization failure cannot discard the identity of an earlier uncertain admin save', async () => {
  const h=createController(), input={eventId:'event-1',recipients:[{mealCount:2}]};
  h.ctx.failure=new Error('lost response');
  await assert.rejects(h.ctx.createOnce('createReferral',input));
  const id=h.requests[0].p.submissionId;
  h.ctx.failure=Object.assign(new Error('signed out'),{code:'AUTH'});
  await assert.rejects(h.ctx.createOnce('createReferral',input));
  assert.equal(h.storage.size,1);
  h.ctx.failure=null;
  await h.ctx.createOnce('createReferral',input);
  assert.ok(h.requests.every(r=>r.p.submissionId===id));
});
