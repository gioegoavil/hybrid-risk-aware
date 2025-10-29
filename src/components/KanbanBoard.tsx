import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface Task {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
}

interface KanbanBoardProps {
  projectId: string;
}

const columns = [
  { id: 'Backlog', title: 'Backlog' },
  { id: 'En Progreso', title: 'En Progreso' },
  { id: 'En Revisión', title: 'En Revisión' },
  { id: 'Hecho', title: 'Hecho' },
];

const KanbanBoard = ({ projectId }: KanbanBoardProps) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      toast({
        title: "Error al cargar tareas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));

      toast({
        title: "Tarea actualizada",
        description: "El estado de la tarea se ha actualizado",
      });
    } catch (error: any) {
      toast({
        title: "Error al actualizar tarea",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'destructive';
      case 'Media': return 'secondary';
      case 'Baja': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Cargando tareas...</p>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map((column) => (
          <div key={column.id} className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              {column.title}
            </h3>
            
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`space-y-2 min-h-[200px] p-2 rounded-lg transition-colors ${
                    snapshot.isDraggingOver ? 'bg-secondary/50' : 'bg-secondary/20'
                  }`}
                >
                  {tasks
                    .filter((task) => task.status === column.id)
                    .map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-move ${
                              snapshot.isDragging ? 'shadow-lg opacity-90' : ''
                            }`}
                          >
                            <CardHeader className="p-3 pb-2">
                              <CardTitle className="text-sm font-medium">
                                {task.name}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                              {task.description && (
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                              <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                                {task.priority}
                              </Badge>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;