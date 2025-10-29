import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Risk {
  id: string;
  description: string;
  probability: string;
  impact: string;
  mitigation_plan: string | null;
  status: string;
}

interface RiskManagementProps {
  projectId: string;
}

const RiskManagement = ({ projectId }: RiskManagementProps) => {
  const { toast } = useToast();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    probability: "",
    impact: "",
    mitigation_plan: "",
  });

  useEffect(() => {
    fetchRisks();
  }, [projectId]);

  const fetchRisks = async () => {
    try {
      const { data, error } = await supabase
        .from('risks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRisks(data || []);
    } catch (error: any) {
      toast({
        title: "Error al cargar riesgos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('risks')
        .insert({
          project_id: projectId,
          ...formData,
        });

      if (error) throw error;

      toast({
        title: "Riesgo registrado",
        description: "El riesgo se ha registrado exitosamente",
      });

      setFormData({
        description: "",
        probability: "",
        impact: "",
        mitigation_plan: "",
      });
      setShowForm(false);
      fetchRisks();
    } catch (error: any) {
      toast({
        title: "Error al registrar riesgo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getProbabilityBadge = (probability: string) => {
    switch (probability) {
      case 'Alta': return 'destructive';
      case 'Media': return 'secondary';
      case 'Baja': return 'outline';
      default: return 'outline';
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'Alto': return 'destructive';
      case 'Medio': return 'secondary';
      case 'Bajo': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Identificado': return 'secondary';
      case 'Mitigado': return 'outline';
      case 'Ocurrido': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Riesgos del Proyecto</h3>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancelar' : 'Registrar Riesgo'}
        </Button>
      </div>

      {showForm && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Nuevo Riesgo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descripción del Riesgo *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="probability">Probabilidad *</Label>
                  <Select
                    value={formData.probability}
                    onValueChange={(value) => setFormData({ ...formData, probability: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona probabilidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Media">Media</SelectItem>
                      <SelectItem value="Baja">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="impact">Impacto *</Label>
                  <Select
                    value={formData.impact}
                    onValueChange={(value) => setFormData({ ...formData, impact: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona impacto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alto">Alto</SelectItem>
                      <SelectItem value="Medio">Medio</SelectItem>
                      <SelectItem value="Bajo">Bajo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mitigation">Plan de Mitigación</Label>
                <Textarea
                  id="mitigation"
                  value={formData.mitigation_plan}
                  onChange={(e) => setFormData({ ...formData, mitigation_plan: e.target.value })}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full">
                Guardar Riesgo
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-md">
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-muted-foreground">Cargando riesgos...</p>
          ) : risks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay riesgos registrados para este proyecto
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Probabilidad</TableHead>
                  <TableHead>Impacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Mitigación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {risks.map((risk) => (
                  <TableRow key={risk.id}>
                    <TableCell className="font-medium max-w-xs">
                      {risk.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getProbabilityBadge(risk.probability)}>
                        {risk.probability}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getImpactBadge(risk.impact)}>
                        {risk.impact}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(risk.status)}>
                        {risk.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs text-sm text-muted-foreground">
                      {risk.mitigation_plan || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskManagement;