// Telegram bot via long polling. Students and parents link their chat with
// "/start S-CODE" (student) or "/start P-CODE" (parent) from their portal page.

export class Telegram {
  constructor(getToken, onLink) {
    this.getToken = getToken;
    this.onLink = onLink; // (role, code, chatId, name) => reply text or null
    this.running = false;
    this.offset = 0;
    this.me = null;
    this.error = null;
    this.base = process.env.TELEGRAM_API_URL || 'https://api.telegram.org';
  }

  api(method, body, signal) {
    return fetch(`${this.base}/bot${this.token}/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body || {}), signal }).then((r) => r.json());
  }

  async sync() {
    const token = this.getToken();
    if (!token) return this.stop();
    if (this.running && this.token === token) return;
    this.stop();
    this.token = token;
    try {
      const me = await this.api('getMe');
      if (!me.ok) throw new Error(me.description || 'Invalid bot token');
      this.me = me.result;
      this.error = null;
    } catch (err) {
      this.error = err.message;
      return;
    }
    this.running = true;
    this.loop();
  }

  stop() {
    this.running = false;
    this.abort?.abort();
    this.me = null;
  }

  async loop() {
    const mine = this.token;
    while (this.running && this.token === mine) {
      this.abort = new AbortController();
      try {
        const r = await this.api('getUpdates', { offset: this.offset, timeout: 30, allowed_updates: ['message'] }, this.abort.signal);
        if (!r.ok) throw new Error(r.description);
        for (const u of r.result) {
          this.offset = u.update_id + 1;
          await this.handle(u);
        }
      } catch (err) {
        if (!this.running) break;
        this.error = err.message;
        await new Promise((res) => setTimeout(res, 5000));
      }
    }
  }

  async handle(u) {
    const m = u.message;
    if (!m?.text || m.chat?.type !== 'private') return;
    const match = m.text.trim().match(/^\/start(?:@\w+)?\s+([SP])-([A-Z0-9]{4,10})$/i);
    if (!match) {
      await this.send(m.chat.id, 'افتح الرابط اللي المدرس بعتهولك عشان نربط حسابك 🙏\nOpen the link your teacher sent you to connect.').catch(() => {});
      return;
    }
    const reply = this.onLink(match[1].toUpperCase() === 'S' ? 'student' : 'parent', match[2].toUpperCase(), String(m.chat.id), m.from?.first_name || '');
    if (reply) await this.send(m.chat.id, reply).catch(() => {});
  }

  async send(chatId, text) {
    if (!this.token) throw new Error('Telegram is not connected');
    const r = await this.api('sendMessage', { chat_id: chatId, text });
    if (!r.ok) throw new Error(r.description || 'sendMessage failed');
  }

  status() {
    return { connected: Boolean(this.running && this.me), username: this.me?.username || null, error: this.error };
  }
}
