import crypto from 'node:crypto';
import { defaultData, localParts } from './app.js';

export function buildDemo(demo) {
  const d = defaultData();
  const ar = demo.lang === 'ar';
  Object.assign(d.settings, { teacherName: ar ? 'أ. محمد سامي' : 'Mr. Sami', subject: ar ? 'رياضيات' : 'Math', currency: ar ? 'جنيه' : 'USD', lang: demo.lang });
  const L = localParts(Date.now(), 'UTC');
  const g = (name, fee, days, time, place, color) => { const x = { id: crypto.randomUUID(), name, subject: d.settings.subject, grade: '', fee, schedule: days.map((day) => ({ day, time, duration: 90 })), place, color, active: true, createdAt: new Date().toISOString() }; d.groups.push(x); return x; };
  const g1 = g(ar ? 'تالتة ثانوي - مجموعة أ' : 'Grade 12 - Group A', ar ? 450 : 45, [L.weekday, (L.weekday + 3) % 7], '16:00', ar ? 'سنتر النور - المعادي' : 'Noor Center', '#2563EB');
  const g2 = g(ar ? 'تانية ثانوي' : 'Grade 11', ar ? 350 : 35, [L.weekday], '19:00', ar ? 'أونلاين' : 'Online', '#16A34A');
  const names = ar ? ['أحمد سمير', 'مريم خالد', 'يوسف طارق', 'جنى محمود', 'عمر حسام', 'ملك أشرف', 'زياد عادل', 'فرح وليد'] : ['Ahmed', 'Mariam', 'Youssef', 'Jana', 'Omar', 'Malak', 'Ziad', 'Farah'];
  names.forEach((name, i) => d.students.push({ id: crypto.randomUUID(), code: 'DEMO' + i + 'X', token: 'demo-student-' + i, name, phone: '0100' + (2000000 + i), parentName: (ar ? 'ولي أمر ' : 'Parent of ') + name.split(' ')[0], parentPhone: '0111' + (3000000 + i), groupIds: [i < 5 ? g1.id : g2.id], feeOverride: null, notes: '', active: true, studentChat: '', parentChat: '', createdAt: new Date(Date.now() - 40 * 864e5).toISOString() }));
  d.students.slice(0, 6).forEach((s, i) => { if (i !== 3) d.payments.push({ id: crypto.randomUUID(), studentId: s.id, month: L.month, amount: i === 2 ? (ar ? 200 : 20) : i < 5 ? g1.fee : g2.fee, method: 'cash', note: '', paidAt: new Date().toISOString() }); });
  for (let k = 1; k <= 8; k++) {
    const date = new Date(Date.now() - k * 3.5 * 864e5).toISOString().slice(0, 10);
    d.sessions.push({ id: crypto.randomUUID(), groupId: g1.id, date, time: '16:00', attendance: Object.fromEntries(d.students.slice(0, 5).map((s, i) => [s.id, (i + k) % 7 === 0 ? 'absent' : (i + k) % 5 === 0 ? 'late' : 'present'])), notes: '' });
  }
  d.exams.push({ id: crypto.randomUUID(), groupId: g1.id, title: ar ? 'امتحان التفاضل' : 'Calculus quiz', date: new Date(Date.now() - 5 * 864e5).toISOString().slice(0, 10), maxScore: 20, scores: Object.fromEntries(d.students.slice(0, 5).map((s, i) => [s.id, [18, 15.5, 19, 12, 17][i]])), publishedAt: new Date().toISOString() });
  d.announcements.push({ id: crypto.randomUUID(), groupId: g1.id, text: ar ? 'الحصة الجاية مراجعة على الباب الأول، هاتوا الكشكول.' : 'Next class is a revision of chapter 1.', at: new Date(Date.now() - 864e5).toISOString(), sent: 0 });
  return d;
}
