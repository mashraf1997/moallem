/* Moallem dashboard — plain JavaScript, no build step. */
(function () {
  'use strict';
  const STR = {
    ar: {
      today: 'النهارده', students: 'الطلبة', groups: 'المجموعات', payments: 'المصاريف', exams: 'الامتحانات', news: 'الإعلانات', settings: 'الإعدادات', logout: 'خروج', lang: 'English',
      setupTitle: 'أهلاً بيك في مُعلّم', setupLead: 'نظّم مجموعاتك وطلبتك والحضور والمصاريف في مكان واحد.', teacher: 'اسمك', subject: 'المادة', password: 'كلمة السر', pwHint: '8 حروف على الأقل', start: 'ابدأ', loginTitle: 'تسجيل الدخول', login: 'دخول',
      studentsN: 'طالب', groupsN: 'مجموعة', collected: 'اتحصّل الشهر ده', of: 'من', unpaidN: 'لسه مادفعوش', attRate: 'نسبة الحضور (30 يوم)', noSessions: 'مفيش حصص النهارده.', save: 'حفظ', saved: 'اتحفظ ✓', alerted: 'اتبعت تنبيه غياب لـ', parents: 'ولي أمر',
      present: 'حاضر', absent: 'غائب', late: 'متأخر', excused: 'بعذر', allPresent: 'الكل حاضر', notes: 'ملاحظات الحصة', date: 'اليوم',
      addStudent: '+ طالب', addGroup: '+ مجموعة', name: 'الاسم', phone: 'الموبايل', parentName: 'ولي الأمر', parentPhone: 'موبايل ولي الأمر', feeOverride: 'مصاريف خاصة (اختياري)', feeOverrideHint: 'سيبها فاضية عشان تتحسب من المجموعات', inGroups: 'المجموعات', active: 'نشط', portal: 'صفحة الطالب', copy: 'نسخ', copied: 'اتنسخ ✓', linked: 'تليجرام', edit: 'تعديل', del: 'حذف', close: 'إغلاق', search: 'دوّر…', none: 'لسه مفيش.',
      gName: 'اسم المجموعة', grade: 'الصف', fee: 'المصاريف الشهرية', place: 'المكان أو اللينك', schedule: 'المواعيد', addTime: '+ ميعاد', duration: 'دقيقة', color: 'اللون',
      month: 'الشهر', due: 'المطلوب', paid: 'المدفوع', status: 'الحالة', pay: 'سجّل دفع', amount: 'المبلغ', remind: 'ابعت تذكير للي مادفعوش', reminded: 'اتبعت تذكير لـ', st_paid: 'مدفوع', st_partial: 'جزء', st_unpaid: 'لسه', st_free: 'مجاني', method: 'طريقة الدفع', cash: 'كاش', wallet: 'محفظة', instapay: 'إنستاباي', bank: 'تحويل',
      newExam: '+ امتحان', title: 'العنوان', maxScore: 'الدرجة النهائية', scores: 'الدرجات', publish: 'انشر النتيجة', published: 'اتنشرت', sent: 'اتبعتت لـ', avg: 'المتوسط',
      annText: 'نص الإعلان', toGroup: 'لمين', all: 'كل الطلبة', alsoParents: 'ابعته لأولياء الأمور كمان', sendAnn: 'ابعت', noBot: 'وصّل بوت تليجرام من الإعدادات عشان الرسائل توصل.',
      tgTitle: 'تليجرام', tgLead: 'الطلبة وأولياء الأمور بيربطوا من صفحة الطالب بضغطة.', tgToken: 'توكن البوت من @BotFather', autoTitle: 'التنبيهات', absenceOn: 'ابعت لولي الأمر لما الطالب يغيب', examOn: 'ابعت النتايج لما تنشرها', remindBefore: 'فكّر الطلبة قبل الحصة بـ (دقيقة، 0 = لأ)', payDay: 'فكّر بالمصاريف يوم (من الشهر، 0 = لأ)', currency: 'العملة', tz: 'المنطقة الزمنية', connected: 'متصل', notConnected: 'مش متصل',
      pwTitle: 'تغيير كلمة السر', current: 'الحالية', next: 'الجديدة', change: 'تغيير',
      days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    },
    en: {
      today: 'Today', students: 'Students', groups: 'Groups', payments: 'Fees', exams: 'Exams', news: 'Announcements', settings: 'Settings', logout: 'Sign out', lang: 'العربية',
      setupTitle: 'Welcome to Moallem', setupLead: 'Groups, students, attendance and fees in one place.', teacher: 'Your name', subject: 'Subject', password: 'Password', pwHint: 'At least 8 characters', start: 'Get started', loginTitle: 'Sign in', login: 'Sign in',
      studentsN: 'students', groupsN: 'groups', collected: 'Collected this month', of: 'of', unpaidN: 'Not paid yet', attRate: 'Attendance (30 days)', noSessions: 'No classes today.', save: 'Save', saved: 'Saved ✓', alerted: 'Absence alerts sent to', parents: 'parents',
      present: 'Present', absent: 'Absent', late: 'Late', excused: 'Excused', allPresent: 'All present', notes: 'Class notes', date: 'Day',
      addStudent: '+ Student', addGroup: '+ Group', name: 'Name', phone: 'Phone', parentName: 'Parent', parentPhone: 'Parent phone', feeOverride: 'Custom monthly fee (optional)', feeOverrideHint: 'Leave empty to use the group fees', inGroups: 'Groups', active: 'Active', portal: 'Student page', copy: 'Copy', copied: 'Copied ✓', linked: 'Telegram', edit: 'Edit', del: 'Delete', close: 'Close', search: 'Search…', none: 'Nothing yet.',
      gName: 'Group name', grade: 'Grade', fee: 'Monthly fee', place: 'Place or link', schedule: 'Schedule', addTime: '+ Time', duration: 'min', color: 'Color',
      month: 'Month', due: 'Due', paid: 'Paid', status: 'Status', pay: 'Record payment', amount: 'Amount', remind: 'Remind those who have not paid', reminded: 'Reminders sent to', st_paid: 'Paid', st_partial: 'Partial', st_unpaid: 'Unpaid', st_free: 'Free', method: 'Method', cash: 'Cash', wallet: 'Wallet', instapay: 'InstaPay', bank: 'Transfer',
      newExam: '+ Exam', title: 'Title', maxScore: 'Full mark', scores: 'Scores', publish: 'Publish results', published: 'Published', sent: 'Sent to', avg: 'Average',
      annText: 'Announcement', toGroup: 'To', all: 'All students', alsoParents: 'Also send to parents', sendAnn: 'Send', noBot: 'Connect a Telegram bot in Settings so messages reach people.',
      tgTitle: 'Telegram', tgLead: 'Students and parents connect from the student page with one tap.', tgToken: 'Bot token from @BotFather', autoTitle: 'Automatic messages', absenceOn: 'Tell the parent when a student is absent', examOn: 'Send results when you publish them', remindBefore: 'Remind students before class (minutes, 0 = off)', payDay: 'Fee reminder on day (of the month, 0 = off)', currency: 'Currency', tz: 'Time zone', connected: 'Connected', notConnected: 'Not connected',
      pwTitle: 'Change password', current: 'Current', next: 'New', change: 'Change',
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
  };
  const get = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const put = (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };
  let lang = get('moallem_lang') || 'ar';
  const t = (k) => STR[lang][k] ?? k;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const app = $('#app');
  const S = { session: null, groups: [], day: null, month: null, q: '' };
  async function api(p, o = {}) {
    const res = await fetch(p, { method: o.method || 'GET', headers: o.body !== undefined ? { 'content-type': 'application/json' } : {}, body: o.body !== undefined ? JSON.stringify(o.body) : undefined });
    const d = await res.json().catch(() => ({}));
    if (res.status === 401 && p !== '/api/login' && p !== '/api/password') { boot(); throw new Error(d.error); }
    if (!res.ok) throw new Error(d.error || `HTTP ${res.status}`);
    return d;
  }
  const toast = (m) => { const el = $('#toast'); el.textContent = m; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2600); };
  const groupName = (id) => S.groups.find((g) => g.id === id)?.name || '';
  const thisMonth = () => new Date().toISOString().slice(0, 7);
  function dialog(html) {
    const d = document.createElement('dialog');
    d.className = 'ed';
    d.innerHTML = html;
    document.body.appendChild(d);
    d.showModal();
    d.addEventListener('close', () => d.remove());
    return d;
  }

  async function boot() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    S.session = await api('/api/session').catch(() => ({}));
    if (S.session.needsSetup) return auth(true);
    if (!S.session.authed) return auth(false);
    S.groups = (await api('/api/groups')).groups;
    shell(); route();
  }
  function auth(setup) {
    app.innerHTML = `<div class="auth"><form class="card" id="f"><div class="brand"><img src="favicon.svg" alt="">Moallem <span class="muted small">مُعلّم</span></div>
      <h1>${setup ? t('setupTitle') : t('loginTitle')}</h1>${setup ? `<p class="muted">${t('setupLead')}</p><div class="grid2"><label class="field" for="tn">${t('teacher')}<input type="text" id="tn"></label><label class="field" for="sb">${t('subject')}<input type="text" id="sb"></label></div>` : ''}
      <label class="field" for="pw">${t('password')} ${setup ? `<span class="hint">${t('pwHint')}</span>` : ''}<input type="password" id="pw"></label>
      ${setup && S.session.setupTokenRequired ? `<label class="field" for="st">Setup token<input type="password" id="st" class="ltr"></label>` : ''}
      <div class="err" id="err"></div><div class="row"><button class="btn primary" type="submit">${setup ? t('start') : t('login')}</button><span class="spacer"></span><button class="btn sm" type="button" id="lb">${t('lang')}</button></div></form></div>`;
    $('#lb').onclick = () => { lang = lang === 'ar' ? 'en' : 'ar'; put('moallem_lang', lang); boot(); };
    $('#f').onsubmit = async (e) => {
      e.preventDefault();
      try {
        if (setup) await api('/api/setup', { method: 'POST', body: { teacherName: $('#tn').value, subject: $('#sb').value, password: $('#pw').value, lang, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, setupToken: $('#st')?.value } });
        else await api('/api/login', { method: 'POST', body: { password: $('#pw').value } });
        location.hash = '#today'; boot();
      } catch (err) { $('#err').textContent = err.message; }
    };
  }
  const PAGES = ['today', 'students', 'groups', 'payments', 'exams', 'news', 'settings'];
  function shell() {
    const nav = PAGES.map((p) => `<a class="nav" href="#${p}" data-page="${p}">${t(p)}</a>`).join('');
    app.innerHTML = `<div class="shell"><nav class="rail"><div class="brand"><img src="favicon.svg" alt="">Moallem</div>${nav}<div class="rail-foot"><button class="nav" id="lb" type="button">${t('lang')}</button><button class="nav" id="lo" type="button">${t('logout')}</button></div></nav><nav class="mobile-nav">${nav}</nav><main class="main" id="main"></main></div>`;
    $('#lb').onclick = () => { lang = lang === 'ar' ? 'en' : 'ar'; put('moallem_lang', lang); boot(); };
    $('#lo').onclick = async () => { await api('/api/logout', { method: 'POST', body: {} }); boot(); };
  }
  const page = () => (PAGES.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'today');
  async function route() {
    $$('.nav[data-page]').forEach((a) => a.setAttribute('aria-current', a.dataset.page === page() ? 'page' : 'false'));
    S.groups = (await api('/api/groups')).groups;
    ({ today: pToday, students: pStudents, groups: pGroups, payments: pPayments, exams: pExams, news: pNews, settings: pSettings }[page()])($('#main'));
  }
  window.addEventListener('hashchange', () => S.session?.authed && route());

  // ---------------- today: attendance ----------------
  async function pToday(main) {
    const o = await api('/api/overview');
    const date = S.day || o.today;
    const plan = date === o.today ? o.todayPlan : (await api('/api/day?date=' + date)).plan;
    main.innerHTML = `<div class="page">
      <div class="page-head"><div><h1>${esc(new Date(date + 'T12:00:00Z').toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' }))}</h1></div><input type="date" id="day" value="${date}" aria-label="${t('date')}" style="width:auto"></div>
      <div class="grid4">
        <a class="card stat" href="#students" style="text-decoration:none;color:inherit"><b>${o.students}</b><span>${t('studentsN')} · ${o.groups} ${t('groupsN')}</span></a>
        <a class="card stat" href="#payments" style="text-decoration:none;color:inherit"><b>${o.collected}</b><span>${t('collected')} ${t('of')} ${o.expected} ${esc(o.currency)}</span></a>
        <a class="card stat ${o.unpaid ? 'alert' : ''}" href="#payments" style="text-decoration:none;color:inherit"><b>${o.unpaid}</b><span>${t('unpaidN')}</span></a>
        <div class="card stat"><b>${o.attendanceRate == null ? '—' : o.attendanceRate + '%'}</b><span>${t('attRate')}</span></div>
      </div>
      ${o.telegram.connected ? '' : `<p class="muted small">${t('noBot')}</p>`}
      ${plan.length ? plan.map((s, i) => `<form class="card slot" data-i="${i}" style="border-inline-start-color:${esc(s.group.color)}">
        <div class="card-head"><div><h2>${esc(s.group.name)}</h2><span class="muted small">${esc(s.time)} · ${s.duration} ${t('duration')}${s.group.place ? ' · ' + esc(s.group.place) : ''}</span></div><button class="btn sm" type="button" data-all>${t('allPresent')}</button></div>
        <div class="att">${s.students.map((st) => `<div class="att-row" data-sid="${st.id}"><span class="nm">${esc(st.name)}</span><span class="seg">${['present', 'absent', 'late', 'excused'].map((k) => `<button type="button" class="${k}" data-k="${k}" aria-pressed="${s.session?.attendance?.[st.id] === k}">${t(k)}</button>`).join('')}</span></div>`).join('') || `<p class="muted">${t('none')}</p>`}</div>
        <input type="text" name="notes" placeholder="${t('notes')}" value="${esc(s.session?.notes || '')}" aria-label="${t('notes')}">
        <div class="row"><button class="btn primary" type="submit">${t('save')}</button></div></form>`).join('') : `<div class="card empty">${t('noSessions')}</div>`}
    </div>`;
    $('#day').onchange = () => { S.day = $('#day').value; pToday(main); };
    $$('form.slot', main).forEach((f) => {
      const s = plan[Number(f.dataset.i)];
      $$('.seg button', f).forEach((b) => (b.onclick = () => { $$('button', b.parentElement).forEach((x) => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true'); }));
      $('[data-all]', f).onclick = () => $$('.att-row', f).forEach((r) => { $$('button', r).forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.k === 'present'))); });
      f.onsubmit = async (e) => {
        e.preventDefault();
        const attendance = Object.fromEntries($$('.att-row', f).map((r) => [r.dataset.sid, $('button[aria-pressed="true"]', r)?.dataset.k]).filter(([, v]) => v));
        try {
          const r = await api('/api/attendance', { method: 'PUT', body: { groupId: s.group.id, date, time: s.time, attendance, notes: f.notes.value } });
          toast(r.alerted ? `${t('saved')} · ${t('alerted')} ${r.alerted} ${t('parents')}` : t('saved'));
        } catch (err) { toast(err.message); }
      };
    });
  }

  // ---------------- students ----------------
  async function pStudents(main) {
    const { students } = await api('/api/students');
    const q = S.q.toLowerCase();
    const list = students.filter((s) => !q || s.name.toLowerCase().includes(q) || s.phone.includes(q) || s.parentPhone.includes(q));
    main.innerHTML = `<div class="page"><div class="page-head"><h1>${t('students')} <span class="muted small">(${students.length})</span></h1><div class="row"><input type="text" id="q" value="${esc(S.q)}" placeholder="${t('search')}" style="width:200px" aria-label="${t('search')}"><button class="btn primary" id="add" type="button">${t('addStudent')}</button></div></div>
      ${list.length ? `<div class="table-wrap"><table><thead><tr><th>${t('name')}</th><th>${t('inGroups')}</th><th>${t('parentName')}</th><th>${t('status')}</th><th>${t('linked')}</th><th></th></tr></thead><tbody>
      ${list.map((s) => `<tr${s.active ? '' : ' style="opacity:.55"'}><td><b>${esc(s.name)}</b><br><span class="mono small muted" dir="ltr">${esc(s.phone)}</span></td><td class="small">${s.groupIds.map(groupName).map(esc).join('، ')}</td>
        <td class="small">${esc(s.parentName)}<br><span class="mono muted" dir="ltr">${esc(s.parentPhone)}</span></td><td><span class="pill ${{ paid: 'good', partial: 'warn', unpaid: 'bad', free: 'off' }[s.pay.status]}">${t('st_' + s.pay.status)}</span></td>
        <td class="small">${s.linked.student ? '🎓' : ''}${s.linked.parent ? '👪' : ''}</td>
        <td><div class="row" style="gap:6px"><button class="btn sm" data-portal="${esc(s.portal)}">${t('portal')}</button><button class="btn sm" data-edit="${s.id}">${t('edit')}</button></div></td></tr>`).join('')}</tbody></table></div>` : `<div class="card empty">${t('none')}</div>`}</div>`;
    let tm;
    $('#q').oninput = () => { clearTimeout(tm); tm = setTimeout(() => { S.q = $('#q').value; pStudents(main).then(() => { const i = $('#q'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }); }, 250); };
    $('#add').onclick = () => studentDialog(null, () => pStudents(main));
    $$('[data-edit]', main).forEach((b) => (b.onclick = () => studentDialog(students.find((s) => s.id === b.dataset.edit), () => pStudents(main))));
    $$('[data-portal]', main).forEach((b) => (b.onclick = async () => { const url = location.origin + b.dataset.portal; try { await navigator.clipboard.writeText(url); toast(t('copied')); } catch { toast(url); } }));
  }
  function studentDialog(s, done) {
    const v = s || { name: '', phone: '', parentName: '', parentPhone: '', groupIds: [], feeOverride: null, notes: '', active: true };
    const d = dialog(`<form class="stack" id="sf"><h2>${s ? esc(s.name) : t('addStudent')}</h2>
      <div class="grid2"><label class="field" for="s-n">${t('name')}<input type="text" id="s-n" value="${esc(v.name)}" required></label><label class="field" for="s-p">${t('phone')}<input type="tel" id="s-p" class="ltr" value="${esc(v.phone)}"></label></div>
      <div class="grid2"><label class="field" for="s-pn">${t('parentName')}<input type="text" id="s-pn" value="${esc(v.parentName)}"></label><label class="field" for="s-pp">${t('parentPhone')}<input type="tel" id="s-pp" class="ltr" value="${esc(v.parentPhone)}"></label></div>
      <div class="field">${t('inGroups')}<div class="checks">${S.groups.map((g) => `<label><input type="checkbox" value="${g.id}" ${v.groupIds.includes(g.id) ? 'checked' : ''}>${esc(g.name)}</label>`).join('') || `<span class="muted">${t('none')}</span>`}</div></div>
      <label class="field" for="s-f">${t('feeOverride')} <span class="hint">${t('feeOverrideHint')}</span><input type="number" id="s-f" min="0" value="${v.feeOverride ?? ''}"></label>
      <label class="field" for="s-no">${t('notes')}<input type="text" id="s-no" value="${esc(v.notes)}"></label>
      <label class="switch"><input type="checkbox" id="s-a" ${v.active ? 'checked' : ''}>${t('active')}</label>
      <div class="err" id="s-e"></div>
      <div class="row"><button class="btn primary" type="submit">${t('save')}</button><button class="btn" type="button" id="s-x">${t('close')}</button><span class="spacer"></span>${s ? `<button class="btn danger" type="button" id="s-d">${t('del')}</button>` : ''}</div></form>`);
    $('#s-x', d).onclick = () => d.close();
    if ($('#s-d', d)) $('#s-d', d).onclick = async () => { await api('/api/students/' + s.id, { method: 'DELETE', body: {} }); d.close(); done(); };
    $('#sf', d).onsubmit = async (e) => {
      e.preventDefault();
      const body = { name: $('#s-n', d).value, phone: $('#s-p', d).value, parentName: $('#s-pn', d).value, parentPhone: $('#s-pp', d).value, groupIds: $$('.checks input:checked', d).map((i) => i.value), feeOverride: $('#s-f', d).value === '' ? null : Number($('#s-f', d).value), notes: $('#s-no', d).value, active: $('#s-a', d).checked };
      try { await api(s ? '/api/students/' + s.id : '/api/students', { method: s ? 'PUT' : 'POST', body }); d.close(); done(); } catch (err) { $('#s-e', d).textContent = err.message; }
    };
  }

  // ---------------- groups ----------------
  function pGroups(main) {
    main.innerHTML = `<div class="page"><div class="page-head"><h1>${t('groups')}</h1><button class="btn primary" id="add" type="button">${t('addGroup')}</button></div>
      <div class="grid2">${S.groups.map((g) => `<section class="card slot" style="border-inline-start-color:${esc(g.color)}"><div class="card-head"><h2>${esc(g.name)}</h2><button class="btn sm" data-edit="${g.id}" type="button">${t('edit')}</button></div>
        <span class="muted small">${esc([g.grade, g.place].filter(Boolean).join(' · '))}</span>
        <div class="small">${g.schedule.map((s) => `${t('days')[s.day]} ${s.time}`).join(' · ')}</div>
        <div class="row small"><span>${g.count} ${t('studentsN')}</span><span class="spacer"></span><b>${g.fee}</b></div></section>`).join('') || `<div class="card empty">${t('none')}</div>`}</div></div>`;
    $('#add').onclick = () => groupDialog(null, () => route());
    $$('[data-edit]', main).forEach((b) => (b.onclick = () => groupDialog(S.groups.find((g) => g.id === b.dataset.edit), () => route())));
  }
  function groupDialog(g, done) {
    const v = g || { name: '', grade: '', fee: 0, place: '', color: '#2563EB', schedule: [{ day: 6, time: '17:00', duration: 90 }] };
    const row = (s) => `<div class="sched-row"><select>${t('days').map((d, i) => `<option value="${i}" ${Number(s.day) === i ? 'selected' : ''}>${d}</option>`).join('')}</select><input type="time" value="${esc(s.time)}"><input type="number" min="15" step="15" value="${s.duration}" style="width:80px"><span class="small muted">${t('duration')}</span><button class="btn sm danger" type="button" data-rm>✕</button></div>`;
    const d = dialog(`<form class="stack" id="gf"><h2>${g ? esc(g.name) : t('addGroup')}</h2>
      <div class="grid2"><label class="field" for="g-n">${t('gName')}<input type="text" id="g-n" value="${esc(v.name)}" required></label><label class="field" for="g-g">${t('grade')}<input type="text" id="g-g" value="${esc(v.grade)}"></label></div>
      <div class="grid2"><label class="field" for="g-f">${t('fee')}<input type="number" id="g-f" min="0" value="${v.fee}"></label><label class="field" for="g-p">${t('place')}<input type="text" id="g-p" value="${esc(v.place)}"></label></div>
      <div class="field">${t('schedule')}<div class="stack" id="g-s" style="gap:6px">${v.schedule.map(row).join('')}</div><button class="btn sm" type="button" id="g-add" style="justify-self:start">${t('addTime')}</button></div>
      <label class="field" for="g-c" style="max-width:140px">${t('color')}<input type="color" id="g-c" value="${esc(v.color)}" style="height:38px"></label>
      <div class="err" id="g-e"></div>
      <div class="row"><button class="btn primary" type="submit">${t('save')}</button><button class="btn" type="button" id="g-x">${t('close')}</button><span class="spacer"></span>${g ? `<button class="btn danger" type="button" id="g-d">${t('del')}</button>` : ''}</div></form>`);
    const bindRm = () => $$('[data-rm]', d).forEach((b) => (b.onclick = () => b.parentElement.remove()));
    bindRm();
    $('#g-add', d).onclick = () => { $('#g-s', d).insertAdjacentHTML('beforeend', row({ day: 0, time: '17:00', duration: 90 })); bindRm(); };
    $('#g-x', d).onclick = () => d.close();
    if ($('#g-d', d)) $('#g-d', d).onclick = async () => { await api('/api/groups/' + g.id, { method: 'DELETE', body: {} }); d.close(); done(); };
    $('#gf', d).onsubmit = async (e) => {
      e.preventDefault();
      const schedule = $$('.sched-row', d).map((r) => ({ day: Number($('select', r).value), time: $('input[type=time]', r).value, duration: Number($('input[type=number]', r).value) }));
      const body = { name: $('#g-n', d).value, grade: $('#g-g', d).value, fee: Number($('#g-f', d).value), place: $('#g-p', d).value, color: $('#g-c', d).value, schedule };
      try { await api(g ? '/api/groups/' + g.id : '/api/groups', { method: g ? 'PUT' : 'POST', body }); d.close(); done(); } catch (err) { $('#g-e', d).textContent = err.message; }
    };
  }

  // ---------------- payments ----------------
  async function pPayments(main) {
    const month = S.month || thisMonth();
    const r = await api('/api/payments?month=' + month);
    const cur = S.session.currency || '';
    main.innerHTML = `<div class="page"><div class="page-head"><h1>${t('payments')}</h1><div class="row"><input type="month" id="m" value="${month}" style="width:auto" aria-label="${t('month')}"><button class="btn" id="rem" type="button">${t('remind')}</button></div></div>
      ${r.students.length ? `<div class="table-wrap"><table><thead><tr><th>${t('name')}</th><th>${t('inGroups')}</th><th>${t('due')}</th><th>${t('paid')}</th><th>${t('status')}</th><th></th></tr></thead><tbody>
      ${r.students.map((s) => `<tr><td><b>${esc(s.name)}</b></td><td class="small">${s.groups.map(esc).join('، ')}</td><td class="num">${s.due}</td><td class="num">${s.paid}</td>
        <td><span class="pill ${{ paid: 'good', partial: 'warn', unpaid: 'bad', free: 'off' }[s.status]}">${t('st_' + s.status)}</span></td>
        <td>${s.status === 'unpaid' || s.status === 'partial' ? `<button class="btn sm primary" data-pay="${s.id}" data-left="${s.due - s.paid}">${t('pay')}</button>` : ''}</td></tr>`).join('')}</tbody></table></div>` : `<div class="card empty">${t('none')}</div>`}</div>`;
    $('#m').onchange = () => { S.month = $('#m').value; pPayments(main); };
    $('#rem').onclick = async () => { try { const x = await api('/api/payments/remind', { method: 'POST', body: { month } }); toast(`${t('reminded')} ${x.sent}`); } catch (err) { toast(err.message); } };
    $$('[data-pay]', main).forEach((b) => (b.onclick = () => {
      const d = dialog(`<form class="stack" id="pf"><h2>${t('pay')}</h2><div class="grid2"><label class="field" for="p-a">${t('amount')}<input type="number" id="p-a" min="1" value="${b.dataset.left}"></label>
        <label class="field" for="p-m">${t('method')}<select id="p-m">${['cash', 'wallet', 'instapay', 'bank'].map((k) => `<option value="${k}">${t(k)}</option>`).join('')}</select></label></div>
        <div class="row"><button class="btn primary" type="submit">${t('save')}</button><button class="btn" type="button" id="p-x">${t('close')}</button></div></form>`);
      $('#p-x', d).onclick = () => d.close();
      $('#pf', d).onsubmit = async (e) => { e.preventDefault(); try { await api('/api/payments', { method: 'POST', body: { studentId: b.dataset.pay, month, amount: Number($('#p-a', d).value), method: $('#p-m', d).value } }); d.close(); pPayments(main); } catch (err) { toast(err.message); } };
    }));
  }

  // ---------------- exams ----------------
  async function pExams(main) {
    const [{ exams }, { students }] = await Promise.all([api('/api/exams'), api('/api/students')]);
    main.innerHTML = `<div class="page"><div class="page-head"><h1>${t('exams')}</h1><button class="btn primary" id="add" type="button">${t('newExam')}</button></div>
      ${exams.map((e) => {
        const sts = students.filter((s) => s.groupIds.includes(e.groupId));
        const vals = Object.values(e.scores);
        const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
        return `<form class="card" data-exam="${e.id}"><div class="card-head"><div><h2>${esc(e.title)}</h2><span class="muted small">${esc(groupName(e.groupId))} · ${e.date} · ${t('maxScore')} ${e.maxScore} · ${t('avg')} ${avg}</span></div>${e.publishedAt ? `<span class="pill good">${t('published')}</span>` : ''}</div>
          <div class="att">${sts.map((s) => `<div class="att-row"><span class="nm">${esc(s.name)}</span><input class="score" type="number" min="0" max="${e.maxScore}" step="0.5" data-sid="${s.id}" value="${e.scores[s.id] ?? ''}" aria-label="${esc(s.name)}"></div>`).join('')}</div>
          <div class="row"><button class="btn primary" type="submit">${t('save')}</button><button class="btn" type="button" data-pub>${t('publish')}</button><span class="spacer"></span><button class="btn danger" type="button" data-del>${t('del')}</button></div></form>`;
      }).join('') || `<div class="card empty">${t('none')}</div>`}</div>`;
    const scoresOf = (f) => Object.fromEntries($$('.score', f).map((i) => [i.dataset.sid, i.value]));
    $$('[data-exam]', main).forEach((f) => {
      const id = f.dataset.exam;
      f.onsubmit = async (e) => { e.preventDefault(); try { await api('/api/exams/' + id, { method: 'PUT', body: { scores: scoresOf(f) } }); toast(t('saved')); pExams(main); } catch (err) { toast(err.message); } };
      $('[data-pub]', f).onclick = async () => { await api('/api/exams/' + id, { method: 'PUT', body: { scores: scoresOf(f) } }); const r = await api(`/api/exams/${id}/publish`, { method: 'POST', body: {} }); toast(`${t('published')} · ${t('sent')} ${r.sent}`); pExams(main); };
      $('[data-del]', f).onclick = async () => { await api('/api/exams/' + id, { method: 'DELETE', body: {} }); pExams(main); };
    });
    $('#add').onclick = () => {
      const d = dialog(`<form class="stack" id="ef"><h2>${t('newExam')}</h2><label class="field" for="e-t">${t('title')}<input type="text" id="e-t" required></label>
        <div class="grid2"><label class="field" for="e-g">${t('groups')}<select id="e-g">${S.groups.map((g) => `<option value="${g.id}">${esc(g.name)}</option>`).join('')}</select></label><label class="field" for="e-m">${t('maxScore')}<input type="number" id="e-m" value="20" min="1"></label></div>
        <label class="field" for="e-d">${t('date')}<input type="date" id="e-d" value="${new Date().toISOString().slice(0, 10)}"></label>
        <div class="err" id="e-e"></div><div class="row"><button class="btn primary" type="submit">${t('save')}</button><button class="btn" type="button" id="e-x">${t('close')}</button></div></form>`);
      $('#e-x', d).onclick = () => d.close();
      $('#ef', d).onsubmit = async (e) => { e.preventDefault(); try { await api('/api/exams', { method: 'POST', body: { title: $('#e-t', d).value, groupId: $('#e-g', d).value, maxScore: Number($('#e-m', d).value), date: $('#e-d', d).value } }); d.close(); pExams(main); } catch (err) { $('#e-e', d).textContent = err.message; } };
    };
  }

  // ---------------- announcements ----------------
  async function pNews(main) {
    const { announcements } = await api('/api/announcements');
    main.innerHTML = `<div class="page"><div class="page-head"><h1>${t('news')}</h1></div>
      <form class="card" id="nf"><label class="field" for="n-t">${t('annText')}<textarea id="n-t" required></textarea></label>
        <div class="grid2"><label class="field" for="n-g">${t('toGroup')}<select id="n-g"><option value="all">${t('all')}</option>${S.groups.map((g) => `<option value="${g.id}">${esc(g.name)}</option>`).join('')}</select></label>
          <label class="switch" style="align-self:end"><input type="checkbox" id="n-p" checked>${t('alsoParents')}</label></div>
        <div class="row"><button class="btn primary" type="submit">${t('sendAnn')}</button></div></form>
      ${announcements.map((a) => `<div class="card"><div class="small muted">${esc(a.groupId === 'all' ? t('all') : groupName(a.groupId))} · ${new Date(a.at).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-GB')} · ${t('sent')} ${a.sent}</div><div style="white-space:pre-wrap">${esc(a.text)}</div></div>`).join('')}</div>`;
    $('#nf').onsubmit = async (e) => { e.preventDefault(); try { const r = await api('/api/announcements', { method: 'POST', body: { text: $('#n-t').value, groupId: $('#n-g').value, parents: $('#n-p').checked } }); toast(`${t('sent')} ${r.announcement.sent}`); pNews(main); } catch (err) { toast(err.message); } };
  }

  // ---------------- settings ----------------
  async function pSettings(main) {
    const { settings: s, telegram, timezone } = await api('/api/settings');
    main.innerHTML = `<div class="page"><div class="page-head"><h1>${t('settings')}</h1></div>
      <form class="card" id="sf" style="max-width:760px">
        <div class="grid2"><label class="field" for="x-tn">${t('teacher')}<input type="text" id="x-tn" value="${esc(s.teacherName)}"></label><label class="field" for="x-sb">${t('subject')}<input type="text" id="x-sb" value="${esc(s.subject)}"></label></div>
        <div class="grid2"><label class="field" for="x-cu">${t('currency')}<input type="text" id="x-cu" value="${esc(s.currency)}"></label><label class="field" for="x-tz">${t('tz')}<input type="text" id="x-tz" class="ltr" value="${esc(s.timezone || timezone)}"></label></div>
        <h2>${t('tgTitle')} <span class="pill ${telegram.connected ? 'good' : 'off'}">${telegram.connected ? '@' + esc(telegram.username) : t('notConnected')}</span></h2><p class="muted small">${t('tgLead')}</p>
        <label class="field" for="x-tg">${t('tgToken')}<input type="text" id="x-tg" class="ltr" value="${esc(s.telegramToken)}" autocomplete="off"></label>
        ${telegram.error ? `<p class="small" style="color:var(--bad)">${esc(telegram.error)}</p>` : ''}
        <h2>${t('autoTitle')}</h2>
        <label class="switch"><input type="checkbox" id="x-ab" ${s.notify.absence ? 'checked' : ''}>${t('absenceOn')}</label>
        <label class="switch"><input type="checkbox" id="x-ex" ${s.notify.examResults ? 'checked' : ''}>${t('examOn')}</label>
        <div class="grid2"><label class="field" for="x-rb">${t('remindBefore')}<input type="number" id="x-rb" min="0" value="${s.notify.sessionReminderMinutes}"></label><label class="field" for="x-pd">${t('payDay')}<input type="number" id="x-pd" min="0" max="28" value="${s.notify.paymentReminderDay}"></label></div>
        <div class="row"><button class="btn primary" type="submit">${t('save')}</button></div></form>
      <form class="card" id="pw" style="max-width:480px"><h2>${t('pwTitle')}</h2><label class="field" for="pc">${t('current')}<input type="password" id="pc"></label><label class="field" for="pn">${t('next')}<input type="password" id="pn"></label><div class="err" id="pe"></div><div class="row"><button class="btn primary" type="submit">${t('change')}</button></div></form>
      <p class="muted small">Moallem · ${esc(S.session.version)} · MIT</p></div>`;
    $('#sf').onsubmit = async (e) => {
      e.preventDefault();
      try {
        await api('/api/settings', { method: 'PUT', body: { settings: { teacherName: $('#x-tn').value, subject: $('#x-sb').value, currency: $('#x-cu').value, timezone: $('#x-tz').value, telegramToken: $('#x-tg').value, notify: { absence: $('#x-ab').checked, examResults: $('#x-ex').checked, sessionReminderMinutes: Number($('#x-rb').value), paymentReminderDay: Number($('#x-pd').value) } } } });
        toast(t('saved')); pSettings(main);
      } catch (err) { toast(err.message); }
    };
    $('#pw').onsubmit = async (e) => { e.preventDefault(); try { await api('/api/password', { method: 'POST', body: { current: $('#pc').value, next: $('#pn').value } }); toast(t('saved')); } catch (err) { $('#pe').textContent = err.message; } };
  }
  boot();
})();
