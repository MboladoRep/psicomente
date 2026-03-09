// Sistema de versiones de PsicoMente
// Actualizar este archivo con cada nuevo deploy

export const VERSION = '1.4.0';

export const VERSION_HISTORY = [
  {
    version: '1.4.0',
    date: '2026-02-26',
    changes: [
      'Eliminadas estadísticas falsas del Hero',
      'Añadidas características reales del servicio',
      'Contenido honesto: 24/7, Privado, Respuesta inmediata',
      'Mejorada honestidad y transparencia de la web',
    ],
  },
  {
    version: '1.3.0',
    date: '2026-02-26',
    changes: [
      'Corregida detección de estado Premium desde la base de datos',
      'Eliminado botón "Actualizar a Premium" del menú',
      'El sistema detecta automáticamente si el usuario es Premium',
      'Mejorado manejo de errores en la API de usuarios',
    ],
  },
  {
    version: '1.2.0',
    date: '2026-02-26',
    changes: [
      'Añadido acceso al perfil desde avatar de usuario',
      'Nueva opción "Mi Perfil" en menú desplegable',
      'Cambiado diseño de colores (purple/pink para branding)',
      'Arreglado conteo de usuarios en panel admin',
      'Ingresos ahora en euros (€)',
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
