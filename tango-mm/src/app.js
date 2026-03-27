// ══════════════════════════════════════════════
//  STATE  —  DÍA 1: 7 de abril de 2026
//
//  Contexto:
//  • El fondo arranca desde cero. VCP inicial = 1000 (valor de emisión).
//  • Suscripción inicial Clase A: ARS 1.000.000.000
//    → 1.000.000 cuotapartes a VCP 1.000
//  • Las inversiones se concertaron hoy mismo (Día 1).
//    Por convención, el día de concertación NO devenga:
//    los instrumentos comienzan a devengar desde el Día 2.
//  • La caja refleja el flujo real del día:
//    entrada por suscripción y salidas por las inversiones realizadas.
// ══════════════════════════════════════════════
const STATE = {
  // ── Fechas ──────────────────────────────────
  // fechaCartera: día anterior al operativo (aquí el fondo aún no existía → usamos el mismo día como base)
  // fechaHoy:     7 de abril de 2026 (Día 1 operativo)
  // fechaT1:      8 de abril de 2026 (próximo hábil)
  fechaCartera: '2026-04-07',   // Base: mismo día (fondo nuevo, no hay "ayer")
  fechaHoy:     '2026-04-07',
  fechaT1:      '2026-04-08',

  // ── Tipo de cambio ───────────────────────────
  ccl: 1488,
  mep: 1453,

  // ── Clases de cuotapartes ────────────────────
  // Clase A: única clase activa en el Día 1.
  // VCP inicial = 1.000 (precio de emisión, por convención CNV).
  // Suscripción: ARS 1.000.000.000 → 1.000.000 cuotapartes.
  // patrimonioAyer = 0 (fondo no existía); la suscripción se registra como movimiento del día.
  // Para el cálculo del VCP del Día 1:
  //   PN_hoy = 0 (ayer) + suscripción − honorarios + devengado (= 0 hoy)
  //   VCP_hoy = PN_hoy / cantidad
  // Honorarios: SG 2.25% TNA + SD 0.22% TNA sobre el PN del día.
  clases: {
    A: {
      vcpAyer:       1000,          // VCP de emisión (precio inicial)
      cantidad:      1000000,       // cuotapartes emitidas: $1.000.000.000 / VCP 1.000
      patrimonioAyer: 0,            // fondo nuevo, PN previo = 0
      honorarioSG:   0.0225,        // 2.25% TNA Sociedad Gerente
      honorarioSD:   0.0022,        // 0.22% TNA Sociedad Depositaria
      umbral:        500000000,     // umbral de clase según reglamento
    },
    B: { vcpAyer: 0, cantidad: 0, patrimonioAyer: 0, honorarioSG: 0.0175, honorarioSD: 0.0022, umbral: 4000000000 },
    C: { vcpAyer: 0, cantidad: 0, patrimonioAyer: 0, honorarioSG: 0.0150, honorarioSD: 0.0022, umbral: 0 },
  },

  // ── Movimientos del día ──────────────────────
  // Suscripción inicial de ARS 1.000.000.000 Clase A.
  movimientos: {
    suscripciones: 1000000000,
    rescates: 0,
    srList: [
      { tipo: 'suscripcion', clase: 'A', cuotas: 1000000, monto: 1000000000, nota: 'Suscripción inicial — Día 1 del fondo' }
    ],
  },

  // ── Cartera ──────────────────────────────────
  // Inversiones realizadas el Día 1. Concertadas hoy → NO devengan (devengado = 0).
  // Los montos surgen del Excel original (hoja LIMITES / CAJA):
  //   PF GGAL:   $200.000.000  tasa 26.75% TNA  vto 08/05/2026
  //   REMU:      $ 80.000.000  tasa 12.50% TNA  (cuenta remunerada, sin vto fijo)
  //   CAUCION:   $200.000.000  tasa 20.00% TNA  vto 10/04/2026
  //   PASE:      $520.000.000  tasa 21.50% TNA  vto 09/04/2026
  //   Caja:      $  0          (balance exacto tras inversiones)
  // Total invertido: $1.000.000.000 = suscripción.
  cartera: [
    {
      especie:   'PF_GGAL_080526',
      asset:     'PF',
      moneda:    'ARS',
      cantidad:  200000000,   // monto colocado
      ppp:       1,           // precio par
      px:        1,           // valuado a costo (devengamiento)
      tasa:      26.75,       // TNA %
      vto:       '2026-05-08',
      devengado: 0,           // Día 1: no devenga aún
      nota:      'Plazo fijo GGAL — concertado 07/04/2026',
    },
    {
      especie:   'REMU_BANCO',
      asset:     'REMU',
      moneda:    'ARS',
      cantidad:  80000000,
      ppp:       1,
      px:        1,
      tasa:      12.5,
      vto:       '',
      devengado: 0,           // Día 1: no devenga
      nota:      'Cuenta remunerada',
    },
    {
      especie:   'CAUCION_BYMA_080426',
      asset:     'CAUCION',
      moneda:    'ARS',
      cantidad:  200000000,
      ppp:       1,
      px:        1,
      tasa:      20.0,
      vto:       '2026-04-08',  // vencimiento T+1 (un día)
      devengado: 0,           // Día 1: no devenga
      nota:      'Caución colocadora BYMA — vto 10/04',
    },
    {
      especie:   'PASE_LATIN_080426',
      asset:     'PASE',
      moneda:    'ARS',
      cantidad:  520000000,
      ppp:       1,
      px:        1,
      tasa:      21.5,
      vto:       '2026-04-08',  // vencimiento T+1 (un día)
      devengado: 0,           // Día 1: no devenga
      nota:      'Pase LATIN — vto 09/04',
    },
  ],

  // ── Blotter ──────────────────────────────────
  // Operaciones del Día 1: registro de las 4 inversiones concertadas.
  blotter: [
    { tipo:'COMPRA', especie:'PF_GGAL_080526',    moneda:'ARS', plazo:'CI', cantidad:200000000, precio:1, monto:200000000, contraparte:'GGAL',         mercado:'OTC',  conc:'2026-04-07', liq:'2026-04-07', vto:'2026-05-08', _new:false },
    { tipo:'COMPRA', especie:'REMU_BANCO',         moneda:'ARS', plazo:'CI', cantidad:80000000,  precio:1, monto:80000000,  contraparte:'Banco',         mercado:'OTC',  conc:'2026-04-07', liq:'2026-04-07', vto:'', _new:false },
    { tipo:'COMPRA', especie:'CAUCION_BYMA_080426',moneda:'ARS', plazo:'CI', cantidad:200000000, precio:1, monto:200000000, contraparte:'BYMA',          mercado:'BYMA', conc:'2026-04-07', liq:'2026-04-07', vto:'2026-04-08', _new:false },
    { tipo:'COMPRA', especie:'PASE_LATIN_080426',  moneda:'ARS', plazo:'CI', cantidad:520000000, precio:1, monto:520000000, contraparte:'LATIN Valores', mercado:'BYMA', conc:'2026-04-07', liq:'2026-04-07', vto:'2026-04-08', _new:false },
  ],

  // ── Caja del Día 1 ───────────────────────────
  // Entrada: $1.000.000.000 por suscripción.
  // Salidas: inversiones concertadas por el total exacto.
  // Caja neta = 0 (fondo 100% invertido desde el primer día).
  caja: {
    inicio:       0,            // saldo previo (fondo nuevo)
    suscripciones: 1000000000,  // entrada por suscripción inicial
    rescates:     0,
    mercado:      0,            // ops de trading intradiarias (equity, bonos, etc.)
    vtoPF:        0,
    concPF:       -200000000,   // colocación PF GGAL
    vtoChecque:   0,
    concChecque:  0,
    vtoCaucion:   0,
    concCaucion:  -200000000,   // colocación caución BYMA
    remu:         -80000000,    // colocación remunerada
    concPase:     -520000000,   // colocación pase LATIN
    gastos:       0,
  },

  // ── Historial ────────────────────────────────
  // Día 1 es el primer registro. No hay historial previo.
  historial: [],
};

// ══════════════════════════════════════════════
//  INIT  —  fija UI al estado del Día 1
// ══════════════════════════════════════════════
function init() {
  document.getElementById('fechaHoy').value = STATE.fechaHoy;
  calcularVCP();
  renderAll();
}

