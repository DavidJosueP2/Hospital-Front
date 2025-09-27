import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Configuración de estilos profesional en blanco y negro
const PDF_STYLES = {
  colors: {
    primary: [0, 0, 0], // Negro puro
    secondary: [100, 100, 100], // Gris oscuro
    lightGray: [240, 240, 240], // Gris claro para fondos
    mediumGray: [200, 200, 200] // Gris medio para bordes
  },
  fonts: {
    title: { size: 16, style: 'bold', font: 'times' },
    subtitle: { size: 12, style: 'bold', font: 'times' },
    section: { size: 11, style: 'bold', font: 'times' },
    body: { size: 10, style: 'normal', font: 'times' },
    small: { size: 8, style: 'normal', font: 'times' },
    tableHeader: { size: 9, style: 'bold', font: 'times' },
    tableBody: { size: 8, style: 'normal', font: 'times' }
  },
  spacing: {
    header: 25,
    margin: 15,
    section: 12,
    line: 5
  }
};

// Utilidades para formato profesional
const PDFUtils = {
  // Header minimalista profesional
  addHeader: (doc, title, subtitle = null) => {
    const { margin, header } = PDF_STYLES.spacing;
    
    // Línea superior decorativa
    doc.setDrawColor(...PDF_STYLES.colors.primary);
    doc.setLineWidth(0.5);
    doc.line(margin, header - 5, 210 - margin, header - 5);
    
    // Título principal
    doc.setFont(PDF_STYLES.fonts.title.font, PDF_STYLES.fonts.title.style);
    doc.setFontSize(PDF_STYLES.fonts.title.size);
    doc.setTextColor(...PDF_STYLES.colors.primary);
    doc.text('HOSPITAL MANAGEMENT SYSTEM', margin, header - 10);
    
    // Subtítulo
    if (subtitle) {
      doc.setFontSize(PDF_STYLES.fonts.subtitle.size);
      doc.text(subtitle, margin, header - 2);
    }
    
    // Línea inferior decorativa
    doc.setLineWidth(0.2);
    doc.line(margin, header + 2, 210 - margin, header + 2);
  },

  // Información de metadatos del reporte
  addReportInfo: (doc, filters, yPosition) => {
    const { margin } = PDF_STYLES.spacing;
    let currentY = yPosition;
    
    doc.setFontSize(PDF_STYLES.fonts.small.size);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...PDF_STYLES.colors.secondary);
    
    // Fecha de generación
    const currentDate = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm:ss", { locale: es });
    doc.text(`Generado el: ${currentDate}`, margin, currentY);
    
    // Tipo de reporte
    const reportTypes = {
      'specialty': 'Consultas por Especialidad',
      'doctor': 'Consultas por Médico',
      'medical-center': 'Consultas por Centro Médico',
      'monthly': 'Estadísticas Mensuales'
    };
    
    currentY += 4;
    doc.text(`Tipo de Reporte: ${reportTypes[filters.reportType] || filters.reportType}`, margin, currentY);
    
    // Filtros aplicados
    const activeFilters = [];
    
    if (filters.startDate && filters.endDate) {
      const start = format(new Date(filters.startDate), 'dd/MM/yyyy', { locale: es });
      const end = format(new Date(filters.endDate), 'dd/MM/yyyy', { locale: es });
      activeFilters.push(`Período: ${start} - ${end}`);
    }
    
    if (filters.specialty && filters.specialty !== 'ALL') {
      activeFilters.push(`Especialidad: ${filters.specialtyName || 'Filtrada'}`);
    }
    
    if (filters.doctor && filters.doctor !== 'ALL') {
      activeFilters.push(`Médico: ${filters.doctorName || 'Filtrado'}`);
    }
    
    if (filters.medicalCenter && filters.medicalCenter !== 'ALL') {
      activeFilters.push(`Centro Médico: ${filters.medicalCenterName || 'Filtrado'}`);
    }
    
    if (activeFilters.length > 0) {
      currentY += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('Filtros Aplicados:', margin, currentY);
      
      activeFilters.forEach((filter, index) => {
        currentY += 4;
        doc.setFont('helvetica', 'normal');
        doc.text(`• ${filter}`, margin + 5, currentY);
      });
    }
    
    return currentY + 8;
  },

  // Resumen ejecutivo mejorado
  addExecutiveSummary: (doc, summaryConfig, yPosition) => {
    const { margin } = PDF_STYLES.spacing;
    const startY = yPosition;
    
    // Título de sección
    doc.setFontSize(PDF_STYLES.fonts.section.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF_STYLES.colors.primary);
    doc.text('RESUMEN EJECUTIVO', margin, startY);
    
    // Línea decorativa bajo el título
    doc.setDrawColor(...PDF_STYLES.colors.mediumGray);
    doc.setLineWidth(0.3);
    doc.line(margin, startY + 1, 60, startY + 1);
    
    let currentY = startY + 8;
    
    // Grid de métricas
    const metrics = summaryConfig; // Ahora summaryConfig es un array de { label, value } con value string
    
    // Dividir en 2 columnas si hay muchas métricas
    const half = Math.ceil(metrics.length / 2);
    
    metrics.forEach((metric, index) => {
      const col = index < half ? 0 : 1;
      const row = index < half ? index : index - half;
      
      const x = margin + (col * 90);
      const y = currentY + (row * 12);
      
      // Etiqueta
      doc.setFontSize(PDF_STYLES.fonts.small.size);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...PDF_STYLES.colors.secondary);
      doc.text(metric.label, x, y);
      
      // Valor
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...PDF_STYLES.colors.primary);
      doc.text(metric.value, x + 40, y);
    });
    
    return currentY + (half * 12) + 10;
  },

  // Footer profesional
  addFooter: (doc) => {
    const pageCount = doc.internal.getNumberOfPages();
    const pageHeight = doc.internal.pageSize.height;
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      doc.setFontSize(PDF_STYLES.fonts.small.size);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...PDF_STYLES.colors.secondary);
      
      // Línea separadora
      doc.setDrawColor(...PDF_STYLES.colors.mediumGray);
      doc.setLineWidth(0.2);
      doc.line(PDF_STYLES.spacing.margin, pageHeight - 15, 210 - PDF_STYLES.spacing.margin, pageHeight - 15);
      
      // Texto del footer
      doc.text('Hospital Management System - Reporte Confidencial', 
               PDF_STYLES.spacing.margin, pageHeight - 10);
      doc.text(`Página ${i} de ${pageCount}`, 
               210 - PDF_STYLES.spacing.margin, pageHeight - 10, { align: 'right' });
    }
  }
};

