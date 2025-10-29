import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderKanban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  project_type: string;
  duration_estimated_days: number | null;
  created_at: string;
}

const Proyectos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [canCreate, setCanCreate] = useState(false);

  useEffect(() => {
    fetchProjects();
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isJefe = roles?.some(r => r.role === 'jefe_proyecto');
    setCanCreate(isJefe || false);
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast({
        title: "Error al cargar proyectos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Proyectos</h1>
            <p className="text-muted-foreground">Gestiona tus proyectos</p>
          </div>
          {canCreate && (
            <Button onClick={() => navigate('/proyectos/nuevo')} className="shadow-primary">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Proyecto
            </Button>
          )}
        </div>

        {loading ? (
          <p className="text-muted-foreground">Cargando proyectos...</p>
        ) : projects.length === 0 ? (
          <Card className="p-12 text-center shadow-md">
            <FolderKanban className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay proyectos</h3>
            <p className="text-muted-foreground mb-4">
              {canCreate 
                ? "Comienza creando tu primer proyecto" 
                : "No hay proyectos disponibles aún"}
            </p>
            {canCreate && (
              <Button onClick={() => navigate('/proyectos/nuevo')}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Proyecto
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="hover:shadow-lg transition-all cursor-pointer border-0 shadow-md"
                onClick={() => navigate(`/proyectos/${project.id}`)}
              >
                <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-bold line-clamp-1">
                      {project.name}
                    </CardTitle>
                    <Badge variant={getStatusBadgeVariant(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="font-medium">{project.project_type}</span>
                  </div>
                  {project.duration_estimated_days && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Duración:</span>
                      <span className="font-medium">{project.duration_estimated_days} días</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Proyectos;