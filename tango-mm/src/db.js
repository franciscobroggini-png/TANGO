// ══════════════════════════════════════════════
//  db.js — Capa de acceso a Supabase
//
//  Todas las operaciones de lectura/escritura
//  a la base de datos pasan por este archivo.
//  app.js llama a estas funciones; nunca habla
//  directamente con Supabase.
// ══════════════════════════════════════════════

const SUPABASE_URL = 'https://znmzkqauigikpwuhndfw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubXprcWF1aWdpa3B3dWhuZGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NzE0ODEsImV4cCI6MjA5MDU0NzQ4MX0.ntzIW5l1g85gSHq6qzOfNAtmCf4ic0lLx_q5_q5_oI-XUo';

// ── Cliente HTTP base ────────────────────────────────────────────────────────
// Wrapper mínimo sobre fetch() para hablar con la API REST de Supabase.
// No usamos el SDK oficial para mantener cero dependencias externas.

async function sbFetch(table, options = {}) {
  const {
    method   = 'GET',
    filters  = '',      // ej: 'fecha=eq.2026-04-07'
    body     = null,
    select   = '*',
    order    = '',
    limit    = '',
    upsert   = false,
  } = options;

  let url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}`;
  if (filters) url += `&${filters}`;
  if (order)   url += `&order=${order}`;
  if (limit)   url += `&limit=${limit}`;

  const headers = {
    'apikey':        SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type':  'application/json',
    'Prefer':        method === 'POST' && upsert
                       ? 'resolution=merge-duplicates'
                       : method === 'POST' ? 'return=representation' : '',
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(`DB error [${table}]: ${err.message || JSON.stringify(err)}`);
  }

  // DELETE y PATCH sin return no devuelven body
  if (method === 'DELETE' || (method === 'PATCH' && !headers['Prefer'].includes('return'))) return null;
  return res.json();
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function hoy() { return STATE.fechaHoy; }

// ══════════════════════════════════════════════
//  PARÁMETROS DEL FONDO
// ══════════════════════════════════════════════

async function db_cargarParametros() {
  // Devuelve array de clases con sus honorarios.
  return sbFetch('parametros_fondo', { filters: 'activo=eq.true', order: 'clase' });
}

// ══════════════════════════════════════════════
//  DÍAS OPERATIVOS
// ══════════════════════════════════════════════

async function db_cargarUltimoDia() {
  // Trae el último día cerrado para inicializar el STATE al abrir la app.
  const rows = await sbFetch('dias_operativos', {
    filters: 'estado=eq.cerrado',
    order:   'fecha.desc',
    limit:   '1',
  });
  return rows[0] || null;
}

async function db_abrirDia(fecha, fechaCartera, fechaT1, ccl, mep) {
  // Crea o actualiza el registro del día operativo actual.
  return sbFetch('dias_operativos', {
    method: 'POST',
    upsert: true,
    body: { fecha, fecha_cartera: fechaCartera, fecha_t1: fechaT1, ccl, mep, estado: 'abierto' },
  });
}

async function db_cerrarDia(fecha) {
  // Marca el día como cerrado (se llama en el reinicio).
  const url = `${SUPABASE_URL}/rest/v1/dias_operativos?fecha=eq.${fecha}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'apikey':        SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ estado: 'cerrado', updated_at: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error('Error cerrando día');
}

// ══════════════════════════════════════════════
//  VCP DIARIO
// ══════════════════════════════════════════════

async function db_guardarVCP(fecha) {
  // Guarda el VCP de todas las clases para el día indicado.
  const totalDev = STATE.cartera.reduce((s, a) => s + (a.devengado || 0), 0);
  const rows = Object.entries(STATE.clases)
    .filter(([, c]) => c.cantidad > 0)
    .map(([clase, c]) => ({
      fecha,
      clase,
      vcp:                  c.vcpHoy  || c.vcpAyer,
      vcp_anterior:         c.vcpAyer,
      patrimonio:           c.patrimonioHoy  || c.patrimonioAyer,
      patrimonio_anterior:  c.patrimonioAyer,
      cantidad_cuotas:      c.cantidad,
      rendimiento_diario:   c.rend    || 0,
      rendimiento_anual:    c.rendAnual || 0,
      honorario_sg:         c.honSG   || 0,
      honorario_sd:         c.honSD   || 0,
      devengado_total:      totalDev,
    }));
  return sbFetch('vcp_diario', { method: 'POST', upsert: true, body: rows });
}

