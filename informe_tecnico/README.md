# Informe Técnico Final — InvenTrack (Plantilla LaTeX, APA 7)

## Estructura de archivos

```
informe_tecnico/
├── main.tex          # Documento principal (toda la estructura del informe)
├── referencias.bib   # Fuentes bibliográficas en formato APA 7
├── imagenes/         # Capturas de pantalla (.png/.jpg)
└── README.md         # Este archivo
```

## Requisitos

Distribución de LaTeX completa que incluya la clase `apa7` y `biblatex`:

- **Linux (Arch):** `sudo pacman -S texlive-meta` (o al menos
  `texlive-latexextra`, `texlive-bibtexextra`, `texlive-langspanish` y `biber`).
- **TeX Live (genérico):** `tlmgr install apa7 biblatex biblatex-apa biber`
- **MiKTeX:** instala los paquetes automáticamente.

## Cómo compilar

Desde la carpeta `informe_tecnico/`:

```bash
pdflatex main.tex
biber main
pdflatex main.tex
pdflatex main.tex
```

Se generará `main.pdf`. La doble/triple pasada es necesaria para el índice,
las referencias cruzadas y la bibliografía.

> Alternativa en un solo comando (si se tiene `latexmk`):
>
> ```bash
> latexmk -pdf -bibtex main.tex
> ```
>
> (usa biber si configuras `$biber` en tu `.latexmkrc`; con biblatex-biber lo
> más simple es `latexmk -pdf main.tex` tras ajustar el backend).

## Mapa de la rúbrica → secciones

| Sección del informe                 | Entregable / Fase                | Peso     |
| ----------------------------------- | -------------------------------- | -------- |
| 1. Dockerización                    | Dockerfiles seguros              | 10%      |
| 2. Manifiestos K8s                  | YAML en GitHub                   | 10%      |
| 3. Despliegue e Ingress             | Dominio `conjunta3p.espe.edu.ec` | 10%      |
| 4.1 Fase 1                          | Pre-engagement                   | 5%       |
| 4.2 Fase 2                          | Intelligence Gathering           | 8%       |
| 4.3 Fase 3                          | Threat Modeling                  | 7%       |
| 4.4 Fase 4                          | Vulnerability Analysis           | 12%      |
| 4.5 Fase 5                          | Exploitation                     | 15%      |
| 4.6 Fase 6                          | Post-Exploitation                | 8%       |
| 4.7 Fase 7                          | Reporting                        | 5%       |
| 5. Informe técnico (calidad global) | Documento final                  | 10%      |
| **Total**                           |                                  | **100%** |
