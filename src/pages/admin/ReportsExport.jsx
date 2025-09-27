import React, { useState } from 'react';
import { Download, FileText, Calendar, Settings, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/shadcn/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/shadcn/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { Progress } from '@/components/ui/progress';
import reportsService from '@/services/reports.service';
import { format } from 'date-fns';

const ReportsExport = () => {
  const [loading, setLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportHistory, setExportHistory] = useState([
    {
      id: 1,
      type: 'Reporte de Especialidades',
      format: 'PDF',
      createdAt: '2024-01-15 10:30:00',
      status: 'completed',
      size: '2.3 MB'
    },
    {
      id: 2,
      type: 'Reporte de Médicos',
      format: 'Excel',
      createdAt: '2024-01-14 15:45:00',
      status: 'completed',
      size: '1.8 MB'
    },
    {
      id: 3,
      type: 'Reporte Mensual',
      format: 'CSV',
      createdAt: '2024-01-13 09:15:00',
      status: 'failed',
      size: '-'
    }
  ]);

  const [exportConfig, setExportConfig] = useState({
    reportType: 'specialty',
    format: 'pdf',
    startDate: '',
    endDate: '',
    includeCharts: true,
    includeAnalytics: true,
    includeDetails: true,
    emailNotification: false,
    scheduledExport: false,
    exportName: ''
  });

  const reportTypes = [
    { value: 'specialty', label: 'Consultas por Especialidad' },
    { value: 'doctor', label: 'Rendimiento de Médicos' },
    { value: 'medical-center', label: 'Análisis por Centro Médico' },
    { value: 'monthly', label: 'Reporte Mensual' },
    { value: 'comprehensive', label: 'Reporte Integral' }
  ];

  const exportFormats = [
    { value: 'pdf', label: 'PDF', description: 'Formato profesional para presentaciones' },
    { value: 'excel', label: 'Excel', description: 'Para análisis y manipulación de datos' },
    { value: 'csv', label: 'CSV', description: 'Para importar en otras herramientas' },
    { value: 'json', label: 'JSON', description: 'Para integración con sistemas' }
  ];

  const handleConfigChange = (key, value) => {
    setExportConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const validateExportConfig = () => {
    if (!exportConfig.reportType) {
      throw new Error('Selecciona un tipo de reporte');
    }
    if (!exportConfig.format) {
      throw new Error('Selecciona un formato de exportación');
    }
    if (!exportConfig.exportName.trim()) {
      throw new Error('Ingresa un nombre para el reporte');
    }
    return true;
  };

  const exportReport = async () => {
    try {
      validateExportConfig();
      setLoading(true);
      setExportProgress(0);

      // Simular progreso
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      let reportData;
      const filterData = {
        startDate: exportConfig.startDate || null,
        endDate: exportConfig.endDate || null
      };

      // Obtener datos según el tipo de reporte
      switch (exportConfig.reportType) {
        case 'specialty':
          reportData = await reportsService.getConsultationsBySpecialty(filterData);
          break;
        case 'doctor':
          reportData = await reportsService.getConsultationsByDoctor(filterData);
          break;
        case 'medical-center':
          reportData = await reportsService.getConsultationsByMedicalCenter(filterData);
          break;
        case 'monthly':
          reportData = await reportsService.getConsultationsByMonth(filterData);
          break;
        case 'comprehensive': {
          // Para reporte integral, obtener todos los datos
          const [specialtyData, doctorData, centerData, monthlyData] = await Promise.all([
            reportsService.getConsultationsBySpecialty(filterData),
            reportsService.getConsultationsByDoctor(filterData),
            reportsService.getConsultationsByMedicalCenter(filterData),
            reportsService.getConsultationsByMonth(filterData)
          ]);
          reportData = {
            specialties: specialtyData,
            doctors: doctorData,
            centers: centerData,
            monthly: monthlyData
          };
          break;
        }
        default:
          throw new Error('Tipo de reporte no válido');
      }

      clearInterval(progressInterval);
      setExportProgress(100);

      // Generar archivo según formato
      if (exportConfig.format === 'pdf') {
        // Usar el generador de PDF existente
        const PDFGenerator = (await import('@/utils/pdfGenerator')).default;
        let doc;
        
        switch (exportConfig.reportType) {
          case 'specialty':
            doc = PDFGenerator.generateSpecialtyReport(reportData, filterData);
            break;
          case 'doctor':
            doc = PDFGenerator.generateDoctorReport(reportData, filterData);
            break;
          default:
            doc = PDFGenerator.generateSpecialtyReport(reportData, filterData);
        }
        
        const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
        const filename = `${exportConfig.exportName}_${timestamp}.pdf`;
        PDFGenerator.downloadPDF(doc, filename);
      } else {
        // Para otros formatos, crear el archivo apropiado
        const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
        const filename = `${exportConfig.exportName}_${timestamp}.${exportConfig.format}`;
        
        let content, mimeType;
        
        switch (exportConfig.format) {
          case 'json':
            content = JSON.stringify(reportData, null, 2);
            mimeType = 'application/json';
            break;
          case 'csv':
            content = convertToCSV(reportData);
            mimeType = 'text/csv';
            break;
          case 'excel':
            // Para Excel, simplificamos a CSV por ahora
            content = convertToCSV(reportData);
            mimeType = 'text/csv';
            break;
        }
        
        downloadFile(content, filename, mimeType);
      }

      // Agregar al historial
      const newExport = {
        id: Date.now(),
        type: reportTypes.find(t => t.value === exportConfig.reportType)?.label || 'Reporte',
        format: exportConfig.format.toUpperCase(),
        createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        status: 'completed',
        size: '1.2 MB' // Simplificado
      };

      setExportHistory(prev => [newExport, ...prev]);

    } catch (error) {
      console.error('Error al exportar reporte:', error);
      alert(error.message || 'Error al exportar el reporte');
    } finally {
      setLoading(false);
      setTimeout(() => setExportProgress(0), 2000);
    }
  };

  const convertToCSV = (data) => {
    if (!Array.isArray(data) || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: 'success',
      failed: 'destructive',
      processing: 'warning'
    };
    
    const labels = {
      completed: 'Completado',
      failed: 'Error',
      processing: 'Procesando'
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exportación de Reportes</h1>
          <p className="text-gray-600 mt-1">Genera y descarga reportes en diferentes formatos</p>
        </div>
      </div>

      <Tabs defaultValue="export" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export">Nueva Exportación</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuración */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Configuración del Reporte</span>
                  </CardTitle>
                  <CardDescription>
                    Personaliza los parámetros de tu reporte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Información básica */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="exportName">Nombre del Reporte</Label>
                      <Input
                        id="exportName"
                        placeholder="Ej: Reporte_Especialidades_Enero"
                        value={exportConfig.exportName}
                        onChange={(e) => handleConfigChange('exportName', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reportType">Tipo de Reporte</Label>
                      <Select
                        value={exportConfig.reportType}
                        onValueChange={(value) => handleConfigChange('reportType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {reportTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Rango de fechas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Fecha Inicio</Label>
                      <Input
                        type="date"
                        id="startDate"
                        value={exportConfig.startDate}
                        onChange={(e) => handleConfigChange('startDate', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">Fecha Fin</Label>
                      <Input
                        type="date"
                        id="endDate"
                        value={exportConfig.endDate}
                        onChange={(e) => handleConfigChange('endDate', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Formato de exportación */}
                  <div className="space-y-3">
                    <Label>Formato de Exportación</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {exportFormats.map((format) => (
                        <div
                          key={format.value}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            exportConfig.format === format.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleConfigChange('format', format.value)}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              checked={exportConfig.format === format.value}
                              onChange={() => handleConfigChange('format', format.value)}
                              className="text-blue-600"
                            />
                            <div>
                              <p className="font-medium">{format.label}</p>
                              <p className="text-sm text-gray-500">{format.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Opciones adicionales */}
                  <div className="space-y-3">
                    <Label>Opciones Adicionales</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeCharts"
                          checked={exportConfig.includeCharts}
                          onCheckedChange={(checked) => handleConfigChange('includeCharts', checked)}
                        />
                        <Label htmlFor="includeCharts">Incluir gráficos y visualizaciones</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeAnalytics"
                          checked={exportConfig.includeAnalytics}
                          onCheckedChange={(checked) => handleConfigChange('includeAnalytics', checked)}
                        />
                        <Label htmlFor="includeAnalytics">Incluir análisis y métricas</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeDetails"
                          checked={exportConfig.includeDetails}
                          onCheckedChange={(checked) => handleConfigChange('includeDetails', checked)}
                        />
                        <Label htmlFor="includeDetails">Incluir datos detallados</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="emailNotification"
                          checked={exportConfig.emailNotification}
                          onCheckedChange={(checked) => handleConfigChange('emailNotification', checked)}
                        />
                        <Label htmlFor="emailNotification">Recibir notificación por email</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Vista previa y acciones */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vista Previa</CardTitle>
                  <CardDescription>Resumen de la configuración</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-medium">
                        {reportTypes.find(t => t.value === exportConfig.reportType)?.label || 'No seleccionado'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Formato:</span>
                      <span className="font-medium">
                        {exportFormats.find(f => f.value === exportConfig.format)?.label || 'No seleccionado'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Período:</span>
                      <span className="font-medium">
                        {exportConfig.startDate && exportConfig.endDate 
                          ? `${exportConfig.startDate} a ${exportConfig.endDate}`
                          : 'Todo el período'
                        }
                      </span>
                    </div>
                  </div>

                  {loading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progreso:</span>
                        <span>{exportProgress}%</span>
                      </div>
                      <Progress value={exportProgress} className="w-full" />
                    </div>
                  )}

                  <Button
                    onClick={exportReport}
                    disabled={loading || !exportConfig.exportName.trim()}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Exportando...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Reporte
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Historial de Exportaciones</span>
              </CardTitle>
              <CardDescription>
                Historial de reportes generados y descargados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exportHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(item.status)}
                      <div>
                        <p className="font-medium">{item.type}</p>
                        <p className="text-sm text-gray-500">
                          {item.createdAt} • {item.format} • {item.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(item.status)}
                      {item.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsExport;