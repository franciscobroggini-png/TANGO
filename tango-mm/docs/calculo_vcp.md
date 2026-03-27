# Metodología de Cálculo del VCP

## Definiciones

| Variable | Descripción |
|----------|-------------|
| `VCP` | Valor de Cuotaparte |
| `PN` | Patrimonio Neto del fondo |
| `SR` | Suscripciones y Rescates |
| `SG` | Sociedad Gerente |
| `SD` | Sociedad Depositaria |
| `AVD` | Activos Valuados a Devengamiento |
| `T+1` | Próximo día hábil bursátil |

---

## Fórmula principal

```
PN_hoy(clase) = PN_ayer(clase)
              + Neto_SR(clase)
              + Devengado_total × prop(clase)
              − Honorario_SG(clase)
              − Honorario_SD(clase)

VCP_hoy(clase) = PN_hoy(clase) / Cantidad_cuotapartes(clase)
```

---

## Proporción por clase

Cuando hay múltiples clases activas, el devengado se distribuye
proporcionalmente al PN de cada clase sobre el total:

```
prop(clase) = PN_ayer(clase) / Σ PN_ayer(todas las clases)
```

**Día 1 (fondo nuevo):** como `PN_ayer = 0` para todas las clases,
la proporción se calcula sobre los montos suscriptos en el día:

```
prop(clase) = Suscripción(clase) / Suscripción_total
```

---

## Devengamiento de instrumentos

Los instrumentos a tasa devuelven un interés diario que se suma al PN:

```
Devengado_diario(instrumento) = Monto_par × (TNA / 365)
```

> **Regla del día de concertación:** el instrumento comienza a devengar
> desde el día **siguiente** a su concertación. En el Día 1 el devengado es $0.

### Instrumentos que devengan

| Asset Class | Valuación | Incluye en devengado |
|-------------|-----------|---------------------|
| Plazo Fijo (PF) | Devengamiento | ✅ |
| Caución | Devengamiento | ✅ |
| Pase activo | Devengamiento | ✅ |
| Remunerada | Devengamiento | ✅ |
| LECAP | Mercado (TIR implícita) | según precio |
| Soberano HD | Mercado | según precio |
| FCI | Mercado (VCP del fondo) | según precio |
| Equity | Mercado | según precio |

---

## Honorarios

Se descuentan diariamente sobre el PN efectivo de la clase:

```
PN_efectivo(clase) = PN_ayer(clase) + Neto_SR(clase) × prop(clase)

Honorario_SG(clase) = (Tasa_SG / 365) × PN_efectivo(clase)
Honorario_SD(clase) = (Tasa_SD / 365) × PN_efectivo(clase)
```

### Tasas por clase

| Clase | Tasa SG (TNA) | Tasa SD (TNA) | Umbral PN |
|-------|--------------|--------------|-----------|
| A     | 2.25%        | 0.22%        | < $500M   |
| B     | 1.75%        | 0.22%        | $500M–$4.000M |
| C     | 1.50%        | 0.22%        | > $4.000M |

---

## Rendimiento

```
Rendimiento_diario = (VCP_hoy − VCP_ayer) / VCP_ayer

Rendimiento_anualizado = (1 + Rendimiento_diario)^365 − 1
```

---

## Ejemplo — Día 2 (primera jornada con devengamiento)

**Datos:**
- PN Día 1: $999.932.329 (después de honorarios, sin devengado)
- Cuotapartes Clase A: 1.000.000
- Cartera: PF $200M × 26.75%, Remu $80M × 12.50%, Caución $200M × 20.00%, Pase $520M × 21.50%

**Devengado total del Día 2:**
```
PF:      $200.000.000 × 26.75% / 365 = $146.575,34
Remu:    $ 80.000.000 × 12.50% / 365 =  $27.397,26
Caución: $200.000.000 × 20.00% / 365 =  $109.589,04
Pase:    $520.000.000 × 21.50% / 365 =  $306.301,37
─────────────────────────────────────────────────────
Total devengado:                          $589.863,01
```

**Honorarios Clase A (Día 2):**
```
SG: $999.932.329 × 2.25% / 365 = $61.640,91
SD: $999.932.329 × 0.22% / 365 =  $6.026,40
Total honorarios:                  $67.667,31
```

**PN Día 2:**
```
PN = $999.932.329 + $589.863,01 − $67.667,31 = $1.000.454.524,70
```

**VCP Día 2:**
```
VCP = $1.000.454.524,70 / 1.000.000 = 1.000,454525
```

**Rendimiento diario:** +0.0522% → **TNA: ~19.05%**
