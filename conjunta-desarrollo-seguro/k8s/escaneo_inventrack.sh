#!/usr/bin/env bash

set -u

# --------------------------- Configuracion -----------------------------------
TARGET_HOST="conjunta3p.espe.edu.ec"
TARGET_URL="http://${TARGET_HOST}"
OUTDIR="resultados_$(date +%Y%m%d_%H%M%S)"

# --------------------------- Utilidades --------------------------------------
c_reset="\033[0m"; c_azul="\033[1;34m"; c_verde="\033[1;32m"; c_amar="\033[1;33m"

titulo()  { echo -e "\n${c_azul}==== $* ====${c_reset}"; }
ok()      { echo -e "${c_verde}[ok]${c_reset} $*"; }
aviso()   { echo -e "${c_amar}[aviso]${c_reset} $*"; }

registrar() {
  local archivo="$1"; shift
  echo -e "\n\$ $*" | tee -a "${OUTDIR}/${archivo}"
  "$@" 2>&1 | tee -a "${OUTDIR}/${archivo}"
}

requiere() {
  if ! command -v "$1" >/dev/null 2>&1; then
    aviso "Falta la herramienta '$1'; se omite esta seccion."
    return 1
  fi
  return 0
}

# --------------------------- Preparacion -------------------------------------
mkdir -p "${OUTDIR}"
titulo "Objetivo: ${TARGET_URL}  |  Resultados en: ${OUTDIR}/"

# --------------------------- Seccion 0: Resolucion y conectividad ------------
seccion_resolucion() {
  titulo "0. Resolucion del dominio y conectividad"
  registrar "00_resolucion.txt" getent hosts "${TARGET_HOST}"
  registrar "00_resolucion.txt" curl -s -o /dev/null -w "HTTP %{http_code}\n" \
    "${TARGET_URL}/api/health"
}

# --------------------------- Seccion 1: Mapeo de puertos (Nmap) --------------
seccion_nmap() {
  titulo "1. Mapeo de puertos (Nmap)"
  requiere nmap || return
  registrar "01_nmap_puertos.txt" \
    nmap -p- -T4 -Pn "${TARGET_HOST}"
  registrar "02_nmap_version.txt" \
    nmap -sV -sC -p 80 -Pn "${TARGET_HOST}"
  registrar "03_nmap_http.txt" \
    nmap --script "http-headers,http-methods,http-title" -p 80 -Pn "${TARGET_HOST}"
  ok "Mapeo de puertos completado."
}

# --------------------------- Seccion 2: Tecnologias (WhatWeb) ----------------
seccion_whatweb() {
  titulo "2. Deteccion de tecnologias (WhatWeb)"
  requiere whatweb || return
  registrar "04_whatweb.txt" \
    whatweb -v -a 3 "${TARGET_URL}"
  ok "Deteccion de tecnologias completada."
}

# --------------------------- Seccion 3: Cabeceras y rutas (curl) -------------
seccion_cabeceras() {
  titulo "3. Cabeceras HTTP y rutas del Ingress"
  requiere curl || return
  registrar "05_cabeceras.txt" curl -sI "${TARGET_URL}/"
  registrar "05_cabeceras.txt" curl -sI "${TARGET_URL}/api/health"
  registrar "06_rutas.txt" curl -s "${TARGET_URL}/api/health"
  echo "" | tee -a "${OUTDIR}/06_rutas.txt"
  registrar "06_rutas.txt" \
    curl -s -o /dev/null -w "GET /uploads/ -> HTTP %{http_code}\n" \
    "${TARGET_URL}/uploads/"
  ok "Inspeccion de cabeceras y rutas completada."
}

# --------------------------- Seccion 4: Nikto (Fase 4) -----------------------
seccion_nikto() {
  titulo "4. Analisis de vulnerabilidades: Nikto"
  requiere nikto || return
  registrar "07_nikto.txt" nikto -h "${TARGET_URL}"
  ok "Escaneo con Nikto completado."
}

# --------------------------- Seccion 5: Nuclei (Fase 4) ----------------------
seccion_nuclei() {
  titulo "5. Analisis de vulnerabilidades: Nuclei"
  requiere nuclei || return
  registrar "08_nuclei.txt" nuclei -u "${TARGET_URL}" \
    -tags misconfig,exposure,http,cve -severity low,medium,high,critical
  ok "Escaneo con Nuclei completado."
}

# --------------------------- Comprobacion previa -----------------------------
verificar_objetivo() {
  local code
  code="$(curl -s -m 5 -o /dev/null -w '%{http_code}' "${TARGET_URL}/api/health" 2>/dev/null)"
  if [ "${code}" != "200" ]; then
    aviso "El objetivo ${TARGET_URL} no responde (HTTP ${code})."
    exit 1
  fi
  ok "Objetivo alcanzable (HTTP 200). Se continua con el escaneo."
}

# --------------------------- Orquestacion ------------------------------------
seccion_resolucion
verificar_objetivo
seccion_nmap
seccion_whatweb
seccion_cabeceras
seccion_nikto
seccion_nuclei

titulo "Fases 2 y 4 finalizadas. Los archivos en ${OUTDIR}/"

