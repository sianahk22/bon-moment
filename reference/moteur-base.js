const SLOTS = 48;
const hourOf = i => (8 + i / 2) % 24;
const label = i => { const m = (8 * 60 + i * 30) % 1440; const h = Math.floor(m / 60); return h + 'h' + (m % 60 ? '30' : ''); };
const slotOfHour = h => ((h - 8 + 24) % 24) * 2;
const euro = v => v.toFixed(2).replace('.', ',') + ' €';
const pct = v => Math.round(v * 100) + ' %';
const kw = v => Math.round(v) + ' kW';
const ACC_PRICE = 0.11;   // prix de l'électricité solaire partagée (hypothèse de démo)
const CAP = 60;           // capacité du poste du quartier (démo)

function bump(h, c, w) { let d = Math.abs(h - c); d = Math.min(d, 24 - d); return Math.exp(-(d * d) / (2 * w * w)); }
const isHC = h => h >= 22 || h < 6;

// Tarifs Tempo réels (TTC, 1er août 2026). Courbes CO2, soleil et tension : simulées.
const SCENARIOS = {
  ete:   { nom: 'Été ensoleillé', tempo: 'Jour bleu', hp: .1654, hc: .1356, sun: { peak: 1, rise: 6, set: 21.5 },
           co2: h => 22 + 35 * bump(h, 19.5, 2) + 8 * bump(h, 8, 1.5), tension: () => 0 },
  hiver: { nom: 'Hiver', tempo: 'Jour blanc', hp: .1921, hc: .1536, sun: { peak: .32, rise: 8.5, set: 17.3 },
           co2: h => 40 + 55 * bump(h, 19, 1.6) + 30 * bump(h, 9, 1.6), tension: h => (h >= 8 && h < 13) ? .5 : (h >= 18 && h < 20) ? 1 : 0 },
  rouge: { nom: 'Hiver tendu', tempo: 'Jour rouge', hp: .7295, hc: .1615, sun: { peak: .28, rise: 8.6, set: 17.2 },
           co2: h => 55 + 75 * bump(h, 19, 1.6) + 40 * bump(h, 9, 1.6), tension: h => (h >= 6 && h < 22) ? (((h >= 8 && h < 13) || (h >= 18 && h < 20)) ? 1 : .5) : 0 },
};

const state = { scenario: 'ete', cloud: false, coord: true, w: .35, user: 'ines', slot: 10, tf: 10, playing: false,
                sim: { ecole: true, boulangerie: true, parking: false } };

function sunAt(h, sc) {
  const { peak, rise, set } = sc.sun;
  if (h < rise || h > set) return 0;
  let v = peak * Math.pow(Math.sin(Math.PI * (h - rise) / (set - rise)), 1.4);
  if (state.cloud && h >= 11.5 && h < 15.5) v *= 0.3;
  return v;
}
function slotCtx() {
  const sc = SCENARIOS[state.scenario];
  return Array.from({ length: SLOTS }, (_, i) => {
    const h = (hourOf(i) + 0.25) % 24;
    return { h, price: isHC(h) ? sc.hc : sc.hp, co2: sc.co2(h), tension: sc.tension(h), sun: sunAt(h, sc) };
  });
}

