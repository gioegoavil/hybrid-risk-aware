import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import KanbanBoard from "@/components/KanbanBoard";
import RiskManagement from "@/components/RiskManagement";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  project_type: string;
  duration_estimated_days: number | null;
  initial_requirements_count: number | null;
  developers_assigned_count: number | null;
}

interface AIPrediction {
  predicted_risk_probability: number;
  suggestion_message: string;
  created_at: string;
}

const DetalleProyecto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [aiPrediction, setAiPrediction] = useState<AIPrediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProjectData();
    }
  }, [id]);

  const fetchProjectData = async () => {
    try {
      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch AI prediction
      const { data: predictionData } = await supabase
        .from('ai_predictions')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (predictionData) {
        setAiPrediction(predictionData);
      }
    } catch (error: any) {
      toast({
        title: "Error al cargar proyecto",
        description: error.message,
        variant: "destructive",
      });
      navigate('/proyectos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <p className="text-muted-foreground">Cargando proyecto...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) return null;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Activo': return 'default';
      case 'Completado': return 'secondary';
      case 'Planificación': return 'outline';
      case 'Cancelado': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/proyectos')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
              <Badge variant={getStatusBadgeVariant(project.status)}>
                {project.status}
              </Badge>
            </div>
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
          </div>
        </div>

        {/* Project Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{project.project_type}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Duración
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {project.duration_estimated_days || '-'} días
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Requerimientos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {project.initial_requirements_count || '-'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Desarrolladores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {project.developers_assigned_count || '-'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Prediction */}
        {aiPrediction && (
          <Card className="border-2 border-primary/20 shadow-md">
            <CardHeader className="bg-gradient-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Análisis de Riesgo (IA)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Probabilidad de Riesgo
                  </p>
                  <p className={`text-4xl font-bold ${
                    aiPrediction.predicted_risk_probability > 0.7 
                      ? 'text-destructive' 
                      : aiPrediction.predicted_risk_probability > 0.4
                      ? 'text-warning'
                      : 'text-success'
                  }`}>
                    {(aiPrediction.predicted_risk_probability * 100).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Recomendación
                  </p>
                  <p className="text-sm">{aiPrediction.suggestion_message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="kanban" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="kanban">Tablero de Tareas (Scrum)</TabsTrigger>
            <TabsTrigger value="risks">Gestión de Riesgos (PRINCE2)</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="mt-6">
            <KanbanBoard projectId={id!} />
          </TabsContent>

          <TabsContent value="risks" className="mt-6">
            <RiskManagement projectId={id!} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DetalleProyecto;