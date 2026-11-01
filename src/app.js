// Moallem server: groups, students, attendance, fees, exams, announcements,
// a portal page per student (shared with parents) and Telegram notifications.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Telegram } from './telegram.js';
import { hashPassword, verifyPassword, createSession, checkSession, parseCookies, RateLimiter } from './auth.js';
import { send, readJson, clientIp, serveStatic, cookie, VERSION } from './http.js';

const ALPHA = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const code6 = () => [...crypto.randomBytes(6)].map((b) => ALPHA[b % ALPHA.length]).join('');
const ATT = ['present', 'absent', 'late', 'excused'];

export function defaultData() {
  return {
    version: 1,
    meta: { secret: crypto.randomBytes(32).toString('hex'), createdAt: new Date().toISOString() },
    admin: null,
    settings: {
      teacherName: '',
      subject: '',
      currency: 'جنيه',
      lang: 'ar',
      timezone: '',
      telegramToken: '',
      notify: { absence: true, examResults: true, sessionReminderMinutes: 120, paymentReminderDay: 5 },
      lastPaymentReminder: '',
    },
    groups: [],
    students: [],
    sessions: [],
    payments: [],
    exams: [],
    announcements: [],
    reminded: [], // keys of session reminders already sent
  };
}

// ---------- time helpers ----------
export function localParts(ts, tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short' }).formatToParts(new Date(ts)).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, month: `${p.year}-${p.month}`, minutes: Number(p.hour) * 60 + Number(p.minute), day: Number(p.day), weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday) };
}
const weekdayOf = (date) => new Date(date + 'T12:00:00Z').getUTCDay();
const toMin = (hm) => { const [h, m] = String(hm).split(':').map(Number); return h * 60 + (m || 0); };

