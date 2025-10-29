-- Asignar rol de jefe_proyecto al usuario
INSERT INTO public.user_roles (user_id, role)
VALUES ('5fbbac17-8527-49bf-8d17-3ef5d63aeab7', 'jefe_proyecto')
ON CONFLICT (user_id, role) DO NOTHING;

-- Crear Proyecto 1: Riesgo Bajo (E-commerce simple)
INSERT INTO public.projects (id, name, description, status, project_type, duration_estimated_days, initial_requirements_count, developers_assigned_count)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Tienda Online Básica', 'E-commerce simple para venta de textiles con catálogo y carrito de compras', 'Activo', 'E-commerce', 45, 15, 3);

-- Crear Proyecto 2: Riesgo Medio (ERP más complejo)
INSERT INTO public.projects (id, name, description, status, project_type, duration_estimated_days, initial_requirements_count, developers_assigned_count)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'Sistema de Inventario ERP', 'Módulo de gestión de inventario y producción para planta textil', 'Planificación', 'ERP Interno', 75, 28, 2);

-- Crear Proyecto 3: Riesgo Alto (Proyecto complejo)
INSERT INTO public.projects (id, name, description, status, project_type, duration_estimated_days, initial_requirements_count, developers_assigned_count)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'Plataforma Integral de Gestión', 'Sistema completo de ERP + E-commerce + CRM para expansión internacional', 'Planificación', 'ERP Interno', 150, 50, 2);

-- Crear tareas para Proyecto 1 (Tienda Online Básica)
INSERT INTO public.tasks (project_id, name, description, status, priority, assignee_id)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Diseño de catálogo de productos', 'Crear interfaz para mostrar productos textiles con filtros', 'Hecho', 'Alta', '5fbbac17-8527-49bf-8d17-3ef5d63aeab7'),
  ('11111111-1111-1111-1111-111111111111', 'Implementar carrito de compras', 'Desarrollar funcionalidad de carrito con localStorage', 'En Revisión', 'Alta', '5fbbac17-8527-49bf-8d17-3ef5d63aeab7'),
  ('11111111-1111-1111-1111-111111111111', 'Integración de pagos', 'Conectar con pasarela de pagos', 'En Progreso', 'Alta', '5fbbac17-8527-49bf-8d17-3ef5d63aeab7'),
  ('11111111-1111-1111-1111-111111111111', 'Panel de administración', 'Dashboard para gestionar productos', 'Backlog', 'Media', '5fbbac17-8527-49bf-8d17-3ef5d63aeab7'),
  ('11111111-1111-1111-1111-111111111111', 'Sistema de notificaciones', 'Enviar emails de confirmación de pedidos', 'Backlog', 'Baja', '5fbbac17-8527-49bf-8d17-3ef5d63aeab7');

-- Crear tareas para Proyecto 2 (Sistema de Inventario)
INSERT INTO public.tasks (project_id, name, description, status, priority, assignee_id)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'Modelado de base de datos', 'Diseñar esquema para inventario y producción', 'En Progreso', 'Alta', '5fbbac17-8527-49bf-8d17-3ef5d63aeab7'),
  ('22222222-2222-2222-2222-222222222222', 'Módulo de entrada de materiales', 'Registrar ingreso de materia prima', 'Backlog', 'Alta', '5fbbac17-8527-49bf-8d17-3ef5d63aeab7'),
  ('22222222-2222-2222-2222-222222222222', 'Reportes de stock', 'Generar reportes automáticos de inventario', 'Backlog', 'Media', '5fbbac17-8527-49bf-8d17-3ef5d63aeab7'),
  ('22222222-2222-2222-2222-222222222222', 'Control de producción', 'Seguimiento de órdenes de producción', 'Backlog', 'Alta', '5fbbac17-8527-49bf-8d17-3ef5d63aeab7');

-- Crear tareas para Proyecto 3 (Plataforma Integral)
INSERT INTO public.tasks (project_id, name, description, status, priority, assignee_id)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'Arquitectura del sistema', 'Definir arquitectura microservicios', 'Backlog', 'Alta', '5fbbac17-8527-49bf-8d17-3ef5d63aeab7'),
  ('33333333-3333-3333-3333-333333333333', 'Módulo ERP completo', 'Integrar todos los módulos de gestión', 'Backlog', 'Alta', '5fbbac17-8527-49bf-8d17-3ef5d63aeab7'),
  ('33333333-3333-3333-3333-333333333333', 'Sistema CRM', 'Gestión de clientes y ventas', 'Backlog', 'Media', '5fbbac17-8527-49bf-8d17-3ef5d63aeab7');

-- Crear riesgos para Proyecto 1 (Riesgo Bajo)
INSERT INTO public.risks (project_id, description, probability, impact, mitigation_plan, status)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Retraso en integración de pasarela de pagos', 'Baja', 'Medio', 'Tener un proveedor alternativo de pagos ya identificado', 'Identificado');

-- Crear riesgos para Proyecto 2 (Riesgo Medio)
INSERT INTO public.risks (project_id, description, probability, impact, mitigation_plan, status)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'Complejidad del modelo de datos mayor a lo estimado', 'Media', 'Alto', 'Asignar un DBA senior para revisión de arquitectura', 'Identificado'),
  ('22222222-2222-2222-2222-222222222222', 'Falta de disponibilidad de usuarios para testing', 'Media', 'Medio', 'Programar sesiones de testing con antelación', 'Identificado');

-- Crear riesgos para Proyecto 3 (Riesgo Alto)
INSERT INTO public.risks (project_id, description, probability, impact, mitigation_plan, status)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'Alcance muy amplio con recursos limitados', 'Alta', 'Alto', 'Dividir proyecto en fases incrementales de 60 días cada una', 'Identificado'),
  ('33333333-3333-3333-3333-333333333333', 'Dependencias entre múltiples módulos generan bloqueos', 'Alta', 'Alto', 'Implementar arquitectura desacoplada con APIs bien definidas', 'Identificado'),
  ('33333333-3333-3333-3333-333333333333', 'Curva de aprendizaje elevada para el equipo', 'Media', 'Alto', 'Capacitación inicial de 2 semanas antes de comenzar desarrollo', 'Identificado');

-- Crear predicciones de IA para los proyectos
INSERT INTO public.ai_predictions (project_id, predicted_risk_probability, suggestion_message, model_version)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 0.1, '✅ Riesgo Bajo: Parámetros dentro de lo normal. Proyecto viable con recursos actuales.', 'v1.0-simulado'),
  ('22222222-2222-2222-2222-222222222222', 0.5, '⚡ Riesgo Medio: Monitorear de cerca el alcance y asegurar comunicación constante.', 'v1.0-simulado'),
  ('33333333-3333-3333-3333-333333333333', 0.9, '⚠️ Riesgo Alto: Proyecto muy complejo. Se recomienda dividir en fases y asignar más recursos.', 'v1.0-simulado');