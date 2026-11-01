import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp, localParts } from '../src/app.js';

let tg, app, base, jar, dataDir, groupId, ali, sara;

before(async () => {
  const calls = [];
  const server = http.createServer(async (req, res) => {
    let raw = '';
    for await (const c of req) raw += c;
    const body = raw ? JSON.parse(raw) : {};
    calls.push({ url: req.url, body });
    res.writeHead(200, { 'content-type': 'application/json' });
    if (req.url.endsWith('/getMe')) return res.end(JSON.stringify({ ok: true, result: { username: 'moallem_test_bot' } }));
    if (req.url.endsWith('/getUpdates')) return setTimeout(() => res.end(JSON.stringify({ ok: true, result: [] })), 200);
    res.end(JSON.stringify({ ok: true, result: {} }));
  });
  await new Promise((r) => server.listen(0, r));
  tg = { server, calls, url: `http://127.0.0.1:${server.address().port}` };
  process.env.TELEGRAM_API_URL = tg.url;
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'moallem-'));
  app = createApp({ dataDir });
  base = `http://127.0.0.1:${await app.start(0)}`;
});
after(async () => {
  await app.stop();
  tg.server.close();
  fs.rmSync(dataDir, { recursive: true, force: true });
});

async function call(p, { method = 'GET', body, auth = true } = {}) {
  const res = await fetch(base + p, { method, headers: { ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...(auth && jar ? { cookie: jar } : {}) }, body: body !== undefined ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, body: json, headers: res.headers };
}
const sentTo = (chat) => tg.calls.filter((c) => c.url.endsWith('/sendMessage') && String(c.body.chat_id) === chat);
const today = () => localParts(Date.now(), 'UTC');

test('setup, Telegram bot, a group with today in its schedule', async () => {
  let r = await call('/api/setup', { method: 'POST', body: { teacherName: 'أ. محمد', subject: 'رياضيات', password: 'teach-pass-1', timezone: 'UTC' } });
  jar = r.headers.get('set-cookie').split(';')[0];
  r = await call('/api/settings', { method: 'PUT', body: { settings: { telegramToken: 'BOT1' } } });
  assert.equal(r.body.telegram.username, 'moallem_test_bot');
  const L = today();
  r = await call('/api/groups', { method: 'POST', body: { name: 'تالتة ثانوي - السبت', fee: 400, schedule: [{ day: L.weekday, time: '23:59', duration: 90 }, { day: 9, time: 'x' }] } });
  groupId = r.body.group.id;
  assert.equal(r.body.group.schedule.length, 1, 'invalid schedule rows are dropped');
});

test('students, portal page and Telegram linking for student and parent', async () => {
  let r = await call('/api/students', { method: 'POST', body: { name: 'علي', phone: '0100', parentName: 'أبو علي', parentPhone: '0111', groupIds: [groupId] } });
  ali = r.body.student;
  assert.ok(ali.portal.startsWith('/p/'));
  assert.equal(ali.token, undefined, 'secret token is only exposed as the portal link');
  r = await call('/api/students', { method: 'POST', body: { name: 'سارة', groupIds: [groupId], feeOverride: 300 } });
  sara = r.body.student;
  // link via bot
  await app.telegram.handle({ message: { chat: { id: 501, type: 'private' }, text: `/start S-${ali.code}` } });
  await app.telegram.handle({ message: { chat: { id: 502, type: 'private' }, text: `/start P-${ali.code}` } });
  await app.telegram.handle({ message: { chat: { id: 503, type: 'private' }, text: '/start P-ZZZZZZ' } });
  assert.match(sentTo('503').at(-1).body.text, /مش موجود/);
  r = await call('/api/portal/' + ali.portal.slice(3), { auth: false });
  assert.equal(r.body.student.name, 'علي');
  assert.deepEqual(r.body.linked, { student: true, parent: true });
  assert.equal(r.body.bot, 'moallem_test_bot');
  assert.equal((await call('/api/portal/nope', { auth: false })).status, 404);
});

test("today's plan and attendance alert the parent once", async () => {
  let r = await call('/api/overview');
  assert.equal(r.body.todayPlan.length, 1);
  assert.equal(r.body.todayPlan[0].students.length, 2);
  const date = r.body.today;
  r = await call('/api/attendance', { method: 'PUT', body: { groupId, date, time: '23:59', attendance: { [ali.id]: 'absent', [sara.id]: 'present' } } });
  assert.equal(r.body.alerted, 1);
  assert.match(sentTo('502').at(-1).body.text, /علي غاب/);
  r = await call('/api/attendance', { method: 'PUT', body: { groupId, date, time: '23:59', attendance: { [ali.id]: 'absent' } } });
  assert.equal(r.body.alerted, 0, 'no second alert for the same absence');
  r = await call('/api/portal/' + ali.portal.slice(3), { auth: false });
  assert.equal(r.body.attendance[0].status, 'absent');
});

test('fees: dues from groups or custom fee, partial payments, reminders', async () => {
  const month = today().month;
  let r = await call('/api/payments?month=' + month);
  const a = r.body.students.find((s) => s.id === ali.id);
  const s = r.body.students.find((x) => x.id === sara.id);
  assert.deepEqual([a.due, a.status], [400, 'unpaid']);
  assert.equal(s.due, 300, 'custom fee wins');
  await call('/api/payments', { method: 'POST', body: { studentId: ali.id, month, amount: 150, method: 'cash' } });
  r = await call('/api/payments?month=' + month);
  assert.equal(r.body.students.find((x) => x.id === ali.id).status, 'partial');
  const before = sentTo('502').length;
  r = await call('/api/payments/remind', { method: 'POST', body: { month } });
  assert.equal(r.body.sent, 1, 'only students with a linked chat get reminders');
  assert.match(sentTo('502').at(before).body.text, /باقي منها 250/);
  r = await call('/api/overview?month=' + month);
  assert.equal(r.body.expected, 700);
  assert.equal(r.body.collected, 150);
});

test('exam scores, publishing with rank, portal results', async () => {
  let r = await call('/api/exams', { method: 'POST', body: { groupId, title: 'امتحان الشهر', maxScore: 20 } });
  const id = r.body.exam.id;
  r = await call('/api/exams/' + id, { method: 'PUT', body: { scores: { [ali.id]: 17, [sara.id]: 19, bogus: 5 } } });
  assert.deepEqual(Object.keys(r.body.exam.scores).sort(), [ali.id, sara.id].sort(), 'unknown students are ignored');
  r = await call('/api/exams/' + id, { method: 'PUT', body: { scores: { [ali.id]: 25 } } });
  assert.equal(r.body.exam.scores[ali.id], 17, 'scores above the full mark are rejected');
  r = await call(`/api/exams/${id}/publish`, { method: 'POST', body: {} });
  assert.equal(r.body.sent, 2, 'student and parent of Ali');
  assert.match(sentTo('501').at(-1).body.text, /17 من 20 \(الترتيب 2 من 2\)/);
  r = await call('/api/portal/' + ali.portal.slice(3), { auth: false });
  assert.deepEqual([r.body.exams[0].score, r.body.exams[0].rank], [17, 2]);
});

test('announcements reach students and optionally parents', async () => {
  const before = tg.calls.length;
  const r = await call('/api/announcements', { method: 'POST', body: { groupId, text: 'الحصة الجاية مراجعة', parents: true } });
  assert.equal(r.body.announcement.sent, 2);
  assert.equal(tg.calls.length - before, 2);
});

test('session reminders and the monthly fee reminder run once', async () => {
  app.data.reminded = [];
  app.data.settings.notify.sessionReminderMinutes = 1440;
  app.data.settings.notify.paymentReminderDay = 1;
  app.data.settings.lastPaymentReminder = '';
  const before = sentTo('501').length;
  await app.tick();
  await app.tick();
  const studentMsgs = sentTo('501').slice(before).map((c) => c.body.text);
  assert.equal(studentMsgs.filter((t) => t.startsWith('⏰')).length, 1);
  assert.equal(app.data.settings.lastPaymentReminder, today().month);
});

test('owner API needs a session', async () => {
  assert.equal((await call('/api/students', { auth: false })).status, 401);
});
