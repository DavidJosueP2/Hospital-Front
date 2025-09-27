import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import { BarChart3, PieChart as PieChartIcon, Table } from "lucide-react";
import reportsService from "../../services/reports.service";
import { toast } from "sonner";

// Subcomponentes
import ReportHeader from './reports/ReportHeader';
import ReportFilters from './reports/ReportFilters';
import ReportCharts from './reports/ReportCharts';
import ReportTable from './reports/ReportTable';

const ReportsDashboard = () => {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('charts');
  
  const [filters, setFilters] = useState({
    reportType: 'specialty',
    specialty: '',  
    doctor: '',    
    medicalCenter: '', 
    startDate: '',
    endDate: '',
    exportFormat: 'PDF'
  });

  const handleFilterChange = (key, value) => {
    // Actualizar el estado de los filtros
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Cuando cambia el tipo de reporte, resetear el reporte actual
    if (key === 'reportType') {
      setReportData(null);
    }
  };

  const generateReport = async () => {
    // No generar reporte si ya está cargando
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Generando reporte con filtros:', filters);
      
      let response;
      // Parámetros base que aplican a todos los tipos de reportes
      const reportParams = {
        startDate: filters.startDate || null,
        endDate: filters.endDate || null
      };

      // Procesar según tipo de reporte
      switch (filters.reportType) {
        case 'specialty':
          reportParams.specialtyId = filters.specialty ? parseInt(filters.specialty) : null;
          if (!reportParams.specialtyId) {
            throw new Error('Debe seleccionar una especialidad');
          }
          console.log('Enviando parámetros al backend para reporte de especialidad:', reportParams);
          response = await reportsService.getConsultationsBySpecialty(reportParams);
          break;
          
        case 'doctor':
          reportParams.doctorId = filters.doctor ? parseInt(filters.doctor) : null;
          if (!reportParams.doctorId) {
            throw new Error('Debe seleccionar un médico');
          }
          console.log('Enviando parámetros al backend para reporte de médico:', reportParams);
          response = await reportsService.getConsultationsByDoctor(reportParams);
          break;
          
        case 'medical-center':
          reportParams.medicalCenterId = filters.medicalCenter ? parseInt(filters.medicalCenter) : null;
          if (!reportParams.medicalCenterId) {
            throw new Error('Debe seleccionar un centro médico');
          }
          console.log('Enviando parámetros al backend para reporte de centro médico:', reportParams);
          response = await reportsService.getConsultationsByMedicalCenter(reportParams);
          break;
          
        case 'monthly':
          console.log('Enviando parámetros al backend para reporte mensual:', reportParams);
          response = await reportsService.getConsultationsByMonth(reportParams);
          break;
        
        default:
          throw new Error('Tipo de reporte no válido');
      }
      // Asegurar que response sea un array y procesarlo según el tipo de reporte
      if (!response) {
        throw new Error('No se recibieron datos del servidor');
      }
      
      let processedData;
      
      // Procesar la respuesta según el tipo de reporte y la estructura esperada
      switch (filters.reportType) {
        case 'doctor':
          // Para reporte de médicos, la respuesta viene como un Map (doctor-performance-ranking)
          console.log('Datos de reporte de médicos recibidos:', response);
          if (!Array.isArray(response)) {
            // Si es un único objeto con estructura específica para doctores
            processedData = [response]; // Mantener la estructura específica 
          } else {
            processedData = response;
          }
          break;
          
        case 'specialty':
        case 'medical-center':
        case 'monthly':
        default:
          // Para los demás reportes, aseguramos que sea un array
          processedData = Array.isArray(response) ? response : [response];
          break;
      }
      
      console.log('Datos procesados para visualización:', processedData);
      
      if (processedData.length === 0) {
        toast.info('No se encontraron datos para los filtros seleccionados');
        setReportData([]);  // Establecer array vacío para mostrar mensaje apropiado
      } else {
        toast.success('Reporte generado exitosamente');
        setReportData(processedData);
        
        // Cambiar a la pestaña de gráficos por defecto cuando se genera un nuevo reporte
        setActiveTab('charts');
      }
      
    } catch (error) {
      console.error('Error generando reporte:', error);
      setError(error.message || 'Error al generar el reporte');
      toast.error(error.message || 'Error al generar el reporte');
      setReportData(null);  // Resetear datos cuando hay error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">
            Dashboard de Reportes
          </h1>
          <p className="text-muted-foreground dark:text-gray-400">
            Genere y visualice reportes de consultas médicas
          </p>
        </div>
      </div>

      {/* Header con estadísticas principales */}
      <ReportHeader reportData={reportData} />

      {/* Filtros de configuración */}
      <ReportFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onGenerateReport={generateReport}
        isLoading={isLoading}
        reportData={reportData}
      />

      {/* Mostrar error si existe */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="text-red-800 dark:text-red-200 font-medium">
            Error al generar el reporte
          </div>
          <div className="text-red-600 dark:text-red-300 text-sm mt-1">
            {error}
          </div>
        </div>
      )}

      {/* Contenido del reporte */}
      {reportData && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Gráficos
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              Tablas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-6">
            <ReportCharts reportData={reportData} filters={filters} />
          </TabsContent>

          <TabsContent value="table" className="space-y-6">
            <ReportTable reportData={reportData} filters={filters} />
          </TabsContent>
        </Tabs>
      )}

      {/* Mensaje cuando no hay datos */}
      {(!reportData || (Array.isArray(reportData) && reportData.length === 0)) && !isLoading && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow">
          <div className="text-gray-500 dark:text-gray-400">
            <BarChart3 className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No hay datos para mostrar</p>
            <p className="text-sm">
              {reportData && reportData.length === 0 
                ? "No se encontraron resultados para los filtros aplicados." 
                : "Configure los filtros y genere un reporte para ver los resultados."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsDashboard;