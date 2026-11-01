/* perbaikan.js — SIMPES Darul Arqam
   Dimuat SETELAH skrip utama di index.html. Isinya:
   1) Percepatan: tidak meminta ulang data setelah simpan, daftar aset tampil dari cache dulu,
      server "dibangunkan" saat halaman dibuka, bilah loading di atas layar.
   2) Dashboard baru, menu dikelompokkan dan lebih besar, tombol Tambah (barang / ruangan / gedung). */
(() => {
'use strict';
const css = `
#ld{position:fixed;top:0;left:0;right:0;height:3px;z-index:100;opacity:0;transition:opacity .2s;pointer-events:none;
  background:linear-gradient(90deg,transparent,var(--p2),transparent) no-repeat;background-size:40% 100%}
#ld.on{opacity:1;animation:ld 1s linear infinite}
@keyframes ld{from{background-position:-40% 0}to{background-position:140% 0}}
main{padding-bottom:8rem}

/* ---- menu: HP (bar bawah) ---- */
#nav{align-items:stretch;justify-content:space-around;gap:.1rem;padding:.35rem .4rem calc(.35rem + env(safe-area-inset-bottom));box-shadow:0 -8px 24px #0000000d}
#nav .nv{flex:1;flex-direction:column;gap:3px;padding:.5rem 0 .4rem;font-size:12px;border-radius:14px}
#nav .nv.on{color:var(--p);background:var(--pl)}#nav .nv.on::before{display:none}
#nav .nv.dx,#nav .ng,#nav .nv-add{display:none}
#nav [data-t=dash]{order:1}#nav [data-t=brg]{order:2}#nav .fab{order:3}#nav [data-t=pjm]{order:4}#nav .more{order:5}
#nav .fab{flex:none;width:58px;height:58px;padding:0;margin:-28px .3rem 0;border-radius:50%;justify-content:center;
  background:linear-gradient(135deg,var(--p2),var(--p));color:var(--pt);border:4px solid var(--bg);box-shadow:0 8px 20px #0f6b5c55}
#nav .nb{position:absolute;top:2px;left:calc(50% + 8px)}
/* ---- menu: laptop (sidebar berkelompok) ---- */
@media(min-width:900px){
 #nav{top:62px;bottom:0;right:auto;width:248px;flex-direction:column;justify-content:flex-start;gap:.15rem;padding:1rem .8rem;border-top:0;border-right:1px solid var(--bd);box-shadow:none;overflow-y:auto}
 #nav .nv{flex:none;flex-direction:row;justify-content:flex-start;gap:.8rem;padding:.75rem .9rem;font-size:15px;order:0!important}
 #nav .nv.dx{display:flex}
 #nav .ng{display:block;font-size:13px;font-weight:700;color:var(--mu);padding:1rem .9rem .3rem}
 #nav .nv-add{display:flex;justify-content:center;background:var(--p);color:var(--pt);font-weight:700;margin-bottom:.4rem}
 #nav .fab,#nav .more{display:none}
 #nav .nb{position:static;margin-left:auto}
 main{padding:1.4rem 1.5rem 2rem 288px}
}
/* ---- sheet menu & tambah ---- */
.mg{display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin-top:.6rem}.mg3{grid-template-columns:repeat(3,1fr)}
.mi{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:.5rem;padding:.9rem;border-radius:16px;border:1px solid var(--bd);background:var(--sf);cursor:pointer;font-weight:700;font-size:14px;text-align:left;color:var(--tx)}
.mi svg{color:var(--p)}.mi:hover{border-color:var(--p2);background:var(--pl)}
.nb2{position:absolute;top:8px;right:8px;background:var(--ac);color:#000;border-radius:9px;font-size:11px;padding:0 6px;font-weight:800}
/* ---- dashboard ---- */
.hero{padding:1.5rem 1.4rem}.hero h2{font-size:1.6rem;margin:.2rem 0}
.qk{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.7rem;margin-top:.8rem}
.qt{display:flex;flex-direction:column;align-items:flex-start;gap:.6rem;padding:.9rem;border-radius:18px;background:var(--sf);border:1px solid var(--bd);box-shadow:var(--sh);cursor:pointer;text-align:left;font-weight:700;font-size:15px;color:var(--tx)}
.qt:hover{border-color:var(--p2)}.qt small{display:block;font-weight:500;font-size:12px}
.qt .ic{width:46px;height:46px;border-radius:14px}
.kv .ic{margin-bottom:.6rem}.kv span{display:block;color:var(--mu);font-size:13px}.kv b{display:block;font-size:1.35rem;letter-spacing:-.02em;word-break:break-word}
.dnw{display:flex;gap:1.2rem;align-items:center;flex-wrap:wrap}.dn{width:150px;height:150px;flex:none}.dn text{fill:var(--tx);font-weight:800;text-anchor:middle}
.dnw .leg{flex:1;min-width:150px;grid-template-columns:1fr}
`;
const st = document.createElement('style'); st.textContent = css; document.body.appendChild(st);   // di akhir body agar menang atas gaya lama
const ldb = document.createElement('div'); ldb.id = 'ld'; document.body.appendChild(ldb);

/* ===== 1. PERCEPATAN ===== */
try { fetch(API, { mode: 'no-cors', cache: 'no-store' }).catch(() => {}); } catch (e) {}   // bangunkan server saat halaman dibuka

const _api = api, WRITE = /^(save|delete|adjust|pecah|terima|decide|ajukan|batal|pinjamAjukan|pinjamDecide|pinjamKembali)/;
let busy = 0;
api = async function (a, d, x, again) {
  busy++; ldb.className = 'on';
  try {
    const r = await _api(a, d, x, again);
    if (WRITE.test(a)) afterWrite(a, x, r);
    return r;
  } finally { if (!--busy) ldb.className = ''; }
};
function afterWrite(a, x, r) {
  Object.keys(sessionStorage).forEach(k => { if (k.startsWith('sp_b:')) sessionStorage.removeItem(k); });
  S._pt = Date.now();
  if ((a === 'saveBarang' || a === 'adjustStok') && r.rec) S._patch = [r.rec];
  else if (a === 'pecahKondisi' && r.recs) S._patch = r.recs;
  else if (a === 'saveGedung' && r.rec) S._mp = { g: r.rec };
  else if (a === 'saveRuangan' && r.rec) S._mp = { r: r.rec };
  else if (a === 'deleteGedung' && x) S._mp = { dg: x.id };
  else if (a === 'deleteRuangan' && x) S._mp = { dr: x.id };
}
const fresh = () => Date.now() - (S._pt || 0) < 4000;

/* gedung / ruangan: perbarui data lokal dari respons simpan, tanpa meminta ulang master */
const _reM = reM;
reM = async function () {
  const p = S._mp; S._mp = null;
  if (!p || !fresh()) return _reM();
  const up = (arr, o) => { const i = arr.findIndex(z => z.id === o.id); i >= 0 ? arr[i] = o : arr.push(o); };
  if (p.g) up(S.g, p.g);
  if (p.r) up(S.r, p.r);
  if (p.dg) S.g = S.g.filter(z => z.id !== p.dg);
  if (p.dr) S.r = S.r.filter(z => z.id !== p.dr);
  gM = new Map(S.g.map(g => [g.id, g])); rM = new Map(S.r.map(r => [r.id, r]));
};

/* daftar aset: tampil dari cache dulu, lalu disegarkan; setelah simpan, kartu langsung diperbarui di tempat */
const hasFilter = f => f.q || f.gedungId || f.ruanganId || f.kondisi || f.kategori;
function drawB() {
  const b = S._b, pages = Math.max(1, Math.ceil(b.total / b.pageSize)), f = S.f;
  $('#info').textContent = `${num(b.total)} jenis · ${num(b.unit)} unit · ${rp(b.nilai)}`;
  $('#lst').innerHTML = S.rows.map(card).join('') || '<div class="cd mu">Belum ada barang yang cocok. Ubah kata kunci atau filter, atau tekan + untuk menambah.</div>';
  $('#pg').innerHTML = pages > 1 ? `<button class="btn g" data-p="-1" ${f.page <= 1 ? 'disabled' : ''}>Sebelumnya</button><span class="mu">${f.page} / ${pages}</span><button class="btn g" data-p="1" ${f.page >= pages ? 'disabled' : ''}>Berikutnya</button>` : '';
}
let seq = 0;
async function fetchB(quiet) {
  const l = $('#lst'); if (!l) return;
  const f = S.f, key = 'sp_b:' + JSON.stringify(f), n = ++seq;
  let c = null;
  if (!quiet) { try { c = JSON.parse(sessionStorage.getItem(key)); } catch (e) {} }
  if (c) { S._b = c; S.rows = ex(c.data); drawB(); } else if (!quiet) l.style.opacity = .5;
  let r;
  try { r = await api('listBarang', f); }
  catch (x) { if ($('#lst')) $('#lst').style.opacity = 1; if (c || quiet) return toast(x.message, 1); throw x; }
  if (n !== seq || !$('#lst')) return;
  $('#lst').style.opacity = 1;
  try { sessionStorage.setItem(key, JSON.stringify(r)); } catch (e) {}
  S._b = r; S.rows = ex(r.data); drawB();
}
function applyPatch() {
  const f = S.f, recs = S._patch; S._patch = null;
  if (!recs || !fresh() || !$('#lst') || !S._b || hasFilter(f) || f.page > 1) return false;
  const top = f.sort === 'updatedAt' && f.dir === 'desc';
  recs.forEach(rec => {
    const i = S.rows.findIndex(z => z.id === rec.id);
    if (i >= 0) { if (top) { S.rows.splice(i, 1); S.rows.unshift(rec); } else S.rows[i] = rec; }
    else { S.rows.unshift(rec); S._b.total++; }
  });
  S.rows = S.rows.slice(0, S._b.pageSize);
  return true;
}
loadB = async function () {
  if (applyPatch()) { drawB(); fetchB(true); return; }   // tampil instan, total disegarkan di belakang layar
  S._patch = null;
  return fetchB();
};

/* ===== 2. DASHBOARD BARU ===== */
const qa = {
  b() { go('brg'); formB(); },
  r() { if (!S.g.length) { toast('Tambahkan gedung dulu, baru ruangan'); return qa.g(); } S.sub = 'lok'; go('kel'); formR(); },
  g() { S.sub = 'lok'; go('kel'); formG(); },
  scan() { scanQR(); }
};
paintDash = function (d) {
  if (S.tab !== 'dash') return;
  const t = d.totals, adm = S.user.role === 'admin', e = canE(), pj = d.pjm || { aktif: [], total: 0, menunggu: 0, terlambat: 0 };
  if (d.pending !== undefined) { S.pend = d.pending; bdg(); }
  const kp = Object.entries(d.kondisi), sum = kp.reduce((a, [, v]) => a + v.unit, 0), gm = Math.max(1, ...d.perGedung.map(g => g.unit));
  const att = [adm && d.pending && ['apv', d.pending, 'persetujuan menunggu'], adm && d.pengadaanBaru && ['pgd', d.pengadaanBaru, 'pengadaan diajukan'],
    adm && d.penghapusanBaru && ['hps', d.penghapusanBaru, 'penghapusan menunggu'], d.lowCount && ['brg', d.lowCount, 'barang stok menipis', 1],
    e && pj.menunggu && ['pjm', pj.menunggu, 'peminjaman menunggu'], pj.terlambat && ['pjm', pj.terlambat, 'peminjaman terlambat', 1]].filter(Boolean);
  const R = 52, C = 2 * Math.PI * R; let off = 0;
  const arcs = kp.filter(([, v]) => v.unit > 0).map(([k, v]) => {
    const L = v.unit / sum * C, s = `<circle cx="70" cy="70" r="${R}" fill="none" stroke="${KC[k] || '#888'}" stroke-width="18" stroke-dasharray="${L} ${C - L}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)"/>`;
    off += L; return s;
  }).join('');
  const tiles = [e && ['b', 'box', 'Tambah', 'Barang'], e && ['r', 'dash', 'Tambah', 'Ruangan'], e && ['g', 'build', 'Tambah', 'Gedung'], ['scan', 'cam', 'Pindai', 'Kode QR'], ['pjm', 'pjm', 'Lihat', 'Peminjaman']].filter(Boolean);
  const kpi = [['box', 'Jenis barang', num(t.jenis)], ['stok', 'Total unit', num(t.unit)], ['coin', 'Nilai aset', rp(t.nilai)], ['build', 'Gedung / ruangan', t.gedung + ' / ' + t.ruangan]];
  M(`<section class="hero"><div><small>${sal()}, ${esc(S.user.name)}</small><h2>Ringkasan inventaris</h2><p>${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p></div></section>
  <div class="qk">${tiles.map(([k, ic, a, b]) => `<button class="qt" ${k === 'pjm' ? 'data-go="pjm"' : `data-q="${k}"`}><span class="ic">${I(ic, 24)}</span><span><small>${a}</small>${b}</span></button>`).join('')}</div>
  ${e && !t.jenis ? `<div class="cd sec"><h3>Mulai dari sini</h3><p class="mu" style="margin:0 0 .7rem">Urutan paling mudah: gedung, lalu ruangan, lalu barang.</p><div class="tg"><button class="btn" data-q="g">Tambah gedung</button><button class="btn" data-q="r">Tambah ruangan</button><button class="btn" data-q="b">Tambah barang</button></div></div>` : ''}
  ${att.length ? `<div class="attn" aria-label="Perlu perhatian">${att.map(([tab, n, l, w]) => `<button class="at ${w ? 'w' : ''}" data-go="${tab}"><b>${num(n)}</b><span>${l}</span></button>`).join('')}</div>` : ''}
  <div class="gr sec">${kpi.map(([ic, l, v]) => `<div class="cd kv"><div class="ic">${I(ic, 22)}</div><span>${l}</span><b>${v}</b></div>`).join('')}</div>
  <div class="gr g2 sec"><div class="cd"><h3>Kondisi barang</h3><div class="dnw"><svg class="dn" viewBox="0 0 140 140" role="img" aria-label="Kondisi barang"><circle cx="70" cy="70" r="${R}" fill="none" stroke="var(--bd)" stroke-width="18"/>${arcs}<text x="70" y="68" font-size="22">${num(sum)}</text><text x="70" y="86" font-size="11" style="font-weight:500">unit</text></svg>
    <div class="leg">${kp.map(([k, v]) => `<span><i style="background:${KC[k] || '#888'}"></i>${esc(KL[k] || k)}<b>${num(v.unit)}</b></span>`).join('')}</div></div></div>
  <div class="cd"><h3>Unit per gedung</h3>${d.perGedung.map(g => bar(g.kode + ' · ' + g.nama, g.unit, gm, 'var(--p2)')).join('') || '<span class="mu">Belum ada gedung.</span>'}</div></div>
  <div class="gr g2 sec"><div class="cd"><h3>Sedang dipinjam <small class="mu">${pj.total} aktif</small></h3>${pj.aktif.map(x => `<div class="row"><span>${esc(x.nama)}${x.tipe === 'barang' ? ' ×' + num(x.jumlah) : ''}<br><small>${esc(x.peminjam)} · ${esc(x.bagian)}</small></span><small style="text-align:right;white-space:nowrap">sampai ${fTg(x.tglSelesai, x.jamSelesai)}${x.terlambat ? '<br><b style="color:var(--rd)">Terlambat</b>' : ''}</small></div>`).join('') || '<span class="mu">Tidak ada yang sedang dipinjam.</span>'}</div>
  <div class="cd"><h3>Stok menipis <small class="mu">${num(d.lowCount)} barang</small></h3>${d.lowStock.map(x => `<div class="row"><span>${esc(x.nama)}<br><small>${esc(x.kode)}</small></span><b>${num(x.jumlah)} <small>/ min ${num(x.minStok)}</small></b></div>`).join('') || '<span class="mu">Semua stok aman.</span>'}</div></div>`);
  $('#main').onclick = ev => {
    const g = ev.target.closest('[data-go]'); if (g) return go(g.dataset.go);
    const q = ev.target.closest('[data-q]'); if (q) qa[q.dataset.q]();
  };
};

/* ===== 3. MENU BERKELOMPOK ===== */
const NAV = [['dash', 'Beranda', 'dash', 'Utama', 1], ['brg', 'Aset', 'box', 'Utama', 1], ['pjm', 'Peminjaman', 'pjm', 'Utama', 1],
  ['apv', 'Persetujuan', 'check', 'Kelola'], ['pgd', 'Pengadaan', 'cart', 'Kelola'], ['hps', 'Penghapusan', 'arch', 'Kelola'], ['kel', 'Data Master', 'cog', 'Kelola'],
  ['rpt', 'Laporan & QR', 'doc', 'Laporan']];
const allowed = () => NAV.filter(n => !(S.user.role === 'viewer' && /^(apv|pgd|kel)$/.test(n[0])));
function mark() { document.querySelectorAll('#nav [data-t]').forEach(b => b.classList.toggle('on', b.dataset.t === S.tab)); }
function buildNav() {
  let h = canE() ? `<button class="nv nv-add" data-add>${I('plus', 22)}<span>Tambah data</span></button>` : '', grp = '';
  allowed().forEach(n => {
    if (n[3] !== grp) { grp = n[3]; h += `<div class="ng">${grp}</div>`; }
    h += `<button class="nv ${n[4] ? '' : 'dx'}" data-t="${n[0]}">${I(n[2], 24)}<span>${n[1]}</span>${n[0] === 'apv' ? '<b class="nb" id="nb" hidden></b>' : ''}</button>`;
  });
  if (canE()) h += `<button class="nv fab" data-add aria-label="Tambah data">${I('plus', 28)}</button>`;
  h += `<button class="nv more" data-more>${I('menu', 24)}<span>Menu</span><b class="nb" id="nbm" hidden></b></button>`;
  $('#nav').innerHTML = h;
  $('#nav').onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.add !== undefined) return quick();
    if (b.dataset.more !== undefined) return more();
    if (b.dataset.t) go(b.dataset.t);
  };
  mark(); bdg();
}
bdg = function () {
  [$('#nb'), $('#nbm')].forEach(b => { if (b) { b.hidden = !S.pend; b.textContent = S.pend; } });
};
function sheet(html, onPick) {
  dlg.innerHTML = html + `<button type="button" class="btn g" style="width:100%;margin-top:.7rem" data-x>Tutup</button>`;
  dlg.oncancel = null;
  dlg.onclick = ev => {
    const p = ev.target.closest('[data-pick]');
    if (p) { dlg.close(); onPick(p.dataset.pick); } else if (ev.target === dlg || ev.target.closest('[data-x]')) dlg.close();
  };
  if (!dlg.open) dlg.showModal();
}
function quick() {
  sheet(`<h3>Tambah data</h3><div class="mg mg3">${[['b', 'box', 'Barang'], ['r', 'dash', 'Ruangan'], ['g', 'build', 'Gedung']].map(([k, ic, l]) => `<button type="button" class="mi" data-pick="${k}">${I(ic, 26)}<span>${l}</span></button>`).join('')}</div>`, k => qa[k]());
}
function more() {
  const it = allowed().filter(n => !n[4]);
  sheet(`<h3>Menu</h3><div class="mg">${it.map(n => `<button type="button" class="mi" data-pick="${n[0]}">${I(n[2], 26)}<span>${n[1]}</span>${n[0] === 'apv' && S.pend ? `<b class="nb2">${S.pend}</b>` : ''}</button>`).join('')}<button type="button" class="mi" data-pick="scan">${I('cam', 26)}<span>Pindai QR</span></button></div>`,
    k => k === 'scan' ? scanQR() : go(k));
}
const _go = go;
go = function (t) { _go(t); mark(); };
const _enter = enter;
enter = async function () { await _enter(); buildNav(); };
if (S.user && !$('#app').hidden) buildNav();   // bila login otomatis sudah selesai sebelum skrip ini dimuat
})();
