import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportarExcel(datos, columnas, nombreArchivo) {
  const filas = datos.map((item) => {
    const fila = {};
    columnas.forEach(({ key, label }) => {
      fila[label] = item[key];
    });
    return fila;
  });

  const hoja = XLSX.utils.json_to_sheet(filas);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Datos');
  XLSX.writeFile(libro, `${nombreArchivo}.xlsx`);
}

export function exportarPDF(datos, columnas, nombreArchivo, titulo) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(titulo, 14, 15);
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [columnas.map((c) => c.label)],
    body: datos.map((item) => columnas.map((c) => item[c.key] ?? '—')),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [79, 70, 229] },
  });

  doc.save(`${nombreArchivo}.pdf`);
}

export async function exportarDashboardPDF(elementId, nombreArchivo = 'dashboard') {
  const { toPng } = await import('html-to-image');
  const elemento = document.getElementById(elementId);
  if (!elemento) return;

  document.querySelectorAll('.no-exportar').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.solo-exportar').forEach(el => el.classList.remove('hidden'));

  try {
    const dataUrl = await toPng(elemento, {
      backgroundColor: '#020617',
      pixelRatio: 2,
    });

    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => { img.onload = resolve; });

    const doc = new jsPDF({ orientation: 'portrait', unit: 'px', format: [img.width / 2, img.height / 2] });
    doc.addImage(dataUrl, 'PNG', 0, 0, img.width / 2, img.height / 2);
    doc.save(`${nombreArchivo}.pdf`);
  } finally {
    document.querySelectorAll('.no-exportar').forEach(el => el.style.display = '');
    document.querySelectorAll('.solo-exportar').forEach(el => el.classList.add('hidden'));
  }
}