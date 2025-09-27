// pdf/utils.js
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PDF_STYLES } from './styles.js';

export const PDFUtils = {
  addHeader(doc, title, subtitle = null) {
    const { margin, header } = PDF_STYLES.spacing;
    
    doc.setDrawColor(...PDF_STYLES.colors.primary);
    doc.setLineWidth(0.5);
    doc.line(margin, header - 5, 210 - margin, header - 5);

    doc.setFont(PDF_STYLES.fonts.title.font, PDF_STYLES.fonts.title.style);
    doc.setFontSize(PDF_STYLES.fonts.title.size);
    doc.setTextColor(...PDF_STYLES.colors.primary);
    doc.text('HOSPITAL MANAGEMENT SYSTEM', margin, header - 10);

    if (subtitle) {
      doc.setFontSize(PDF_STYLES.fonts.subtitle.size);
      doc.text(subtitle, margin, header - 2);
    }

    doc.setLineWidth(0.2);
    doc.line(margin, header + 2, 210 - margin, header + 2);
  },

  addReportInfo(doc, filters, yPosition) {
    const { margin } = PDF_STYLES.spacing;
    let currentY = yPosition;
    
    doc.setFontSize(PDF_STYLES.fonts.small.size);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...PDF_STYLES.colors.secondary);

    const currentDate = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm:ss", { locale: es });
    doc.text(`Generado el: ${currentDate}`, margin, currentY);

    const reportTypes = {
      'specialty': 'Consultas por Especialidad',
      'doctor': 'Consultas por Médico',
      'medical-center': 'Consultas por Centro Médico',
      'monthly': 'Estadísticas Mensuales'
    };
    
    currentY += 4;
    doc.text(`Tipo de Reporte: ${reportTypes[filters.reportType] || filters.reportType}`, margin, currentY);

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

  addExecutiveSummary(doc, metrics, yPosition) {
    const { margin } = PDF_STYLES.spacing;
    const startY = yPosition;
    
    doc.setFontSize(PDF_STYLES.fonts.section.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF_STYLES.colors.primary);
    doc.text('RESUMEN EJECUTIVO', margin, startY);
    
    doc.setDrawColor(...PDF_STYLES.colors.mediumGray);
    doc.setLineWidth(0.3);
    doc.line(margin, startY + 1, 60, startY + 1);
    
    let currentY = startY + 8;
    doc.setFontSize(PDF_STYLES.fonts.small.size);
    
    // metrics es un array de { label, value }
    const half = Math.ceil(metrics.length / 2);
    
    metrics.forEach((metric, index) => {
      const col = index < half ? 0 : 1;
      const row = index < half ? index : index - half;
      
      const x = margin + (col * 90);
      const y = currentY + (row * 12);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...PDF_STYLES.colors.secondary);
      doc.text(metric.label, x, y);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...PDF_STYLES.colors.primary);
      doc.text(metric.value, x + 40, y);
    });
    
    return currentY + (half * 12) + 10;
  },

  addFooter(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    const pageHeight = doc.internal.pageSize.height;
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      doc.setFontSize(PDF_STYLES.fonts.small.size);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...PDF_STYLES.colors.secondary);
      
      doc.setDrawColor(...PDF_STYLES.colors.mediumGray);
      doc.setLineWidth(0.2);
      doc.line(PDF_STYLES.spacing.margin, pageHeight - 15, 210 - PDF_STYLES.spacing.margin, pageHeight - 15);
      
      doc.text('Hospital Management System - Reporte Confidencial', 
               PDF_STYLES.spacing.margin, pageHeight - 10);
      doc.text(`Página ${i} de ${pageCount}`, 
               210 - PDF_STYLES.spacing.margin, pageHeight - 10, { align: 'right' });
    }
  },
};