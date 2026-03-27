# Límites Normativos — TANGO MM Dinámico

Implementación de las reglas CNV aplicables a Fondos de Mercado de Dinero **Dinámicos**
(Sección II, Capítulo II, Título V de las NORMAS CNV N.T. 2013 y mod.)

---

## Tolerancia operativa

Los límites disparan **BREACH** (rojo) solo si se supera el umbral en más de
**0.10 puntos porcentuales**. Dentro de esa banda, el estado es **ATENCIÓN** (amarillo).

Esta tolerancia evita falsos positivos por redondeo o diferencias de valuación intradiarias.

---

## Regla 2 — Límite por emisora

**Umbral:** ≤ 20% del PN por emisora privada

**Computan:**
- Plazos Fijos (PF)
- FCIs de renta fija privada
- ONs, VCPs, otros instrumentos de deuda privada

**No computan:**
- Cuentas remuneradas (disponibilidades)
- Cauciones
- Pases
- Títulos públicos nacionales (Soberanos, LECAPs, BONCER, etc.)

**Detección de emisora** por convención de nombre:
- `PF_EMISORA_VTODDMMAA` → emisora = segundo segmento
- `FCI_NOMBRE` → emisora = segundo segmento
- Otros → primer segmento antes del `_`

---

## Regla 8 — Vida Promedio Ponderada (VPP)

**Umbral:** ≤ 35 días corridos

**Fórmula:**
```
VPP = Σ(monto_i × días_corridos_a_vto_i) / Σ(monto_i)
```

**Scope:** todos los AVD (PF + Caución + Pase) con fecha de vencimiento definida.  
Los instrumentos sin vencimiento (Remunerada) no integran el cálculo.  
Los días se cuentan desde `fechaHoy` hasta la fecha de vencimiento (días corridos).

---

## Regla 16 — Margen de Liquidez

**Umbral:** ratio ≥ 80%

**Fórmula:**
```
Numerador   = Disponibilidades (Remu) + min(10% PN,  AVD con vto ≤ T+1)
Denominador = AVD con vto > T+1
Ratio       = Numerador / Denominador ≥ 80%
```

**Lógica del min(10% PN, AVD T+1):**  
Los AVD que vencen en T+1 son casi tan líquidos como el efectivo, pero la norma
limita su contribución al numerador al 10% del PN para evitar sobreestimar la liquidez.

**Caso extremo:** si el denominador es $0 (toda la cartera vence en T+1 o son disponibilidades),
el ratio se considera 100% (fondo totalmente líquido).

---

## Regla 17 — Límite de Activos a Devengamiento (AVD)

**Umbral:** ≤ 30% del PN (para MM **Dinámico**)

> Para MM Clásico el límite es 35%.

**Fórmula:**
```
AVD_computable = PF + Caución + Pase   (solo los que vencen DESPUÉS de T+1)
Ratio = AVD_computable / PN ≤ 30%
```

**Excluidos del ratio:**
- AVD con vencimiento en T+1 (son prácticamente disponibilidades)
- Remunerada (disponibilidad pura)
- Títulos públicos (valuados a mercado)

---

## Regla 21 / 26 — PF Precancelables en período

**Umbral MM Dinámico:** ≤ 20% del PN en PF precancelables en período de precancelación.

> *Pendiente de implementación. Requiere marcar cada PF como "en período de preca" o no.*

---

## Política de Inversión del fondo

Límites adicionales definidos en el reglamento de gestión (no normativos CNV):

| Instrumento | Límite máximo |
|-------------|--------------|
| Plazo Fijo  | 20% del PN   |
| Caución     | 20% del PN   |
| Remunerada  | Sin límite   |
| Pases       | Sin límite   |

---

## Estados de los indicadores

| Estado | Color | Criterio |
|--------|-------|---------|
| **OK** | 🟢 Verde | ≤ 80% del límite máximo (o ≥ mínimo requerido) |
| **ATENCIÓN** | 🟡 Amarillo | Entre 80% del límite y el límite + 0.10% de tolerancia |
| **BREACH** | 🔴 Rojo | Supera el límite en más de 0.10 puntos porcentuales |
| **—** | Gris | No aplicable o sin datos suficientes para calcular |
