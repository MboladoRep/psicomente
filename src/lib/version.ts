// Sistema de versiones de PsicoMente
// Actualizar este archivo con cada nuevo deploy

export const VERSION = '1.2.0';

export const VERSION_HISTORY = [
  {
    version: '1.2.0',
    date: '2026-02-26',
    changes: [
      'Añadido acceso al perfil desde avatar de usuario',
      'Nueva opción "Mi Perfil" en menú desplegable',
      'Cambiado diseño de colores (purple/pink para branding)',
      'Arreglado conteo de usuarios en panel admin',
      'Ingresos ahora en euros (€)',
      'Mejorada detección de estado Premium',
      'Añadido sistema de versiones',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-02-25',
    changes: [
      'Mejoras en seguridad de APIs',
      'Añadido historial de chat',
      'Página de perfil de usuario',
      'Panel de administración mejorado',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-02-20',
    changes: [
      'Versión inicial de PsicoMente',
      'Chat IA con Groq',
      'Sistema de usuarios con Firebase',
      'Panel de administración',
      'Tests psicológicos',
      'Diario personal',
      'Ejercicios de mindfulness',
    ],
  },
];

export function getVersionInfo() {
  return {
    version: VERSION,
    current: VERSION_HISTORY[0],
    history: VERSION_HISTORY,
  };
}
