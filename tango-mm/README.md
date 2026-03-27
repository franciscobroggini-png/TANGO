# TANGO MM Dinámico — VCP Dashboard

Dashboard web para el cálculo diario del **Valor de Cuotaparte (VCP)** del fondo común de inversión TANGO Money Market Dinámico, con control normativo en tiempo real.

---

## Estructura del proyecto

```
tango-mm/
├── index.html          # Entrada principal — estructura HTML y modales
├── src/
│   ├── app.js          # Toda la lógica: estado, cálculos, renders
│   └── styles.css      # Estilos (tema oscuro, IBM Plex Mono/Sans)
├── docs/
│   ├── calculo_vcp.md  # Metodología de cálculo del VCP
│   └── limites.md      # Reglas normativas implementadas
└── README.md
```

---

## Uso

Abrí `index.html` directamente en el navegador. No requiere servidor ni dependencias externas.

### Reinicio diario

El flujo de reinicio está en la pestaña **⚡ Reinicio**:

1. **Avanzar Fecha** — mueve `fechaCartera → fechaHoy` y calcula T+1
2. **Limpiar Blotter** — archiva las operaciones del día anterior
3. **Cargar Precios de Cierre** — pegá la tabla desde tu Excel (tab-separado o CSV)
4. **Recalcular VCP** — actualiza patrimonio, VCP por clase y todos los límites

---

## Cálculo del VCP

### Fórmula general

```
PN_hoy = PN_ayer + Neto_SR + Devengado_total − Honorarios_SG − Honorarios_SD
VCP_hoy = PN_hoy / Cantidad_cuotapartes
```

### Devengamiento

Los instrumentos a tasa (PF, Caución, Pase, Remunerada) devengan a partir del **día siguiente a la concertación**. El día de concertación (Día 1) el devengado es **$0**.

```
Devengado_diario = Monto × (Tasa_anual / 365)
```

### Honorarios

Se descuentan diariamente sobre el PN efectivo del día:

| Clase | Sociedad Gerente | Sociedad Depositaria |
|-------|-----------------|---------------------|
| A     | 2.25% TNA       | 0.22% TNA           |
| B     | 1.75% TNA       | 0.22% TNA           |
| C     | 1.50% TNA       | 0.22% TNA           |

```
Honorario_diario = (Tasa / 365) × PN_efectivo_del_día
```

### Día 1 (fondo nuevo)

Cuando `patrimonioAyer = 0`, la proporción por clase se calcula sobre los montos suscriptos. El VCP del Día 1 es ligeramente menor a 1.000 por efecto de los honorarios (devengado = 0).

---

## Límites normativos implementados

| Límite | Regla | Cálculo |
|--------|-------|---------|
| Plazo Fijo | Política | PF / PN ≤ 20% |
| Remunerada | — | Sin límite (informativo) |
| Caución | Política | Caución / PN ≤ 20% |
| Pases | — | Sin límite (informativo) |
| AVD — Regla 17 | CNV R.17 | AVD (vto > T+1) / PN ≤ 30% |
| Margen de Liquidez | CNV R.16 | (Remu + min(10% PN, AVD T+1)) / AVD(>T+1) ≥ 80% |
| VPP | CNV R.8 | Σ(monto_i × días_i) / Σ(monto_i) ≤ 35 días |
| Emisora única | CNV R.2 | Exposición por emisora privada ≤ 20% PN |
| Tít. Púb. iguales | CNV R.4 | Títulos públicos de igual condición ≤ 30% PN |

### Tolerancia de breach

Los límites disparan **BREACH** solo si se supera el umbral en más de **0.10 puntos porcentuales** (tolerancia operativa).

### AVD — Regla 17 (MM Dinámico)

- **Computan**: PF + Caución + Pase con vencimiento **posterior a T+1**
- **No computan**: AVD que vencen en T+1, Remunerada (disponibilidad), títulos públicos

### Margen de Liquidez — Regla 16

```
Numerador  = Remunerada + min(10% PN,  AVD con vto ≤ T+1)
Denominador = AVD con vto > T+1
Ratio ≥ 80%
```

### VPP — Regla 8

```
VPP = Σ(monto_i × días_corridos_a_vto_i) / Σ(monto_i)
```
Incluye todos los AVD (PF + Caución + Pase) con fecha de vencimiento definida.

### Emisoras — Regla 2

Agrupa activos **privados** por emisora (detectada del nombre del instrumento).  
**No computan**: Remunerada, Cauciones, Pases, Soberanos, LECAPs.  
Convención de nombres: `PF_EMISORA_VTODDMMAA` → emisora = segundo segmento.

---

## Convención de nombres de especies

| Formato | Ejemplo | Emisora detectada |
|---------|---------|------------------|
| `PF_EMISORA_VTO` | `PF_GGAL_080526` | GGAL |
| `FCI_NOMBRE` | `FCI_DELTA` | DELTA |
| `CAUCION_CONTRA_VTO` | `CAUCION_BYMA_080426` | — (no computa) |
| `PASE_CONTRA_VTO` | `PASE_LATIN_080426` | — (no computa) |
| `REMU_BANCO` | `REMU_BANCO` | — (no computa) |

---

## Estado inicial (Día 1 — 7 de abril de 2026)

| Instrumento | Asset | Monto | Tasa | Vto |
|------------|-------|-------|------|-----|
| PF_GGAL_080526 | Plazo Fijo | $200.000.000 | 26.75% TNA | 08/05/2026 |
| REMU_BANCO | Remunerada | $80.000.000 | 12.50% TNA | — |
| CAUCION_BYMA_080426 | Caución | $200.000.000 | 20.00% TNA | 08/04/2026 |
| PASE_LATIN_080426 | Pase | $520.000.000 | 21.50% TNA | 08/04/2026 |

**Suscripción inicial Clase A**: ARS 1.000.000.000 → 1.000.000 cuotapartes a VCP 1.000.  
**Devengado Día 1**: $0 (concertación sin devengamiento).

---

## Tecnología

- HTML5 + CSS3 + JavaScript vanilla (sin frameworks, sin dependencias)
- Fuentes: IBM Plex Mono + IBM Plex Sans (Google Fonts)
- Compatible con Chrome, Firefox, Edge, Safari
- Sin backend — todo el estado vive en memoria del navegador
