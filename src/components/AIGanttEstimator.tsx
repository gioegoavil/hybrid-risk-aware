import { useMemo } from "react";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, BarChart3, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Phase {
  name: string;
  percentage: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface AIGanttEstimatorProps {
  duration: number;
  startDate: Date;
}

const PHASES: Phase[] = [
  { 
    name: "Planificación", 
    percentage: 10, 
    color: "bg-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30"
  },
  { 
    name: "Diseño", 
    percentage: 20, 
    color: "bg-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/30"
  },
  { 
    name: "Desarrollo", 
    percentage: 40, 
    color: "bg-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/30"
  },
  { 
    name: "Pruebas", 
    percentage: 20, 
    color: "bg-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/30"
  },
  { 
    name: "Despliegue", 
    percentage: 10, 
    color: "bg-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30"
  },
];

const AIGanttEstimator = ({ duration, startDate }: AIGanttEstimatorProps) => {
  const schedule = useMemo(() => {
    let currentDate = startDate;
    
    return PHASES.map((phase) => {
      const phaseDays = Math.max(1, Math.round((phase.percentage / 100) * duration));
      const phaseStartDate = currentDate;
      const phaseEndDate = addDays(currentDate, phaseDays - 1);
      currentDate = addDays(phaseEndDate, 1);
      
      return {
        ...phase,
        days: phaseDays,
        startDate: phaseStartDate,
        endDate: phaseEndDate,
      };
    });
  }, [duration, startDate]);

  const totalDays = schedule.reduce((acc, phase) => acc + phase.days, 0);
  const endDate = addDays(startDate, totalDays - 1);

  return (
    <Card className="shadow-lg border-2 border-accent/20 animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-accent" />
          Estimación de Cronograma (IA)
        </CardTitle>
        <CardDescription className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(startDate, "dd MMM yyyy", { locale: es })} - {format(endDate, "dd MMM yyyy", { locale: es })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {totalDays} días totales
          </span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Gantt Chart Visual */}
        <div className="space-y-3">
          {schedule.map((phase, index) => (
            <div key={phase.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${phase.color}`} />
                  <span className="font-medium text-foreground">{phase.name}</span>
                </div>
                <span className="text-muted-foreground text-xs">
                  {format(phase.startDate, "dd/MM", { locale: es })} - {format(phase.endDate, "dd/MM", { locale: es })} ({phase.days}d)
                </span>
              </div>
              
              {/* Progress Bar Container */}
              <div className="relative h-8 bg-secondary rounded-md overflow-hidden">
                {/* Offset for visual positioning */}
                <div 
                  className={`absolute h-full ${phase.color} rounded-md transition-all duration-500 flex items-center justify-end pr-2`}
                  style={{ 
                    width: `${phase.percentage}%`,
                    left: `${PHASES.slice(0, index).reduce((acc, p) => acc + p.percentage, 0)}%`,
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <span className="text-xs font-semibold text-primary-foreground drop-shadow-sm">
                    {phase.percentage}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Table */}
        <div className="mt-6 rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-2 px-3 font-semibold text-foreground">Fase</th>
                <th className="text-center py-2 px-3 font-semibold text-foreground">Días</th>
                <th className="text-center py-2 px-3 font-semibold text-foreground">%</th>
                <th className="text-right py-2 px-3 font-semibold text-foreground">Fechas</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((phase) => (
                <tr key={phase.name} className={`border-t border-border ${phase.bgColor}`}>
                  <td className="py-2 px-3 font-medium text-foreground">{phase.name}</td>
                  <td className="py-2 px-3 text-center text-muted-foreground">{phase.days}</td>
                  <td className="py-2 px-3 text-center text-muted-foreground">{phase.percentage}%</td>
                  <td className="py-2 px-3 text-right text-muted-foreground text-xs">
                    {format(phase.startDate, "dd MMM", { locale: es })} - {format(phase.endDate, "dd MMM", { locale: es })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border mt-4">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Nota:</strong> Este cronograma es una estimación basada en recursos y requerimientos. 
            No sustituye la planificación detallada. Los porcentajes representan una distribución estándar 
            que puede variar según la naturaleza específica del proyecto.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIGanttEstimator;
