# Sistema para supermercado (Super Encinas)

App de gestión de un supermercado con dos sucursales. Usuario final no técnico: explicar en español rioplatense, sin jerga.

## Cómo está armado
- `src/` tiene el código en partes; `src/ORDEN.txt` fija el orden.
- `python3 build.py` une las partes y genera `index.html`, que es lo que publica GitHub Pages (rama `main`, carpeta raíz).
- **Nunca editar `index.html` a mano**: editar `src/` y correr `build.py`. `python3 build.py --check` verifica que estén sincronizados.
- Datos y usuarios: Firebase (proyecto `supermercado-bb0e9`), Auth por correo/contraseña (usuario + `@superencinas.app`) y Firestore. Plan gratuito Spark.
- `firestore.rules` es la copia de las reglas; **se publican a mano** desde la consola de Firebase (pestaña Reglas). Si se cambian, avisarle al dueño que las pegue.
- El repositorio es público: acá va solo código, nunca datos del negocio.

## Antes de publicar
1. `python3 build.py`
2. `node pruebas/recorrido.js` (necesita Playwright; usa `pruebas/firebase-simulado.js`, que imita Firebase y sus reglas). Todas las líneas deben empezar con `ok`.
3. `git commit` y `git push origin main`. La app avisa sola a los usuarios que hay versión nueva.

## Cosas a saber
- Los permisos se guardan por usuario (`cuentas/{usuario}.permisos`); los rangos (`RANGOS`) son plantillas. Cambiar una plantilla no cambia a los usuarios ya asignados.
- Las reglas distinguen: acceso completo (`fin()`), caja (`caja()`), traslados/mercadería (`depo()`) y datos propios (`esMia()`). Si una función nueva escribe en otra colección, revisar reglas y el simulador.
- Las escrituras no esperan al servidor (`dbRapida`): confirman al instante y avisan si después fallan.
- Límites del plan gratuito: 50.000 lecturas por día. Los usuarios con acceso completo bajan todos los datos del mes al abrir.
- Cajas: los usuarios con acceso completo solo bajan los cierres de los últimos 7 días y los que faltan corroborar. Los cerrados se copian a `cajasmes/{AAAA-MM}` (un documento por mes, campo `r` con cada cierre como texto JSON); `CJ` se arma mezclando ambos (`cjMix`). Todo cambio a un cierre ya corroborado tiene que llamar a `cjArchUp`. Los informes por período piden los meses con `cjNeed(d1,d2)`.
- Pagos a proveedores sin boleta (`src/12b-pagos-directos.js`): colecciones `pagosdir` (cada pago, número PG-xxxxxx), `pagosadj` (foto y firma como imagen, se baja solo al abrir un pago), `pgefec` (efectivo recibido de las cajas) y `pgarq` (conteos). Permisos `pgd` (carga, rango "Pagos a proveedores": no ve nada más ni puede editar ni anular) y `pgc` (control semanal, cuenta como acceso completo). `CFG.soloPagos` esconde todo salvo `SOLOK`.
