# Instrucciones para Claude

## Sobre mí
- Soy principiante en programación. Explicame las cosas de forma simple, sin dar por sentado que conozco términos técnicos. Si usás un término técnico, explicalo brevemente.

## Idioma
- Hablame siempre en español rioplatense, usando "vos" (por ejemplo: "fijate", "podés", "tenés", "hacé").

## Forma de trabajar
- Antes de hacer cualquier cambio, explicame de forma simple qué vas a cambiar y por qué.
- Pedime permiso antes de crear, modificar o borrar cualquier archivo. No toques nada hasta que te diga que sí.
- Si hay varias formas de hacer algo, recomendame una y contame por qué, en pocas palabras.

## Cómo levantar el proyecto en una compu
- Hace falta Node 22 o más nuevo (lo pide `react-router`). En la Mac se instaló con Homebrew (`brew install node@22`).
- Después de clonar o de bajar cambios: `npm install`, y para ver la página `npm run dev` (queda en http://localhost:5173/).
- Antes de trabajar, bajar lo último de GitHub (`git pull`). Se trabaja desde dos compus y las conversaciones con Claude no pasan de una a otra: lo que haya que recordar va en este archivo.
- `npm run lint` (el revisor de código) tiene que quedar en cero errores.

## Cómo está organizado el código (dentro de `src`)
- `App.jsx`: las direcciones de la página y el manejo de la sesión del conductor.
- `config.js`: datos que se cambian seguido (WhatsApp, precio semanal, dirección de la API y de Google Sheets, fotos de la flota).
- `theme.js`: los colores. `routes.js`: la dirección y el título de cada sección.
- `utils/`: ayudas para fechas, montos, patentes y turnos.
- `components/`: piezas que se repiten (menú, pie de página, íconos, botones, botón de WhatsApp).
- `pages/`: una por pantalla (inicio, flota, formulario, ingreso, cambio de contraseña, "próximamente", pedir turno).
- `panel/`: el área del chofer (inicio, turnos, multas, mis datos).
- Los estilos van escritos dentro de cada componente; no hay hojas de estilo aparte.

## Formulario "Quiero manejar" y Google Sheets
- El formulario le envía los datos a un script de Google (Apps Script) que los guarda en una planilla. El script contesta `{ success: true }` o `{ success: false, error }`, y la página muestra "¡Solicitud enviada!" solo si recibe `success: true`.
- **No tocar el script de Google.** Decisión de Leonardo (6 de octubre de 2026): le costó mucho hacerlo funcionar. Cualquier mejora se hace del lado de la página. Si alguna vez hiciera falta cambiarlo, preguntarle antes y explicarle cómo volver atrás.
- Los nombres de los datos que se envían (`nombre`, `nacimiento`, `direccion`, `localidad`, `telefono`, `email`, `licencia`, `vigencia`, `urgencia`, `apps`, `alquilerPrevio`, `empresaAnterior`, `referencia`, `comentario`) los usa el script para armar las columnas: no se cambian.
- La página tiene dos trampas contra envíos automáticos: un casillero invisible y un mínimo de 5 segundos. No frenan a quien le escriba directo al script; si aparecen filas basura en la planilla, es por ahí.
- Probar un envío real crea una fila en la planilla real, aunque se haga desde la compu.

## Dónde están las tareas
- En Linear, proyecto "KPCars Web" (las tareas se llaman KPW-número). Ahí está lo hecho, lo pendiente y lo que salió de la revisión completa del 4 de octubre de 2026.
- Al terminar algo, actualizar la tarea en Linear y, si cambia una decisión o una regla, anotarlo también acá.

## Cómo se publica
- Cada `git push` a la rama `main` publica el sitio real: GitHub arma la página y la deja en la rama `deploy`, y Hostinger la copia al dominio.
- Por eso el trabajo a medio hacer va en otra rama, que no publica nada.
- La dirección oficial es `https://kpcars.com.ar`, sin `www` (decisión de Leonardo). `www` redirige sola; está en `public/.htaccess`.
- Para Google: `public/robots.txt` excluye las páginas privadas y `public/sitemap.xml` lista las públicas. Si se agrega una sección pública nueva, sumarla al `sitemap.xml` y ponerle título y descripción en `src/routes.js`.
- Una dirección que no existe muestra la página "no encontrada" (`src/pages/NotFoundPage.jsx`).
- Pendiente menor: actualizar `actions/checkout@v4` y `actions/setup-node@v4` en `.github/workflows/deploy.yml` (GitHub avisa que quedan viejas).

## Área del chofer: rediseño (octubre 2026)
**Dónde está:** en `main` y publicado en el sitio real desde el 3 de octubre de 2026, por pedido de Leonardo. El código ordenado en archivos y la nueva regla del turno urgente se publicaron el 5 de octubre de 2026. Todo está en `main`; no quedan ramas de trabajo abiertas.

**Qué se decidió**
- Los choferes entran 100% desde el celular y lo que más consultan son los turnos. El panel se piensa primero para celular, con letra grande.
- Pero también tiene que verse bien en pantallas grandes: ahí las secciones van como pestañas arriba a la derecha del saludo (como era antes), con el botón "Pedir turno", y el contenido usa el ancho.
- Secciones del panel: Inicio (`/panel/inicio`, es donde se entra), Turnos, Multas y Mis datos. En el celular van en una barra fija abajo.
- Pedir turno (`/turnos`) es en 3 pasos: qué le pasa al auto, qué día, revisar y confirmar. Reglas del turno normal: sin miércoles, sábados ni domingos; un día con 4 turnos normales queda "Sin lugar"; se ofrecen hasta 60 días para adelante.
- Turno urgente (decidido por Leonardo el 5 de octubre de 2026): en el paso 2 solo se puede elegir hoy o el día hábil siguiente. No se atienden sábados ni domingos (los miércoles sí). Desde las 18 hs ya no se ofrece "hoy". Si el día siguiente cae en fin de semana, se ofrece el lunes. El sistema acepta una emergencia con fecha del día siguiente.
- Los textos de la página van de "tú" ("Tienes", "Debes"), como el resto del sitio.
- Maqueta de referencia (privada, de la cuenta de Leonardo): https://claude.ai/artifact/UHbmVbMntYFq98wkpmN9C1

**Multas** (la sección no existía en el código; se hizo de cero)
- La API es `GET /mis-multas` (con sesión). Devuelve `multas` y `total_adeudado`. Cada multa trae: `id`, `fecha`, `fecha_vencimiento`, `descripcion`, `jurisdiccion`, `punto_rojo`, `sin_importe`, `patente`, `monto`, `monto_adeudado`, `cobrado`, `pdf_url`.
- El chofer ve: motivo, fecha, vencimiento, patente, jurisdicción, monto y el PDF de la multa. Los montos SÍ se muestran, y también el total adeudado.
- "Cobrada" (nombre interno) se muestra al chofer como "Pagada".
- "Punto rojo" es una multa pendiente que igual se paga; lleva una etiqueta. Si viene sin monto, se muestra "A confirmar".
- Si hay pago parcial, se muestra lo que falta y debajo "Pagaste $X de $Y".
- Se muestran en LISTA (tabla en pantallas grandes, renglones apilados en el celular), no en tarjetas. Pendientes arriba, pagadas plegadas abajo.

**Qué falta**
- Lo publicado el 5 de octubre de 2026 salió sin prueba previa: falta que Leonardo recorra el panel en el sitio real, pida un turno urgente de prueba para el día siguiente y pruebe ampliar la foto de perfil en "Mis datos".
- Leonardo probó en el sitio real confirmar un turno, cancelarlo y abrir un PDF de multa el 4 de octubre de 2026: funcionan. Claude no ejecuta esas acciones porque son reales; después de cambios en el panel hay que pedirle a Leonardo que las repita.
- Revisar la pantalla "Mis datos": es la de perfil anterior, sin rediseñar.
- Decidir si el botón flotante de WhatsApp se oculta dentro del panel en el celular (hoy puede tapar parte de la lista de multas).
- Decidir qué etiqueta llevan los turnos de fechas pasadas que el sistema sigue marcando "Agendado".
- Confirmar que los días "Sin lugar" que muestra el paso 2 coinciden con la realidad del taller.
