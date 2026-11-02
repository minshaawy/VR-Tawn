// Password screen for every page. GitHub Pages can't do real logins, so this only keeps casual visitors out:
// the files themselves are still public to anyone who knows their exact URL.
(() => {
  const HASH = '79b4515087fcd8c0e0275a15d202d0a19bcbbc71d3a0b5f5d2d8cf4dd7b24242';   // sha-256 of the password
  const KEY = 'tw_gate';
  let ok = false;
  try { ok = localStorage.getItem(KEY) === HASH; } catch (e) {}
  if (ok) return;

  const css = document.createElement('style');
  css.textContent = `
    #twGate { position:fixed; inset:0; z-index:2147483647; display:flex; align-items:center; justify-content:center; padding:20px;
              background:#0E0C14 radial-gradient(900px 500px at 85% -10%, rgba(107,71,245,.35), transparent 60%); font-family:Tajawal, system-ui, sans-serif; }
    #twGate form { width:min(460px, 100%); background:#fff; color:#34295E; border-radius:28px; padding:36px 30px; text-align:center; box-sizing:border-box; direction:rtl; }
    #twGate h2 { margin:0 0 8px; font-size:30px; font-weight:800; }
    #twGate p { margin:0 0 22px; color:#666; font-size:19px; }
    #twGate input { width:100%; box-sizing:border-box; font:inherit; font-size:26px; text-align:center; padding:16px; border:3px solid #d9d3ef; border-radius:18px; outline:none; }
    #twGate input:focus { border-color:#6B47F5; }
    #twGate button { margin-top:16px; width:100%; font:inherit; font-weight:800; font-size:26px; color:#fff; background:#6B47F5; border:0; border-radius:18px; padding:16px; cursor:pointer; }
    #twGate .err { color:#D9443B; font-size:18px; min-height:26px; margin-top:12px; }
    html.tw-locked body > *:not(#twGate) { visibility:hidden !important; }`;
  document.head.appendChild(css);
  document.documentElement.classList.add('tw-locked');

  // crypto.subtle only exists on https, so plain http (e.g. before the domain's certificate is issued) uses sha256js.
  async function sha256(text) {
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    }
    return sha256js(new TextEncoder().encode(text));
  }
  function sha256js(bytes) {
    const K = [], H = [], isPrime = n => { for (let f = 2; f * f <= n; f++) if (n % f === 0) return false; return true; };
    for (let n = 2, i = 0; i < 64; n++) if (isPrime(n)) {
      if (i < 8) H[i] = (Math.pow(n, 1 / 2) * 2 ** 32) | 0;
      K[i++] = (Math.pow(n, 1 / 3) * 2 ** 32) | 0;
    }
    const len = bytes.length, total = ((len + 9 + 63) >> 6) << 6, m = new Uint8Array(total);
    m.set(bytes); m[len] = 0x80;
    new DataView(m.buffer).setUint32(total - 4, len * 8);
    const w = new Int32Array(64), rot = (x, n) => (x >>> n) | (x << (32 - n));
    for (let o = 0; o < total; o += 64) {
      for (let i = 0; i < 16; i++) w[i] = (m[o + 4 * i] << 24) | (m[o + 4 * i + 1] << 16) | (m[o + 4 * i + 2] << 8) | m[o + 4 * i + 3];
      for (let i = 16; i < 64; i++) {
        const s0 = rot(w[i - 15], 7) ^ rot(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = rot(w[i - 2], 17) ^ rot(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) {
        const t1 = (h + (rot(e, 6) ^ rot(e, 11) ^ rot(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
        const t2 = ((rot(a, 2) ^ rot(a, 13) ^ rot(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      [a, b, c, d, e, f, g, h].forEach((v, i) => { H[i] = (H[i] + v) | 0; });
    }
    return H.map(v => (v >>> 0).toString(16).padStart(8, '0')).join('');
  }
  function show() {
    const gate = document.createElement('div');
    gate.id = 'twGate';
    gate.innerHTML = `<form autocomplete="off">
      <h2>عالم التعاونية VR</h2>
      <p>اكتب كلمة السر عشان تدخل</p>
      <input type="password" inputmode="text" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="كلمة السر" aria-label="كلمة السر">
      <button type="submit">دخول</button>
      <div class="err" role="alert"></div>
    </form>`;
    document.body.appendChild(gate);
    const input = gate.querySelector('input'), err = gate.querySelector('.err');
    input.focus();
    gate.querySelector('form').addEventListener('submit', async e => {
      e.preventDefault();
      if (await sha256(input.value.trim().toLowerCase()) === HASH) {
        try { localStorage.setItem(KEY, HASH); } catch (e2) {}
        gate.remove();
        document.documentElement.classList.remove('tw-locked');
      } else {
        err.textContent = 'كلمة السر غلط، جرّب تاني';
        input.select();
      }
    });
  }
  if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
})();
