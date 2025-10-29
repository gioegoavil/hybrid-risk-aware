import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserRole {
  role: string;
}

const Perfil = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");

      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      setRoles((rolesData || []).map((r: UserRole) => r.role));
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

  const getRoleName = (role: string) => {
    switch (role) {
      case 'jefe_proyecto': return 'Jefe de Proyecto';
      case 'desarrollador': return 'Desarrollador';
      default: return role;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
          <p className="text-muted-foreground">Información de tu cuenta</p>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Cargando datos...</p>
        ) : (
          <div className="space-y-4">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Roles y Permisos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {roles.length === 0 ? (
                  <p className="text-muted-foreground">No tienes roles asignados</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <Badge key={role} variant="secondary" className="text-sm">
                        {getRoleName(role)}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Perfil;