<?php
/* Recibe las solicitudes del formulario "Quiero manejar" y se las pasa al script de Google
   (el mismo de siempre, sin cambios) desde este servidor.

   Por qué existe: el 13/10/2026 los navegadores en Argentina dejaron de poder hablarle de forma
   confiable al script de Google (contestaba 1 de cada 10 veces). Este servidor sí llega bien.
   Entonces el formulario le habla a este archivo, y este archivo le habla a Google.

   Para no perder nada: cada solicitud se anota primero en una lista de pendientes, fuera de la
   carpeta pública del sitio. Si Google no responde, queda ahí y se vuelve a intentar sola cuando
   llega la solicitud siguiente. */

const GOOGLE_URL = 'https://script.google.com/macros/s/AKfycby9oZ4hlk8mqZFRtVUWBq2qNGOSYNt5waPRx3L8FyQgGbudK0mkCd1IAQJlfwB_YtK4dQ/exec';
const CAMPOS = ['nombre', 'nacimiento', 'direccion', 'localidad', 'telefono', 'email', 'licencia', 'vigencia',
                'urgencia', 'apps', 'alquilerPrevio', 'empresaAnterior', 'referencia', 'comentario'];
const OBLIGATORIOS = ['nombre', 'nacimiento', 'direccion', 'localidad', 'telefono', 'email', 'licencia', 'vigencia',
                      'urgencia', 'alquilerPrevio', 'referencia'];
const MIN_SEGUNDOS = 5;      // menos que esto: envío automático
const MAX_LARGO = 600;       // largo máximo de cada dato
const TIEMPO_MAXIMO = 22;    // segundos que se le dedican a hablar con Google en cada pedido

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function responder(array $datos, int $codigo = 200): void {
  http_response_code($codigo);
  echo json_encode($datos);
  exit;
}

// Le manda una solicitud al script de Google. Devuelve true solo si Google contesta que la guardó.
function enviarAGoogle(array $solicitud, int $espera): bool {
  $ch = curl_init(GOOGLE_URL);
  curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($solicitud, JSON_UNESCAPED_UNICODE),
    CURLOPT_HTTPHEADER => ['Content-Type: text/plain;charset=utf-8'],
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT => max(3, min(10, $espera)), // Google suele tardar 1 o 2 segundos
  ]);
  $cuerpo = curl_exec($ch);
  $codigo = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  $respuesta = json_decode((string) $cuerpo, true);
  return $codigo === 200 && is_array($respuesta) && !empty($respuesta['success']);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') responder(['success' => false, 'error' => 'Solo POST'], 405);

$datos = json_decode((string) file_get_contents('php://input', false, null, 0, 20000), true);
if (!is_array($datos)) responder(['success' => false, 'error' => 'Datos inválidos'], 400);

// Trampas para envíos automáticos: se contesta "bien" pero no se guarda nada
if (!empty($datos['sitio']) || (int) ($datos['segundos'] ?? 0) < MIN_SEGUNDOS) responder(['success' => true]);

// Solo los campos conocidos, como texto, con largo máximo y sin "=" al principio (para que la planilla no lo tome como fórmula)
$solicitud = [];
foreach (CAMPOS as $campo) {
  $valor = is_scalar($datos[$campo] ?? '') ? trim((string) ($datos[$campo] ?? '')) : '';
  $solicitud[$campo] = ltrim(mb_substr($valor, 0, MAX_LARGO), '=');
}
foreach (OBLIGATORIOS as $campo) {
  if ($solicitud[$campo] === '') responder(['success' => false, 'error' => 'Faltan datos obligatorios'], 422);
}

$inicio = microtime(true);
$restante = fn() => (int) floor(TIEMPO_MAXIMO - (microtime(true) - $inicio));

// Carpeta fuera del sitio público: no se puede abrir desde internet y no se borra al publicar
$carpeta = dirname($_SERVER['DOCUMENT_ROOT']) . '/kpcars-solicitudes';
if (!is_dir($carpeta)) @mkdir($carpeta, 0700, true);
$archivoPendientes = $carpeta . '/pendientes.jsonl';
$candado = @fopen($carpeta . '/candado', 'c');

// Si no se puede usar la lista de pendientes, se intenta directo: mejor eso que perder la solicitud
if (!$candado || !flock($candado, LOCK_EX)) {
  $ok = enviarAGoogle($solicitud, $restante()) || enviarAGoogle($solicitud, $restante());
  responder(['success' => $ok, 'error' => $ok ? null : 'No se pudo guardar'], $ok ? 200 : 502);
}

// 1) Anotar la solicitud nueva al final de la lista
$pendientes = is_file($archivoPendientes) ? array_values(array_filter(array_map('trim', file($archivoPendientes)))) : [];
$nueva = json_encode(['id' => bin2hex(random_bytes(6)), 'recibida' => date('c'), 'solicitud' => $solicitud], JSON_UNESCAPED_UNICODE);
$pendientes[] = $nueva;
$anotada = @file_put_contents($archivoPendientes, implode("\n", $pendientes) . "\n") !== false;

// 2) Mandarle a Google todo lo pendiente, de la más vieja a la más nueva, mientras quede tiempo
$quedan = [];
$enviadas = 0;
foreach ($pendientes as $linea) {
  $item = json_decode($linea, true);
  if (!is_array($item) || !isset($item['solicitud'])) continue;
  $ok = $restante() >= 4 && enviarAGoogle($item['solicitud'], $restante());
  if (!$ok) $ok = $restante() >= 4 && enviarAGoogle($item['solicitud'], $restante());
  if ($ok) $enviadas++; else $quedan[] = $linea;
}
@file_put_contents($archivoPendientes, $quedan ? implode("\n", $quedan) . "\n" : '');

// Registro sin datos personales, para poder revisar qué pasó
@file_put_contents($carpeta . '/registro.log', date('c') . " enviadas=$enviadas pendientes=" . count($quedan) . "\n", FILE_APPEND);

flock($candado, LOCK_UN);

// La solicitud nueva está a salvo si llegó a Google o si quedó anotada para el próximo intento
$nuevaEnviada = !in_array($nueva, $quedan, true);
if ($nuevaEnviada || $anotada) responder(['success' => true, 'pendiente' => !$nuevaEnviada]);
responder(['success' => false, 'error' => 'No se pudo guardar'], 502);