function toDateStr(d) {
  return d.toISOString().slice(0,10);
}
function nextHabil(d) {
  const n = new Date(d); n.setDate(n.getDate() + 1);
  while ([0,6].includes(n.getDay())) n.setDate(n.getDate()+1);
  return n;
}
function fmtNum(n, dec=0) {
  if (n == null || isNaN(n)) return '-';
  return n.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtPct(n, dec=4) { return (n*100).toFixed(dec) + '%'; }
function fmtDate(s) {
  if (!s) return '-';
  const [y,m,d] = s.split('-'); return `${d}/${m}/${y}`;
}

// ══════════════════════════════════════════════
//  VCP CALCULATION
//  Día 1: patrimonioAyer=0 para todas las clases.
//  La suscripción es la base del PN. Devengado=0.
//  VCP_hoy = (suscripción − honorarios) / cuotapartes.
// ══════════════════════════════════════════════
function calcularVCP() {
  const neto = STATE.movimientos.suscripciones - STATE.movimientos.rescates;
  const totalDevengado = STATE.cartera.reduce((s,a) => s + (a.devengado||0), 0);

  // Base proporcional: si hay PN anterior usarlo; si es Día 1 usar suscripciones.
  const totalPNBase = Object.values(STATE.clases).reduce((s,x) => s + x.patrimonioAyer, 0);

  for (const [cls, c] of Object.entries(STATE.clases)) {
    let propPN;
    if (totalPNBase > 0) {
      propPN = c.patrimonioAyer / totalPNBase;
    } else {
      // Día 1: proporción = monto suscripto en esta clase / neto total
      const miSusc = STATE.movimientos.srList
        .filter(s => s.clase === cls && s.tipo === 'suscripcion')
        .reduce((a,s) => a + s.monto, 0);
      propPN = neto > 0 ? miSusc / neto : 0;
    }

    const devProp   = totalDevengado * propPN;
    const pnBase4Hon = c.patrimonioAyer + neto * propPN;  // PN efectivo del día
    const honSG     = (c.honorarioSG / 365) * pnBase4Hon;
    const honSD     = (c.honorarioSD / 365) * pnBase4Hon;
    const variacion = devProp - honSG - honSD;

    c.patrimonioHoy = c.patrimonioAyer + neto * propPN + variacion;
    c.vcpHoy        = c.cantidad > 0 ? c.patrimonioHoy / c.cantidad : 0;
    c.rend          = c.vcpAyer > 0 && c.vcpHoy > 0 ? (c.vcpHoy - c.vcpAyer) / c.vcpAyer : 0;
    c.rendAnual     = c.rend !== 0 ? Math.pow(1 + c.rend, 365) - 1 : 0;
    c.honSG = honSG;
    c.honSD = honSD;
  }
}

// ══════════════════════════════════════════════
//  RENDER ALL
// ══════════════════════════════════════════════
function renderAll() {
  renderVCP();
  renderPN();
  renderHonorarios();
  renderSR();
  renderAlertas();
  renderCartera();
  renderBlotter();
  renderLimites();
  renderCaja();
  renderHistorial();
  renderReinicio();
}

// ── VCP Cards ──
function renderVCP() {
  const clsColors = { A:'clase-a', B:'clase-b', C:'clase-c', D:'clase-d' };
  const html = Object.entries(STATE.clases).map(([cls, c]) => {
    const rend = c.rend || 0;
    const cls2 = rend >= 0 ? 'pos' : 'neg';
    const sign = rend >= 0 ? '+' : '';
    return `<div class="vcp-card ${clsColors[cls]}">
      <div class="vcp-label">Clase ${cls}</div>
      <div class="vcp-value">${c.vcpHoy > 0 ? c.vcpHoy.toFixed(6) : '—'}</div>
      <div class="vcp-sub">PN: $${fmtNum(c.patrimonioHoy)}</div>
      <div class="vcp-rend ${cls2}">${sign}${fmtPct(rend)} · ${sign}${fmtPct(c.rendAnual||0,2)} TNA</div>
    </div>`;
  }).join('');
  document.getElementById('vcpGrid').innerHTML = html;
}

// ── PN Panel ──
function renderPN() {
  const totalAyer = Object.values(STATE.clases).reduce((s,c) => s + c.patrimonioAyer, 0);
  const totalHoy  = Object.values(STATE.clases).reduce((s,c) => s + (c.patrimonioHoy||c.patrimonioAyer), 0);
  const neto = STATE.movimientos.suscripciones - STATE.movimientos.rescates;
  const varPN = totalHoy - totalAyer;
  const html = `
    <div class="stat-row"><span class="stat-label">PN al ${fmtDate(STATE.fechaCartera)}</span><span class="stat-value">$${fmtNum(totalAyer)}</span></div>
    <div class="stat-row"><span class="stat-label">Suscripciones / Rescates</span><span class="stat-value ${neto>=0?'green':'red'}">${neto>=0?'+':''}$${fmtNum(neto)}</span></div>
    <div class="stat-row"><span class="stat-label">Variación patrimonial</span><span class="stat-value ${varPN>=0?'green':'red'}">${varPN>=0?'+':''}$${fmtNum(varPN)}</span></div>
    <div class="stat-row"><span class="stat-label"><b>PN al ${fmtDate(STATE.fechaHoy)}</b></span><span class="stat-value accent">$${fmtNum(totalHoy)}</span></div>
  `;
  document.getElementById('pnPanel').innerHTML = html;
}

// ── Honorarios ──
function renderHonorarios() {
  const rows = Object.entries(STATE.clases).map(([cls, c]) => {
    const total = (c.honSG||0) + (c.honSD||0);
    return `<div class="stat-row">
      <span class="stat-label">Clase ${cls} (SG ${(c.honorarioSG*100).toFixed(3)}% + SD ${(c.honorarioSD*100).toFixed(3)}%)</span>
      <span class="stat-value">$${fmtNum(total,2)}</span>
    </div>`;
  }).join('');
  const totalHon = Object.values(STATE.clases).reduce((s,c) => s + (c.honSG||0) + (c.honSD||0), 0);
  document.getElementById('honorariosPanel').innerHTML = rows +
    `<div class="stat-row"><span class="stat-label"><b>Total honorarios del día</b></span><span class="stat-value red">-$${fmtNum(totalHon,2)}</span></div>`;
}

// ── SR ──
function renderSR() {
  const { srList, suscripciones, rescates } = STATE.movimientos;
  if (!srList.length) {
    document.getElementById('srPanel').innerHTML = `<p style="font-family:var(--mono);font-size:11px;color:var(--text3);text-align:center;padding:16px">Sin movimientos del día</p>`;
    return;
  }
  const rows = srList.map(s =>
    `<div class="stat-row">
      <span class="stat-label">[${s.tipo === 'suscripcion' ? 'SUSC' : 'RESC'}] Clase ${s.clase} — ${s.nota||'—'}</span>
      <span class="stat-value ${s.tipo==='suscripcion'?'green':'red'}">${s.tipo==='suscripcion'?'+':'-'}$${fmtNum(s.monto)}</span>
    </div>`
  ).join('');
  document.getElementById('srPanel').innerHTML = rows +
    `<div class="stat-row"><span class="stat-label"><b>Neto</b></span><span class="stat-value accent">$${fmtNum(suscripciones - rescates)}</span></div>`;
}

// ── Alertas ──
function renderAlertas() {
  const limites = getLimites();
  const alertas = limites.filter(l => l.status !== 'ok' && l.status !== 'na');
  let html;
  if (!alertas.length) {
    html = `<div style="display:flex;align-items:center;gap:10px;padding:12px 0;font-family:var(--mono);font-size:12px;color:var(--green)">✅ Todos los límites dentro del rango</div>`;
  } else {
    html = alertas.map(a =>
      `<div class="stat-row">
        <span class="stat-label">${a.nombre}</span>
        <span class="badge ${a.status}">${a.actual} / ${a.limite}</span>
      </div>`
    ).join('');
  }
  document.getElementById('alertasPanel').innerHTML = html;
}

// ── Cartera ──
function renderCartera() {
  document.getElementById('cartFechaLabel').textContent = fmtDate(STATE.fechaHoy);
  const assetTag = { PF:'pf', CAUCION:'caucion', PASE:'pase', REMU:'remu', FCI:'fci', LECAP:'lecap', SOB_HD:'sob', EQUITY:'sob', CORPO_HD:'sob' };
  const assetLabel = { PF:'PF', CAUCION:'Caución', PASE:'Pase', REMU:'Remunerada', FCI:'FCI', LECAP:'LECAP', SOB_HD:'Sob HD', EQUITY:'Equity', CORPO_HD:'Corpo HD' };
  const rows = STATE.cartera.map(a => {
    const mkt = a.cantidad * a.px;
    const pnl = a.px > 0 && a.ppp > 0 ? (a.px - a.ppp) * a.cantidad : 0;
    const pnlCls = pnl >= 0 ? 'green' : 'red';
    const tag = assetTag[a.asset] || 'caja';
    return `<tr>
      <td><b>${a.especie}</b></td>
      <td><span class="tag-asset tag-${tag}">${assetLabel[a.asset]||a.asset}</span></td>
      <td>${a.moneda}</td>
      <td>${fmtNum(a.cantidad)}</td>
      <td>${a.ppp ? a.ppp.toFixed(4) : '—'}</td>
      <td>${a.px ? a.px.toFixed(4) : '—'}</td>
      <td>$${fmtNum(mkt)}</td>
      <td style="color:var(--${pnlCls})">${pnl>=0?'+':''}$${fmtNum(pnl,2)}</td>
      <td style="color:var(--green)">$${fmtNum(a.devengado||0,2)}</td>
      <td style="color:var(--text3)">${a.vto ? fmtDate(a.vto) : '—'}</td>
    </tr>`;
  }).join('');
  const totalMKT = STATE.cartera.reduce((s,a) => s + a.cantidad * a.px, 0);
  const totalDev = STATE.cartera.reduce((s,a) => s + (a.devengado||0), 0);
  document.getElementById('cartBody').innerHTML = rows +
    `<tr class="total"><td colspan="6">TOTAL</td><td>$${fmtNum(totalMKT)}</td><td>—</td><td style="color:var(--green)">$${fmtNum(totalDev,2)}</td><td></td></tr>`;
}

// ── Blotter ──
function renderBlotter() {
  document.getElementById('blotterFechaLabel').textContent = fmtDate(STATE.fechaHoy);
  if (!STATE.blotter.length) {
    document.getElementById('blotterBody').innerHTML =
      `<tr><td colspan="13" style="text-align:center;color:var(--text3);padding:24px;font-family:var(--mono)">Sin operaciones registradas hoy</td></tr>`;
    return;
  }
  const rows = STATE.blotter.map((op, i) =>
    `<tr class="${op._new?'blotter-new':''}">
      <td class="${op.tipo==='COMPRA'?'blotter-compra':'blotter-venta'}" style="font-weight:600">${op.tipo}</td>
      <td><b>${op.especie}</b></td>
      <td>${op.moneda}</td>
      <td>${op.plazo}</td>
      <td>${fmtNum(op.cantidad)}</td>
      <td>${op.precio.toFixed(4)}</td>
      <td>$${fmtNum(op.monto)}</td>
      <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis">${op.contraparte||'—'}</td>
      <td>${op.mercado}</td>
      <td>${fmtDate(op.conc)}</td>
      <td>${fmtDate(op.liq)}</td>
      <td style="color:var(--text3)">${op.vto ? fmtDate(op.vto) : '—'}</td>
      <td><button class="btn btn-danger btn-sm" onclick="eliminarOp(${i})">✕</button></td>
    </tr>`
  ).join('');
  document.getElementById('blotterBody').innerHTML = rows;
}

// ── Límites ──
function getLimites() {
  const totalPN = Object.values(STATE.clases).reduce((s,c) => s + (c.patrimonioHoy||c.patrimonioAyer), 0) || 1;
  const cart = STATE.cartera;

  // Montos por asset class (con detalle de instrumentos individuales)
  const pfItems    = cart.filter(a=>a.asset==='PF');
  const remuItems  = cart.filter(a=>a.asset==='REMU');
  const cauItems   = cart.filter(a=>a.asset==='CAUCION');
  const paseItems  = cart.filter(a=>a.asset==='PASE');
  const fciItems   = cart.filter(a=>a.asset==='FCI');
  const lecapItems = cart.filter(a=>a.asset==='LECAP');

  const pf     = pfItems.reduce((s,a)   => s + a.cantidad*a.px, 0);
  const remu   = remuItems.reduce((s,a) => s + a.cantidad*a.px, 0);
  const caucion= cauItems.reduce((s,a)  => s + a.cantidad*a.px, 0);
  const pase   = paseItems.reduce((s,a) => s + a.cantidad*a.px, 0);
  const fci    = fciItems.reduce((s,a)  => s + a.cantidad*a.px, 0);
  const lecap  = lecapItems.reduce((s,a)=> s + a.cantidad*a.px, 0);

  // ── Clasificación AVD por vencimiento ──────────────────────────────────────
  // AVD = activos valuados a devengamiento: PF, Caución, Pase.
  // Remunerada = disponibilidad (cuenta a la vista), no es AVD propiamente.
  // T+1 = próximo día hábil operativo.
  const avdItems = [...pfItems, ...cauItems, ...paseItems];
  const avdT1Items  = avdItems.filter(a => a.vto && a.vto <= STATE.fechaT1);
  const avdMasItems = avdItems.filter(a => !a.vto || a.vto > STATE.fechaT1);

  const avdT1  = avdT1Items.reduce((s,a)  => s + a.cantidad*a.px, 0);  // vence en T+1
  const avdMas = avdMasItems.reduce((s,a) => s + a.cantidad*a.px, 0);  // vence después
  const avd    = avdT1 + avdMas;  // total AVD (sin remunerada)

  // ── Regla 16: Margen de Liquidez ──────────────────────────────────────────
  // Numerador  = Disponibilidades (Remu) + min(10% PN, AVD venc. T+1)
  // Denominador = AVD con vencimiento > T+1
  const cap10pct   = 0.10 * totalPN;
  const aportT1    = Math.min(cap10pct, avdT1);   // contribución capped al 10% PN
  const numLiq     = remu + aportT1;              // numerador de la Regla 16
  const denLiq     = avdMas;                      // denominador de la Regla 16
  const liqRatio   = denLiq > 0 ? numLiq / denLiq : (numLiq > 0 ? 1 : 0);

  // ── Regla 17: AVD total ────────────────────────────────────────────────────
  // Regla 17 MM Dinámico: AVD con vencimiento > T+1 / PN ≤ 30%.
  // Los AVD que vencen en T+1 quedan excluidos del ratio (son casi disponibilidades).
  // La remunerada tampoco entra (es disponibilidad pura).
  const avdPct     = avdMas / totalPN;   // solo AVD con vto > T+1

  const pfPct      = pf / totalPN;
  const remuPct    = remu / totalPN;
  const cauPct     = caucion / totalPN;
  const pasePct    = pase / totalPN;
  const liqPct     = liqRatio;

  // Márgenes
  const margenPF   = 0.20 * totalPN - pf;
  const margenRemu = totalPN;
  const margenCau  = 0.20 * totalPN - caucion;
  const margenPase = totalPN;
  const margenAVD  = 0.30 * totalPN - avdMas;  // solo AVD > T+1
  const deficit    = numLiq - 0.80 * denLiq;

  const TOL = 0.001; // 0.10% de tolerancia antes de marcar BREACH
  function st(val, max, minGood=null) {
    if (minGood !== null) {
      if (val >= minGood)       return 'ok';
      if (val >= minGood - TOL) return 'warn'; // dentro de tolerancia → aviso, no breach
      if (val >= minGood * 0.9) return 'warn';
      return 'breach';
    }
    if (val <= max * 0.80)      return 'ok';
    if (val <= max)             return 'warn';
    if (val <= max + TOL)       return 'warn'; // dentro de tolerancia → aviso, no breach
    return 'breach';
  }

  // Función que genera el HTML del detalle desplegable para cada límite
  function detalleItems(items, totalPNRef, nombreGrupo, montoGrupo, limitePct, isMin=false) {
    const itemRows = items.map(a => {
      const monto = a.cantidad * a.px;
      const pctPN = monto / totalPNRef;
      return `<tr>
        <td style="color:var(--text2);padding:4px 8px;font-size:10px">${a.especie}</td>
        <td style="text-align:right;padding:4px 8px;font-size:10px">$${fmtNum(monto)}</td>
        <td style="text-align:right;padding:4px 8px;font-size:10px">${fmtPct(pctPN,2)}</td>
        <td style="text-align:right;padding:4px 8px;font-size:10px;color:var(--text3)">${a.tasa ? a.tasa+'% TNA' : '—'}</td>
      </tr>`;
    }).join('');
    const limiteMonto = limitePct * totalPNRef;
    const margen = isMin ? montoGrupo - limiteMonto : limiteMonto - montoGrupo;
    const margenColor = margen >= 0 ? 'var(--green)' : 'var(--red)';
    return `
      <table style="width:100%;border-collapse:collapse;margin-bottom:8px">
        <thead>
          <tr style="border-bottom:1px solid var(--border)">
            <th style="text-align:left;padding:4px 8px;font-size:10px;color:var(--text3);font-weight:500">Instrumento</th>
            <th style="text-align:right;padding:4px 8px;font-size:10px;color:var(--text3);font-weight:500">Monto</th>
            <th style="text-align:right;padding:4px 8px;font-size:10px;color:var(--text3);font-weight:500">% PN</th>
            <th style="text-align:right;padding:4px 8px;font-size:10px;color:var(--text3);font-weight:500">Tasa</th>
          </tr>
        </thead>
        <tbody>${itemRows || '<tr><td colspan="4" style="padding:6px 8px;font-size:10px;color:var(--text3)">Sin posiciones</td></tr>'}</tbody>
      </table>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:8px;background:var(--bg);border-radius:4px;font-family:var(--mono);font-size:10px">
        <div><div style="color:var(--text3);margin-bottom:2px">Total ${nombreGrupo}</div><div style="color:var(--text)">$${fmtNum(montoGrupo)}</div></div>
        <div><div style="color:var(--text3);margin-bottom:2px">PN Total</div><div style="color:var(--text)">$${fmtNum(totalPNRef)}</div></div>
        <div><div style="color:var(--text3);margin-bottom:2px">${isMin?'Déficit / Superávit':'Margen disponible'}</div><div style="color:${margenColor}">${margen>=0?'+':''}$${fmtNum(margen)}</div></div>
      </div>`;
  }

  function detalleAVD(totalPNRef) {
    const rowStyle = 'padding:4px 8px;font-size:10px';
    const mkRow = (label, monto, extra='', labelColor='var(--text2)') =>
      `<tr>
        <td style="color:${labelColor};${rowStyle}">${label}</td>
        <td style="text-align:right;${rowStyle}">$${fmtNum(monto)}</td>
        <td style="text-align:right;${rowStyle}">${fmtPct(monto/totalPNRef,2)}</td>
        <td style="text-align:right;${rowStyle};color:var(--text3)">${extra}</td>
      </tr>`;

    const avdT1Rows  = avdT1Items.map(a  => mkRow(`↳ ${a.especie} <span style="color:var(--yellow);font-size:9px">VTO T+1</span>`, a.cantidad*a.px, fmtDate(a.vto))).join('');
    const avdMasRows = avdMasItems.map(a => mkRow(`↳ ${a.especie}`, a.cantidad*a.px, fmtDate(a.vto))).join('');

    return `
      <table style="width:100%;border-collapse:collapse;margin-bottom:10px">
        <thead><tr style="border-bottom:1px solid var(--border)">
          <th style="text-align:left;${rowStyle};color:var(--text3);font-weight:500">Instrumento</th>
          <th style="text-align:right;${rowStyle};color:var(--text3);font-weight:500">Monto</th>
          <th style="text-align:right;${rowStyle};color:var(--text3);font-weight:500">% PN</th>
          <th style="text-align:right;${rowStyle};color:var(--text3);font-weight:500">Vto.</th>
        </tr></thead>
        <tbody>
          <tr><td colspan="4" style="${rowStyle};color:var(--text3);font-weight:600;padding-top:8px">Remunerada (Disponibilidad)</td></tr>
          ${remuItems.map(a => mkRow(`↳ ${a.especie}`, a.cantidad*a.px, '—')).join('') || mkRow('↳ Sin posiciones', 0, '')}
          <tr style="border-top:1px dashed var(--border)"><td colspan="4" style="${rowStyle};color:var(--text3);font-weight:600;padding-top:8px">AVD — vencimiento T+1 (${fmtDate(STATE.fechaT1)})</td></tr>
          ${avdT1Rows || `<tr><td colspan="4" style="${rowStyle};color:var(--text3)">↳ Sin AVD con vencimiento en T+1</td></tr>`}
          <tr style="border-top:1px dashed var(--border)"><td colspan="4" style="${rowStyle};color:var(--text3);font-weight:600;padding-top:8px">AVD — vencimiento > T+1</td></tr>
          ${avdMasRows || `<tr><td colspan="4" style="${rowStyle};color:var(--text3)">↳ Sin AVD con vencimiento posterior</td></tr>`}
          <tr style="border-top:1px solid var(--border2)">
            <td style="color:var(--accent);${rowStyle};font-weight:600">AVD COMPUTABLE (> T+1)</td>
            <td style="text-align:right;${rowStyle};color:var(--accent);font-weight:600">$${fmtNum(avdMas)}</td>
            <td style="text-align:right;${rowStyle};color:var(--accent);font-weight:600">${fmtPct(avdPct,2)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:8px;background:var(--bg);border-radius:4px;font-family:var(--mono);font-size:10px">
        <div><div style="color:var(--text3);margin-bottom:2px">Límite MAX (30% PN)</div><div style="color:var(--text)">$${fmtNum(0.30*totalPNRef)}</div></div>
        <div><div style="color:var(--text3);margin-bottom:2px">AVD > T+1 / PN</div><div style="color:var(--text)">$${fmtNum(avdMas)} / $${fmtNum(totalPNRef)}</div></div>
        <div><div style="color:var(--text3);margin-bottom:2px">Margen disponible</div><div style="color:${margenAVD>=0?'var(--green)':'var(--red)'}">${margenAVD>=0?'+':''}$${fmtNum(margenAVD)}</div></div>
      </div>
      <div style="padding:6px 8px;font-family:var(--mono);font-size:10px;color:var(--text3);margin-top:6px">
        Regla 17 CNV (MM Dinámico): AVD con vencimiento > T+1 ≤ 30% del PN. Los AVD que vencen en T+1 y la Remunerada no computan en este ratio.
      </div>`;
  }

  function detalleLiquidez(totalPNRef) {
    const rs = 'padding:4px 8px;font-size:10px';
    const minReq80  = 0.80 * denLiq;
    const faltante  = numLiq - minReq80;
    const capLabel  = avdT1 > cap10pct
      ? `min(10% PN, AVD T+1) → <b>capped en 10% PN</b> = $${fmtNum(cap10pct)}`
      : `min(10% PN, AVD T+1) → <b>AVD T+1</b> = $${fmtNum(avdT1)}`;
    return `
      <table style="width:100%;border-collapse:collapse;margin-bottom:10px">
        <thead><tr style="border-bottom:1px solid var(--border)">
          <th style="text-align:left;${rs};color:var(--text3);font-weight:500">Componente</th>
          <th style="text-align:right;${rs};color:var(--text3);font-weight:500">Monto</th>
          <th style="text-align:right;${rs};color:var(--text3);font-weight:500">Detalle</th>
        </tr></thead>
        <tbody>
          <tr><td colspan="3" style="${rs};color:var(--text3);font-weight:600;padding-top:8px">NUMERADOR</td></tr>
          <tr>
            <td style="color:var(--text2);${rs}">Disponibilidades (Remunerada)</td>
            <td style="text-align:right;${rs}">$${fmtNum(remu)}</td>
            <td style="text-align:right;${rs};color:var(--text3)">${fmtPct(remuPct,2)} del PN</td>
          </tr>
          <tr>
            <td style="color:var(--text2);${rs}">AVD venc. T+1 — aporte al numerador</td>
            <td style="text-align:right;${rs}">$${fmtNum(aportT1)}</td>
            <td style="text-align:right;${rs};color:var(--text3);font-size:9px">${capLabel}</td>
          </tr>
          <tr style="border-top:1px solid var(--border2)">
            <td style="color:var(--accent);${rs};font-weight:600">TOTAL NUMERADOR</td>
            <td style="text-align:right;${rs};color:var(--accent);font-weight:600">$${fmtNum(numLiq)}</td>
            <td></td>
          </tr>

          <tr><td colspan="3" style="${rs};color:var(--text3);font-weight:600;padding-top:12px;border-top:1px dashed var(--border)">DENOMINADOR — AVD venc. > T+1</td></tr>
          ${avdMasItems.map(a => `<tr>
            <td style="color:var(--text2);${rs}">↳ ${a.especie}</td>
            <td style="text-align:right;${rs}">$${fmtNum(a.cantidad*a.px)}</td>
            <td style="text-align:right;${rs};color:var(--text3)">${fmtDate(a.vto)}</td>
          </tr>`).join('') || `<tr><td colspan="3" style="${rs};color:var(--text3)">↳ Sin AVD con vencimiento posterior a T+1</td></tr>`}
          <tr style="border-top:1px solid var(--border2)">
            <td style="color:var(--accent);${rs};font-weight:600">TOTAL DENOMINADOR</td>
            <td style="text-align:right;${rs};color:var(--accent);font-weight:600">$${fmtNum(denLiq)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <div style="padding:10px;background:var(--bg);border-radius:4px;font-family:var(--mono);font-size:10px;margin-bottom:8px">
        <div style="color:var(--text3);margin-bottom:6px;font-weight:600">CÁLCULO DEL RATIO</div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="color:var(--text2)">Margen = Numerador / Denominador =</span>
          <span style="color:var(--text)">$${fmtNum(numLiq)} / $${fmtNum(denLiq)} =</span>
          <span style="font-size:14px;font-weight:700;color:${liqRatio>=0.80?'var(--green)':liqRatio>=0.72?'var(--yellow)':'var(--red)'}">${fmtPct(liqRatio,2)}</span>
          <span style="color:var(--text3)">(mínimo requerido: 80%)</span>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:8px;background:var(--bg);border-radius:4px;font-family:var(--mono);font-size:10px">
        <div><div style="color:var(--text3);margin-bottom:2px">Mínimo requerido</div><div style="color:var(--text)">$${fmtNum(minReq80)}</div></div>
        <div><div style="color:var(--text3);margin-bottom:2px">Numerador actual</div><div style="color:var(--text)">$${fmtNum(numLiq)}</div></div>
        <div><div style="color:var(--text3);margin-bottom:2px">${faltante>=0?'Superávit':'Déficit'}</div><div style="color:${faltante>=0?'var(--green)':'var(--red)'}">${faltante>=0?'+':''}$${fmtNum(faltante)}</div></div>
      </div>
      <div style="padding:6px 8px;font-family:var(--mono);font-size:10px;color:var(--text3);margin-top:6px;line-height:1.5">
        Regla 16 CNV: Numerador = Disponibilidades + min(10% PN, AVD venc. T+1). Denominador = AVD con venc. > T+1. Ratio ≥ 80%.
      </div>`;
  }

  return [
    {
      id:'lim_pf', nombre:'Plazo Fijo', actual: fmtPct(pfPct,2), limite:'≤ 20%',
      pct: pfPct, max:0.20, status: st(pfPct, 0.20), barPct: Math.min(pfPct/0.20, 1),
      margen: `Margen disponible: +$${fmtNum(margenPF)}`,
      regla: 'Política de inversión: máximo 20% del PN en Plazos Fijos.',
      detalle: () => detalleItems(pfItems, totalPN, 'Plazo Fijo', pf, 0.20),
    },
    {
      id:'lim_remu', nombre:'Remunerada', actual: fmtPct(remuPct,2), limite:'Sin límite',
      pct: remuPct, max:1, status: 'ok', barPct: remuPct,
      margen: `Posición actual: $${fmtNum(remu)}`,
      regla: 'Sin límite normativo ni de política de inversión para cuentas remuneradas.',
      detalle: () => detalleItems(remuItems, totalPN, 'Remunerada', remu, 1),
    },
    {
      id:'lim_cau', nombre:'Caución', actual: fmtPct(cauPct,2), limite:'≤ 20%',
      pct: cauPct, max:0.20, status: st(cauPct, 0.20), barPct: Math.min(cauPct/0.20, 1),
      margen: `Margen disponible: +$${fmtNum(margenCau)}`,
      regla: 'Política de inversión: máximo 20% del PN en Cauciones. (Regla CNV: sin límite en sí, pero la política lo restringe).',
      detalle: () => detalleItems(cauItems, totalPN, 'Caución', caucion, 0.20),
    },
    {
      id:'lim_pase', nombre:'Pases', actual: fmtPct(pasePct,2), limite:'Sin límite',
      pct: pasePct, max:1, status: 'ok', barPct: pasePct,
      margen: `Posición actual: $${fmtNum(pase)}`,
      regla: 'Sin límite normativo ni de política de inversión para Pases activos.',
      detalle: () => detalleItems(paseItems, totalPN, 'Pases', pase, 1),
    },
    {
      id:'lim_avd', nombre:'AVD — Regla 17', actual: fmtPct(avdPct,2), limite:'≤ 30%',
      pct: avdPct, max:0.30, status: st(avdPct, 0.30), barPct: Math.min(avdPct/0.30, 1),
      margen: margenAVD >= 0 ? `Margen disponible: +$${fmtNum(margenAVD)}` : `EXCESO: $${fmtNum(Math.abs(margenAVD))}`,
      regla: 'CNV Regla 17 (MM Dinámico): AVD con vencimiento > T+1 ≤ 30% del PN.',
      detalle: () => detalleAVD(totalPN),
    },
    {
      id:'lim_liq', nombre:'Margen de Liquidez', actual: fmtPct(liqRatio,2), limite:'≥ 80%',
      pct: liqRatio, max:1, status: st(liqRatio, 1, 0.80), barPct: Math.min(liqRatio, 1),
      margen: deficit >= 0 ? `Superávit: +$${fmtNum(deficit)}` : `DÉFICIT: -$${fmtNum(Math.abs(deficit))}`,
      regla: 'CNV Regla 16: Margen de Liquidez ≥ 80%. Num = Remu + min(10% PN, AVD T+1). Den = AVD > T+1.',
      detalle: () => detalleLiquidez(totalPN),
    },
    (() => {
      // VPP = Σ(monto_i × días_i) / Σ(monto_i)  — solo AVD con vencimiento definido
      // "días" = días corridos desde fechaHoy hasta el vencimiento de cada instrumento
      const hoy = new Date(STATE.fechaHoy + 'T00:00:00');
      const MS_DIA = 86400000;
      let sumPeso = 0, sumPonderado = 0;
      const vppDetalle = [];

      avdItems.forEach(a => {
        if (!a.vto) return;
        const monto = a.cantidad * a.px;
        if (monto <= 0) return;
        const vtoDate = new Date(a.vto + 'T00:00:00');
        const dias = Math.max(0, Math.round((vtoDate - hoy) / MS_DIA));
        sumPeso       += monto;
        sumPonderado  += monto * dias;
        vppDetalle.push({ especie: a.especie, monto, dias, pct: 0 });
      });

      vppDetalle.forEach(r => r.pct = sumPeso > 0 ? r.monto / sumPeso : 0);
      const vpp     = sumPeso > 0 ? sumPonderado / sumPeso : 0;
      const vppInt  = Math.round(vpp * 10) / 10;
      const vppPct  = vpp / 35;   // fracción del límite de 35 días
      const vppSt   = sumPeso === 0 ? 'na'
                    : vpp <= 35 + 0.001 ? (vpp <= 35 * 0.80 ? 'ok' : 'warn') : 'breach';
      const margenVPP = 35 - vpp;

      const detalleVPP = () => {
        const rs = 'padding:4px 8px;font-size:10px';
        const rows = vppDetalle.map(r =>
          `<tr>
            <td style="color:var(--text2);${rs}">${r.especie}</td>
            <td style="text-align:right;${rs}">$${fmtNum(r.monto)}</td>
            <td style="text-align:right;${rs}">${fmtPct(r.pct,2)}</td>
            <td style="text-align:right;${rs}">${r.dias} días</td>
            <td style="text-align:right;${rs};color:var(--text3)">${fmtPct(r.pct,4)} × ${r.dias} = ${(r.pct * r.dias).toFixed(2)}</td>
          </tr>`
        ).join('') || `<tr><td colspan="5" style="${rs};color:var(--text3)">Sin AVD con vencimiento definido</td></tr>`;
        return `
          <table style="width:100%;border-collapse:collapse;margin-bottom:10px">
            <thead><tr style="border-bottom:1px solid var(--border)">
              <th style="text-align:left;${rs};color:var(--text3);font-weight:500">Instrumento</th>
              <th style="text-align:right;${rs};color:var(--text3);font-weight:500">Monto</th>
              <th style="text-align:right;${rs};color:var(--text3);font-weight:500">Pond. (w)</th>
              <th style="text-align:right;${rs};color:var(--text3);font-weight:500">Días a vto.</th>
              <th style="text-align:right;${rs};color:var(--text3);font-weight:500">w × días</th>
            </tr></thead>
            <tbody>
              ${rows}
              <tr style="border-top:1px solid var(--border2)">
                <td colspan="2" style="color:var(--accent);${rs};font-weight:600">VPP = Σ(w × días)</td>
                <td style="text-align:right;${rs};color:var(--accent);font-weight:600">100%</td>
                <td></td>
                <td style="text-align:right;${rs};color:var(--accent);font-weight:600">${vppInt} días</td>
              </tr>
            </tbody>
          </table>
          <div style="padding:10px;background:var(--bg);border-radius:4px;font-family:var(--mono);font-size:10px;margin-bottom:8px">
            <div style="color:var(--text3);margin-bottom:6px;font-weight:600">CÁLCULO</div>
            <div style="color:var(--text2)">VPP = Σ(monto<sub>i</sub> × días<sub>i</sub>) / Σ(monto<sub>i</sub>) = <b style="color:${vppSt==='ok'?'var(--green)':vppSt==='warn'?'var(--yellow)':'var(--red)'}">${vppInt} días</b> (límite: 35 días)</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:8px;background:var(--bg);border-radius:4px;font-family:var(--mono);font-size:10px">
            <div><div style="color:var(--text3);margin-bottom:2px">Límite MAX</div><div style="color:var(--text)">35 días</div></div>
            <div><div style="color:var(--text3);margin-bottom:2px">VPP actual</div><div style="color:var(--text)">${vppInt} días</div></div>
            <div><div style="color:var(--text3);margin-bottom:2px">${margenVPP>=0?'Margen':'Exceso'}</div><div style="color:${margenVPP>=0?'var(--green)':'var(--red)'}">${margenVPP>=0?'+':''}${(margenVPP).toFixed(1)} días</div></div>
          </div>
          <div style="padding:6px 8px;font-family:var(--mono);font-size:10px;color:var(--text3);margin-top:6px">
            Regla 8 CNV: La Vida Promedio Ponderada de la cartera valuada a devengamiento no puede superar los 35 días corridos.
          </div>`;
      };

      return {
        id:'lim_vpp', nombre:'VPP', actual: sumPeso > 0 ? vppInt + ' días' : '— días', limite:'≤ 35 días',
        pct: Math.min(vppPct, 1), max:1, status: vppSt, barPct: Math.min(vppPct, 1),
        margen: sumPeso > 0 ? (margenVPP >= 0 ? `Margen: +${margenVPP.toFixed(1)} días` : `Exceso: ${Math.abs(margenVPP).toFixed(1)} días`) : 'Sin AVD con vencimiento.',
        regla: 'CNV Regla 8: VPP = Σ(monto_i × días_i) / Σ(monto_i) ≤ 35 días corridos.',
        detalle: detalleVPP,
      };
    })(),
    (() => {
      // Emisoras: agrupa activos privados (excluye TIT_PUB y REMU) por emisora.
      // La emisora se extrae del nombre del instrumento: todo antes del primer '_' o '-'.
      // Activos que NO computan: REMU (disponibilidad) y activos de deuda pública.
      // Excluidos del límite de emisoras:
      // - Títulos públicos (SOB_HD, LECAP)
      // - Cuentas remuneradas (REMU)
      // - Cauciones (CAUCION): son operaciones de mercado, no exposición a emisora privada
      // - Pases (PASE): ídem cauciones
      const ASSETS_EXCLUIDOS = new Set(['REMU', 'SOB_HD', 'LECAP', 'CAUCION', 'PASE']);
      const privados = STATE.cartera.filter(a => !ASSETS_EXCLUIDOS.has(a.asset));

      // Emisora: se extrae del nombre según convención:
      // Para PF: PF_EMISORA_VTODDMMAA → segundo segmento = emisora
      // Para FCI: FCI_NOMBRE → segundo segmento = nombre del fondo
      // Para el resto: primer segmento antes del primer '_'
      const porEmisora = {};
      privados.forEach(a => {
        let emisora;
        const parts = a.especie.split('_');
        if (a.asset === 'PF' && parts.length >= 2)       emisora = parts[1];
        else if (a.asset === 'FCI' && parts.length >= 2)  emisora = parts[1];
        else                                               emisora = parts[0];
        if (!porEmisora[emisora]) porEmisora[emisora] = { monto: 0, items: [] };
        const monto = a.cantidad * a.px;
        porEmisora[emisora].monto += monto;
        porEmisora[emisora].items.push({ especie: a.especie, monto, asset: a.asset });
      });

      const emisorasList = Object.entries(porEmisora)
        .map(([nombre, d]) => ({ nombre, monto: d.monto, pct: d.monto / totalPN, items: d.items }))
        .sort((a, b) => b.pct - a.pct);

      const maxEmisora = emisorasList.length > 0 ? emisorasList[0] : null;
      const maxPct     = maxEmisora ? maxEmisora.pct : 0;
      const emisoraSt  = emisorasList.length === 0 ? 'na'
                       : maxPct <= 0.20 * 0.80 ? 'ok'
                       : maxPct <= 0.20         ? 'warn'
                       : maxPct <= 0.20 + TOL   ? 'warn'
                       : 'breach';

      const detalleEmisoras = () => {
        const rs = 'padding:4px 8px;font-size:10px';
        if (emisorasList.length === 0) {
          return `<div style="${rs};color:var(--text3);font-family:var(--mono)">Sin activos privados en cartera. Cuentas remuneradas y títulos públicos no computan en este límite.</div>`;
        }
        const rows = emisorasList.map(e => {
          const stE   = e.pct <= 0.20 * 0.80 ? 'ok' : e.pct <= 0.20 + TOL ? 'warn' : 'breach';
          const items = e.items.map(i =>
            `<tr>
              <td style="color:var(--text3);${rs};padding-left:20px">↳ ${i.especie}</td>
              <td style="text-align:right;${rs}">$${fmtNum(i.monto)}</td>
              <td colspan="2"></td>
            </tr>`
          ).join('');
          return `
            <tr style="border-top:1px solid var(--border)">
              <td style="color:var(--text2);${rs};font-weight:600">${e.nombre}</td>
              <td style="text-align:right;${rs};font-weight:600">$${fmtNum(e.monto)}</td>
              <td style="text-align:right;${rs};font-weight:600">${fmtPct(e.pct,2)}</td>
              <td style="text-align:right;${rs}"><span class="badge ${stE}">${stE==='ok'?'OK':stE==='warn'?'ATENCIÓN':'BREACH'}</span></td>
            </tr>
            ${items}`;
        }).join('');

        return `
          <table style="width:100%;border-collapse:collapse;margin-bottom:10px">
            <thead><tr style="border-bottom:1px solid var(--border)">
              <th style="text-align:left;${rs};color:var(--text3);font-weight:500">Emisora</th>
              <th style="text-align:right;${rs};color:var(--text3);font-weight:500">Exposición</th>
              <th style="text-align:right;${rs};color:var(--text3);font-weight:500">% PN</th>
              <th style="text-align:right;${rs};color:var(--text3);font-weight:500">Estado</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:8px;background:var(--bg);border-radius:4px;font-family:var(--mono);font-size:10px">
            <div><div style="color:var(--text3);margin-bottom:2px">Límite por emisora</div><div style="color:var(--text)">20% PN = $${fmtNum(0.20*totalPN)}</div></div>
            <div><div style="color:var(--text3);margin-bottom:2px">Mayor exposición</div><div style="color:var(--text)">${maxEmisora ? maxEmisora.nombre : '—'} (${fmtPct(maxPct,2)})</div></div>
            <div><div style="color:var(--text3);margin-bottom:2px">Margen disponible</div><div style="color:${(0.20-maxPct)>=0?'var(--green)':'var(--red)'}">${(0.20-maxPct)>=0?'+':''}$${fmtNum((0.20-maxPct)*totalPN)}</div></div>
          </div>
          <div style="padding:6px 8px;font-family:var(--mono);font-size:10px;color:var(--text3);margin-top:6px">
            Regla 2 CNV: inversiones en activos privados de una misma emisora ≤ 20% del PN. No computan: títulos públicos (Soberanos, LECAPs), cuentas remuneradas, cauciones ni pases.
          </div>`;
      };

      return {
        id:'lim_emisora',
        nombre:'Emisora única',
        actual: emisorasList.length > 0 ? fmtPct(maxPct,2) + (maxEmisora ? ' (' + maxEmisora.nombre + ')' : '') : '— %',
        limite:'≤ 20% c/u',
        pct: maxPct, max: 0.20, status: emisoraSt, barPct: Math.min(maxPct / 0.20, 1),
        margen: maxEmisora
          ? ((0.20 - maxPct) >= 0 ? `Margen mayor emisora: +$${fmtNum((0.20-maxPct)*totalPN)}` : `EXCESO: $${fmtNum((maxPct-0.20)*totalPN)}`)
          : 'Sin activos privados en cartera.',
        regla: 'CNV Regla 2: activos privados de una misma emisora ≤ 20% del PN. Excluye tít. públicos y remuneradas.',
        detalle: detalleEmisoras,
      };
    })(),
    {
      id:'lim_titpub', nombre:'Tít. Púb. iguales', actual:'— %', limite:'≤ 30%',
      pct:0, max:0.30, status:'na', barPct:0,
      margen:'Sin posiciones en títulos públicos.',
      regla:'CNV Regla 4: títulos públicos de "iguales condiciones de emisión" no pueden superar 30% del PN.',
      detalle: () => `<div style="padding:8px;font-family:var(--mono);font-size:11px;color:var(--text3)">Aplicable a tenencias de títulos públicos con igual serie/condición. Sin posiciones activas de este tipo en la cartera actual.</div>`,
    },
  ];
}

function toggleLimite(id) {
  const panel = document.getElementById('detail_' + id);
  const arrow  = document.getElementById('arrow_' + id);
  if (!panel) return;
  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'block';
  arrow.textContent = isOpen ? '▸' : '▾';
}

function renderLimites() {
  const limites = getLimites();
  const html = limites.map(l => {
    const detailHtml = l.detalle();
    const statusLabel = l.status==='ok'?'OK' : l.status==='warn'?'ATENCIÓN' : l.status==='breach'?'BREACH' : '—';
    const canExpand   = l.status !== 'na';
    const rowStyle    = canExpand ? 'cursor:pointer;' : '';
    const clickAttr   = canExpand ? `onclick="toggleLimite('${l.id}')"` : '';
    return `
    <div style="border-bottom:1px solid var(--border)">
      <div class="limit-row" style="${rowStyle}user-select:none" ${clickAttr} title="${canExpand?'Clic para ver detalle':''}">
        <span class="limit-name" style="display:flex;align-items:center;gap:6px">
          ${canExpand ? `<span id="arrow_${l.id}" style="font-size:10px;color:var(--text3);transition:transform .2s;width:10px">▸</span>` : `<span style="width:10px;display:inline-block"></span>`}
          ${l.nombre}
        </span>
        <div class="limit-bar-wrap"><div class="limit-bar ${l.status}" style="width:${(l.barPct*100).toFixed(1)}%"></div></div>
        <span class="limit-val">${l.actual}</span>
        <span class="limit-max">${l.limite}</span>
        <div class="limit-status"><span class="badge ${l.status}">${statusLabel}</span></div>
      </div>

      ${canExpand ? `
      <div id="detail_${l.id}" style="display:none;background:var(--surface2);border-top:1px solid var(--border);padding:12px 16px 12px 26px">
        <div style="font-family:var(--mono);font-size:10px;color:var(--text3);margin-bottom:8px;padding:6px 8px;background:rgba(0,0,0,.3);border-radius:4px;border-left:2px solid var(--border2)">
          📋 ${l.regla}
        </div>
        ${detailHtml}
        <div style="font-family:var(--mono);font-size:10px;color:${l.status==='breach'?'var(--red)':l.status==='warn'?'var(--yellow)':'var(--text3)'};margin-top:6px;padding-top:6px;border-top:1px solid var(--border)">
          ${l.status==='breach'?'⚠ BREACH — Este límite está excedido. Tomá acción correctiva.' : l.status==='warn'?'⚡ ATENCIÓN — Próximo al límite. Monitoreá de cerca.' : '✅ Dentro del rango normativo.'}
          &nbsp;·&nbsp; ${l.margen}
        </div>
      </div>` : ''}
    </div>`;
  }).join('');
  document.getElementById('limitesBody').innerHTML = html;
  document.getElementById('limitesUpdate').textContent = `Actualizado ${new Date().toLocaleTimeString('es-AR')}`;
}

// ── Caja ──
function renderCaja() {
  const c = STATE.caja;
  const neto = c.inicio + c.suscripciones + c.rescates + c.mercado +
    c.vtoPF + c.concPF + c.vtoChecque + c.concChecque +
    c.vtoCaucion + c.concCaucion + c.remu + (c.concPase||0) + c.gastos;

  const items = [
    ['Saldo inicial', c.inicio],
    ['Suscripciones', c.suscripciones],
    ['Rescates', c.rescates],
    ['Operaciones mercado', c.mercado],
    ['Vto. Plazo Fijo', c.vtoPF],
    ['Conc. Plazo Fijo', c.concPF],
    ['Vto. Caución', c.vtoCaucion],
    ['Conc. Caución', c.concCaucion],
    ['Remunerada (colocación)', c.remu],
    ['Conc. Pase', c.concPase || 0],
    ['Gastos', c.gastos],
  ];
  const rows = items.map(([label, val]) =>
    `<div class="caja-row">
      <span class="caja-item">${label}</span>
      <span class="caja-val ${val>0?'pos':val<0?'neg':'neutral'}">${val>=0?'+':''}$${fmtNum(val)}</span>
    </div>`
  ).join('');
  document.getElementById('cajaPanel').innerHTML = rows +
    `<div class="caja-row" style="border-top:1px solid var(--border2);margin-top:4px">
      <span class="caja-item"><b>Caja neta</b></span>
      <span class="caja-val ${neto>=0?'pos':'neg'}" style="font-size:14px">$${fmtNum(neto)}</span>
    </div>`;

  // Vencimientos
  const venc = STATE.cartera
    .filter(a => a.vto && a.vto >= STATE.fechaHoy)
    .sort((a,b) => a.vto.localeCompare(b.vto))
    .slice(0,6);
  const vHtml = venc.length
    ? venc.map(a =>
        `<div class="stat-row">
          <span class="stat-label">${a.especie}</span>
          <span class="stat-label">${fmtDate(a.vto)}</span>
          <span class="stat-value">$${fmtNum(a.cantidad)}</span>
        </div>`
      ).join('')
    : `<p style="font-family:var(--mono);font-size:11px;color:var(--text3);text-align:center;padding:16px">Sin vencimientos próximos</p>`;
  document.getElementById('vencimientosPanel').innerHTML = vHtml;
}

// ── Historial ──
function renderHistorial() {
  const rows = [...STATE.historial].reverse().map(h =>
    `<div class="historial-row">
      <span class="hist-fecha">${fmtDate(h.fecha)}</span>
      <span class="hist-vcp">${h.vcp.toFixed(6)}</span>
      <span class="hist-pn">$${fmtNum(h.pn)}</span>
      <span class="hist-rend ${h.rend>=0?'vcp-rend pos':'vcp-rend neg'}">${h.rend>=0?'+':''}${fmtPct(h.rend)}</span>
    </div>`
  ).join('');
  document.getElementById('historialPanel').innerHTML =
    `<div class="historial-row" style="margin-bottom:4px">
      <span style="font-family:var(--mono);font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">Fecha</span>
      <span style="font-family:var(--mono);font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">VCP</span>
      <span style="font-family:var(--mono);font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">PN</span>
      <span style="font-family:var(--mono);font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">Rend.</span>
    </div>` + rows;
}

// ── Reinicio Estado ──
function renderReinicio() {
  const totalPN = Object.values(STATE.clases).reduce((s,c) => s + (c.patrimonioHoy||c.patrimonioAyer), 0);
  const vcpA = STATE.clases.A.vcpHoy || STATE.clases.A.vcpAyer;
  document.getElementById('reinicioEstado').innerHTML = `
    <div class="stat-row"><span class="stat-label">Fecha cartera</span><span class="stat-value">${fmtDate(STATE.fechaCartera)}</span></div>
    <div class="stat-row"><span class="stat-label">Fecha hoy</span><span class="stat-value accent">${fmtDate(STATE.fechaHoy)}</span></div>
    <div class="stat-row"><span class="stat-label">T+1</span><span class="stat-value">${fmtDate(STATE.fechaT1)}</span></div>
    <div class="stat-row"><span class="stat-label">VCP Clase A</span><span class="stat-value accent">${vcpA.toFixed(6)}</span></div>
    <div class="stat-row"><span class="stat-label">PN Total</span><span class="stat-value">$${fmtNum(totalPN)}</span></div>
    <div class="stat-row"><span class="stat-label">Ops en Blotter</span><span class="stat-value">${STATE.blotter.length}</span></div>
    <div class="stat-row"><span class="stat-label">CCL / MEP</span><span class="stat-value">$${fmtNum(STATE.ccl)} / $${fmtNum(STATE.mep)}</span></div>
  `;
  document.getElementById('inputCCL').value = STATE.ccl;
  document.getElementById('inputMEP').value = STATE.mep;
  document.getElementById('fxStatus').textContent = `Última actualización: ${new Date().toLocaleTimeString('es-AR')}`;
}

// ══════════════════════════════════════════════
//  ACTIONS
// ══════════════════════════════════════════════
function cambiarFecha() {
  STATE.fechaHoy = document.getElementById('fechaHoy').value;
  const n = new Date(STATE.fechaHoy + 'T00:00:00');
  STATE.fechaT1 = toDateStr(nextHabil(n));
  calcularVCP();
  renderAll();
  toast('Fecha actualizada a ' + fmtDate(STATE.fechaHoy));
}

function agregarSR() {
  const tipo = document.getElementById('srTipo').value;
  const clase = document.getElementById('srClase').value;
  const cuotas = parseFloat(document.getElementById('srCuotas').value) || 0;
  const monto = parseFloat(document.getElementById('srMonto').value) || 0;
  const nota = document.getElementById('srNota').value;
  if (!monto && !cuotas) { toast('Ingresá monto o cuotas', 'error'); return; }
  const montoFinal = monto || cuotas * (STATE.clases[clase].vcpHoy || STATE.clases[clase].vcpAyer);
  STATE.movimientos.srList.push({ tipo, clase, cuotas, monto: montoFinal, nota });
  if (tipo === 'suscripcion') STATE.movimientos.suscripciones += montoFinal;
  else STATE.movimientos.rescates += montoFinal;
  STATE.caja[tipo === 'suscripcion' ? 'suscripciones' : 'rescates'] += montoFinal;
  closeModal('modalSR');
  calcularVCP(); renderAll();
  toast(`${tipo === 'suscripcion' ? 'Suscripción' : 'Rescate'} registrado: $${fmtNum(montoFinal)}`);
}

function agregarOp() {
  const especie = document.getElementById('opEspecie').value.toUpperCase().trim();
  if (!especie) { toast('Ingresá la especie', 'error'); return; }
  const op = {
    tipo: document.getElementById('opTipo').value,
    especie,
    moneda: document.getElementById('opMoneda').value,
    plazo: document.getElementById('opPlazo').value,
    cantidad: parseFloat(document.getElementById('opCantidad').value) || 0,
    precio: parseFloat(document.getElementById('opPrecio').value) || 0,
    monto: parseFloat(document.getElementById('opMonto').value) || 0,
    contraparte: document.getElementById('opContraparte').value,
    mercado: document.getElementById('opMercado').value,
    conc: document.getElementById('opConc').value || STATE.fechaHoy,
    liq: document.getElementById('opLiq').value || STATE.fechaHoy,
    vto: document.getElementById('opVto').value || '',
    _new: true,
  };
  if (!op.monto) op.monto = op.cantidad * op.precio;
  STATE.blotter.push(op);
  STATE.caja.mercado += (op.tipo === 'COMPRA' ? -1 : 1) * op.monto;
  closeModal('modalOp');
  renderBlotter(); renderCaja();
  setTimeout(() => { op._new = false; renderBlotter(); }, 600);
  toast(`${op.tipo} ${op.especie} registrada`);
}

function calcularMontoOp() {
  const c = parseFloat(document.getElementById('opCantidad').value) || 0;
  const p = parseFloat(document.getElementById('opPrecio').value) || 0;
  if (c && p) document.getElementById('opMonto').value = (c * p).toFixed(2);
}

function eliminarOp(i) {
  const op = STATE.blotter[i];
  STATE.caja.mercado -= (op.tipo === 'COMPRA' ? -1 : 1) * op.monto;
  STATE.blotter.splice(i, 1);
  renderBlotter(); renderCaja();
  toast('Operación eliminada');
}

function limpiarBlotter() {
  if (STATE.blotter.length === 0) { toast('Blotter ya está vacío'); return; }
  if (!confirm(`¿Archivar y limpiar ${STATE.blotter.length} operaciones del Blotter?`)) return;
  STATE.blotter = [];
  STATE.caja.mercado = 0;
  renderBlotter(); renderCaja();
  toast('Blotter limpiado ✓', 'success');
}

function agregarActivo() {
  const especie = document.getElementById('naEspecie').value.toUpperCase().trim();
  if (!especie) { toast('Ingresá la especie', 'error'); return; }
  const cantidadRaw = parseFloat(document.getElementById('naCantidad').value) || 0;
  const ppp = parseFloat(document.getElementById('naPPP').value) || 1;
  const px  = parseFloat(document.getElementById('naPx').value) || 1;
  const tasa = parseFloat(document.getElementById('naTasa').value) || 0;
  const vto  = document.getElementById('naVto').value;
  const monto = cantidadRaw * px;
  const devengado = tasa > 0 ? monto * (tasa / 100) / 365 : 0;
  STATE.cartera.push({
    especie,
    asset: document.getElementById('naAsset').value,
    moneda: document.getElementById('naMoneda').value,
    cantidad: cantidadRaw,
    ppp, px, tasa, vto, devengado,
  });
  closeModal('modalNuevoActivo');
  calcularVCP(); renderAll();
  toast(`${especie} agregado a la cartera`);
}

function cargarPrecios() {
  const text = document.getElementById('precioInput').value.trim();
  if (!text) { toast('Pegá los precios primero', 'error'); return; }
  const lines = text.split('\n').filter(l => l.trim());
  let count = 0;
  lines.forEach(line => {
    const parts = line.trim().split(/[\t,;]+/);
    if (parts.length >= 2) {
      const especie = parts[0].trim().toUpperCase();
      const precio = parseFloat(parts[1].replace(',', '.'));
      if (!isNaN(precio)) {
        const found = STATE.cartera.find(a => a.especie === especie);
        if (found) { found.px = precio; count++; }
      }
    }
  });
  closeModal('modalPrecio');
  document.getElementById('precioInput').value = '';
  calcularVCP(); renderAll();
  toast(`${count} precios actualizados ✓`, 'success');
}

function guardarFX() {
  STATE.ccl = parseFloat(document.getElementById('inputCCL').value) || STATE.ccl;
  STATE.mep = parseFloat(document.getElementById('inputMEP').value) || STATE.mep;
  renderReinicio();
  toast('Tipo de cambio actualizado ✓', 'success');
}

function reinicioFecha() {
  const h = new Date(STATE.fechaHoy + 'T00:00:00');
  STATE.fechaCartera = STATE.fechaHoy;
  const mañana = nextHabil(h);
  STATE.fechaHoy = toDateStr(mañana);
  STATE.fechaT1 = toDateStr(nextHabil(mañana));
  document.getElementById('fechaHoy').value = STATE.fechaHoy;

  // Roll VCP
  for (const [cls, c] of Object.entries(STATE.clases)) {
    c.vcpAyer = c.vcpHoy || c.vcpAyer;
    c.patrimonioAyer = c.patrimonioHoy || c.patrimonioAyer;
  }
  STATE.movimientos = { suscripciones: 0, rescates: 0, srList: [] };
  calcularVCP(); renderAll();
  toast(`Fecha avanzada a ${fmtDate(STATE.fechaHoy)} ✓`, 'success');
}

function reinicioCompleto() {
  // Guardar en historial antes de limpiar
  const totalPN = Object.values(STATE.clases).reduce((s,c) => s + (c.patrimonioHoy||c.patrimonioAyer), 0);
  STATE.historial.push({
    fecha: STATE.fechaHoy,
    vcp: STATE.clases.A.vcpHoy || STATE.clases.A.vcpAyer,
    pn: totalPN,
    rend: STATE.clases.A.rend || 0,
  });
  reinicioFecha();
  STATE.blotter = [];
  STATE.caja = { inicio: Object.values(STATE.clases).reduce((s,c)=>s+(c.patrimonioHoy||c.patrimonioAyer),0), suscripciones:0, rescates:0, mercado:0, vtoPF:0, concPF:0, vtoChecque:0, concChecque:0, vtoCaucion:0, concCaucion:0, remu:0, gastos:0 };
  calcularVCP(); renderAll();
  toast('✅ Reinicio completo ejecutado', 'success');
}

function exportarHistorial() {
  const csv = 'Fecha,VCP,PN,Rendimiento\n' +
    STATE.historial.map(h => `${h.fecha},${h.vcp.toFixed(6)},${h.pn.toFixed(2)},${h.rend.toFixed(8)}`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `historial_vcp_${STATE.fechaHoy}.csv`;
  a.click();
  toast('CSV exportado ✓', 'success');
}

// ══════════════════════════════════════════════
//  UI HELPERS
// ══════════════════════════════════════════════
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  event.currentTarget.classList.add('active');
  if (name === 'limites') renderLimites();
}

function openModal(id) {
  const m = document.getElementById(id);
  m.classList.add('open');
  if (id === 'modalOp') {
    document.getElementById('opConc').value = STATE.fechaHoy;
    document.getElementById('opLiq').value = STATE.fechaHoy;
  }
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
});

function toast(msg, type='') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'show ' + type;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.className = '', 3000);
}

// ══════════════════════════════════════════════
//  BOOT
// ══════════════════════════════════════════════
init();