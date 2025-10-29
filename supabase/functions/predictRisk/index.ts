import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { duration, requirements, developers } = await req.json();

    console.log('Predicting risk for:', { duration, requirements, developers });

    // Lógica de negocio simulada (basada en datos de tesis)
    let probability = 0.1; // Base risk

    if (duration > 90) probability += 0.3;
    if (requirements > 30) probability += 0.3;
    if (developers < 2) probability += 0.2;

    // Limitar probabilidad a 0-1
    probability = Math.min(probability, 1.0);

    let suggestion = '';
    if (probability > 0.7) {
      suggestion = "⚠️ Riesgo Alto: Proyecto muy complejo. Se recomienda dividir en fases y asignar más recursos.";
    } else if (probability > 0.4) {
      suggestion = "⚡ Riesgo Medio: Monitorear de cerca el alcance y asegurar comunicación constante.";
    } else {
      suggestion = "✅ Riesgo Bajo: Parámetros dentro de lo normal. Proyecto viable con recursos actuales.";
    }

    console.log('Risk prediction result:', { probability, suggestion });

    return new Response(
      JSON.stringify({ probability, suggestion }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in predictRisk function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});