async function db_cargarHistorialVCP(limit = 60) {
  // Trae el historial de VCP Clase A para el panel de Historial.
  return sbFetch('vcp_diario', {
    filters: 'clase=eq.A',
    order:   'fecha.desc',
    limit:   String(limit),
  });
}

async function db_cargarVCPAyer(fechaAyer) {
  // Trae el VCP del día anterior para inicializar el STATE del día nuevo.
  return sbFetch('vcp_diario', { filters: `fecha=eq.${fechaAyer}` });
}

// ══════════════════════════════════════════════
//  CARTERA DIARIA
// ══════════════════════════════════════════════

async function db_guardarCartera(fecha) {
  // Snapshot completo de la cartera al cierre del día.
  const rows = STATE.cartera.map(a => ({
    fecha,
    especie:     a.especie,
    asset_class: a.asset,
    moneda:      a.moneda,
    cantidad:    a.cantidad,
    ppp:         a.ppp,
    px_cierre:   a.px,
    monto_mkt:   a.cantidad * a.px,
    devengado:   a.devengado || 0,
    tasa:        a.tasa || 0,
    vencimiento: a.vto || null,
    nota:        a.nota || null,
  }));
  return sbFetch('cartera_diaria', { method: 'POST', upsert: true, body: rows });
}

async function db_cargarCartera(fecha) {
  // Carga la cartera de una fecha específica (para ver días pasados).
  return sbFetch('cartera_diaria', {
    filters: `fecha=eq.${fecha}`,
    order:   'asset_class,especie',
  });
}

// ══════════════════════════════════════════════
//  BLOTTER
// ══════════════════════════════════════════════

async function db_guardarOperacion(op) {
  // Guarda una operación individual en tiempo real.
  return sbFetch('blotter', {
    method: 'POST',
    body: {
      fecha:        hoy(),
      tipo:         op.tipo,
      especie:      op.especie,
      moneda:       op.moneda,
      plazo:        op.plazo,
      cantidad:     op.cantidad,
      precio:       op.precio,
      monto:        op.monto,
      contraparte:  op.contraparte || null,
      mercado:      op.mercado     || null,
      concertacion: op.conc        || hoy(),
      liquidacion:  op.liq         || hoy(),
      vencimiento:  op.vto         || null,
    },
  });
}

async function db_eliminarOperacion(id) {
  // Elimina una operación por su id de base de datos.
  const url = `${SUPABASE_URL}/rest/v1/blotter?id=eq.${id}`;
  await fetch(url, {
    method: 'DELETE',
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
  });
}

async function db_cargarBlotter(fecha) {
  // Carga las operaciones del día indicado.
  return sbFetch('blotter', {
    filters: `fecha=eq.${fecha}`,
    order:   'created_at',
  });
}

// ══════════════════════════════════════════════
//  MOVIMIENTOS SR
// ══════════════════════════════════════════════

async function db_guardarSR(sr) {
  return sbFetch('movimientos_sr', {
    method: 'POST',
    body: {
      fecha:       hoy(),
      tipo:        sr.tipo,
      clase:       sr.clase,
      cuotapartes: sr.cuotas || 0,
      monto:       sr.monto,
      nota:        sr.nota || null,
    },
  });
}

async function db_cargarSR(fecha) {
  return sbFetch('movimientos_sr', { filters: `fecha=eq.${fecha}`, order: 'created_at' });
}

// ══════════════════════════════════════════════
//  PRECIOS HISTÓRICOS
// ══════════════════════════════════════════════

async function db_guardarPrecios(fecha) {
  // Guarda los precios de cierre de todos los activos de la cartera.
  const rows = STATE.cartera
    .filter(a => a.px > 0)
    .map(a => ({ fecha, especie: a.especie, precio: a.px, fuente: 'manual' }));
  if (!rows.length) return;
  return sbFetch('precios_historicos', { method: 'POST', upsert: true, body: rows });
}

// ══════════════════════════════════════════════
//  SNAPSHOT COMPLETO DEL DÍA (cierre)
//  Llama a todas las funciones de guardado
//  en secuencia al hacer el reinicio.
// ══════════════════════════════════════════════

