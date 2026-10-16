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

  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
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
