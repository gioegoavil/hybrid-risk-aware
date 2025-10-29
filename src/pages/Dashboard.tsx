import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  activeProjects: number;
  planningProjects: number;
  pendingTasks: number;
  highRisks: number;
}

interface Task {
  id: string;
  name: string;
  priority: string;
  project_id: string;
}

const Dashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 0,
    planningProjects: 0,
    pendingTasks: 0,
    highRisks: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch projects stats
      const { data: activeProjects } = await supabase
        .from('projects')
        .select('id', { count: 'exact' })
        .eq('status', 'Activo');

      const { data: planningProjects } = await supabase
        .from('projects')
        .select('id', { count: 'exact' })
        .eq('status', 'Planificación');

      // Fetch pending tasks for current user
      const { data: pendingTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('assignee_id', user.id)
        .neq('status', 'Hecho')
        .limit(5);

      // Fetch high risks
      const { data: highRisks } = await supabase
        .from('risks')
        .select('id', { count: 'exact' })
        .eq('status', 'Identificado')
        .eq('probability', 'Alta');

      setStats({
        activeProjects: activeProjects?.length || 0,
        planningProjects: planningProjects?.length || 0,
        pendingTasks: pendingTasks?.length || 0,
        highRisks: highRisks?.length || 0,
      });

      setRecentTasks(pendingTasks || []);
    } catch (error: any) {
      toast({
        title: "Error al cargar datos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Proyectos Activos",
      value: stats.activeProjects,
      icon: FolderKanban,
      gradient: "bg-gradient-primary",
    },
    {
      title: "En Planificación",
      value: stats.planningProjects,
      icon: TrendingUp,
      gradient: "bg-gradient-warning",
    },
    {
      title: "Tareas Pendientes",
      value: stats.pendingTasks,
      icon: CheckCircle2,
      gradient: "bg-gradient-success",
    },
    {
      title: "Riesgos Altos",
      value: stats.highRisks,
      icon: AlertTriangle,
      gradient: "bg-gradient-danger",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'text-destructive';
      case 'Media': return 'text-warning';
      case 'Baja': return 'text-success';
      default: return 'text-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Resumen de tus proyectos y tareas</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className={`${stat.gradient} text-white pb-2`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium opacity-90">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-5 w-5 opacity-75" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-3xl font-bold text-foreground">
                  {loading ? "..." : stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Tasks */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Mis Tareas Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Cargando tareas...</p>
            ) : recentTasks.length === 0 ? (
              <p className="text-muted-foreground">No tienes tareas pendientes</p>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <span className="font-medium text-foreground">{task.name}</span>
                    <span className={`text-sm font-semibold ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;