export function createApp({ dataDir, setupToken = process.env.SETUP_TOKEN || '' } = {}) {
  fs.mkdirSync(dataDir, { recursive: true });
  const file = path.join(dataDir, 'moallem.json');
  const def = defaultData();
  const loaded = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
  const data = loaded ? { ...def, ...loaded, settings: { ...def.settings, ...loaded.settings, notify: { ...def.settings.notify, ...loaded.settings?.notify } } } : def;
  let timer;
  const flush = () => { clearTimeout(timer); fs.writeFileSync(file + '.tmp', JSON.stringify(data)); fs.renameSync(file + '.tmp', file); };
  const save = () => { clearTimeout(timer); timer = setTimeout(flush, 200); };
  if (!loaded) flush();

  const tz = () => data.settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const loginLimiter = new RateLimiter(10, 15 * 60_000);
  const hashFor = (uid) => (uid === 'owner' ? data.admin?.hash : null);
  const isAuthed = (req) => Boolean(checkSession(data.meta.secret, parseCookies(req.headers.cookie).moallem_session, hashFor));
  const session = (req) => cookie(req, 'moallem_session', createSession(data.meta.secret, data.admin.hash), 30 * 86400);

  // ---------- Telegram ----------
  const telegram = new Telegram(() => data.settings.telegramToken, (role, code, chatId) => {
    const st = data.students.find((s) => s.code === code);
    if (!st) return 'الكود ده مش موجود. اتأكد من الرابط.\nCode not found.';
    if (role === 'student') st.studentChat = chatId;
    else st.parentChat = chatId;
    save();
    return role === 'student'
      ? `✅ أهلاً ${st.name}! هيوصلك هنا مواعيد الحصص والنتايج.`
      : `✅ تمام! هيوصل لحضرتك هنا غياب ${st.name} ونتايجه ومواعيد المصاريف.`;
  });
  const notify = async (chatIds, text) => {
    let sent = 0;
    for (const id of [...new Set(chatIds.filter(Boolean))]) {
      try {
        await telegram.send(id, text);
        sent += 1;
      } catch (err) {
        console.error('[telegram]', err.message);
      }
    }
    return sent;
  };
  const teacher = () => data.settings.teacherName || 'المدرس';

  // ---------- money ----------
  const groupsOf = (st) => data.groups.filter((g) => st.groupIds.includes(g.id));
  const dueFor = (st) => (st.feeOverride != null && st.feeOverride !== '' ? Number(st.feeOverride) : groupsOf(st).reduce((s, g) => s + (Number(g.fee) || 0), 0));
  const paidFor = (st, month) => data.payments.filter((p) => p.studentId === st.id && p.month === month).reduce((s, p) => s + Number(p.amount), 0);
  const payState = (st, month) => {
    const due = dueFor(st);
    const paid = paidFor(st, month);
    return { due, paid, status: due <= 0 ? 'free' : paid >= due ? 'paid' : paid > 0 ? 'partial' : 'unpaid' };
  };

  // ---------- day plan ----------
  function dayPlan(date) {
    const wd = weekdayOf(date);
    const slots = [];
    for (const g of data.groups.filter((x) => x.active !== false)) {
      for (const s of g.schedule || []) {
        if (Number(s.day) !== wd) continue;
        const session = data.sessions.find((x) => x.groupId === g.id && x.date === date && x.time === s.time) || null;
        slots.push({ group: { id: g.id, name: g.name, color: g.color, place: g.place }, time: s.time, duration: Number(s.duration) || 60, session, students: data.students.filter((st) => st.active !== false && st.groupIds.includes(g.id)).map((st) => ({ id: st.id, name: st.name })) });
      }
    }
    // extra sessions added by hand on other days
    for (const ses of data.sessions.filter((x) => x.date === date)) {
      if (slots.some((s) => s.session?.id === ses.id)) continue;
      const g = data.groups.find((x) => x.id === ses.groupId);
      if (g) slots.push({ group: { id: g.id, name: g.name, color: g.color, place: g.place }, time: ses.time, duration: ses.duration || 60, session: ses, extra: true, students: data.students.filter((st) => st.groupIds.includes(g.id)).map((st) => ({ id: st.id, name: st.name })) });
    }
    return slots.sort((a, b) => a.time.localeCompare(b.time));
  }

  // ---------- scheduler ----------
  async function tick(now = Date.now()) {
    if (!telegram.token) return;
    const L = localParts(now, tz());
    const before = Number(data.settings.notify.sessionReminderMinutes) || 0;
    if (before > 0) {
      for (const slot of dayPlan(L.date)) {
        const startsIn = toMin(slot.time) - L.minutes;
        const key = `${slot.group.id}|${L.date}|${slot.time}`;
        if (startsIn <= 0 || startsIn > before || data.reminded.includes(key)) continue;
        data.reminded.push(key);
        const sts = data.students.filter((s) => slot.students.some((x) => x.id === s.id));
        await notify(sts.map((s) => s.studentChat), `⏰ تذكير: حصة ${slot.group.name} النهارده الساعة ${slot.time}${slot.group.place ? ` · ${slot.group.place}` : ''}`);
      }
      if (data.reminded.length > 2000) data.reminded = data.reminded.slice(-500);
    }
    const day = Number(data.settings.notify.paymentReminderDay) || 0;
    if (day > 0 && L.day >= day && data.settings.lastPaymentReminder !== L.month) {
      data.settings.lastPaymentReminder = L.month;
      await remindPayments(L.month);
    }
    save();
  }

  async function remindPayments(month) {
    let n = 0;
    for (const st of data.students.filter((s) => s.active !== false)) {
      const ps = payState(st, month);
      if (ps.status !== 'unpaid' && ps.status !== 'partial') continue;
      const left = ps.due - ps.paid;
      n += await notify([st.parentChat || st.studentChat], `💳 تذكير من ${teacher()}: مصاريف شهر ${month} لـ ${st.name} باقي منها ${left} ${data.settings.currency}. شكراً 🙏`);
    }
    return n;
  }

  const studentView = (st) => ({ ...st, token: undefined, portal: `/p/${st.token}`, linked: { student: Boolean(st.studentChat), parent: Boolean(st.parentChat) }, studentChat: undefined, parentChat: undefined });

  // ---------- routes ----------
  async function route(req, res) {
    const url = new URL(req.url, 'http://localhost');
    const p = url.pathname;
    const method = req.method;
    let m;
    if (p === '/health') return send(res, 200, { ok: true, version: VERSION });

    // ----- student / parent portal (public by secret link) -----
    if (method === 'GET' && /^\/p\/[\w-]+$/.test(p)) return serveStatic(res, 'portal.html');
    if ((m = p.match(/^\/api\/portal\/([\w-]+)$/)) && method === 'GET') {
      const st = data.students.find((s) => s.token === m[1]);
      if (!st) return send(res, 404, { error: 'not_found' });
      const groups = groupsOf(st);
      const since = new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10);
      const attendance = data.sessions.filter((s) => st.groupIds.includes(s.groupId) && s.date >= since && s.attendance?.[st.id]).map((s) => ({ date: s.date, group: groups.find((g) => g.id === s.groupId)?.name || '', status: s.attendance[st.id] })).sort((a, b) => b.date.localeCompare(a.date));
      const joined = String(st.createdAt || '').slice(0, 7);
      const months = [...Array(6)].map((_, i) => { const d = new Date(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - i); return d.toISOString().slice(0, 7); }).filter((mo) => mo >= joined);
      const exams = data.exams.filter((e) => st.groupIds.includes(e.groupId) && e.publishedAt && e.scores?.[st.id] != null).map((e) => {
        const all = Object.values(e.scores).map(Number).sort((a, b) => b - a);
        return { title: e.title, date: e.date, score: Number(e.scores[st.id]), max: Number(e.maxScore), rank: all.indexOf(Number(e.scores[st.id])) + 1, of: all.length };
      }).sort((a, b) => b.date.localeCompare(a.date));
      return send(res, 200, {
        teacher: { name: data.settings.teacherName, subject: data.settings.subject, currency: data.settings.currency },
        student: { name: st.name, code: st.code },
        groups: groups.map((g) => ({ name: g.name, place: g.place, schedule: g.schedule })),
        attendance,
        payments: months.map((mo) => ({ month: mo, ...payState(st, mo) })),
        exams,
        announcements: data.announcements.filter((a) => a.groupId === 'all' || st.groupIds.includes(a.groupId)).slice(-10).reverse().map((a) => ({ text: a.text, at: a.at })),
        bot: telegram.status().username,
        linked: { student: Boolean(st.studentChat), parent: Boolean(st.parentChat) },
      });
    }

    // ----- owner auth -----
    if (p === '/api/session' && method === 'GET') return send(res, 200, { needsSetup: !data.admin, authed: isAuthed(req), setupTokenRequired: Boolean(setupToken), version: VERSION, timezone: tz() });
    if (p === '/api/setup' && method === 'POST') {
      if (data.admin) return send(res, 409, { error: 'Already set up' });
      const body = await readJson(req);
      if (setupToken && body.setupToken !== setupToken) return send(res, 403, { error: 'Wrong setup token' });
      if (String(body.password || '').length < 8) return send(res, 400, { error: 'Password must be at least 8 characters' });
      data.admin = hashPassword(String(body.password));
      Object.assign(data.settings, { teacherName: String(body.teacherName || '').slice(0, 80), subject: String(body.subject || '').slice(0, 80), timezone: String(body.timezone || ''), lang: body.lang === 'en' ? 'en' : 'ar', currency: body.lang === 'en' ? 'USD' : 'جنيه' });
      flush();
      return send(res, 200, { ok: true }, { 'set-cookie': session(req) });
    }
    if (p === '/api/login' && method === 'POST') {
      if (!loginLimiter.allow(clientIp(req))) return send(res, 429, { error: 'Too many attempts. Try again in 15 minutes.' });
      const body = await readJson(req);
      if (!verifyPassword(String(body.password || ''), data.admin)) return send(res, 401, { error: 'Wrong password' });
      return send(res, 200, { ok: true }, { 'set-cookie': session(req) });
    }
    if (p === '/api/logout' && method === 'POST') return send(res, 200, { ok: true }, { 'set-cookie': cookie(req, 'moallem_session', '', 0) });

    if (p.startsWith('/api/')) {
      if (!isAuthed(req)) return send(res, 401, { error: 'Not signed in' });
      if (method !== 'GET' && !(req.headers['content-type'] || '').includes('application/json')) return send(res, 415, { error: 'Send JSON' });
      return api(req, res, url, p, method);
    }

    if (method === 'GET') {
      if (p === '/' || p === '/index.html') return serveStatic(res, 'index.html');
      if (/^\/[\w.-]+\.(js|css|svg|png|ico)$/.test(p)) return serveStatic(res, p.slice(1));
    }
    return send(res, 404, 'Not found');
  }

  async function api(req, res, url, p, method) {
    let m;
    const L = localParts(Date.now(), tz());

    if (p === '/api/overview' && method === 'GET') {
      const month = url.searchParams.get('month') || L.month;
      const active = data.students.filter((s) => s.active !== false);
      let expected = 0, collected = 0, unpaid = 0;
      for (const st of active) {
        const ps = payState(st, month);
        expected += ps.due;
        collected += Math.min(ps.paid, ps.due || ps.paid);
        if (ps.status === 'unpaid' || ps.status === 'partial') unpaid += 1;
      }
      const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
      let present = 0, marked = 0;
      for (const s of data.sessions.filter((x) => x.date >= since)) for (const v of Object.values(s.attendance || {})) { marked += 1; if (v === 'present' || v === 'late') present += 1; }
      return send(res, 200, {
        today: L.date, month, students: active.length, groups: data.groups.filter((g) => g.active !== false).length,
        expected, collected, unpaid, attendanceRate: marked ? Math.round((present / marked) * 100) : null,
        todayPlan: dayPlan(L.date), telegram: telegram.status(), currency: data.settings.currency,
      });
    }

    if (p === '/api/day' && method === 'GET') {
      const date = /^\d{4}-\d{2}-\d{2}$/.test(url.searchParams.get('date') || '') ? url.searchParams.get('date') : L.date;
      return send(res, 200, { date, plan: dayPlan(date) });
    }

    // ----- groups -----
    if (p === '/api/groups' && method === 'GET') return send(res, 200, { groups: data.groups.map((g) => ({ ...g, count: data.students.filter((s) => s.groupIds.includes(g.id) && s.active !== false).length })) });
    if (p === '/api/groups' && method === 'POST') {
      const body = await readJson(req);
      const g = { id: crypto.randomUUID(), name: '', subject: data.settings.subject, grade: '', fee: 0, schedule: [], place: '', color: '#2563EB', active: true, createdAt: new Date().toISOString() };
      applyGroup(g, body);
      if (!g.name) return send(res, 400, { error: 'Group name is required' });
      data.groups.push(g);
      save();
      return send(res, 200, { group: g });
    }
    if ((m = p.match(/^\/api\/groups\/([\w-]+)$/))) {
      const g = data.groups.find((x) => x.id === m[1]);
      if (!g) return send(res, 404, { error: 'Group not found' });
      if (method === 'PUT') { applyGroup(g, await readJson(req)); save(); return send(res, 200, { group: g }); }
      if (method === 'DELETE') {
        data.groups = data.groups.filter((x) => x.id !== g.id);
        for (const s of data.students) s.groupIds = s.groupIds.filter((id) => id !== g.id);
        save();
        return send(res, 200, { ok: true });
      }
    }

    // ----- students -----
    if (p === '/api/students' && method === 'GET') {
      const month = url.searchParams.get('month') || L.month;
      return send(res, 200, { month, students: data.students.map((s) => ({ ...studentView(s), pay: payState(s, month) })) });
    }
    if (p === '/api/students' && method === 'POST') {
      const body = await readJson(req);
      const st = { id: crypto.randomUUID(), code: uniqueCode(), token: crypto.randomBytes(18).toString('base64url'), name: '', phone: '', parentName: '', parentPhone: '', groupIds: [], feeOverride: null, notes: '', active: true, studentChat: '', parentChat: '', createdAt: new Date().toISOString() };
      applyStudent(st, body);
      if (!st.name) return send(res, 400, { error: 'Student name is required' });
      data.students.push(st);
      save();
      return send(res, 200, { student: studentView(st) });
    }
    if ((m = p.match(/^\/api\/students\/([\w-]+)$/))) {
      const st = data.students.find((x) => x.id === m[1]);
      if (!st) return send(res, 404, { error: 'Student not found' });
      if (method === 'PUT') { applyStudent(st, await readJson(req)); save(); return send(res, 200, { student: studentView(st) }); }
      if (method === 'DELETE') { data.students = data.students.filter((x) => x.id !== st.id); save(); return send(res, 200, { ok: true }); }
    }

    // ----- attendance -----
    if (p === '/api/attendance' && method === 'PUT') {
      const body = await readJson(req);
      const g = data.groups.find((x) => x.id === body.groupId);
      if (!g || !/^\d{4}-\d{2}-\d{2}$/.test(body.date || '') || !/^\d{1,2}:\d{2}$/.test(body.time || '')) return send(res, 400, { error: 'group, date and time are required' });
      let ses = data.sessions.find((x) => x.groupId === g.id && x.date === body.date && x.time === body.time);
      if (!ses) {
        ses = { id: crypto.randomUUID(), groupId: g.id, date: body.date, time: body.time, attendance: {}, notes: '' };
        data.sessions.push(ses);
      }
      const newlyAbsent = [];
      for (const [sid, status] of Object.entries(body.attendance || {})) {
        if (!ATT.includes(status) || !data.students.some((s) => s.id === sid)) continue;
        if (status === 'absent' && ses.attendance[sid] !== 'absent') newlyAbsent.push(sid);
        ses.attendance[sid] = status;
      }
      if (typeof body.notes === 'string') ses.notes = body.notes.slice(0, 1000);
      save();
      let alerted = 0;
      if (data.settings.notify.absence && telegram.token && body.date === L.date) {
        for (const sid of newlyAbsent) {
          const st = data.students.find((s) => s.id === sid);
          alerted += await notify([st.parentChat], `📌 ${st.name} غاب عن حصة ${g.name} النهارده (${body.date}، الساعة ${body.time}). — ${teacher()}`);
        }
      }
      return send(res, 200, { session: ses, alerted });
    }

    // ----- payments -----
    if (p === '/api/payments' && method === 'GET') {
      const month = url.searchParams.get('month') || L.month;
      return send(res, 200, { month, payments: data.payments.filter((x) => x.month === month), students: data.students.filter((s) => s.active !== false).map((s) => ({ id: s.id, name: s.name, groups: groupsOf(s).map((g) => g.name), ...payState(s, month), linked: Boolean(s.parentChat || s.studentChat) })) });
    }
    if (p === '/api/payments' && method === 'POST') {
      const body = await readJson(req);
      const st = data.students.find((s) => s.id === body.studentId);
      const amount = Number(body.amount);
      if (!st || !(amount > 0) || !/^\d{4}-\d{2}$/.test(body.month || '')) return send(res, 400, { error: 'student, month and amount are required' });
      const pay = { id: crypto.randomUUID(), studentId: st.id, month: body.month, amount, method: String(body.method || 'cash').slice(0, 30), note: String(body.note || '').slice(0, 200), paidAt: new Date().toISOString() };
      data.payments.push(pay);
      save();
      return send(res, 200, { payment: pay, state: payState(st, body.month) });
    }
    if ((m = p.match(/^\/api\/payments\/([\w-]+)$/)) && method === 'DELETE') {
      data.payments = data.payments.filter((x) => x.id !== m[1]);
      save();
      return send(res, 200, { ok: true });
    }
    if (p === '/api/payments/remind' && method === 'POST') {
      const body = await readJson(req);
      return send(res, 200, { sent: await remindPayments(/^\d{4}-\d{2}$/.test(body.month || '') ? body.month : L.month) });
    }

    // ----- exams -----
    if (p === '/api/exams' && method === 'GET') return send(res, 200, { exams: [...data.exams].sort((a, b) => b.date.localeCompare(a.date)) });
    if (p === '/api/exams' && method === 'POST') {
      const body = await readJson(req);
      if (!data.groups.some((g) => g.id === body.groupId) || !String(body.title || '').trim()) return send(res, 400, { error: 'group and title are required' });
      const e = { id: crypto.randomUUID(), groupId: body.groupId, title: String(body.title).slice(0, 120), date: /^\d{4}-\d{2}-\d{2}$/.test(body.date || '') ? body.date : L.date, maxScore: Math.max(1, Number(body.maxScore) || 20), scores: {}, publishedAt: null };
      data.exams.push(e);
      save();
      return send(res, 200, { exam: e });
    }
    if ((m = p.match(/^\/api\/exams\/([\w-]+)$/))) {
      const e = data.exams.find((x) => x.id === m[1]);
      if (!e) return send(res, 404, { error: 'Exam not found' });
      if (method === 'PUT') {
        const body = await readJson(req);
        for (const [sid, v] of Object.entries(body.scores || {})) {
          if (!data.students.some((st) => st.id === sid && st.groupIds.includes(e.groupId))) continue;
          if (v === '' || v == null) delete e.scores[sid];
          else if (Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= e.maxScore) e.scores[sid] = Number(v);
        }
        if (typeof body.title === 'string' && body.title.trim()) e.title = body.title.slice(0, 120);
        save();
        return send(res, 200, { exam: e });
      }
      if (method === 'DELETE') { data.exams = data.exams.filter((x) => x.id !== e.id); save(); return send(res, 200, { ok: true }); }
    }
    if ((m = p.match(/^\/api\/exams\/([\w-]+)\/publish$/)) && method === 'POST') {
      const e = data.exams.find((x) => x.id === m[1]);
      if (!e) return send(res, 404, { error: 'Exam not found' });
      e.publishedAt = new Date().toISOString();
      save();
      let sent = 0;
      if (data.settings.notify.examResults && telegram.token) {
        const sorted = Object.values(e.scores).map(Number).sort((a, b) => b - a);
        for (const [sid, score] of Object.entries(e.scores)) {
          const st = data.students.find((s) => s.id === sid);
          if (!st) continue;
          sent += await notify([st.studentChat, st.parentChat], `📝 نتيجة ${e.title}: ${st.name} خد ${score} من ${e.maxScore} (الترتيب ${sorted.indexOf(Number(score)) + 1} من ${sorted.length}). — ${teacher()}`);
        }
      }
      return send(res, 200, { exam: e, sent });
    }

    // ----- announcements -----
    if (p === '/api/announcements' && method === 'GET') return send(res, 200, { announcements: [...data.announcements].reverse().slice(0, 100) });
    if (p === '/api/announcements' && method === 'POST') {
      const body = await readJson(req);
      const text = String(body.text || '').trim().slice(0, 2000);
      const groupId = body.groupId === 'all' ? 'all' : data.groups.find((g) => g.id === body.groupId)?.id;
      if (!text || !groupId) return send(res, 400, { error: 'text and group are required' });
      const a = { id: crypto.randomUUID(), groupId, text, at: new Date().toISOString(), sent: 0 };
      const sts = data.students.filter((s) => s.active !== false && (groupId === 'all' || s.groupIds.includes(groupId)));
      if (telegram.token) a.sent = await notify(sts.flatMap((s) => [s.studentChat, body.parents ? s.parentChat : null]), `📢 ${teacher()}:\n${text}`);
      data.announcements.push(a);
      save();
      return send(res, 200, { announcement: a });
    }

    // ----- settings -----
    if (p === '/api/settings' && method === 'GET') {
      const s = structuredClone(data.settings);
      if (s.telegramToken) s.telegramToken = '••••••' + s.telegramToken.slice(-4);
      return send(res, 200, { settings: s, telegram: telegram.status(), timezone: tz() });
    }
    if (p === '/api/settings' && method === 'PUT') {
      const b = (await readJson(req)).settings || {};
      const s = data.settings;
      for (const k of ['teacherName', 'subject', 'currency', 'timezone']) if (typeof b[k] === 'string') s[k] = b[k].slice(0, 80);
      if (typeof b.telegramToken === 'string' && !b.telegramToken.startsWith('••')) s.telegramToken = b.telegramToken.trim();
      if (b.notify) {
        if (typeof b.notify.absence === 'boolean') s.notify.absence = b.notify.absence;
        if (typeof b.notify.examResults === 'boolean') s.notify.examResults = b.notify.examResults;
        if (b.notify.sessionReminderMinutes != null) s.notify.sessionReminderMinutes = Math.min(1440, Math.max(0, Number(b.notify.sessionReminderMinutes) || 0));
        if (b.notify.paymentReminderDay != null) s.notify.paymentReminderDay = Math.min(28, Math.max(0, Number(b.notify.paymentReminderDay) || 0));
      }
      save();
      await telegram.sync();
      return send(res, 200, { ok: true, telegram: telegram.status() });
    }
    if (p === '/api/password' && method === 'POST') {
      const body = await readJson(req);
      if (!verifyPassword(String(body.current || ''), data.admin)) return send(res, 401, { error: 'Current password is wrong' });
      if (String(body.next || '').length < 8) return send(res, 400, { error: 'New password must be at least 8 characters' });
      data.admin = hashPassword(String(body.next));
      flush();
      return send(res, 200, { ok: true }, { 'set-cookie': session(req) });
    }
    return send(res, 404, { error: 'Not found' });
  }

  function uniqueCode() {
    let c;
    do c = code6(); while (data.students.some((s) => s.code === c));
    return c;
  }
  function applyGroup(g, b) {
    for (const k of ['name', 'subject', 'grade', 'place']) if (typeof b[k] === 'string') g[k] = b[k].trim().slice(0, 100);
    if (b.fee != null) g.fee = Math.max(0, Number(b.fee) || 0);
    if (/^#[0-9a-f]{6}$/i.test(b.color || '')) g.color = b.color;
    if (typeof b.active === 'boolean') g.active = b.active;
    if (Array.isArray(b.schedule)) g.schedule = b.schedule.filter((s) => Number(s.day) >= 0 && Number(s.day) <= 6 && /^\d{1,2}:\d{2}$/.test(s.time)).map((s) => ({ day: Number(s.day), time: s.time.padStart(5, '0'), duration: Math.min(600, Math.max(15, Number(s.duration) || 60)) })).slice(0, 14);
  }
  function applyStudent(st, b) {
    for (const k of ['name', 'phone', 'parentName', 'parentPhone', 'notes']) if (typeof b[k] === 'string') st[k] = b[k].trim().slice(0, k === 'notes' ? 1000 : 100);
    if (Array.isArray(b.groupIds)) st.groupIds = b.groupIds.filter((id) => data.groups.some((g) => g.id === id));
    if (b.feeOverride === null || b.feeOverride === '') st.feeOverride = null;
    else if (b.feeOverride != null) st.feeOverride = Math.max(0, Number(b.feeOverride) || 0);
    if (typeof b.active === 'boolean') st.active = b.active;
  }

  const server = http.createServer((req, res) => {
    route(req, res).catch((err) => {
      const status = err.status || 500;
      if (status === 500) console.error('[http]', err);
      if (!res.headersSent) send(res, status, { error: status === 500 ? 'Internal error' : err.message });
    });
  });

  let tickTimer;
  return {
    server, data, telegram, tick, dayPlan,
    async start(port) {
      await telegram.sync();
      tickTimer = setInterval(() => tick().catch((e) => console.error('[tick]', e.message)), 60_000);
      tickTimer.unref?.();
      await new Promise((r) => server.listen(port, r));
      return server.address().port;
    },
    async stop() {
      telegram.stop();
      clearInterval(tickTimer);
      flush();
      await new Promise((r) => server.close(r));
    },
  };
}
