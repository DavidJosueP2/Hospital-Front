import api from './api';
import { REPORT_TYPES, EXPORT_FORMATS } from '@/types/report-types';

const REPORTS_BASE_URL = '/api/reports';

// Configuración común de headers
const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Accept': 'application/json; charset=utf-8'
};

// Mapeo de tipos de reporte a endpoints
const REPORT_ENDPOINTS = {
  [REPORT_TYPES.SPECIALTY]: `${REPORTS_BASE_URL}/consultation/specialty`,
  [REPORT_TYPES.DOCTOR]: `${REPORTS_BASE_URL}/consultation/doctor`,
  [REPORT_TYPES.MEDICAL_CENTER]: `${REPORTS_BASE_URL}/consultation/medical-center`,
  [REPORT_TYPES.MONTHLY]: `${REPORTS_BASE_URL}/consultation/monthly`,
  [REPORT_TYPES.DETAILED]: `${REPORTS_BASE_URL}/consultation/detailed`
};

// Generador de nombres de archivo
const generateFilename = (reportType, format, timestamp = new Date()) => {
  const dateStr = timestamp.toISOString().split('T')[0];
  const timeStr = timestamp.toTimeString().split(' ')[0].replace(/:/g, '-');
  
  const typeNames = {
    [REPORT_TYPES.SPECIALTY]: 'especialidades',
    [REPORT_TYPES.DOCTOR]: 'medicos',
    [REPORT_TYPES.MEDICAL_CENTER]: 'centros-medicos',
    [REPORT_TYPES.MONTHLY]: 'mensual',
    [REPORT_TYPES.DETAILED]: 'detallado'
  };
  
  return `reporte-${typeNames[reportType]}-${dateStr}_${timeStr}.${format}`;
};

// Servicio unificado de reportes
export const reportsService = {
  /**
   * Obtener datos de reporte en formato JSON
   */
  getReportData: async (reportType, filters = {}) => {
    const endpoint = REPORT_ENDPOINTS[reportType];
    
    if (!endpoint) {
      throw new Error(`Tipo de reporte no válido: ${reportType}`);
    }

    const response = await api.post(endpoint, filters, {
      headers: JSON_HEADERS
    });
    
    return response.data;
  },

  /**
   * Generar y descargar reporte en diferentes formatos
   */
  generateReport: async (reportType, filters = {}, format = EXPORT_FORMATS.PDF) => {
    // Primero obtenemos los datos
    const data = await reportsService.getReportData(reportType, filters);
    
    // Determinamos el endpoint y configuraciones según el formato
    let endpoint, options;
    
    switch (format) {
      case EXPORT_FORMATS.PDF:
      case EXPORT_FORMATS.EXCEL:
      case EXPORT_FORMATS.CSV:
        endpoint = `${REPORTS_BASE_URL}/export/${format}`;
        options = {
          responseType: 'blob',
          headers: {
            ...JSON_HEADERS,
            'X-Report-Type': reportType
          }
        };
        break;
        
      case EXPORT_FORMATS.JSON:
        // Para JSON, simplemente devolvemos los datos
        return {
          data,
          filename: generateFilename(reportType, 'json'),
          format: EXPORT_FORMATS.JSON
        };
        
      default:
        throw new Error(`Formato no soportado: ${format}`);
    }
    
    // Para formatos binarios, hacemos la petición al endpoint de exportación
    const response = await api.post(endpoint, { 
      reportType, 
      filters, 
      data 
    }, options);
    
    return {
      blob: response.data,
      filename: generateFilename(reportType, format),
      format
    };
  },

  /**
   * Métodos específicos por compatibilidad (pueden ser deprecados luego)
   */
  /**
   * Métodos específicos por compatibilidad, con transformación de parámetros
   * para asegurar compatibilidad con la API del backend
   */
  getConsultationsBySpecialty: (filters) => {
    // Mapear los parámetros al formato esperado por el backend
    const backendFilters = {
      fechaInicio: filters.startDate ? new Date(filters.startDate) : null,
      fechaFin: filters.endDate ? new Date(filters.endDate) : null,
      specialtyId: filters.specialtyId,
      // Si hay más parámetros, agregarlos aquí
    };
    
    return reportsService.getReportData(REPORT_TYPES.SPECIALTY, backendFilters);
  },
    
  getConsultationsByDoctor: (filters) => {
    // Mapear los parámetros al formato esperado por el backend
    const backendFilters = {
      fechaInicio: filters.startDate ? new Date(filters.startDate) : null,
      fechaFin: filters.endDate ? new Date(filters.endDate) : null,
      doctorId: filters.doctorId,
      // Si hay más parámetros, agregarlos aquí
    };
    
    return reportsService.getReportData(REPORT_TYPES.DOCTOR, backendFilters);
  },
    
  getConsultationsByMedicalCenter: (filters) => {
    // Mapear los parámetros al formato esperado por el backend
    const backendFilters = {
      fechaInicio: filters.startDate ? new Date(filters.startDate) : null,
      fechaFin: filters.endDate ? new Date(filters.endDate) : null,
      medicalCenterId: filters.medicalCenterId,
      // Si hay más parámetros, agregarlos aquí
    };
    
    return reportsService.getReportData(REPORT_TYPES.MEDICAL_CENTER, backendFilters);
  },
    
  getConsultationsByMonth: (filters) => {
    // Mapear los parámetros al formato esperado por el backend
    const backendFilters = {
      fechaInicio: filters.startDate ? new Date(filters.startDate) : null,
      fechaFin: filters.endDate ? new Date(filters.endDate) : null,
      // Si hay más parámetros, agregarlos aquí
    };
    
    return reportsService.getReportData(REPORT_TYPES.MONTHLY, backendFilters);
  },

  /**
   * Utilidades para descarga de archivos
   */
  downloadFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpieza de memoria
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  },

  /**
   * Previsualizar archivo en nueva pestaña (para PDFs)
   */
  previewFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    
    // Fallback si el popup es bloqueado
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      reportsService.downloadFile(blob, filename);
    }
  },

  /**
   * Obtener estadísticas rápidas del reporte
   */
  getReportStats: async (reportType, filters = {}) => {
    const data = await reportsService.getReportData(reportType, filters);
    
    const statsGenerators = {
      [REPORT_TYPES.SPECIALTY]: (data) => ({
        totalEspecialidades: data.length,
        totalConsultas: data.reduce((sum, item) => sum + (item.totalConsultations || 0), 0),
        especialidadMasActiva: data.reduce((max, item) => 
          (item.totalConsultations || 0) > (max.totalConsultations || 0) ? item : max, data[0]
        )?.specialtyName || 'N/A'
      }),
      
      [REPORT_TYPES.DOCTOR]: (data) => ({
        totalMedicos: data.length,
        totalConsultas: data.reduce((sum, item) => sum + (item.totalConsultations || 0), 0),
        promedioConsultas: data.length > 0 ? 
          (data.reduce((sum, item) => sum + (item.totalConsultations || 0), 0) / data.length).toFixed(1) : 0
      }),
      
      [REPORT_TYPES.MEDICAL_CENTER]: (data) => ({
        totalCentros: data.length,
        totalConsultas: data.reduce((sum, item) => sum + (item.totalConsultations || 0), 0),
        centrosConMasActividad: data.slice(0, 3).map(center => ({
          nombre: center.centerName,
          consultas: center.totalConsultations
        }))
      })
    };
    
    const generator = statsGenerators[reportType];
    return generator ? generator(data) : null;
  }
};

export default reportsService;