// Le moteur : optimisation sous contraintes (version gloutonne pour la démo)
function slotScore(p, i, ctx, solar, load, o) {
  const c = ctx[i];
  const loc = Math.min(p, Math.max(0, solar[i]));
  const cost = (loc * ACC_PRICE + (p - loc) * c.price) / p;
  const co2 = ((p - loc) * c.co2) / p;
  let s = (1 - o.w) * (cost / 0.73) + o.w * (co2 / 150) + 0.25 * c.tension;
  if (o.cap && load[i] + p > o.cap) s += o.capW * (load[i] + p - o.cap) / p;
  return s;
}
function plan(tasks, ctx, o) {
  const solar = o.solar.slice(), load = o.baseLoad.slice(), out = [];
  const order = tasks.map((_, k) => k).sort((a, b) =>
    (tasks[a].interruptible - tasks[b].interruptible) || ((tasks[a].deadline - tasks[a].dur) - (tasks[b].deadline - tasks[b].dur)) || (tasks[b].p - tasks[a].p));
  for (const k of order) {
    const t = tasks[k], sc = i => slotScore(t.p, i, ctx, solar, load, o);
    let slots;
    if (!t.interruptible) {
      let best = 0, bs = Infinity;
      for (let s = 0; s + t.dur <= t.deadline; s++) {
        let sum = 0; for (let j = s; j < s + t.dur; j++) sum += sc(j);
        if (sum < bs - 1e-9) { bs = sum; best = s; }
      }
      slots = Array.from({ length: t.dur }, (_, j) => best + j);
    } else {
      slots = [...Array(t.deadline).keys()].sort((a, b) => sc(a) - sc(b) || a - b).slice(0, t.dur).sort((a, b) => a - b);
    }
    for (const i of slots) { const loc = Math.min(t.p, Math.max(0, solar[i])); solar[i] -= loc; load[i] += t.p; }
    out[k] = slots;
  }
  return out;
}
const habitSlots = t => Array.from({ length: t.dur }, (_, j) => Math.min(SLOTS - 1, t.habit + j));
function evaluate(tasks, slotsArr, ctx, solarInit) {
  const solar = solarInit.slice(); let cost = 0, co2 = 0, sol = 0, kwh = 0; const per = [];
  tasks.forEach((t, k) => {
    let c = 0, g = 0, s = 0;
    for (const i of slotsArr[k]) {
      const e = t.p * .5, loc = Math.min(t.p, Math.max(0, solar[i]));
      solar[i] -= loc; const le = loc * .5, ge = e - le;
      c += le * ACC_PRICE + ge * ctx[i].price; g += ge * ctx[i].co2; s += le; kwh += e;
    }
    cost += c; co2 += g; sol += s; per[k] = { cost: c, co2: g, sol: s };
  });
  return { cost, co2, sol, kwh, per };
}
function ranges(slots) {
  const r = []; let a = null, b = null;
  for (const i of slots) { if (a === null) { a = b = i; } else if (i === b + 1) { b = i; } else { r.push([a, b]); a = b = i; } }
  if (a !== null) r.push([a, b]);
  return r;
}
const rangeText = slots => ranges(slots).map(([a, b]) => label(a) + '–' + label(b + 1)).join(', ');

// Appareils (puissance en kW, durée en créneaux de 30 min)
const DEVICES = {
  voiture:    { name: 'Voiture électrique', detail: '+20 kWh (de 30 à 70 %)', p: 3.7, dur: 11, interruptible: true, auto: true, habitH: 18.5 },
  linge:      { name: 'Lave-linge', detail: 'Programme 40 °C', p: .8, dur: 3, interruptible: false, auto: false, habitH: 19 },
  eau:        { name: 'Chauffe-eau', detail: 'Ballon de 200 L', p: 2.4, dur: 4, interruptible: true, auto: true, habitH: 22 },
  vaisselle:  { name: 'Lave-vaisselle', detail: 'Programme éco', p: 1, dur: 3, interruptible: false, auto: false, habitH: 21 },
  secheLinge: { name: 'Sèche-linge', detail: 'Pompe à chaleur', p: 1, dur: 4, interruptible: false, auto: true, habitH: 19 },
  froid:      { name: 'Chambre froide', detail: 'Pré-refroidissement à -21 °C', p: 3, dur: 8, interruptible: true, auto: true, habitH: 16 },
  utilitaire: { name: 'Utilitaire de livraison', detail: '+30 kWh', p: 7, dur: 9, interruptible: true, auto: true, habitH: 13 },
};
let uid = 0;
const mkTask = (type, deadlineH) => {
  const d = DEVICES[type];
  return { id: ++uid, type, ...d, deadlineH, deadline: slotOfHour(deadlineH) || SLOTS, habit: slotOfHour(d.habitH) };
};
const USERS = {
  ines: { name: 'Inès', role: 'Habitante · offre Premium', share: 3, base: .5, cap: 6,
          tasks: [mkTask('voiture', 7), mkTask('linge', 22), mkTask('eau', 7), mkTask('vaisselle', 8)],
          types: ['voiture', 'linge', 'eau', 'vaisselle', 'secheLinge'] },
  lily: { name: 'Lily', role: 'Boulangerie · offre Pro', share: 10, base: 4, cap: 30,
          tasks: [mkTask('froid', 18), mkTask('utilitaire', 5), mkTask('eau', 4), mkTask('vaisselle', 20)],
          types: ['froid', 'utilitaire', 'eau', 'vaisselle'] },
};
const DEADLINES = [10, 12, 14, 16, 18, 20, 22, 0, 2, 4, 6, 7, 8];
const deadlineText = h => { const s = slotOfHour(h); return 'Avant ' + h + 'h' + ((s >= 32 || s === 0) ? ' demain' : ''); };

