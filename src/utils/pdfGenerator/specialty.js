// pdf/generators/specialty.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDF_STYLES } from '../styles.js';
import { PDFUtils } from '../utils.js';

export function generateSpecialtyReport(data, filters = {}) {
  const doc = new jsPDF();
  const firstReport = data?.[0];
  if (!firstReport) {
    throw new Error('No hay datos disponibles para generar el reporte');
  }

  const {
    specialtyStatistics = [],
    topActiveDoctors = [],
    weeklyDistribution = {},
    kpis = {},
    executiveSummary = {}
  } = firstReport;

  PDFUtils.addHeader(doc, 'Medical Analytics & Reporting Division', 'CONSULTATIONS BY SPECIALTY');

  let yPosition = PDF_STYLES.spacing.header + 15;
  yPosition = PDFUtils.addReportInfo(doc, filters, yPosition);

  // Resumen ejecutivo
  const summaryMetrics = [
    { label: 'Total Consultations', value: executiveSummary.totalConsultations?.toLocaleString() || '0' },
    { label: 'Doctors Involved', value: kpis.doctorsInvolved?.toLocaleString() || '0' },
    { label: 'Distinct Specialties', value: kpis.distinctSpecialties?.toLocaleString() || '0' },
    { label: 'Medical Centers Involved', value: kpis.medicalCentersInvolved?.toLocaleString() || '0' },
    { label: 'Avg. per Doctor', value: kpis.avgConsultationsPerDoctor?.toFixed(1) || '0.0' },
    { label: 'Data Completeness', value: kpis.dataQuality?.dataCompletenessPercentage ? kpis.dataQuality.dataCompletenessPercentage.toFixed(1) + '%' : '0%' },
  ];

  yPosition = PDFUtils.addExecutiveSummary(doc, summaryMetrics, yPosition);

  // Tabla de especialidades
  if (specialtyStatistics.length > 0) {
    doc.setFontSize(PDF_STYLES.fonts.section.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF_STYLES.colors.primary);
    doc.text('ESTADÍSTICAS POR ESPECIALIDAD', PDF_STYLES.spacing.margin, yPosition);
    yPosition += 8;

    const tableColumns = [
      { header: 'Especialidad', dataKey: 'specialty' },
      { header: 'Total Consultas', dataKey: 'totalConsultations' },
      { header: 'Pacientes Únicos', dataKey: 'uniquePatients' },
      { header: 'Médicos Únicos', dataKey: 'uniqueDoctors' },
      { header: 'Promedio por Médico', dataKey: 'avgConsultationsPerDoctor' }
    ];

    const tableRows = specialtyStatistics.map(item => ({
      specialty: item.specialty || 'No especificado',
      totalConsultations: (item.totalConsultations || 0).toLocaleString(),
      uniquePatients: (item.uniquePatients || 0).toLocaleString(),
      uniqueDoctors: (item.uniqueDoctors || 0).toLocaleString(),
      avgConsultationsPerDoctor: (item.avgConsultationsPerDoctor || 0).toFixed(1)
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

    yPosition = doc.lastAutoTable.finalY + 10;
  }

  // Tabla de top doctors
  if (topActiveDoctors.length > 0) {
    doc.setFontSize(PDF_STYLES.fonts.section.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF_STYLES.colors.primary);
    doc.text('TOP 5 MÉDICOS MÁS ACTIVOS', PDF_STYLES.spacing.margin, yPosition);
    yPosition += 8;

    const tableColumns = [
      { header: 'Médico', dataKey: 'doctorName' },
      { header: 'Total Consultas', dataKey: 'totalConsultations' },
      { header: 'Porcentaje', dataKey: 'consultationShare' }
    ];

    const tableRows = topActiveDoctors.slice(0, 5).map(item => ({
      doctorName: item.doctorName || 'No especificado',
      totalConsultations: (item.totalConsultations || 0).toLocaleString(),
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

    yPosition = doc.lastAutoTable.finalY + 10;
  }

  // Distribución semanal
  if (Object.keys(weeklyDistribution).length > 0) {
    doc.setFontSize(PDF_STYLES.fonts.section.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF_STYLES.colors.primary);
    doc.text('DISTRIBUCIÓN SEMANAL', PDF_STYLES.spacing.margin, yPosition);
    yPosition += 8;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayNames = {
      'Monday': 'Lunes',
      'Tuesday': 'Martes',
      'Wednesday': 'Miércoles',
      'Thursday': 'Jueves',
      'Friday': 'Viernes',
      'Saturday': 'Sábado',
      'Sunday': 'Domingo'
    };

    const tableColumns = days.map(day => ({
      header: dayNames[day],
      dataKey: day
    }));

    const tableRow = {};
    days.forEach(day => {
      tableRow[day] = (weeklyDistribution[day] || 0).toString();
    });

    autoTable(doc, {
      columns: tableColumns,
      body: [tableRow],
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