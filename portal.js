// Doorway that takes you to the other scene: walk into it, or point the VR laser at it and pull the trigger.
// Shared by reception/ and accident/. The page passes its own THREE, scene and a getLang() so labels follow the language button.
export function addPortal({ THREE, scene, x, z, face, href, color, label, getLang, inXR }) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = Math.atan2(face[0] - x, face[1] - z);   // look at the given point (usually where you start)
  scene.add(group);

  // A plain doorway: matte frame in the scene's accent colour and a faint tinted pane you walk through
  const DW = 1.1, DH = 2.2, T = 0.07;
  const frameMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
  for (const [w, h, px, py] of [[T, DH, -DW / 2, DH / 2], [T, DH, DW / 2, DH / 2], [DW + T, T, 0, DH]]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, T), frameMat);
    m.position.set(px, py, 0); m.castShadow = true; group.add(m);
  }
  const paneMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.15, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const disc = new THREE.Mesh(new THREE.PlaneGeometry(DW - T, DH - T / 2), paneMat);
  disc.position.y = (DH - T / 2) / 2; group.add(disc);

  // Sign above the door
  const cnv = document.createElement('canvas'); cnv.width = 1024; cnv.height = 300;
  const g = cnv.getContext('2d');
  const tex = new THREE.CanvasTexture(cnv); tex.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3 * 300 / 1024),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, fog: false, side: THREE.DoubleSide }));
  sign.position.y = DH + 0.3; group.add(sign);
  let drawn = '', hover = false;
  function drawSign() {
    const ar = getLang() === 'ar', key = getLang() + hover;
    if (key === drawn) return; drawn = key;
    const w = cnv.width, h = cnv.height;
    g.clearRect(0, 0, w, h);
    g.fillStyle = hover ? color : 'rgba(22,18,34,0.92)'; g.beginPath(); g.roundRect(6, 6, w - 12, h - 12, 60); g.fill();
    g.strokeStyle = color; g.lineWidth = 8; g.stroke();
    g.direction = ar ? 'rtl' : 'ltr'; g.textAlign = 'center'; g.fillStyle = '#fff';
    const fit = (text, weight, size, y) => {   // shrink the font until the line fits the sign
      do g.font = `${weight} ${size--}px Tajawal, sans-serif`; while (g.measureText(text).width > w - 90 && size > 20);
      g.fillText(text, w / 2, y);
    };
    fit(label[ar ? 'ar' : 'en'], 800, 92, 135);
    g.fillStyle = 'rgba(255,255,255,0.85)';
    fit(ar ? 'ادخل من الباب أو وجّه الليزر واضغط Trigger' : 'Walk through, or point the laser and pull the trigger', 500, 46, 225);
    tex.needsUpdate = true;
  }
  drawSign();

  let armed = false, leaving = false;
  function go() {
    if (leaving) return; leaving = true;
    const q = new URLSearchParams({ lang: getLang() });
    if (inXR()) q.set('vr', '1');
    location.href = `${href}?${q}`;
  }
  const api = {
    targets: [disc, sign],
    go,
    setHover(v) { hover = !!v; paneMat.opacity = hover ? 0.35 : 0.15; },
    // px/pz = where the visitor stands. You have to step away once before walking in counts, so arriving next to it is safe.
    update(t, px, pz) {
      drawSign();
      const d = Math.hypot(px - x, pz - z);
      if (d > 2) armed = true;
      if (armed && d < 0.55) go();
    },
  };
  disc.userData.portal = sign.userData.portal = api;   // the laser finds which door it hit
  return api;
}

// Read ?lang= and ?vr=1 that the portal adds. If the browser hands over the VR session on navigation (sessiongranted),
// go straight back into VR; otherwise the start card's "Enter VR" button is one click away.
export function arrival({ setLang, enterVR }) {
  const q = new URLSearchParams(location.search);
  if (q.get('lang') === 'en' || q.get('lang') === 'ar') setLang(q.get('lang'));
  if (q.get('vr') === '1' && navigator.xr) navigator.xr.addEventListener('sessiongranted', () => enterVR());
  return q.get('vr') === '1';
}
