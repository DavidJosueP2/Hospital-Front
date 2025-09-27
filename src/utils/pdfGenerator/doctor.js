// pdf/generators/doctor.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDF_STYLES } from '../styles.js';
import { PDFUtils } from '../utils.js';

export function generateDoctorReport(data, filters = {}) {
  const doc = new jsPDF();
  const firstReport = data?.[0];
  if (!firstReport) {
    throw new Error('No hay datos disponibles para generar el reporte');
  }

  // Asumiendo que la estructura para doctor es similar a specialty, pero con datos de doctores
  const {
    topActiveDoctors = [],
    kpis = {},
    executiveSummary = {}
  } = firstReport;

  PDFUtils.addHeader(doc, 'Medical Analytics & Reporting Division', 'CONSULTATIONS BY DOCTOR');

  let yPosition = PDF_STYLES.spacing.header + 15;
  yPosition = PDFUtils.addReportInfo(doc, filters, yPosition);

  // Resumen ejecutivo
  const summaryMetrics = [
    { label: 'Total Consultations', value: executiveSummary.totalConsultations?.toLocaleString() || '0' },
    { label: 'Doctors Involved', value: kpis.doctorsInvolved?.toLocaleString() || '0' },
    { label: 'Avg. per Doctor', value: kpis.avgConsultationsPerDoctor?.toFixed(1) || '0.0' },
  ];

  yPosition = PDFUtils.addExecutiveSummary(doc, summaryMetrics, yPosition);

  // Tabla de doctores
  if (topActiveDoctors.length > 0) {
    doc.setFontSize(PDF_STYLES.fonts.section.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF_STYLES.colors.primary);
    doc.text('RENDIMIENTO POR MÉDICO', PDF_STYLES.spacing.margin, yPosition);
    yPosition += 8;

    const tableColumns = [
      { header: 'Médico', dataKey: 'doctorName' },
      { header: 'Total Consultas', dataKey: 'totalConsultations' },
      { header: 'Pacientes Únicos', dataKey: 'uniquePatients' },
      { header: 'Porcentaje', dataKey: 'consultationShare' }
    ];

    const tableRows = topActiveDoctors.map(item => ({
      doctorName: item.doctorName || 'No especificado',
      totalConsultations: (item.totalConsultations || 0).toLocaleString(),
      uniquePatients: (item.uniquePatients || 0).toLocaleString(),
      consultationShare: (item.consultationShare || 0).toFixed(1) + '%'
    }));

    autoTable(doc, {
      columns: tableColumns,
      body: tableRows,
      startY: yPosition,
      theme: 'grid',
      headStyles: {
        fillColor: PDF_STYLES.colors.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: PDF_STYLES.fonts.tableHeader.size,
        cellPadding: 2
      },
      bodyStyles: {
        fontSize: PDF_STYLES.fonts.tableBody.size,
        textColor: PDF_STYLES.colors.primary,
        cellPadding: 2
      },
      alternateRowStyles: {
        fillColor: PDF_STYLES.colors.lightGray
      },
      margin: { left: PDF_STYLES.spacing.margin, right: PDF_STYLES.spacing.margin }
    });
  }

  PDFUtils.addFooter(doc);
  return doc;
}