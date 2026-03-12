// Sistema de versiones de PsicoMente
// Actualizar este archivo con cada nuevo deploy

export const VERSION = '1.7.0';

export const VERSION_HISTORY = [
  {
    version: '1.7.0',
    date: '2026-02-26',
    changes: [
      'Generación automática de imagen optimizada para Instagram (1080x1080)',
      'La imagen incluye título, extracto, logo y tiempo de lectura',
      'Texto del artículo se copia automáticamente al descargar',
      'Instrucciones claras para subir a Instagram',
    ],
  },
  {
    version: '1.6.0',
    date: '2026-02-26',
    changes: [
      'Añadidas imágenes generadas con IA para cada artículo',
      'Botones de compartir en Instagram, Twitter y WhatsApp',
      'Diálogo de compartir con opciones múltiples',
      'Mejorada visualización de artículos con imágenes',
      'Indicador de vistas en cada artículo',
    ],
  },
  {
    version: '1.5.0',
    date: '2026-02-26',
    changes: [
      'Añadidos sonidos ambientales reales a la Zona Mindfulness',
      '4 nuevos sonidos: Océano, Lluvia, Bosque, Fogata',
      'Control de volumen para ejercicios de sonido',
    ],
  },
  {
    version: '1.4.0',
    date: '2026-02-26',
    changes: [
      'Eliminadas estadísticas falsas del Hero',
      'Añadidas características reales del servicio',
      'Contenido honesto: 24/7, Privado, Respuesta inmediata',
    ],
  },
  {
    version: '1.3.0',
    date: '2026-02-26',
    changes: [
      'Corregida detección de estado Premium desde la base de datos',
      'Eliminado botón "Actualizar a Premium" del menú',
      'El sistema detecta automáticamente si el usuario es Premium',
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
