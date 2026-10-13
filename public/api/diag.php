<?php
// Diagnóstico temporal: mide si este servidor llega bien al script de Google. No guarda nada. Se borra después.
header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');
if (($_GET['k'] ?? '') !== 'kp-diag-1310') { http_response_code(404); exit("no"); }
$url = 'https://script.google.com/macros/s/AKfycby9oZ4hlk8mqZFRtVUWBq2qNGOSYNt5waPRx3L8FyQgGbudK0mkCd1IAQJlfwB_YtK4dQ/exec';
echo "php " . PHP_VERSION . " | curl " . (function_exists('curl_init') ? 'si' : 'NO') . " | servidor " . gethostname() . "\n";
$base = dirname($_SERVER['DOCUMENT_ROOT']);
echo "carpeta fuera del sitio escribible: " . (is_writable($base) ? 'si' : 'no') . " | tmp escribible: " . (is_writable(sys_get_temp_dir()) ? 'si' : 'no') . "\n";
$ok = 0; $n = 6;
for ($i = 1; $i <= $n; $i++) {
  $ch = curl_init($url);
  curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => 'prueba-no-json', CURLOPT_HTTPHEADER => ['Content-Type: text/plain;charset=utf-8'],
    CURLOPT_FOLLOWLOCATION => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8, CURLOPT_CONNECTTIMEOUT => 5]);
  $t0 = microtime(true); $body = curl_exec($ch); $code = curl_getinfo($ch, CURLINFO_HTTP_CODE); $err = curl_error($ch); curl_close($ch);
  $bien = ($code === 200 && strpos((string)$body, '"success"') !== false); if ($bien) $ok++;
  echo "$i: http=$code " . round(microtime(true) - $t0, 2) . "s " . ($bien ? 'OK' : 'FALLO ' . $err) . "\n";
}
echo "RESULTADO: $ok de $n\n";