async function db_cerrarYGuardar() {
  const fecha = STATE.fechaHoy;
  toast('Guardando en base de datos…');
  try {
    await Promise.all([
      db_guardarVCP(fecha),
      db_guardarCartera(fecha),
      db_guardarPrecios(fecha),
    ]);
    await db_cerrarDia(fecha);
    toast('✅ Día cerrado y guardado en Supabase', 'success');
  } catch (e) {
    console.error(e);
    toast('⚠ Error guardando en base: ' + e.message, 'error');
  }
}

// ══════════════════════════════════════════════
//  CARGA INICIAL AL ABRIR LA APP
//  Restaura el STATE desde la base de datos.
// ══════════════════════════════════════════════

async function db_inicializar() {
  try {
    // 1. Parámetros del fondo
    const params = await db_cargarParametros();
    params.forEach(p => {
      if (STATE.clases[p.clase]) {
        STATE.clases[p.clase].honorarioSG = parseFloat(p.honorario_sg);
        STATE.clases[p.clase].honorarioSD = parseFloat(p.honorario_sd);
        STATE.clases[p.clase].umbral      = parseFloat(p.umbral);
        STATE.clases[p.clase].vcpAyer     = parseFloat(p.vcp_emision);
      }
    });

    // 2. Último día cerrado → base para el día de hoy
    const ultimoDia = await db_cargarUltimoDia();
    if (ultimoDia) {
      // Hay historial: cargar VCP y cartera del último cierre
      const vcpAyer = await db_cargarVCPAyer(ultimoDia.fecha);
      vcpAyer.forEach(v => {
        if (STATE.clases[v.clase]) {
          STATE.clases[v.clase].vcpAyer        = parseFloat(v.vcp);
          STATE.clases[v.clase].patrimonioAyer  = parseFloat(v.patrimonio);
          STATE.clases[v.clase].cantidad        = parseFloat(v.cantidad_cuotas);
        }
      });

      const carteraAyer = await db_cargarCartera(ultimoDia.fecha);
      if (carteraAyer.length) {
        STATE.cartera = carteraAyer.map(r => ({
          especie:   r.especie,
          asset:     r.asset_class,
          moneda:    r.moneda,
          cantidad:  parseFloat(r.cantidad),
          ppp:       parseFloat(r.ppp),
          px:        parseFloat(r.px_cierre),
          tasa:      parseFloat(r.tasa),
          vto:       r.vencimiento || '',
          devengado: 0,   // se recalcula al abrir el nuevo día
          nota:      r.nota || '',
        }));
      }
    }

    // 3. Día de hoy: blotter y SR ya cargados (por si la app se recargó a mitad del día)
    const blotterHoy = await db_cargarBlotter(STATE.fechaHoy);
    if (blotterHoy.length) {
      STATE.blotter = blotterHoy.map(r => ({
        _dbId:       r.id,
        tipo:        r.tipo,
        especie:     r.especie,
        moneda:      r.moneda,
        plazo:       r.plazo,
        cantidad:    parseFloat(r.cantidad),
        precio:      parseFloat(r.precio),
        monto:       parseFloat(r.monto),
        contraparte: r.contraparte || '',
        mercado:     r.mercado     || '',
        conc:        r.concertacion,
        liq:         r.liquidacion,
        vto:         r.vencimiento || '',
        _new:        false,
      }));
    }

    const srHoy = await db_cargarSR(STATE.fechaHoy);
    srHoy.forEach(r => {
      const monto = parseFloat(r.monto);
      STATE.movimientos.srList.push({
        _dbId: r.id, tipo: r.tipo, clase: r.clase,
        cuotas: parseFloat(r.cuotapartes), monto, nota: r.nota || '',
      });
      if (r.tipo === 'suscripcion') STATE.movimientos.suscripciones += monto;
      else                          STATE.movimientos.rescates       += monto;
    });

    // 4. Historial para el panel
    const hist = await db_cargarHistorialVCP(60);
    STATE.historial = hist.reverse().map(h => ({
      fecha: h.fecha,
      vcp:   parseFloat(h.vcp),
      pn:    parseFloat(h.patrimonio),
      rend:  parseFloat(h.rendimiento_diario),
    }));

    // 5. Abrir el día en la base
    await db_abrirDia(STATE.fechaHoy, STATE.fechaCartera, STATE.fechaT1, STATE.ccl, STATE.mep);

    console.log('✅ DB inicializada correctamente');
    return true;
  } catch (e) {
    console.warn('⚠ Sin conexión a base de datos, modo offline:', e.message);
    return false;   // la app sigue funcionando offline
  }
}
