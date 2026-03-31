-- ══════════════════════════════════════════════
--  TANGO MM Dinámico — Schema Supabase
--  Ejecutar en: Supabase → SQL Editor → New query
-- ══════════════════════════════════════════════

-- 1. PARÁMETROS DEL FONDO
--    Configuración de cada clase de cuotaparte.
--    Se carga una vez y se modifica solo si cambian los honorarios.
create table if not exists parametros_fondo (
  id            serial primary key,
  clase         char(1) not null unique,         -- 'A', 'B', 'C'
  honorario_sg  numeric(8,6) not null,            -- TNA, ej: 0.0225
  honorario_sd  numeric(8,6) not null,            -- TNA, ej: 0.0022
  umbral        numeric(20,2) default 0,          -- umbral PN para la clase
  vcp_emision   numeric(16,6) default 1000,       -- VCP inicial de emisión
  activo        boolean default true,
  created_at    timestamptz default now()
);

-- 2. DÍAS OPERATIVOS
--    Un registro por cada día de operación del fondo.
--    estado: 'abierto' durante el día, 'cerrado' tras el reinicio.
create table if not exists dias_operativos (
  id            serial primary key,
  fecha         date not null unique,
  estado        text not null default 'abierto'   -- 'abierto' | 'cerrado'
                check (estado in ('abierto', 'cerrado')),
  fecha_cartera date,                              -- día anterior hábil
  fecha_t1      date,                              -- próximo día hábil
  ccl           numeric(12,2),
  mep           numeric(12,2),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 3. VCP DIARIO
--    Snapshot del VCP por clase al cierre de cada día.
create table if not exists vcp_diario (
  id                  serial primary key,
  fecha               date not null,
  clase               char(1) not null,
  vcp                 numeric(20,6) not null,
  vcp_anterior        numeric(20,6),
  patrimonio          numeric(20,2) not null,
  patrimonio_anterior numeric(20,2) default 0,
  cantidad_cuotas     numeric(20,6) not null,
  rendimiento_diario  numeric(16,10),
  rendimiento_anual   numeric(16,10),
  honorario_sg        numeric(16,2) default 0,
  honorario_sd        numeric(16,2) default 0,
  devengado_total     numeric(16,2) default 0,
  created_at          timestamptz default now(),
  unique (fecha, clase)
);

-- 4. CARTERA DIARIA
--    Snapshot de cada posición al cierre del día.
create table if not exists cartera_diaria (
  id            serial primary key,
  fecha         date not null,
  especie       text not null,
  asset_class   text not null,                    -- PF, REMU, CAUCION, PASE, FCI, etc.
  moneda        text not null default 'ARS',
  cantidad      numeric(20,2) not null default 0,
  ppp           numeric(16,6) default 1,
  px_cierre     numeric(16,6) default 1,
  monto_mkt     numeric(20,2) default 0,
  devengado     numeric(16,2) default 0,
  tasa          numeric(8,4) default 0,           -- TNA en %
  vencimiento   date,
  nota          text,
  created_at    timestamptz default now(),
  unique (fecha, especie)
);

-- 5. BLOTTER
--    Registro histórico acumulativo de todas las operaciones.
create table if not exists blotter (
  id            serial primary key,
  fecha         date not null,                    -- fecha operativa del día
  tipo          text not null                     -- 'COMPRA' | 'VENTA'
                check (tipo in ('COMPRA', 'VENTA')),
  especie       text not null,
  moneda        text not null default 'ARS',
  plazo         text default 'CI',
  cantidad      numeric(20,2) default 0,
  precio        numeric(16,6) default 0,
  monto         numeric(20,2) default 0,
  contraparte   text,
  mercado       text,
  concertacion  date,
  liquidacion   date,
  vencimiento   date,
  created_at    timestamptz default now()
);

-- 6. MOVIMIENTOS SR
--    Suscripciones y rescates por día.
create table if not exists movimientos_sr (
  id            serial primary key,
  fecha         date not null,
  tipo          text not null                     -- 'suscripcion' | 'rescate'
                check (tipo in ('suscripcion', 'rescate')),
  clase         char(1) not null,
  cuotapartes   numeric(20,6) default 0,
  monto         numeric(20,2) not null,
  nota          text,
  created_at    timestamptz default now()
);

-- 7. PRECIOS HISTORICOS
--    Cierre de cada especie por día (para consulta histórica y backtesting).
create table if not exists precios_historicos (
  id            serial primary key,
  fecha         date not null,
  especie       text not null,
  precio        numeric(16,6) not null,
  fuente        text default 'manual',
  created_at    timestamptz default now(),
  unique (fecha, especie)
);

-- ── ÍNDICES para consultas frecuentes ──────────────────────────────────────

create index if not exists idx_vcp_diario_fecha       on vcp_diario (fecha desc);
create index if not exists idx_cartera_diaria_fecha    on cartera_diaria (fecha desc);
create index if not exists idx_blotter_fecha           on blotter (fecha desc);
create index if not exists idx_movimientos_sr_fecha    on movimientos_sr (fecha desc);
create index if not exists idx_precios_historicos_fecha on precios_historicos (fecha desc, especie);

-- ── DATOS INICIALES — Parámetros del fondo ─────────────────────────────────

insert into parametros_fondo (clase, honorario_sg, honorario_sd, umbral, vcp_emision) values
  ('A', 0.0225, 0.0022, 500000000,    1000),
  ('B', 0.0175, 0.0022, 4000000000,   1000),
  ('C', 0.0150, 0.0022, 0,            1000)
on conflict (clase) do nothing;

-- ── VERIFICACIÓN ───────────────────────────────────────────────────────────

select 'parametros_fondo' as tabla, count(*) as filas from parametros_fondo
union all
select 'dias_operativos',   count(*) from dias_operativos
union all
select 'vcp_diario',        count(*) from vcp_diario
union all
select 'cartera_diaria',    count(*) from cartera_diaria
union all
select 'blotter',           count(*) from blotter
union all
select 'movimientos_sr',    count(*) from movimientos_sr
union all
select 'precios_historicos',count(*) from precios_historicos;
