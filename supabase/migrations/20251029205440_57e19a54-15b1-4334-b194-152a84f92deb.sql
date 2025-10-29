-- Crear enum para roles de aplicación
CREATE TYPE public.app_role AS ENUM ('jefe_proyecto', 'desarrollador');

-- Crear tabla de roles de usuario
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Habilitar RLS en user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Función de seguridad para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Crear tabla de proyectos
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Planificación' CHECK (status IN ('Planificación', 'Activo', 'Completado', 'Cancelado')),
    project_type TEXT NOT NULL CHECK (project_type IN ('E-commerce', 'ERP Interno', 'Mantenimiento', 'Otro')),
    duration_estimated_days INTEGER,
    initial_requirements_count INTEGER,
    developers_assigned_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Crear tabla de tareas (Scrum)
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Backlog' CHECK (status IN ('Backlog', 'En Progreso', 'En Revisión', 'Hecho')),
    priority TEXT NOT NULL DEFAULT 'Media' CHECK (priority IN ('Alta', 'Media', 'Baja')),
    assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Crear tabla de riesgos (PRINCE2)
CREATE TABLE public.risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    probability TEXT NOT NULL CHECK (probability IN ('Alta', 'Media', 'Baja')),
    impact TEXT NOT NULL CHECK (impact IN ('Alto', 'Medio', 'Bajo')),
    mitigation_plan TEXT,
    status TEXT NOT NULL DEFAULT 'Identificado' CHECK (status IN ('Identificado', 'Mitigado', 'Ocurrido')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en risks
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;

-- Crear tabla de predicciones de IA
CREATE TABLE public.ai_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    predicted_risk_probability FLOAT CHECK (predicted_risk_probability >= 0 AND predicted_risk_probability <= 1),
    suggestion_message TEXT,
    model_version TEXT DEFAULT 'v1.0-simulado',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en ai_predictions
ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_roles
CREATE POLICY "Los usuarios pueden ver sus propios roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Solo jefes de proyecto pueden asignar roles"
    ON public.user_roles FOR ALL
    USING (public.has_role(auth.uid(), 'jefe_proyecto'));

-- Políticas RLS para projects
CREATE POLICY "Todos los usuarios autenticados pueden ver proyectos"
    ON public.projects FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Solo jefes de proyecto pueden crear proyectos"
    ON public.projects FOR INSERT
    TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'jefe_proyecto'));

CREATE POLICY "Solo jefes de proyecto pueden actualizar proyectos"
    ON public.projects FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'jefe_proyecto'));

CREATE POLICY "Solo jefes de proyecto pueden eliminar proyectos"
    ON public.projects FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'jefe_proyecto'));

-- Políticas RLS para tasks
CREATE POLICY "Todos los usuarios autenticados pueden ver tareas"
    ON public.tasks FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Jefes de proyecto pueden crear tareas"
    ON public.tasks FOR INSERT
    TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'jefe_proyecto'));

CREATE POLICY "Los usuarios pueden actualizar tareas asignadas a ellos"
    ON public.tasks FOR UPDATE
    TO authenticated
    USING (
        assignee_id = auth.uid() 
        OR public.has_role(auth.uid(), 'jefe_proyecto')
    );

CREATE POLICY "Solo jefes de proyecto pueden eliminar tareas"
    ON public.tasks FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'jefe_proyecto'));

-- Políticas RLS para risks
CREATE POLICY "Todos los usuarios autenticados pueden ver riesgos"
    ON public.risks FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden crear riesgos"
    ON public.risks FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar riesgos"
    ON public.risks FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Solo jefes de proyecto pueden eliminar riesgos"
    ON public.risks FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'jefe_proyecto'));

-- Políticas RLS para ai_predictions
CREATE POLICY "Todos los usuarios autenticados pueden ver predicciones"
    ON public.ai_predictions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden crear predicciones"
    ON public.ai_predictions FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_risks_updated_at
    BEFORE UPDATE ON public.risks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();