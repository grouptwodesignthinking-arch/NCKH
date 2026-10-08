/* Củ Chi Stories — lớp 3D: bản đồ địa đạo tương tác, cảnh VR từng trạm, vật thể AR bám mã trạm.
 * Mọi mô hình là MINH HỌA dựng từ hình khối đơn giản, không theo tỷ lệ hay vị trí thực của di tích.
 * Cần three.js r149 (assets/three.min.js). Không tải gì từ mạng, chạy được offline.
 *
 * API (window.CuChi3D):
 *   supported                       → true nếu trình duyệt có WebGL
 *   createMap(el, {onSelect})       → bản đồ 3D: select(id), setLayer(name, on), setRoute(on), setAR(pose|null, live), dispose()
 *   createVR(el, {scene, onHotspot})→ cảnh VR: setGyro(on) → Promise<bool>, setStereo(on), setWalk(dir), hotspots, dispose()
 *   createARObject(el, {id})        → vật thể AR: setLive(on), setPose(pose|null), dispose()
 * pose = {cx, cy, ux, uy, vx, vy}: tâm và hai cạnh của mã QR, theo pixel của khung hiển thị.
 */
(function () {
  'use strict';
  const THREE = window.THREE;
  const supported = (() => {
    try {
      const c = document.createElement('canvas');
      return !!(THREE && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) {
      return false;
    }
  })();

  const COL = {
    soil: 0x8a6a45, soilDark: 0x5e4630, clay: 0xa9825a, earthFloor: 0x6f5438, wood: 0x7a5230, woodDark: 0x4f3520,
    leaf: 0x6f7d3c, leafDry: 0xa08a4f, leafRed: 0x8c5a33, grass: 0x7d8c4a, canopy: 0x56692f, canopy2: 0x6d7f3a,
    bark: 0x6a5643, rubberBark: 0x8f8573, metal: 0x2f2f2c, smoke: 0xd9d4c4, water: 0x4f6b6a, gold: 0xd4af75,
    olive: 0x41551f, cloth: 0x2f3a2a, skin: 0xc9a27e, straw: 0xd8c38a, hole: 0x120d08,
  };

  // ---------- helpers ----------
  function rng(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  }
  function std(color, o) {
    return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.92, metalness: 0, flatShading: true }, o || {}));
  }
  function mesh(geo, material, x, y, z) {
    const m = new THREE.Mesh(geo, material);
    m.position.set(x || 0, y || 0, z || 0);
    return m;
  }
  let dotTex = null;
  function dotTexture() {
    if (dotTex) return dotTex;
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.4, 'rgba(255,255,255,0.55)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    dotTex = new THREE.CanvasTexture(c);
    return dotTex;
  }
  const earthTex = {};
  function earthTexture(base, seed) {
    const key = base + ':' + seed;
    if (earthTex[key]) return earthTex[key];
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = base;
    g.fillRect(0, 0, 256, 256);
    const r = rng(seed);
    for (let i = 0; i < 2600; i++) {
      const s = r() * 3 + 0.6;
      g.fillStyle = r() < 0.55 ? `rgba(40,25,10,${0.12 + r() * 0.22})` : `rgba(230,200,150,${0.06 + r() * 0.12})`;
      g.fillRect(r() * 256, r() * 256, s, s);
    }
    for (let i = 0; i < 14; i++) {
      g.strokeStyle = `rgba(45,28,12,${0.08 + r() * 0.12})`;
      g.lineWidth = 1 + r() * 2.5;
      g.beginPath();
      const y = r() * 256;
      g.moveTo(0, y);
      for (let x = 0; x <= 256; x += 32) g.lineTo(x, y + (r() - 0.5) * 12);
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    earthTex[key] = t;
    return t;
  }
  function numberTexture(n) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    g.fillStyle = 'rgba(242,240,230,0.95)';
    g.beginPath();
    g.arc(64, 64, 44, 0, Math.PI * 2);
    g.fill();
    g.lineWidth = 10;
    g.strokeStyle = 'rgba(212,175,117,0.9)';
    g.stroke();
    g.fillStyle = '#41551f';
    g.font = 'bold 54px Georgia, serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(String(n), 64, 68);
    return new THREE.CanvasTexture(c);
  }
  function disposeTree(obj) {
    obj.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
        if (m.map && m.map !== dotTex && !Object.values(earthTex).includes(m.map)) m.map.dispose();
        m.dispose();
      });
    });
  }
  // A small particle emitter (smoke, air, dust, falling leaves).
  function emitter(ctx, o) {
    const n = ctx.mini ? Math.ceil(o.count / 3) : o.count;
    const pos = new Float32Array(n * 3), vel = new Float32Array(n * 3), age = new Float32Array(n), max = new Float32Array(n);
    const r = rng(o.seed || 11);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({
      color: o.color, size: o.size, map: dotTexture(), transparent: true, opacity: o.opacity,
      depthWrite: false, blending: o.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    ctx.points.push({ m, base: o.size });
    const pts = new THREE.Points(geo, m);
    pts.frustumCulled = false;
    const p = [0, 0, 0], v = [0, 0, 0];
    const reset = (i) => {
      p[0] = p[1] = p[2] = v[0] = v[1] = v[2] = 0;
      o.spawn(p, v, r);
      pos[i * 3] = p[0]; pos[i * 3 + 1] = p[1]; pos[i * 3 + 2] = p[2];
      vel[i * 3] = v[0]; vel[i * 3 + 1] = v[1]; vel[i * 3 + 2] = v[2];
      age[i] = 0;
      max[i] = o.life[0] + r() * (o.life[1] - o.life[0]);
    };
    for (let i = 0; i < n; i++) {
      reset(i);
      age[i] = r() * max[i];
      for (let k = 0; k < 3; k++) pos[i * 3 + k] += vel[i * 3 + k] * age[i];
    }
    const acc = o.accel || [0, 0, 0];
    ctx.anim.push((t, dt) => {
      for (let i = 0; i < n; i++) {
        age[i] += dt;
        if (age[i] > max[i]) { reset(i); continue; }
        const k = i * 3;
        vel[k] += acc[0] * dt; vel[k + 1] += acc[1] * dt; vel[k + 2] += acc[2] * dt;
        if (o.wobble) vel[k] += Math.sin(t * 1.3 + i) * o.wobble * dt;
        pos[k] += vel[k] * dt; pos[k + 1] += vel[k + 1] * dt; pos[k + 2] += vel[k + 2] * dt;
      }
      geo.attributes.position.needsUpdate = true;
    });
    return pts;
  }
  function flame(ctx, s, withLight, intensity) {
    const g = new THREE.Group();
    const outer = mesh(new THREE.ConeGeometry(0.08 * s, 0.24 * s, 8), new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.65 }), 0, 0.11 * s, 0);
    const core = mesh(new THREE.ConeGeometry(0.045 * s, 0.15 * s, 8), new THREE.MeshBasicMaterial({ color: 0xffd36b }), 0, 0.08 * s, 0);
    g.add(outer, core);
    let light = null;
    if (withLight && !ctx.ar) {
      light = new THREE.PointLight(0xffa24a, intensity || 1.4, 6 * s, 2);
      light.position.y = 0.3 * s;
      g.add(light);
    }
    const ph = Math.random() * 10;
    ctx.anim.push((t) => {
      const f = 0.85 + 0.12 * Math.sin(t * 17 + ph) + 0.08 * Math.sin(t * 29 + ph * 2);
      core.scale.set(1, f, 1);
      outer.scale.set(1 + 0.08 * Math.sin(t * 11 + ph), 0.9 + 0.2 * Math.sin(t * 13 + ph), 1);
      if (light) light.intensity = (intensity || 1.4) * f;
    });
    return g;
  }
  function oilLamp(ctx, s, withLight) {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.06 * s, 0.08 * s, 0.06 * s, 12), std(0x5b4a35, { metalness: 0.3, roughness: 0.6 }), 0, 0.03 * s, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.035 * s, 0.05 * s, 0.15 * s, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0xfff1d0, transparent: true, opacity: 0.35, emissive: 0xffc070, emissiveIntensity: 0.6, side: THREE.DoubleSide }), 0, 0.13 * s, 0));
    const f = flame(ctx, 0.55 * s, withLight, 1.1);
    f.position.y = 0.07 * s;
    g.add(f);
    return g;
  }
  function figure(s, crouch) {
    const g = new THREE.Group();
    const body = mesh(new THREE.CylinderGeometry(0.11 * s, 0.15 * s, (crouch ? 0.32 : 0.55) * s, 8), std(COL.cloth), 0, (crouch ? 0.16 : 0.28) * s, 0);
    const head = mesh(new THREE.SphereGeometry(0.075 * s, 10, 8), std(COL.skin), 0, (crouch ? 0.4 : 0.64) * s, 0);
    const hat = mesh(new THREE.ConeGeometry(0.16 * s, 0.07 * s, 14), std(COL.straw), 0, (crouch ? 0.47 : 0.71) * s, 0);
    g.add(body, head, hat);
    return g;
  }
  function tree(ctx, r, h, kind) {
    const g = new THREE.Group();
    const rubber = kind === 'rubber';
    const trunkH = h * (rubber ? 0.75 : 0.6);
    g.add(mesh(new THREE.CylinderGeometry(0.04 * h * (rubber ? 0.7 : 1), 0.06 * h * (rubber ? 0.7 : 1), trunkH, 7), std(rubber ? COL.rubberBark : COL.bark), 0, trunkH / 2, 0));
    const blobs = rubber ? 3 : 4;
    for (let i = 0; i < blobs; i++) {
      const b = mesh(new THREE.IcosahedronGeometry(h * (rubber ? 0.16 : 0.22) * (0.8 + r() * 0.4), 0), std(r() < 0.5 ? COL.canopy : COL.canopy2), (r() - 0.5) * h * 0.3, trunkH + (r() - 0.2) * h * 0.22, (r() - 0.5) * h * 0.3);
      g.add(b);
    }
    const ph = r() * 6;
    const lean = (r() - 0.5) * (rubber ? 0.12 : 0.06);
    ctx.anim.push((t) => { g.rotation.z = lean + Math.sin(t * 0.7 + ph) * 0.015; });
    return g;
  }
  function leafCarpet(ctx, count, radius, y, seed, avoid, leafSize) {
    const r = rng(seed);
    const geo = new THREE.PlaneGeometry(1, 0.65);
    const m = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 1 });
    const im = new THREE.InstancedMesh(geo, m, count);
    const d = new THREE.Object3D();
    const cols = [COL.leaf, COL.leafDry, COL.leafRed, 0xb59a5f].map((c) => new THREE.Color(c));
    let k = 0;
    for (let i = 0; i < count * 3 && k < count; i++) {
      const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * radius;
      const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
      if (avoid && avoid(x, z)) continue;
      const s = (leafSize || radius * 0.05) * (0.6 + r() * 0.8);
      d.position.set(x, y + r() * 0.004 * radius, z);
      d.rotation.set(-Math.PI / 2 + (r() - 0.5) * 0.5, 0, r() * Math.PI * 2);
      d.scale.set(s, s, s);
      d.updateMatrix();
      im.setMatrixAt(k, d.matrix);
      im.setColorAt(k, cols[Math.floor(r() * cols.length)]);
      k++;
    }
    im.count = k;
    return im;
  }
  function groundDisc(color, r, h) {
    return mesh(new THREE.CylinderGeometry(r, r * 1.04, h, 32), std(color), 0, -h / 2, 0);
  }

  // ---------- station objects (footprint ≈ 1 unit = cạnh mã trạm) ----------
  function buildHatch(ctx) {
    const g = new THREE.Group();
    g.add(groundDisc(COL.soil, 0.95, 0.08));
    g.add(leafCarpet(ctx, ctx.mini ? 30 : 90, 0.92, 0.002, 3, (x, z) => Math.abs(x) < 0.26 && Math.abs(z) < 0.26));
    g.add(mesh(new THREE.BoxGeometry(0.44, 0.012, 0.44), new THREE.MeshBasicMaterial({ color: COL.hole }), 0, 0.004, 0));
    // khung miệng hầm
    const rim = std(COL.woodDark);
    [[0, 0.24], [0, -0.24]].forEach(([x, z]) => g.add(mesh(new THREE.BoxGeometry(0.52, 0.03, 0.04), rim, x, 0.012, z)));
    [[0.24, 0], [-0.24, 0]].forEach(([x, z]) => g.add(mesh(new THREE.BoxGeometry(0.04, 0.03, 0.52), rim, x, 0.012, z)));
    const pivot = new THREE.Group();
    pivot.position.set(-0.23, 0.03, 0);
    const lid = mesh(new THREE.BoxGeometry(0.46, 0.045, 0.46), std(COL.wood), 0.23, 0.02, 0);
    pivot.add(lid);
    const lidLeaves = leafCarpet(ctx, 22, 0.22, 0.046, 9);
    lidLeaves.position.set(0.23, 0, 0);
    pivot.add(lidLeaves);
    g.add(pivot);
    let target = ctx.autoOpen ? null : 0, open = 0;
    ctx.anim.push((t, dt) => {
      const goal = target === null ? Math.max(0, Math.min(1, 0.5 - 0.75 * Math.cos(t * 0.8))) : target;
      open += (goal - open) * Math.min(1, dt * 3);
      pivot.rotation.z = open * 1.95;
    });
    g.userData.toggle = () => { target = target === null ? 1 : target > 0.5 ? 0 : 1; };
    return g;
  }
  function buildVent(ctx) {
    const g = new THREE.Group();
    g.add(groundDisc(COL.soil, 0.95, 0.08));
    g.add(leafCarpet(ctx, ctx.mini ? 20 : 60, 0.92, 0.002, 5, (x, z) => x * x + z * z < 0.25));
    const prof = [[0.52, 0], [0.47, 0.14], [0.4, 0.32], [0.3, 0.52], [0.2, 0.72], [0.1, 0.9], [0, 0.97]].map(([x, y]) => new THREE.Vector2(x, y));
    const lg = new THREE.LatheGeometry(prof, 18);
    const r = rng(21), p = lg.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      if (y > 0.02 && y < 0.95) { const k = 1 + (r() - 0.5) * 0.12; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); }
    }
    lg.computeVertexNormals();
    g.add(mesh(lg, std(0x9b7550)));
    g.add(mesh(new THREE.SphereGeometry(0.22, 10, 8), std(0x8d6a47), 0.3, 0.12, -0.18));
    const hole = mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.08, 14), new THREE.MeshBasicMaterial({ color: COL.hole }), 0, 0.55, 0.29);
    hole.rotation.x = Math.PI / 2 - 0.35;
    g.add(hole);
    g.add(emitter(ctx, {
      count: 40, color: 0xeaf3f0, size: 0.09, opacity: 0.55, life: [1.4, 2.6], seed: 4, wobble: 0.08,
      spawn: (q, v, rr) => { q[0] = (rr() - 0.5) * 0.05; q[1] = 0.56; q[2] = 0.32; v[0] = (rr() - 0.5) * 0.08; v[1] = 0.06 + rr() * 0.08; v[2] = 0.18 + rr() * 0.12; },
    }));
    return g;
  }
  function buildStove(ctx) {
    const g = new THREE.Group();
    g.add(groundDisc(COL.earthFloor, 0.95, 0.08));
    const clay = std(COL.clay);
    g.add(mesh(new THREE.BoxGeometry(0.62, 0.3, 0.42), clay, 0, 0.15, 0));
    g.add(mesh(new THREE.BoxGeometry(0.68, 0.05, 0.48), std(0x95714d), 0, 0.325, 0));
    g.add(mesh(new THREE.BoxGeometry(0.22, 0.14, 0.03), new THREE.MeshBasicMaterial({ color: COL.hole }), 0, 0.11, 0.205));
    const f = flame(ctx, 0.85, true, 1.6);
    f.position.set(0, 0.04, 0.16);
    g.add(f);
    const iron = std(COL.metal, { metalness: 0.4, roughness: 0.55 });
    g.add(mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.14, 16), iron, -0.13, 0.42, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.02, 16), iron, -0.13, 0.5, 0));
    g.add(mesh(new THREE.SphereGeometry(0.02, 8, 6), iron, -0.13, 0.52, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.1, 12), iron, 0.17, 0.4, 0.04));
    const logs = std(COL.bark);
    [[-0.3, 0.6], [0.05, -0.5], [0.28, 0.3]].forEach(([x, a], i) => {
      const l = mesh(new THREE.CylinderGeometry(0.025, 0.028, 0.34, 7), logs, x * 0.5, 0.03 + i * 0.012, 0.36);
      l.rotation.set(0, a, Math.PI / 2);
      g.add(l);
    });
    // rãnh dẫn khói: chạy sát mặt đất ra xa bếp, khói thoát ra mỏng như sương
    const duct = new THREE.MeshStandardMaterial({ color: 0xb08a60, roughness: 1, flatShading: true });
    // Trong hầm (VR, bản đồ) rãnh khói đi vào vách đất; ngoài trời (AR) thấy khói thoát ra ở đầu rãnh.
    const paths = ctx.indoor
      ? [
          [[0, 0.1, -0.21], [0, 0.06, -0.42], [0.3, 0.05, -0.7], [0.55, 0.05, -0.98]],
          [[0, 0.06, -0.42], [-0.3, 0.05, -0.7], [-0.6, 0.05, -0.98]],
        ]
      : [
          [[0, 0.1, -0.21], [0, 0.06, -0.42], [0.28, 0.04, -0.66], [0.62, 0.04, -0.74]],
          [[0, 0.06, -0.42], [-0.3, 0.04, -0.64], [-0.66, 0.04, -0.7]],
        ];
    paths.forEach((pts, i) => {
      const c = new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(q[0], q[1], q[2])));
      g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 24, 0.038, 8, false), duct));
      if (ctx.indoor) return;
      const end = pts[pts.length - 1];
      g.add(mesh(new THREE.SphereGeometry(0.07, 8, 6), std(0x8b6a48), end[0], 0.02, end[2]));
      g.add(emitter(ctx, {
        count: 34, color: COL.smoke, size: 0.22, opacity: 0.16, life: [2.5, 4.5], seed: 30 + i, wobble: 0.05,
        spawn: (q, v, rr) => { q[0] = end[0]; q[1] = 0.06; q[2] = end[2]; const s = end[0] > 0 ? 1 : -1; v[0] = s * (0.05 + rr() * 0.06); v[1] = 0.02 + rr() * 0.035; v[2] = (rr() - 0.6) * 0.06; },
      }));
    });
    return g;
  }
  function buildTunnel(ctx) {
    const g = new THREE.Group();
    const shape = new THREE.Shape();
    shape.moveTo(-0.8, 0); shape.lineTo(0.8, 0); shape.lineTo(0.8, 0.9); shape.lineTo(-0.8, 0.9); shape.lineTo(-0.8, 0);
    const hole = new THREE.Path();
    hole.moveTo(-0.2, 0.1); hole.lineTo(0.2, 0.1); hole.lineTo(0.2, 0.42);
    hole.absarc(0, 0.42, 0.2, 0, Math.PI, false);
    hole.lineTo(-0.2, 0.1);
    shape.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.7, bevelEnabled: false });
    geo.translate(0, 0, -0.35);
    const tex = earthTexture('#8a6a45', 2);
    const m = new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex, roughness: 1 });
    tex.repeat.set(1.5, 1.5);
    g.add(new THREE.Mesh(geo, m));
    g.add(mesh(new THREE.BoxGeometry(1.62, 0.045, 0.72), std(COL.grass), 0, 0.92, 0));
    g.add(mesh(new THREE.PlaneGeometry(0.4, 0.7).rotateX(-Math.PI / 2), std(0x4a3725), 0, 0.101, 0));
    const lamp = oilLamp(ctx, 0.75, true);
    lamp.position.set(0.12, 0.1, 0.12);
    g.add(lamp);
    const fig = figure(0.48, true);
    fig.position.set(-0.08, 0.1, 0);
    g.add(fig);
    for (let i = 0; i < 5; i++) {
      const tuft = mesh(new THREE.ConeGeometry(0.03, 0.08, 5), std(COL.canopy2), -0.7 + i * 0.34, 0.98, (i % 2 ? 0.2 : -0.18));
      g.add(tuft);
    }
    return g;
  }
  function buildCrater(ctx) {
    const g = new THREE.Group();
    const prof = [[0, -0.3], [0.25, -0.28], [0.5, -0.17], [0.7, -0.03], [0.8, 0.06], [0.9, 0.04], [1.0, 0]].map(([x, y]) => new THREE.Vector2(x, y));
    g.add(mesh(new THREE.LatheGeometry(prof, 36), std(COL.soil, { side: THREE.DoubleSide })));
    g.add(mesh(new THREE.RingGeometry(1.0, 1.25, 36).rotateX(-Math.PI / 2), std(COL.grass), 0, 0.001, 0));
    g.add(mesh(new THREE.CircleGeometry(0.24, 24).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: COL.water, roughness: 0.25, metalness: 0.1 }), 0, -0.27, 0));
    g.add(leafCarpet(ctx, ctx.mini ? 25 : 70, 1.2, 0.004, 7, (x, z) => x * x + z * z < 0.9));
    const r = rng(5);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + r() * 0.4;
      const t = tree(ctx, r, 0.45 + r() * 0.3, 'jungle');
      t.position.set(Math.cos(a) * 1.12, 0, Math.sin(a) * 1.12);
      g.add(t);
    }
    const p = figure(0.32, false);
    p.position.set(0.86, 0.04, 0.35);
    g.add(p);
    return g;
  }
  function buildGrove(ctx) {
    const g = new THREE.Group();
    g.add(groundDisc(0x7a6a45, 0.95, 0.08));
    g.add(mesh(new THREE.PlaneGeometry(0.26, 1.85).rotateX(-Math.PI / 2), std(0xb59a6f), 0, 0.003, 0));
    g.add(leafCarpet(ctx, ctx.mini ? 30 : 80, 0.92, 0.004, 13, (x) => Math.abs(x) < 0.13));
    const r = rng(17);
    [-0.62, -0.3, 0.3, 0.62].forEach((x) => {
      for (let z = -0.72; z <= 0.73; z += 0.36) {
        if (x * x + z * z > 0.85) continue;
        const t = tree(ctx, r, 0.7 + r() * 0.15, 'rubber');
        t.position.set(x + (r() - 0.5) * 0.04, 0, z);
        g.add(t);
      }
    });
    g.add(emitter(ctx, {
      count: 26, color: COL.leafDry, size: 0.05, opacity: 0.9, life: [3, 5], seed: 8, wobble: 0.2,
      spawn: (q, v, rr) => { q[0] = (rr() - 0.5) * 1.4; q[1] = 0.7 + rr() * 0.2; q[2] = (rr() - 0.5) * 1.4; v[1] = -0.12 - rr() * 0.08; v[0] = (rr() - 0.5) * 0.05; },
    }));
    return g;
  }

  const STATIONS = {
    'nap-ham': { code: 'CC-01', short: 'Nắp hầm', build: buildHatch },
    'lo-thong-hoi': { code: 'CC-02', short: 'Lỗ thông hơi', build: buildVent },
    'bep-hoang-cam': { code: 'CC-03', short: 'Bếp Hoàng Cầm', build: buildStove },
    'long-dia-dao': { code: 'CC-04', short: 'Lòng địa đạo', build: buildTunnel },
    'dau-tich': { code: 'CC-05', short: 'Hố bom', build: buildCrater },
    'loi-rung': { code: 'CC-06', short: 'Lối rừng', build: buildGrove },
  };

  // ---------- shared renderer plumbing ----------
  function makeStage(el, alpha) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: !!alpha, powerPreference: 'low-power', preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.className = 'c3d-canvas';
    el.appendChild(renderer.domElement);
    const labels = document.createElement('div');
    labels.className = 'c3d-labels';
    el.appendChild(labels);
    const ctx = { anim: [], points: [], ar: false, mini: false };
    let raf = 0, last = performance.now(), t0 = last, alive = true, w = 1, h = 1;
    const size = () => {
      w = Math.max(1, el.clientWidth); h = Math.max(1, el.clientHeight);
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = w + 'px';
      renderer.domElement.style.height = h + 'px';
      stage.onResize && stage.onResize(w, h);
    };
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(size) : null;
    if (ro) ro.observe(el); else window.addEventListener('resize', size);
    const stage = {
      renderer, labels, ctx, el,
      get w() { return w; }, get h() { return h; },
      start(frame) {
        size();
        const loop = (now) => {
          if (!alive) return;
          raf = requestAnimationFrame(loop);
          if (document.hidden) { last = now; return; }
          // dấu thời gian rAF có thể sớm hơn lúc tạo stage → kẹp về 0
          const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
          last = now;
          const t = Math.max(0, (now - t0) / 1000);
          for (const f of ctx.anim) f(t, dt);
          frame(t, dt);
        };
        raf = requestAnimationFrame(loop);
      },
      dispose(scene) {
        alive = false;
        cancelAnimationFrame(raf);
        if (ro) ro.disconnect(); else window.removeEventListener('resize', size);
        if (scene) disposeTree(scene);
        renderer.dispose();
        try { renderer.forceContextLoss(); } catch (e) { /* ignore */ }
        renderer.domElement.remove();
        labels.remove();
      },
    };
    return stage;
  }
  // Place `root` on a QR marker: centre, in-plane angle, size, and a tilt from the marker's foreshortening.
  function applyMarkerPose(root, inner, pose, w, h, k) {
    const s = Math.hypot(pose.ux, pose.uy) || 1;
    const r = Math.min(1, Math.hypot(pose.vx, pose.vy) / s);
    root.position.set(pose.cx, -pose.cy, 0);
    root.rotation.set(0, 0, Math.atan2(-pose.uy, pose.ux));
    root.scale.setScalar(s * k);
    inner.rotation.x = Math.min(1.15, Math.max(0.35, Math.asin(Math.max(0.2, r))));
    return s * k;
  }
  function orthoFor(w, h) {
    const cam = new THREE.OrthographicCamera(0, w, 0, -h, -100000, 100000);
    cam.position.z = 1000;
    return cam;
  }
  function lights(scene, strength) {
    scene.add(new THREE.HemisphereLight(0xf6f2e2, 0x4a3b28, 0.95 * (strength || 1)));
    const d = new THREE.DirectionalLight(0xfff2d6, 0.75 * (strength || 1));
    d.position.set(0.6, 1, 0.8);
    scene.add(d);
  }

  // ---------- AR object anchored to a station marker ----------
  function createARObject(el, opts) {
    const stage = makeStage(el, true);
    const ctx = stage.ctx;
    ctx.ar = true;
    const scene = new THREE.Scene();
    lights(scene, 1.1);
    const root = new THREE.Group(), inner = new THREE.Group(), spin = new THREE.Group();
    const meta = STATIONS[opts.id] || STATIONS['nap-ham'];
    ctx.autoOpen = true;
    spin.add(meta.build(ctx));
    inner.add(spin);
    root.add(inner);
    scene.add(root);
    let cam = orthoFor(1, 1), live = false, pose = null;
    stage.onResize = (w, h) => { cam = orthoFor(w, h); };
    stage.start((t) => {
      let px;
      if (pose) {
        px = applyMarkerPose(root, inner, pose, stage.w, stage.h, 0.72);
        spin.rotation.y = 0;
      } else {
        const s = Math.min(stage.w, stage.h) * 0.32;
        px = applyMarkerPose(root, inner, { cx: stage.w * 0.5, cy: stage.h * 0.44, ux: s, uy: 0, vx: 0, vy: s * 0.62 }, stage.w, stage.h, 0.95);
        spin.rotation.y = t * 0.45;
      }
      root.visible = !!pose || !live;
      for (const p of ctx.points) p.m.size = p.base * px;
      stage.renderer.render(scene, cam);
    });
    return {
      setLive(v) { live = !!v; if (!live) pose = null; },
      setPose(p) { pose = p || null; },
      dispose() { stage.dispose(scene); },
    };
  }

  // ---------- interactive 3D tunnel map ----------
  const L = { surface: 0, l1: -1.5, l2: -3, l3: -4.5 };
  const MAP_POS = {
    'nap-ham': [-6, 0, -1.5], 'lo-thong-hoi': [-3, 0.62, -3], 'bep-hoang-cam': [-1.2, L.l1, -1],
    'long-dia-dao': [3.9, L.l2, 1.0], 'dau-tich': [5.4, 0, -2.4], 'loi-rung': [6.8, 0, 1.8],
  };
  const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  function tube(points, r, material, closed) {
    const c = new THREE.CatmullRomCurve3(points.map(V), !!closed, 'centripetal');
    return new THREE.Mesh(new THREE.TubeGeometry(c, Math.max(24, points.length * 16), r, 10, false), material);
  }
  function createMap(el, opts) {
    const stage = makeStage(el, true);
    const ctx = stage.ctx;
    ctx.mini = true;
    ctx.autoOpen = true;
    const scene = new THREE.Scene();
    const bg = new THREE.Color(0xe3e1d0);
    scene.background = bg;
    scene.fog = new THREE.Fog(0xe3e1d0, 30, 62);
    lights(scene);
    const world = new THREE.Group(), inner = new THREE.Group(), root = new THREE.Group();
    inner.add(world);
    root.add(inner);
    scene.add(root);
    const layers = { surface: new THREE.Group(), l1: new THREE.Group(), l2: new THREE.Group(), l3: new THREE.Group(), route: new THREE.Group() };
    Object.values(layers).forEach((g) => world.add(g));

    // mặt đất & khối đất cắt ngang
    const surf = mesh(new THREE.BoxGeometry(17, 0.12, 9.5), std(COL.grass, { transparent: true, opacity: 0.5, depthWrite: false }), 0.4, -0.06, 0);
    layers.surface.add(surf);
    const soilBox = new THREE.BoxGeometry(17, 5.2, 9.5);
    const soilMesh = mesh(soilBox, new THREE.MeshStandardMaterial({ color: COL.soil, transparent: true, opacity: 0.07, depthWrite: false }), 0.4, -2.72, 0);
    world.add(soilMesh);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(soilBox), new THREE.LineBasicMaterial({ color: 0x6b5a3a, transparent: true, opacity: 0.45 }));
    edges.position.copy(soilMesh.position);
    world.add(edges);
    [L.l1, L.l2, L.l3].forEach((y, i) => {
      const loop = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([V([-8.1, y, -4.75]), V([8.9, y, -4.75]), V([8.9, y, 4.75]), V([-8.1, y, 4.75])]), new THREE.LineDashedMaterial({ color: 0x6b5a3a, dashSize: 0.3, gapSize: 0.25, transparent: true, opacity: 0.5 }));
      loop.computeLineDistances();
      layers['l' + (i + 1)].add(loop);
    });
    // cây trên mặt đất
    const r = rng(42);
    const near = (x, z) => Object.values(MAP_POS).some((p) => Math.hypot(p[0] - x, p[2] - z) < 1.3);
    for (let i = 0; i < 46; i++) {
      const x = -7.6 + r() * 15.6, z = -4.2 + r() * 8.4;
      if (near(x, z)) continue;
      const t = tree(ctx, r, 0.7 + r() * 0.6, x > 5.6 && z > 0.4 ? 'rubber' : 'jungle');
      t.position.set(x, 0, z);
      layers.surface.add(t);
    }
    // vật thể nhỏ tại các trạm trên mặt đất
    const place = (id, s, y) => {
      const o = STATIONS[id].build(ctx);
      const p = MAP_POS[id];
      o.scale.setScalar(s);
      o.position.set(p[0], y === undefined ? 0 : y, p[2]);
      layers.surface.add(o);
      return o;
    };
    place('nap-ham', 0.9);
    place('lo-thong-hoi', 0.65);
    place('dau-tich', 1.15);
    place('loi-rung', 1.05);

    const clay = new THREE.MeshStandardMaterial({ color: 0xc49a64, emissive: 0x3a2410, emissiveIntensity: 0.35, roughness: 0.8 });
    const clayDeep = new THREE.MeshStandardMaterial({ color: 0xa47c50, emissive: 0x2a180a, emissiveIntensity: 0.3, roughness: 0.85 });
    // Tầng 1: lối vào → lỗ thông hơi → bếp → nối tầng 2
    layers.l1.add(tube([[-6, -0.05, -1.5], [-6, L.l1, -1.5]], 0.12, clay));
    layers.l1.add(tube([[-6, L.l1, -1.5], [-4.5, L.l1, -2.2], [-3, L.l1, -2.6], [-1.2, L.l1, -1], [0.8, L.l1, -0.2], [2.6, L.l1, 0.6]], 0.17, clay));
    layers.l1.add(tube([[-3, 0.1, -3], [-3, -0.8, -2.85], [-3, L.l1, -2.6]], 0.07, clay));
    const chamber = mesh(new THREE.SphereGeometry(1, 18, 12), new THREE.MeshStandardMaterial({ color: 0xc49a64, transparent: true, opacity: 0.38, depthWrite: false }), -1.2, L.l1 + 0.15, -1);
    chamber.scale.set(0.95, 0.55, 0.8);
    layers.l1.add(chamber);
    ctx.indoor = true;
    const stove = STATIONS['bep-hoang-cam'].build(ctx);
    ctx.indoor = false;
    stove.scale.setScalar(0.55);
    stove.position.set(-1.2, L.l1 - 0.25, -1);
    layers.l1.add(stove);
    const ducts = [
      [[-1.2, L.l1 + 0.1, -1.4], [-0.4, -0.9, -1.9], [0.6, -0.25, -2.4], [0.6, 0, -2.4]],
      [[-1.2, L.l1 + 0.1, -0.6], [-0.9, -0.8, 0.2], [-0.4, -0.25, 1.2], [-0.4, 0, 1.2]],
    ];
    ducts.forEach((d, i) => {
      layers.l1.add(tube(d, 0.05, new THREE.MeshStandardMaterial({ color: 0x9a7a55, roughness: 1 })));
      const end = d[d.length - 1];
      layers.surface.add(emitter(ctx, {
        count: 24, color: COL.smoke, size: 0.5, opacity: 0.14, life: [3, 5], seed: 60 + i, wobble: 0.08,
        spawn: (q, v, rr) => { q[0] = end[0]; q[1] = 0.05; q[2] = end[2]; v[0] = (rr() - 0.5) * 0.2; v[1] = 0.05 + rr() * 0.08; v[2] = (rr() - 0.5) * 0.2; },
      }));
    });
    layers.l1.add(tube([[2.6, L.l1, 0.6], [3.0, -2.3, 1.0], [3.2, L.l2, 1.4]], 0.12, clay));
    // Tầng 2: lòng địa đạo → lối ra
    layers.l2.add(tube([[-2.5, L.l2, 1.8], [0, L.l2, 2.4], [1.8, L.l2, 2.0], [3.2, L.l2, 1.4], [3.9, L.l2, 1.0], [4.6, L.l2, 0.2]], 0.17, clay));
    layers.l2.add(tube([[4.6, L.l2, 0.2], [4.6, -0.05, 0.2]], 0.11, clay));
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xffc35a });
    const lamps = [];
    [[-1.6, 2.15], [0.4, 2.4], [2.2, 1.85], [3.6, 1.2]].forEach(([x, z]) => {
      const lm = mesh(new THREE.SphereGeometry(0.07, 8, 6), lampMat, x, L.l2 + 0.22, z);
      lamps.push(lm);
      layers.l2.add(lm);
    });
    ctx.anim.push((t) => lamps.forEach((lm, i) => lm.scale.setScalar(0.85 + 0.25 * Math.abs(Math.sin(t * 3 + i * 1.7)))));
    // Tầng 3: tầng sâu
    layers.l3.add(tube([[0, L.l2, 2.4], [-0.4, -3.8, 1.8], [-0.6, L.l3, 1.2], [1.6, L.l3, 0.4]], 0.14, clayDeep));
    const deep = mesh(new THREE.SphereGeometry(1, 14, 10), new THREE.MeshStandardMaterial({ color: 0xa47c50, transparent: true, opacity: 0.35, depthWrite: false }), 1.8, L.l3 + 0.1, 0.3);
    deep.scale.set(0.7, 0.4, 0.55);
    layers.l3.add(deep);

    // đường hành trình: một đốm sáng đi qua sáu trạm theo thứ tự câu chuyện
    const route = new THREE.CatmullRomCurve3([
      [-6, 0.3, -1.5], [-6, L.l1, -1.5], [-4.5, L.l1, -2.2], [-3, L.l1, -2.6], [-1.2, L.l1, -1], [0.8, L.l1, -0.2], [2.6, L.l1, 0.6],
      [3.0, -2.3, 1.0], [3.2, L.l2, 1.4], [3.9, L.l2, 1.0], [4.6, L.l2, 0.2], [4.6, 0.3, 0.2], [5.1, 0.3, -1.3], [5.4, 0.3, -2.4],
      [6.4, 0.3, -0.8], [6.8, 0.3, 1.8],
    ].map(V), false, 'centripetal');
    const routeLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(route.getSpacedPoints(300)), new THREE.LineDashedMaterial({ color: 0xb5543a, dashSize: 0.18, gapSize: 0.12 }));
    routeLine.computeLineDistances();
    layers.route.add(routeLine);
    const walker = mesh(new THREE.SphereGeometry(0.16, 14, 10), new THREE.MeshBasicMaterial({ color: 0xffd36b }));
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTexture(), color: 0xffc35a, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.scale.setScalar(1.1);
    walker.add(glow);
    layers.route.add(walker);
    ctx.anim.push((t) => { walker.position.copy(route.getPointAt((t / 26) % 1)); });

    // điểm trạm (chạm để chọn) + nhãn HTML
    const pins = {}, hits = [];
    const pinMat = () => new THREE.MeshStandardMaterial({ color: COL.gold, emissive: 0x6a4a18, emissiveIntensity: 0.5 });
    Object.entries(MAP_POS).forEach(([id, p]) => {
      const g = new THREE.Group();
      g.position.set(p[0], p[1] + (p[1] < -0.1 ? 0.55 : 1.1), p[2]);
      const head = mesh(new THREE.SphereGeometry(0.2, 16, 12), pinMat());
      const ring = mesh(new THREE.TorusGeometry(0.34, 0.03, 8, 28), new THREE.MeshBasicMaterial({ color: 0xb5543a, transparent: true, opacity: 0.8 }));
      ring.rotation.x = Math.PI / 2;
      ring.visible = false;
      const stem = mesh(new THREE.CylinderGeometry(0.02, 0.02, p[1] < -0.1 ? 0.5 : 1.0, 6), new THREE.MeshBasicMaterial({ color: 0x6b5a3a }), 0, p[1] < -0.1 ? -0.27 : -0.52, 0);
      const hit = mesh(new THREE.SphereGeometry(0.55, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
      hit.userData.id = id;
      g.add(head, ring, stem, hit);
      world.add(g);
      hits.push(hit);
      const label = document.createElement('button');
      label.type = 'button';
      label.className = 'c3d-label';
      label.dataset.id = id;
      label.innerHTML = `<b>${STATIONS[id].code}</b> ${STATIONS[id].short}`;
      label.addEventListener('click', (e) => { e.stopPropagation(); select(id, true); });
      stage.labels.appendChild(label);
      pins[id] = { g, head, ring, label, layer: p[1] < -2 ? 'l2' : p[1] < -0.1 ? 'l1' : 'surface' };
    });
    ctx.anim.push((t) => Object.values(pins).forEach((p) => { if (p.ring.visible) p.ring.scale.setScalar(1 + 0.15 * Math.sin(t * 4)); }));
    const depthLabels = [['Mặt đất', 0], ['Tầng 1 · ~3 m', L.l1], ['Tầng 2 · ~6 m', L.l2], ['Tầng 3 · 8–12 m', L.l3]].map(([text, y], i) => {
      const d = document.createElement('span');
      d.className = 'c3d-depth';
      d.textContent = text;
      stage.labels.appendChild(d);
      return { d, pos: V([-8.1, y + 0.15, 4.75]), layer: ['surface', 'l1', 'l2', 'l3'][i] };
    });

    // điều khiển: kéo để xoay, chụm/cuộn để phóng, chạm để chọn
    const orbit = { theta: -0.55, phi: 1.02, radius: 18, target: V([0.6, -1.7, 0]) };
    const goal = { theta: orbit.theta, phi: orbit.phi, radius: orbit.radius, target: orbit.target.clone() };
    const persp = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
    let ortho = orthoFor(1, 1), arPose = null, arLive = false, selected = null, fitR = 18, touched = false;
    stage.onResize = (w, h) => {
      persp.aspect = w / h; persp.updateProjectionMatrix(); ortho = orthoFor(w, h);
      // khung dọc (điện thoại) cần lùi camera để thấy trọn mô hình
      fitR = Math.max(18, Math.min(34, 25 / Math.min(1, persp.aspect)));
      if (!touched) { goal.radius = fitR; orbit.radius = fitR; }
    };
    const ptrs = new Map();
    let downAt = null, pinch = 0;
    const cvs = stage.renderer.domElement;
    cvs.style.touchAction = 'none';
    const onDown = (e) => { touched = true; ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); downAt = { x: e.clientX, y: e.clientY, t: performance.now() }; cvs.setPointerCapture && cvs.setPointerCapture(e.pointerId); };
    const onMove = (e) => {
      if (!ptrs.has(e.pointerId) || arPose) return;
      const prev = ptrs.get(e.pointerId);
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) goal.radius = Math.max(7, Math.min(40, goal.radius * (pinch / d)));
        pinch = d;
        return;
      }
      goal.theta -= (e.clientX - prev.x) * 0.008;
      goal.phi = Math.max(0.25, Math.min(1.5, goal.phi - (e.clientY - prev.y) * 0.006));
    };
    const onUp = (e) => {
      ptrs.delete(e.pointerId);
      if (ptrs.size < 2) pinch = 0;
      if (downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 7 && performance.now() - downAt.t < 450) pick(e);
      downAt = null;
    };
    const onWheel = (e) => { e.preventDefault(); touched = true; goal.radius = Math.max(7, Math.min(40, goal.radius * (1 + Math.sign(e.deltaY) * 0.1))); };
    cvs.addEventListener('pointerdown', onDown);
    cvs.addEventListener('pointermove', onMove);
    cvs.addEventListener('pointerup', onUp);
    cvs.addEventListener('pointercancel', onUp);
    cvs.addEventListener('wheel', onWheel, { passive: false });
    const ray = new THREE.Raycaster();
    function pick(e) {
      const rect = cvs.getBoundingClientRect();
      const m = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      ray.setFromCamera(m, arPose ? ortho : persp);
      const hit = ray.intersectObjects(hits.filter((hh) => hh.parent.visible), false)[0];
      if (hit) select(hit.object.userData.id, true);
    }
    function select(id, notify) {
      selected = id;
      Object.entries(pins).forEach(([k, p]) => {
        const on = k === id;
        p.ring.visible = on;
        p.head.material.color.setHex(on ? 0xb5543a : COL.gold);
        p.head.scale.setScalar(on ? 1.35 : 1);
        p.label.classList.toggle('active', on);
      });
      if (id && MAP_POS[id]) {
        goal.target.copy(V(MAP_POS[id]));
        goal.radius = Math.min(goal.radius, 12);
      }
      if (notify && opts.onSelect) opts.onSelect(id);
    }
    const tmp = new THREE.Vector3();
    stage.start(() => {
      const k = 0.12;
      orbit.theta += (goal.theta - orbit.theta) * k;
      orbit.phi += (goal.phi - orbit.phi) * k;
      orbit.radius += (goal.radius - orbit.radius) * k;
      orbit.target.lerp(goal.target, k);
      let cam = persp, px = 1;
      if (arPose) {
        scene.background = null;
        scene.fog = null;
        world.position.set(-0.4, 1.6, 0);
        px = applyMarkerPose(root, inner, arPose, stage.w, stage.h, 3.4 / 17);
        root.visible = true;
        cam = ortho;
      } else {
        scene.background = arLive ? null : bg;
        scene.fog = arLive ? null : scene.fog || new THREE.Fog(0xe3e1d0, 30, 62);
        world.position.set(0, 0, 0);
        root.position.set(0, 0, 0); root.rotation.set(0, 0, 0); root.scale.setScalar(1); inner.rotation.set(0, 0, 0);
        root.visible = !arLive;
        persp.position.set(
          orbit.target.x + orbit.radius * Math.sin(orbit.phi) * Math.sin(orbit.theta),
          orbit.target.y + orbit.radius * Math.cos(orbit.phi),
          orbit.target.z + orbit.radius * Math.sin(orbit.phi) * Math.cos(orbit.theta),
        );
        persp.lookAt(orbit.target);
      }
      for (const p of ctx.points) p.m.size = arPose ? p.base * px : p.base;
      stage.renderer.render(scene, cam);
      // nhãn HTML theo điểm 3D
      scene.updateMatrixWorld();
      const place = (el2, worldPos, visible) => {
        tmp.copy(worldPos).project(cam);
        const on = visible && root.visible && tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1;
        el2.style.display = on ? '' : 'none';
        if (on) el2.style.transform = `translate(${((tmp.x + 1) / 2) * stage.w}px, ${((1 - tmp.y) / 2) * stage.h}px) translate(-50%, -130%)`;
        return on ? ((1 - tmp.y) / 2) * stage.h : null;
      };
      Object.values(pins).forEach((p) => place(p.label, p.head.getWorldPosition(new THREE.Vector3()), layers[p.layer].visible));
      // nhãn độ sâu: nhìn từ trên xuống thì các tầng chồng lên nhau, chỉ giữ nhãn không đè nhau
      let lastY = -1e9;
      depthLabels.forEach((d) => {
        const y = place(d.d, world.localToWorld(d.pos.clone()), layers[d.layer].visible && !arPose);
        if (y === null) return;
        if (y - lastY < 22) d.d.style.display = 'none'; else lastY = y;
      });
    });
    return {
      select: (id) => select(id, false),
      setLayer(name, on) { if (layers[name]) layers[name].visible = !!on; Object.values(pins).forEach((p) => { p.g.visible = layers[p.layer].visible; }); },
      setRoute(on) { layers.route.visible = !!on; },
      setAR(pose, live) { arPose = pose || null; arLive = !!live; },
      reset() { goal.theta = -0.55; goal.phi = 1.02; goal.radius = fitR; goal.target.set(0.6, -1.7, 0); select(null, true); },
      dispose() {
        cvs.removeEventListener('wheel', onWheel);
        stage.dispose(scene);
      },
    };
  }

  // ---------- VR scenes (first person) ----------
  const HOT = {
    'nap-ham': [
      { p: [0, 0.35, -1.9], t: 'Nắp hầm', d: 'Một nắp nhỏ phủ đất và lá, vừa đủ một người lách xuống. Chạm lần nữa để mở hoặc đóng nắp trong mô hình.', toggle: true },
      { p: [1.2, 0.15, -2.4], t: 'Lớp lá khô', d: 'Lá và màu đất làm đường viền của nắp gần như biến mất. So với ảnh tư liệu ở trạm này để thấy điều tương tự.' },
      { p: [-1.3, 0.5, -1.6], t: 'Đi đúng lối hướng dẫn', d: 'Tại di tích, chỉ xuống những lối đã mở cho khách và đi theo hướng dẫn viên.' },
    ],
    'lo-thong-hoi': [
      { p: [0, 1.0, -1.45], t: 'Miệng thông hơi', d: 'Một lỗ nhỏ trên ụ đất. Hãy quan sát hình dáng và vị trí của nó trước khi đọc chú thích.' },
      { p: [0.9, 0.5, -2.3], t: 'Hình dáng tự nhiên', d: 'Ụ đất lẫn vào cảnh rừng. Hình dáng tự nhiên khiến chi tiết này dễ bị bỏ qua.' },
      { p: [-0.9, 0.2, -1.8], t: 'Không khí cho tầng dưới', d: 'Lỗ thông hơi gợi đến nhu cầu trao đổi không khí của không gian dưới đất. Xem đường ống trên Bản đồ 3D.' },
    ],
    'bep-hoang-cam': [
      { p: [0, 0.62, -0.62], t: 'Bếp và ngọn lửa', d: 'Khu bếp Hoàng Cầm là nơi chuẩn bị bữa ăn. Hãy nhìn các vật dụng quanh bếp: chúng kể về nhịp sinh hoạt hằng ngày.' },
      { p: [0.9, 0.2, -1.6], t: 'Đường dẫn khói', d: 'Khói được dẫn qua rãnh dưới đất, tản ra và nguội dần, nên khi thoát lên chỉ còn mỏng như sương. Mô hình minh họa nguyên lý, không phải bản vẽ kỹ thuật.' },
      { p: [-0.28, 0.95, -0.95], t: 'Nồi cơm', d: 'Một bữa cơm là câu chuyện về chăm sóc và duy trì đời sống, không chỉ về chiến tranh.' },
      { p: [-1.6, 1.05, -0.9], t: 'Đèn dầu', d: 'Ánh sáng dưới lòng đất rất ít. Hãy để ý không gian thay đổi thế nào khi ánh sáng yếu đi.' },
    ],
    'long-dia-dao': [
      { u: 0.12, t: 'Trần thấp', d: 'Đường hầm hẹp và thấp. Khi không gian thu hẹp, cách quan sát của chúng ta cũng thay đổi.' },
      { u: 0.42, t: 'Đèn dầu', d: 'Mô tả ba điều bạn thực sự nhìn thấy trước khi nói về điều bạn tưởng tượng.' },
      { u: 0.68, t: 'Ngã rẽ', d: 'Đường hầm có nhiều nhánh. Khi tham quan thật, chỉ đi theo tuyến đã mở và hướng dẫn an toàn.' },
      { u: 0.95, t: 'Ánh sáng phía trước', d: 'Cuối đoạn hầm. Sơ đồ và mô hình này chỉ để tìm hiểu, không dùng để chỉ đường.' },
    ],
    'dau-tich': [
      { p: [0, -0.6, -6.5], t: 'Hố bom', d: 'Quan sát tỷ lệ của khoảng trũng so với cây cối và lối đi quanh nó.' },
      { p: [3.6, 1.6, -4.6], t: 'Cây mọc lại', d: 'Cảnh quan hôm nay vẫn giữ nhiều lớp ký ức hơn những gì ta thấy trong lần nhìn đầu.' },
      { p: [-1.6, 1.25, -1.6], t: 'Biển giới thiệu', d: 'Đối chiếu biển giới thiệu và tư liệu tại di tích giúp cách hiểu có căn cứ hơn.' },
    ],
    'loi-rung': [
      { p: [0, 0.2, -4], t: 'Lối đi dưới tán cây', d: 'Hành trình trở lại với lối đi dưới tán cây. Cùng một cảnh quan có thể gợi những câu hỏi khác lúc ban đầu.' },
      { p: [2.2, 2.4, -3], t: 'Hàng cây', d: 'Hãy chọn một chi tiết bạn muốn kể lại: chiếc nắp hầm, lỗ thông hơi, gian bếp hay đường đất.' },
      { p: [-1.4, 1.2, -2], t: 'Mang một câu chuyện về', d: 'Viết một ghi chú ngắn trong hộ chiếu. Phân biệt điều đã quan sát, điều được giải thích và cảm nhận riêng.' },
    ],
  };
  function forestEnv(ctx, scene, o) {
    scene.background = new THREE.Color(0xbfc9a8);
    scene.fog = new THREE.Fog(0xbfc9a8, 7, 30);
    scene.add(new THREE.HemisphereLight(0xe8f0d0, 0x4a3b28, 0.9));
    const sun = new THREE.DirectionalLight(0xfff0cc, 0.8);
    sun.position.set(4, 10, 3);
    scene.add(sun);
    const ground = mesh(new THREE.PlaneGeometry(80, 80).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x6b5a3a, roughness: 1 }), 0, -0.01, 0);
    scene.add(ground);
    scene.add(leafCarpet(ctx, 1600, 14, 0.0, o.seed || 3, o.avoid, 0.09));
    const r = rng(o.seed || 3);
    const n = o.trees || 60;
    for (let i = 0; i < n; i++) {
      let x, z;
      if (o.rows) {
        const row = i % 2 ? 1 : -1, k = Math.floor(i / 2);
        x = row * (1.6 + (k % 2) * 2.4) + (r() - 0.5) * 0.2;
        z = 2 - k * 2.2;
      } else {
        const a = r() * Math.PI * 2, d = 3 + r() * 22;
        x = Math.cos(a) * d; z = Math.sin(a) * d;
        if (o.clear && o.clear(x, z)) continue;
      }
      const t = tree(ctx, r, o.rows ? 7 + r() * 2 : 6 + r() * 6, o.rows ? 'rubber' : 'jungle');
      t.position.set(x, 0, z);
      scene.add(t);
    }
    for (let i = 0; i < 5; i++) {
      const beam = mesh(new THREE.CylinderGeometry(0.3, 1.2, 12, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff1c4, transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), -6 + i * 3 + r(), 5, -6 - r() * 6);
      beam.rotation.z = 0.25;
      scene.add(beam);
    }
    scene.add(emitter(ctx, {
      count: 50, color: COL.leafDry, size: 0.07, opacity: 0.9, life: [5, 9], seed: 77, wobble: 0.25,
      spawn: (q, v, rr) => { q[0] = (rr() - 0.5) * 12; q[1] = 4 + rr() * 3; q[2] = -rr() * 10; v[1] = -0.4 - rr() * 0.3; },
    }));
    scene.add(emitter(ctx, {
      count: 70, color: 0xfff3cf, size: 0.035, opacity: 0.6, life: [4, 8], seed: 78, additive: true, wobble: 0.05,
      spawn: (q, v, rr) => { q[0] = (rr() - 0.5) * 8; q[1] = 0.5 + rr() * 3; q[2] = -1 - rr() * 6; v[0] = (rr() - 0.5) * 0.05; v[1] = (rr() - 0.5) * 0.03; },
    }));
  }
  function chamberEnv(ctx, scene) {
    scene.background = new THREE.Color(0x1a120a);
    scene.fog = new THREE.Fog(0x1a120a, 3, 9);
    scene.add(new THREE.AmbientLight(0xffe2b8, 0.42));
    scene.add(new THREE.HemisphereLight(0xffd9a8, 0x2a1c10, 0.45));
    const tex = earthTexture('#7a5a3a', 4);
    tex.repeat.set(3, 1.5);
    const room = mesh(new THREE.BoxGeometry(4.4, 2.0, 3.8), new THREE.MeshStandardMaterial({ map: tex, side: THREE.BackSide, roughness: 1 }), 0, 1.0, -0.6);
    scene.add(room);
    const wood = std(COL.woodDark);
    [[-2.1, -2.4], [2.1, -2.4], [-2.1, 1.2], [2.1, 1.2]].forEach(([x, z]) => scene.add(mesh(new THREE.BoxGeometry(0.12, 2.0, 0.12), wood, x, 1.0, z)));
    [-2.4, 1.2].forEach((z) => scene.add(mesh(new THREE.BoxGeometry(4.3, 0.12, 0.12), wood, 0, 1.94, z)));
    // hốc đèn dầu trên vách
    scene.add(mesh(new THREE.BoxGeometry(0.4, 0.3, 0.2), new THREE.MeshBasicMaterial({ color: 0x0c0804 }), -2.1, 1.0, -0.9));
    const lamp = oilLamp(ctx, 1.4, true);
    lamp.position.set(-1.98, 0.86, -0.9);
    scene.add(lamp);
    // củi và chum nước
    const logs = std(COL.bark);
    for (let i = 0; i < 6; i++) {
      const l = mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.7, 7), logs, 1.4 + (i % 3) * 0.12, 0.06 + Math.floor(i / 3) * 0.1, -2.0);
      l.rotation.z = Math.PI / 2;
      scene.add(l);
    }
    scene.add(mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.5, 14), std(0x6d4c32), -1.4, 0.25, -2.0));
    // hai miệng rãnh khói chui vào vách
    [0.94, -1.02].forEach((x) => scene.add(mesh(new THREE.CircleGeometry(0.1, 14), new THREE.MeshBasicMaterial({ color: 0x050302 }), x, 0.09, -2.49)));
  }
  function createVR(el, opts) {
    const stage = makeStage(el, false);
    const ctx = stage.ctx;
    const id = STATIONS[opts.scene] ? opts.scene : 'nap-ham';
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(70, 1, 0.03, 120);
    const eyeL = new THREE.PerspectiveCamera(70, 1, 0.03, 120), eyeR = new THREE.PerspectiveCamera(70, 1, 0.03, 120);
    let base = { pos: V([0, 1.5, 0]), yaw: 0, pitch: -0.25 };
    let curve = null, u = 0, walk = 0, center = null;
    if (id === 'nap-ham' || id === 'lo-thong-hoi') {
      forestEnv(ctx, scene, { seed: id === 'nap-ham' ? 3 : 9, clear: (x, z) => Math.hypot(x, z + 2) < 2.4 });
      ctx.autoOpen = false;
      center = STATIONS[id].build(ctx);
      center.scale.setScalar(id === 'nap-ham' ? 1.7 : 1.9);
      center.position.set(0, 0, id === 'nap-ham' ? -1.9 : -2.0);
      scene.add(center);
      base.pitch = -0.42;
    } else if (id === 'bep-hoang-cam') {
      chamberEnv(ctx, scene);
      ctx.indoor = true;
      center = STATIONS[id].build(ctx);
      center.scale.setScalar(1.7);
      center.position.set(0, 0, -0.8);
      scene.add(center);
      base = { pos: V([0, 1.15, 1.0]), yaw: 0, pitch: -0.32 };
    } else if (id === 'long-dia-dao') {
      scene.background = new THREE.Color(0x120c06);
      scene.fog = new THREE.Fog(0x120c06, 3, 14);
      scene.add(new THREE.AmbientLight(0xffe2b8, 0.3));
      scene.add(new THREE.HemisphereLight(0xffd9a8, 0x2a1c10, 0.35));
      curve = new THREE.CatmullRomCurve3([[0, 0.55, 2], [0, 0.55, -4], [1.4, 0.45, -9], [0.6, 0.5, -14], [-1.2, 0.45, -18], [-0.4, 0.55, -24], [1.2, 0.6, -28]].map(V), false, 'centripetal');
      const tex = earthTexture('#7a5a3a', 6);
      tex.repeat.set(30, 2);
      const tunnelGeo = new THREE.TubeGeometry(curve, 260, 0.62, 12, false);
      scene.add(new THREE.Mesh(tunnelGeo, new THREE.MeshStandardMaterial({ map: tex, side: THREE.BackSide, roughness: 1 })));
      [0.1, 0.3, 0.5, 0.72, 0.9].forEach((k, i) => {
        const p = curve.getPointAt(k), tan = curve.getTangentAt(k), side = new THREE.Vector3(-tan.z, 0, tan.x).normalize().multiplyScalar(i % 2 ? 0.48 : -0.48);
        const lamp = oilLamp(ctx, 0.9, true);
        lamp.position.copy(p).add(side);
        lamp.position.y -= 0.12;
        scene.add(lamp);
      });
      [0.32, 0.68].forEach((k, i) => {
        const p = curve.getPointAt(k), tan = curve.getTangentAt(k), side = new THREE.Vector3(-tan.z, 0, tan.x).normalize().multiplyScalar(i ? 0.6 : -0.6);
        const branch = mesh(new THREE.CircleGeometry(0.34, 16), new THREE.MeshBasicMaterial({ color: 0x050302 }));
        branch.position.copy(p).add(side);
        branch.lookAt(p);
        scene.add(branch);
      });
      const exitLight = mesh(new THREE.CircleGeometry(0.6, 20), new THREE.MeshBasicMaterial({ color: 0xfff1c4 }));
      exitLight.position.copy(curve.getPointAt(1));
      exitLight.lookAt(curve.getPointAt(0.98));
      scene.add(exitLight);
      base.pitch = 0;
    } else if (id === 'dau-tich') {
      forestEnv(ctx, scene, { seed: 12, trees: 50, clear: (x, z) => Math.hypot(x, z + 6.5) < 6.6, avoid: (x, z) => Math.hypot(x, z + 6.5) < 5 });
      center = STATIONS[id].build(ctx);
      center.scale.setScalar(5);
      center.position.set(0, 0, -6.5);
      scene.add(center);
      const post = std(COL.woodDark);
      scene.add(mesh(new THREE.BoxGeometry(0.08, 1.1, 0.08), post, -1.6, 0.55, -1.6));
      const board = mesh(new THREE.BoxGeometry(0.7, 0.42, 0.04), std(0xe8dfc4), -1.6, 1.2, -1.6);
      board.rotation.y = 0.5;
      scene.add(board);
      base = { pos: V([0, 1.6, 0]), yaw: 0, pitch: -0.3 };
    } else {
      forestEnv(ctx, scene, { seed: 21, rows: true, trees: 40, avoid: (x) => Math.abs(x) < 0.6 });
      scene.add(mesh(new THREE.PlaneGeometry(1.2, 80).rotateX(-Math.PI / 2), std(0xb59a6f), 0, 0.002, -30));
      base.pitch = -0.08;
    }
    // điểm sáng chạm được
    const spots = (HOT[id] || []).map((h, i) => {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: numberTexture(i + 1), transparent: true, depthTest: false }));
      const pos = h.u !== undefined && curve ? curve.getPointAt(h.u).add(V([0, 0.12, 0])) : V(h.p);
      sp.position.copy(pos);
      sp.scale.setScalar(h.u !== undefined ? 0.16 : 0.32);
      sp.renderOrder = 10;
      sp.userData.index = i;
      scene.add(sp);
      return sp;
    });
    ctx.anim.push((t) => spots.forEach((s, i) => { const k = (spots[i].userData.baseScale = spots[i].userData.baseScale || s.scale.x); s.scale.setScalar(k * (1 + 0.08 * Math.sin(t * 3 + i))); }));

    let yaw = base.yaw, pitch = base.pitch, gyro = false, stereo = false;
    const devQ = new THREE.Quaternion(), qx = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)), zee = new THREE.Vector3(0, 0, 1), eul = new THREE.Euler(), q0 = new THREE.Quaternion();
    const onOrient = (e) => {
      if (e.alpha === null) return;
      const orient = ((screen.orientation && screen.orientation.angle) || window.orientation || 0) * (Math.PI / 180);
      eul.set(e.beta * (Math.PI / 180), e.alpha * (Math.PI / 180), -e.gamma * (Math.PI / 180), 'YXZ');
      devQ.setFromEuler(eul);
      devQ.multiply(qx);
      devQ.multiply(q0.setFromAxisAngle(zee, -orient));
    };
    stage.onResize = (w, h) => {
      cam.aspect = w / h; cam.updateProjectionMatrix();
      eyeL.aspect = eyeR.aspect = w / 2 / h; eyeL.updateProjectionMatrix(); eyeR.updateProjectionMatrix();
    };
    const cvs = stage.renderer.domElement;
    cvs.style.touchAction = 'none';
    let drag = null;
    const ray = new THREE.Raycaster();
    cvs.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now() }; cvs.setPointerCapture && cvs.setPointerCapture(e.pointerId); });
    cvs.addEventListener('pointermove', (e) => {
      if (!drag) return;
      yaw += (e.clientX - drag.x) * 0.005;
      if (!gyro) pitch = Math.max(-1.3, Math.min(1.1, pitch + (e.clientY - drag.y) * 0.004));
      drag.x = e.clientX; drag.y = e.clientY;
    });
    const up = (e) => {
      if (drag && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 7 && performance.now() - drag.t < 450) {
        const rect = cvs.getBoundingClientRect();
        let mx = ((e.clientX - rect.left) / rect.width) * 2 - 1, camUsed = cam;
        if (stereo) { camUsed = mx < 0 ? eyeL : eyeR; mx = mx < 0 ? mx * 2 + 1 : mx * 2 - 1; }
        ray.setFromCamera(new THREE.Vector2(mx, -((e.clientY - rect.top) / rect.height) * 2 + 1), camUsed);
        const hit = ray.intersectObjects(spots, false)[0];
        if (hit) activate(hit.object.userData.index);
      }
      drag = null;
    };
    cvs.addEventListener('pointerup', up);
    cvs.addEventListener('pointercancel', () => { drag = null; });
    function activate(i) {
      const h = (HOT[id] || [])[i];
      if (!h) return;
      if (h.toggle && center && center.userData.toggle) center.userData.toggle();
      if (h.u !== undefined && curve) u = Math.max(0, h.u - 0.06);
      if (opts.onHotspot) opts.onHotspot(h, i);
    }
    const yq = new THREE.Quaternion(), yAxis = new THREE.Vector3(0, 1, 0), tmp = new THREE.Vector3();
    stage.start((t, dt) => {
      if (curve) {
        u = Math.max(0, Math.min(1, u + walk * dt * 0.035));
        const p = curve.getPointAt(Math.min(u, 0.995));
        cam.position.copy(p).add(V([0, 0.1, 0]));
        const tan = curve.getTangentAt(Math.min(u, 0.995));
        base.yaw = Math.atan2(-tan.x, -tan.z);
      } else {
        cam.position.copy(base.pos);
      }
      if (gyro) {
        yq.setFromAxisAngle(yAxis, yaw + (curve ? base.yaw : 0));
        cam.quaternion.copy(yq).multiply(devQ);
      } else {
        eul.set(pitch, yaw + (curve ? base.yaw : 0), 0, 'YXZ');
        cam.quaternion.setFromEuler(eul);
      }
      cam.updateMatrixWorld();
      const r = stage.renderer;
      if (stereo) {
        const w = stage.w, h = stage.h;
        r.setScissorTest(true);
        [[eyeL, -0.032, 0], [eyeR, 0.032, w / 2]].forEach(([e, off, x]) => {
          e.position.copy(cam.position).add(tmp.set(off, 0, 0).applyQuaternion(cam.quaternion));
          e.quaternion.copy(cam.quaternion);
          r.setViewport(x, 0, w / 2, h);
          r.setScissor(x, 0, w / 2, h);
          r.render(scene, e);
        });
        r.setScissorTest(false);
        r.setViewport(0, 0, w, h);
      } else {
        r.render(scene, cam);
      }
    });
    return {
      hotspots: HOT[id] || [],
      activate,
      async setGyro(on) {
        if (!on) { gyro = false; window.removeEventListener('deviceorientation', onOrient); return false; }
        try {
          if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            const res = await DeviceOrientationEvent.requestPermission();
            if (res !== 'granted') return false;
          }
        } catch (e) { return false; }
        if (typeof DeviceOrientationEvent === 'undefined') return false;
        window.addEventListener('deviceorientation', onOrient);
        gyro = true;
        yaw = 0;
        return true;
      },
      setStereo(on) { stereo = !!on; stage.onResize(stage.w, stage.h); },
      setWalk(dir) { walk = curve ? dir : 0; },
      canWalk: !!curve,
      dispose() { window.removeEventListener('deviceorientation', onOrient); stage.dispose(scene); },
    };
  }

  window.CuChi3D = { supported, createMap, createVR, createARObject, stations: STATIONS };
})();