// Quartier : 30 foyers simulés (tirage déterministe)
function rng(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const QTASKS = (() => {
  const r = rng(42), out = [];
  for (let f = 0; f < 30; f++) {
    if (f < 20) out.push({ p: 2.2, dur: 4, deadline: 46, interruptible: true, habit: 28 });
    out.push({ p: .8, dur: 3, deadline: 46, interruptible: false, habit: 20 + Math.floor(r() * 7) });
    if (f < 8) out.push({ p: 3.7, dur: 8, deadline: 46, interruptible: true, habit: 21 + Math.floor(r() * 3) });
    if (f < 12) out.push({ p: 1, dur: 3, deadline: 46, interruptible: false, habit: 26 + Math.floor(r() * 3) });
  }
  return out;
})();

function quartierSim(coord) {
  const ctx = slotCtx(), winter = state.scenario !== 'ete';
  const kWc = 80 + (state.sim.parking ? 30 : 0);
  const prod = ctx.map(c => kWc * .85 * c.sun);
  const parts = ctx.map(c => {
    const h = c.h;
    let res = 30 * (.32 + .75 * bump(h, 20, 1.7) + .35 * bump(h, 7.5, 1)); if (winter) res *= 1.4;
    const ecole = (state.sim.ecole && h >= 8.5 && h < 17) ? (winter ? 14 : 9) : 0;
    const boul = state.sim.boulangerie ? ((h >= 4 && h < 19) ? 6 : 1.2) : 0;
    return { res, ecole, boul };
  });
  const base = parts.map(p => p.res + p.ecole + p.boul);
  const slots = coord
    ? plan(QTASKS, ctx, { solar: prod.map((p, i) => Math.max(0, p - base[i])), baseLoad: base, cap: CAP, capW: 1.2, w: state.w })
    : QTASKS.map(habitSlots);
  const flex = Array(SLOTS).fill(0);
  QTASKS.forEach((t, k) => slots[k].forEach(i => flex[i] += t.p));
  const cons = base.map((b, i) => b + flex[i]);
  let local = 0, P = 0, cost = 0, co2 = 0;
  cons.forEach((c, i) => { const l = Math.min(c, prod[i]); local += l * .5; P += prod[i] * .5; cost += (l * ACC_PRICE + (c - l) * ctx[i].price) * .5; co2 += (c - l) * ctx[i].co2 * .5; });
  return { ctx, prod, parts, base, flex, cons, taux: P ? local / P : 0, peak: Math.max(...cons), cost, co2, local, P };
}

const MUNI = [
  { name: 'Piscine · préchauffage du bassin', p: 12, dur: 8, deadline: 46, interruptible: true },
  { name: 'Gymnase · eau chaude des douches', p: 6, dur: 4, deadline: 22, interruptible: true },
  { name: '4 véhicules municipaux', p: 14.8, dur: 6, deadline: 46, interruptible: true },
];

// Calcul global
function compute() {
  state.q = { on: quartierSim(true), off: quartierSim(false) };
  const u = USERS[state.user] || USERS.ines;
  const ctx = state.q.on.ctx;
  const solar = ctx.map(c => u.share * c.sun);
  const opts = { solar, baseLoad: Array(SLOTS).fill(u.base), cap: u.cap, capW: 3, w: state.w };
  const slots = plan(u.tasks, ctx, opts);
  const habits = u.tasks.map(habitSlots);
  state.f = { u, ctx, solar, opts, slots, habits, planned: evaluate(u.tasks, slots, ctx, solar), naive: evaluate(u.tasks, habits, ctx, solar) };
  const q = state.q.on;
  state.m = plan(MUNI, ctx, { solar: q.prod.map((p, i) => Math.max(0, p - q.cons[i])), baseLoad: q.cons, w: state.w });
}
