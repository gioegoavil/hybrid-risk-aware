import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Brain, AlertTriangle, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import AIGanttEstimator from "@/components/AIGanttEstimator";

const NuevoProyecto = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [showGantt, setShowGantt] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    project_type: "",
    duration_estimated_days: "",
    initial_requirements_count: "",
    developers_assigned_count: "",
  });

  const [aiPrediction, setAiPrediction] = useState<{
    probability: number;
    suggestion: string;
  } | null>(null);

  useEffect(() => {
    // Verificar permisos
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isJefe = roles?.some(r => r.role === 'jefe_proyecto');
    if (!isJefe) {
      toast({
        title: "Acceso denegado",
        description: "Solo los jefes de proyecto pueden crear proyectos",
        variant: "destructive",
      });
      navigate('/proyectos');
    }
  };

  // Predecir riesgo cuando cambien los campos relevantes
  useEffect(() => {
    const { duration_estimated_days, initial_requirements_count, developers_assigned_count } = formData;
    
    if (duration_estimated_days && initial_requirements_count && developers_assigned_count) {
      predictRisk();
    } else {
      setAiPrediction(null);
    }
  }, [formData.duration_estimated_days, formData.initial_requirements_count, formData.developers_assigned_count]);

  const predictRisk = async () => {
    setPredicting(true);
    try {
      const response = await fetch(
        `https://rstkizfcmlxluvbndrju.supabase.co/functions/v1/predictRisk`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            duration: parseInt(formData.duration_estimated_days),
            requirements: parseInt(formData.initial_requirements_count),
            developers: parseInt(formData.developers_assigned_count),
          }),
        }
      );

      const data = await response.json();
      setAiPrediction(data);
    } catch (error) {
      console.error('Error predicting risk:', error);
    } finally {
      setPredicting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Crear proyecto
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: formData.name,
          description: formData.description,
          project_type: formData.project_type,
          duration_estimated_days: parseInt(formData.duration_estimated_days),
          initial_requirements_count: parseInt(formData.initial_requirements_count),
          developers_assigned_count: parseInt(formData.developers_assigned_count),
          status: 'Planificación',
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Guardar predicción de IA
      if (aiPrediction && project) {
        await supabase.from('ai_predictions').insert({
          project_id: project.id,
          predicted_risk_probability: aiPrediction.probability,
          suggestion_message: aiPrediction.suggestion,
        });
      }

      toast({
        title: "Proyecto creado",
        description: "El proyecto se ha creado exitosamente",
      });

      navigate(`/proyectos/${project.id}`);
    } catch (error: any) {
      toast({
        title: "Error al crear proyecto",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (probability: number) => {
    if (probability > 0.7) return 'text-destructive';
    if (probability > 0.4) return 'text-warning';
    return 'text-success';
  };

  const getRiskLevel = (probability: number) => {
    if (probability > 0.7) return 'Alto';
    if (probability > 0.4) return 'Medio';
    return 'Bajo';
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nuevo Proyecto</h1>
          <p className="text-muted-foreground">Crea un nuevo proyecto con análisis de riesgo por IA</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Información del Proyecto</CardTitle>
              <CardDescription>Completa los datos básicos del proyecto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Proyecto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_type">Tipo de Proyecto *</Label>
                <Select
                  value={formData.project_type}
                  onValueChange={(value) => setFormData({ ...formData, project_type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="E-commerce">E-commerce</SelectItem>
                    <SelectItem value="ERP Interno">ERP Interno</SelectItem>
                    <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración Estimada (días) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration_estimated_days}
                    onChange={(e) => setFormData({ ...formData, duration_estimated_days: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requerimientos Iniciales *</Label>
                  <Input
                    id="requirements"
                    type="number"
                    min="1"
                    value={formData.initial_requirements_count}
                    onChange={(e) => setFormData({ ...formData, initial_requirements_count: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="developers">Desarrolladores Asignados *</Label>
                  <Input
                    id="developers"
                    type="number"
                    min="1"
                    value={formData.developers_assigned_count}
                    onChange={(e) => setFormData({ ...formData, developers_assigned_count: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Análisis de IA */}
          <Card className="shadow-md border-2 border-primary/20">
            <CardHeader className="bg-gradient-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Análisis Proactivo de Riesgos (IA - SPAR)
              </CardTitle>
              <CardDescription>
                Predicción en tiempo real basada en los parámetros del proyecto
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {predicting ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : aiPrediction ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Probabilidad de Riesgo</Label>
                      <span className={`text-2xl font-bold ${getRiskColor(aiPrediction.probability)}`}>
                        {(aiPrediction.probability * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress 
                      value={aiPrediction.probability * 100} 
                      className="h-3"
                    />
                    <p className="text-sm text-muted-foreground text-right">
                      Nivel de Riesgo: <span className={`font-semibold ${getRiskColor(aiPrediction.probability)}`}>
                        {getRiskLevel(aiPrediction.probability)}
                      </span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Sugerencia del Sistema
                    </Label>
                    <div className={`p-4 rounded-lg border-2 ${
                      aiPrediction.probability > 0.7 
                        ? 'bg-destructive/10 border-destructive/30' 
                        : aiPrediction.probability > 0.4
                        ? 'bg-warning/10 border-warning/30'
                        : 'bg-success/10 border-success/30'
                    }`}>
                      <p className="text-sm">{aiPrediction.suggestion}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Completa los campos de duración, requerimientos y desarrolladores para ver el análisis de riesgo
                </p>
              )}
            </CardContent>
          </Card>

          {/* Botón para generar Gantt */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setShowGantt(!showGantt)}
              disabled={!formData.duration_estimated_days}
              className="gap-2 border-accent/50 hover:bg-accent/10 hover:border-accent transition-all"
            >
              <Sparkles className="h-5 w-5 text-accent" />
              {showGantt ? "Ocultar Cronograma" : "✨ Generar Estimación de Cronograma (IA)"}
            </Button>
          </div>

          {/* AI Gantt Estimator */}
          {showGantt && formData.duration_estimated_days && (
            <AIGanttEstimator 
              duration={parseInt(formData.duration_estimated_days)} 
              startDate={new Date()}
            />
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/proyectos')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando proyecto...
                </>
              ) : (
                "Guardar Proyecto"
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NuevoProyecto;