// Generador de reportes profesional en blanco y negro
export const PDFGenerator = {
  /**
   * Reporte de Consultas por Especialidad - Diseño profesional
   */
    generateSpecialtyReport: (data, filters = {}) => {
    const doc = new jsPDF();
    const firstReport = data?.[0];
    const specialtyData = firstReport?.specialtyStatistics || [];
    const topDoctors = firstReport?.topActiveDoctors || [];
    const weeklyDistribution = firstReport?.weeklyDistribution || {};
    const kpis = firstReport?.kpis || {};
    const executiveSummary = firstReport?.executiveSummary || {};

    // Configurar encoding para UTF-8
    // doc.setLanguage('es');
    
    // Header
    PDFUtils.addHeader(doc, 'Medical Analytics & Reporting Division', 'CONSULTATIONS BY SPECIALTY');

    // Información del reporte
    let yPosition = PDF_STYLES.spacing.header + 15;
    yPosition = PDFUtils.addReportInfo(doc, filters, yPosition);

    // Resumen ejecutivo con KPIs
    const summaryConfig = [
      { label: 'Total Consultations', value: executiveSummary.totalConsultations?.toLocaleString() || '0' },
      { label: 'Doctors Involved', value: kpis.doctorsInvolved?.toLocaleString() || '0' },
      { label: 'Distinct Specialties', value: kpis.distinctSpecialties?.toLocaleString() || '0' },
      { label: 'Medical Centers Involved', value: kpis.medicalCentersInvolved?.toLocaleString() || '0' },
      { label: 'Avg. Consultations per Doctor', value: kpis.avgConsultationsPerDoctor?.toFixed(1) || '0.0' },
      { label: 'Data Completeness', value: kpis.dataQuality?.dataCompletenessPercentage ? kpis.dataQuality.dataCompletenessPercentage.toFixed(1) + '%' : '0%' },
      { label: 'Consultations with Diagnosis', value: kpis.dataQuality?.consultationsWithDiagnosis?.toLocaleString() || '0' },
      { label: 'Consultations with Treatment', value: kpis.dataQuality?.consultationsWithTreatment?.toLocaleString() || '0' }
    ];

    yPosition = PDFUtils.addExecutiveSummary(doc, specialtyData, summaryConfig, yPosition);

    // Tabla de especialidades
    if (specialtyData.length > 0) {
      const tableColumns = [
        { header: 'Specialty', dataKey: 'specialty' },
        { header: 'Total Consultations', dataKey: 'totalConsultations' },
        { header: 'Unique Patients', dataKey: 'uniquePatients' },
        { header: 'Unique Doctors', dataKey: 'uniqueDoctors' },
        { header: 'Consultations/Doctor', dataKey: 'avgConsultationsPerDoctor' }
      ];

      const tableRows = specialtyData.map(item => ({
        specialty: item.specialty || 'Not Specified',
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
          font: 'times',
          fontStyle: 'bold',
          fontSize: PDF_STYLES.fonts.tableHeader.size,
          cellPadding: 2,
          lineWidth: 0.1
        },
        bodyStyles: {
          fontSize: PDF_STYLES.fonts.tableBody.size,
          textColor: PDF_STYLES.colors.primary,
          cellPadding: 2,
          lineWidth: 0.1
        },
        alternateRowStyles: {
          fillColor: PDF_STYLES.colors.lightGray
        },
        styles: {
          lineColor: PDF_STYLES.colors.mediumGray,
          lineWidth: 0.1
        },
        margin: { left: PDF_STYLES.spacing.margin, right: PDF_STYLES.spacing.margin },
        tableLine: true
      });

      yPosition = doc.lastAutoTable.finalY + 10;
    }

    // Tabla de top doctors
    if (topDoctors.length > 0) {
      // Título de la sección
      doc.setFontSize(PDF_STYLES.fonts.section.size);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...PDF_STYLES.colors.primary);
      doc.text('TOP 5 MOST ACTIVE DOCTORS', PDF_STYLES.spacing.margin, yPosition);

      yPosition += 8;

      const tableColumns = [
        { header: 'Doctor', dataKey: 'doctorName' },
        { header: 'Total Consultations', dataKey: 'totalConsultations' },
        { header: 'Consultation Share', dataKey: 'consultationShare' }
      ];

      const tableRows = topDoctors.slice(0, 5).map(item => ({
        doctorName: item.doctorName || 'Not Specified',
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
          font: 'times',
          fontStyle: 'bold',
          fontSize: PDF_STYLES.fonts.tableHeader.size,
          cellPadding: 2,
          lineWidth: 0.1
        },
        bodyStyles: {
          fontSize: PDF_STYLES.fonts.tableBody.size,
          textColor: PDF_STYLES.colors.primary,
          cellPadding: 2,
          lineWidth: 0.1
        },
        alternateRowStyles: {
          fillColor: PDF_STYLES.colors.lightGray
        },
        styles: {
          lineColor: PDF_STYLES.colors.mediumGray,
          lineWidth: 0.1
        },
        margin: { left: PDF_STYLES.spacing.margin, right: PDF_STYLES.spacing.margin },
        tableLine: true
      });

      yPosition = doc.lastAutoTable.finalY + 10;
    }

    // Tabla de distribución semanal
    if (Object.keys(weeklyDistribution).length > 0) {
      doc.setFontSize(PDF_STYLES.fonts.section.size);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...PDF_STYLES.colors.primary);
      doc.text('WEEKLY CONSULTATION DISTRIBUTION', PDF_STYLES.spacing.margin, yPosition);

      yPosition += 8;

      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const tableColumns = days.map(day => ({ header: day, dataKey: day }));
      const tableRow = {};
      days.forEach(day => {
        tableRow[day] = (weeklyDistribution[day] || 0).toLocaleString();
      });

      autoTable(doc, {
        columns: tableColumns,
        body: [tableRow],
        startY: yPosition,
        theme: 'grid',
        headStyles: {
          fillColor: PDF_STYLES.colors.primary,
          textColor: [255, 255, 255],
          font: 'times',
          fontStyle: 'bold',
          fontSize: PDF_STYLES.fonts.tableHeader.size,
          cellPadding: 2,
          lineWidth: 0.1
        },
        bodyStyles: {
          fontSize: PDF_STYLES.fonts.tableBody.size,
          textColor: PDF_STYLES.colors.primary,
          cellPadding: 2,
          lineWidth: 0.1
        },
        alternateRowStyles: {
          fillColor: PDF_STYLES.colors.lightGray
        },
        styles: {
          lineColor: PDF_STYLES.colors.mediumGray,
          lineWidth: 0.1
        },
        margin: { left: PDF_STYLES.spacing.margin, right: PDF_STYLES.spacing.margin },
        tableLine: true
      });
    }

    PDFUtils.addFooter(doc);
    return doc;
  },

  /**
   * Reporte de Consultas por Médico - Diseño profesional
   */
  generateDoctorReport: (data, filters = {}) => {
    const doc = new jsPDF();
    const firstReport = data?.[0];
    const doctorData = firstReport?.topActiveDoctors || [];

    PDFUtils.addHeader(doc, 'Medical Analytics & Reporting Division', 'CONSULTATIONS BY DOCTOR');

    let yPosition = PDF_STYLES.spacing.header + 15;
    yPosition = PDFUtils.addReportInfo(doc, filters, yPosition);

    const summaryConfig = [
      { label: 'Total Records', value: (data) => doctorData.length.toString() },
      { label: 'Total Consultations', 
        value: (data) => doctorData.reduce((sum, item) => sum + (item.totalConsultations || 0), 0).toLocaleString() },
      { label: 'Unique Patients', 
        value: (data) => doctorData.reduce((sum, item) => sum + (item.uniquePatients || 0), 0).toLocaleString() },
      { label: 'Report Status', value: 'Completed Successfully' },
      { label: 'Data Quality', value: doctorData.length > 0 ? 'Validated' : 'No Data' },
      { label: 'Avg. per Doctor', 
        value: (data) => {
          const avg = doctorData.length > 0 ? 
            doctorData.reduce((sum, item) => sum + (item.totalConsultations || 0), 0) / doctorData.length : 0;
          return avg.toFixed(1);
        }
      },
      { label: 'Top Performer', 
        value: (data) => {
          const top = doctorData.reduce((max, item) => 
            (item.totalConsultations || 0) > (max.totalConsultations || 0) ? item : max, doctorData[0]);
          return top?.doctorName ? top.doctorName.split(' ')[0] + '...' : 'N/A';
        }
      }
    ];

    yPosition = PDFUtils.addExecutiveSummary(doc, doctorData, summaryConfig, yPosition);

    if (doctorData.length > 0) {
      const tableColumns = [
        { header: 'Doctor', dataKey: 'doctorName' },
        { header: 'Specialty', dataKey: 'specialty' },
        { header: 'Total Consultations', dataKey: 'totalConsultations' },
        { header: 'Unique Patients', dataKey: 'uniquePatients' },
        { header: 'Efficiency %', dataKey: 'efficiency' }
      ];

      const tableRows = doctorData.map(item => ({
        doctorName: item.doctorName || 'Not Specified',
        specialty: item.specialty || 'Not Specified',
        totalConsultations: (item.totalConsultations || 0).toLocaleString(),
        uniquePatients: (item.uniquePatients || 0).toLocaleString(),
        efficiency: item.totalConsultations > 0 ?
          (((item.totalConsultations - (item.activeConsultations || 0)) / item.totalConsultations) * 100).toFixed(1) + '%' : '0%'
      }));

      autoTable(doc, {
        columns: tableColumns,
        body: tableRows,
        startY: yPosition,
        theme: 'grid',
        headStyles: {
          fillColor: PDF_STYLES.colors.primary,
          textColor: [255, 255, 255],
          font: 'times',
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
        styles: {
          lineColor: PDF_STYLES.colors.mediumGray,
          lineWidth: 0.1
        },
        margin: { left: PDF_STYLES.spacing.margin, right: PDF_STYLES.spacing.margin }
      });
    }

    PDFUtils.addFooter(doc);
    return doc;
  },

  /**
   * Reporte de Centros Médicos - Diseño profesional
   */
  generateMedicalCenterReport: (data, filters = {}) => {
    const doc = new jsPDF();
    const firstReport = data?.[0];
    const centerData = firstReport?.medicalCenterStatistics || [];

    PDFUtils.addHeader(doc, 'Medical Analytics & Reporting Division', 'CONSULTATIONS BY MEDICAL CENTER');

    let yPosition = PDF_STYLES.spacing.header + 15;
    yPosition = PDFUtils.addReportInfo(doc, filters, yPosition);

    const summaryConfig = [
      { label: 'Total Records', value: (data) => centerData.length.toString() },
      { label: 'Total Consultations', 
        value: (data) => centerData.reduce((sum, item) => sum + (item.totalConsultations || 0), 0).toLocaleString() },
      { label: 'Unique Patients', 
        value: (data) => centerData.reduce((sum, item) => sum + (item.uniquePatients || 0), 0).toLocaleString() },
      { label: 'Active Doctors', 
        value: (data) => centerData.reduce((sum, item) => sum + (item.activeDoctors || 0), 0).toLocaleString() },
      { label: 'Report Status', value: 'Completed Successfully' },
      { label: 'Most Active Center', 
        value: (data) => {
          const top = centerData.reduce((max, item) => 
            (item.totalConsultations || 0) > (max.totalConsultations || 0) ? item : max, centerData[0]);
          return top?.centerName ? top.centerName.substring(0, 15) + '...' : 'N/A';
        }
      }
    ];

    yPosition = PDFUtils.addExecutiveSummary(doc, centerData, summaryConfig, yPosition);

    if (centerData.length > 0) {
      const tableColumns = [
        { header: 'Medical Center', dataKey: 'centerName' },
        { header: 'Total Consultations', dataKey: 'totalConsultations' },
        { header: 'Unique Patients', dataKey: 'uniquePatients' },
        { header: 'Active Doctors', dataKey: 'activeDoctors' },
        { header: 'Consultations/Doctor', dataKey: 'consultationsPerDoctor' }
      ];

      const tableRows = centerData.map(item => ({
        centerName: item.centerName || 'Not Specified',
        totalConsultations: (item.totalConsultations || 0).toLocaleString(),
        uniquePatients: (item.uniquePatients || 0).toLocaleString(),
        activeDoctors: (item.activeDoctors || 0).toLocaleString(),
        consultationsPerDoctor: item.activeDoctors > 0 ?
          ((item.totalConsultations || 0) / item.activeDoctors).toFixed(1) : '0.0'
      }));

      autoTable(doc, {
        columns: tableColumns,
        body: tableRows,
        startY: yPosition,
        // ... mismo estilo que los anteriores
      });
    }

    PDFUtils.addFooter(doc);
    return doc;
  },

  /**
   * Reporte Mensual - Diseño profesional
   */
  generateMonthlyReport: (data, filters = {}) => {
    const doc = new jsPDF();
    const firstReport = data?.[0];
    const monthlyData = firstReport?.monthlyStatistics || [];

    PDFUtils.addHeader(doc, 'Medical Analytics & Reporting Division', 'MONTHLY CONSULTATION STATISTICS');

    let yPosition = PDF_STYLES.spacing.header + 15;
    yPosition = PDFUtils.addReportInfo(doc, filters, yPosition);

    const summaryConfig = [
      { label: 'Period Analyzed', value: (data) => `${monthlyData.length} months` },
      { label: 'Total Consultations', 
        value: (data) => monthlyData.reduce((sum, item) => sum + (item.totalConsultations || 0), 0).toLocaleString() },
      { label: 'Average Growth', 
        value: (data) => {
          const avgGrowth = monthlyData.reduce((sum, item) => sum + (item.growth || 0), 0) / monthlyData.length;
          return `${avgGrowth >= 0 ? '+' : ''}${avgGrowth.toFixed(1)}%`;
        }
      },
      { label: 'Report Status', value: 'Completed Successfully' },
      { label: 'Best Performing Month', 
        value: (data) => {
          const best = monthlyData.reduce((max, item) => 
            (item.totalConsultations || 0) > (max.totalConsultations || 0) ? item : max, monthlyData[0]);
          return best?.period || 'N/A';
        }
      }
    ];

    yPosition = PDFUtils.addExecutiveSummary(doc, monthlyData, summaryConfig, yPosition);

    if (monthlyData.length > 0) {
      const tableColumns = [
        { header: 'Period', dataKey: 'period' },
        { header: 'Total Consultations', dataKey: 'totalConsultations' },
        { header: 'Unique Patients', dataKey: 'uniquePatients' },
        { header: 'Specialties', dataKey: 'specialtyCount' },
        { header: 'Growth %', dataKey: 'growth' }
      ];

      const tableRows = monthlyData.map(item => ({
        period: item.period || 'N/A',
        totalConsultations: (item.totalConsultations || 0).toLocaleString(),
        uniquePatients: (item.uniquePatients || 0).toLocaleString(),
        specialtyCount: (item.specialtyCount || 0).toLocaleString(),
        growth: `${item.growth >= 0 ? '+' : ''}${item.growth?.toFixed(1)}%`
      }));

      autoTable(doc, {
        columns: tableColumns,
        body: tableRows,
        startY: yPosition,
        // ... mismo estilo
      });
    }

    PDFUtils.addFooter(doc);
    return doc;
  },

  // Métodos de utilidad
  downloadPDF: (doc, filename) => {
    doc.save(filename);
  },

  previewPDF: (doc) => {
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
  },

  // Método unificado que usa la estructura de datos real
  generateReport: (reportType, data, filters = {}) => {
    const generators = {
      'specialty': PDFGenerator.generateSpecialtyReport,
      'doctor': PDFGenerator.generateDoctorReport,
      'medical-center': PDFGenerator.generateMedicalCenterReport,
      'monthly': PDFGenerator.generateMonthlyReport
    };

    const generator = generators[reportType];
    if (!generator) {
      throw new Error(`Tipo de reporte no soportado: ${reportType}`);
    }

    return generator(data, filters);
  }
};

export default PDFGenerator;