/**
 * Sistema de versiones de PsicoMente
 * Permite rastrear cambios y mejoras implementadas
 */

export const VERSION = '1.7.6';

export interface VersionEntry {
  version: string;
  date: string;
  changes: string[];
}

export const VERSION_HISTORY: VersionEntry[] = [
  {
    version: '1.7.6',
    date: '2025-02-26',
    changes: [
      'Página de detalle de artículos (/articulos/[slug])',
      'Enlaces de WhatsApp ahora funcionan correctamente',
      'Imágenes únicas generadas por IA para cada artículo',
      'Diversidad visual en artículos del blog',
    ],
  },
  {
    version: '1.7.5',
    date: '2025-02-26',
    changes: [
      'Mejoras en chat: historial lateral completo',
      'Eliminar conversaciones guardadas',
      'Límite de 3 conversaciones para usuarios free',
      'Indicador de conversaciones guardadas',
    ],
  },
  {
    version: '1.7.4',
    date: '2025-02-26',
    changes: [
      'Botón de guardar movido abajo del chat (más visible)',
      'Campo de texto se expande automáticamente al escribir',
      'Mejor experiencia en móvil para mensajes largos',
      'Feedback visual al guardar (check verde)',
      'Añadido hint de teclado (Enter/Shift+Enter)',
    ],
  },
  {
    version: '1.7.1',
    date: '2025-02-26',
    changes: [
      'Compartir artículos optimizado para móviles',
      'Web Share API nativo para Instagram en móvil',
      'Sheet bottom para compartir en móvil',
      'Soporte especial para iOS (mantener pulsado)',
      'Botón compartir visible siempre en móvil',
      'Detección automática de dispositivo',
    ],
  },
  {
    version: '1.7.0',
    date: '2025-02-26',
    changes: [
      'Generación de imágenes para compartir artículos',
      'URL correcta en marca de agua: psicomente.vercel.app',
      'Compartir en Instagram con imagen descargable',
      'Compartir en Twitter y WhatsApp',
      'Copiar enlace del artículo',
      'Vista previa de imágenes en artículos',
    ],
  },
  {
    version: '1.6.0',
    date: '2025-02-26',
    changes: [
      'Imágenes en artículos',
      'Botones de compartir en redes sociales',
      'Contador de vistas en artículos',
    ],
  },
  {
    version: '1.5.0',
    date: '2025-02-26',
    changes: [
      'Sonidos ambientales en Zona Mindfulness',
      '4 tipos de sonido: Océano, Lluvia, Bosque, Fuego',
      'Control de volumen integrado',
    ],
  },
  {
    version: '1.4.0',
    date: '2025-02-26',
    changes: [
      'Eliminadas estadísticas falsas del Hero',
      'Trust badges actualizados con datos reales',
      'Contenido honesto y transparente',
    ],
  },
  {
    version: '1.3.0',
    date: '2025-02-26',
    changes: [
      'Corregida detección de estado Premium',
      'Comparación estricta de booleanos',
      'Mejor manejo de datos de usuario',
    ],
  },
  {
    version: '1.2.0',
    date: '2025-02-25',
    changes: [
      'Acceso al perfil desde avatar de usuario',
      'Opción "Mi Perfil" en menú desplegable',
      'Cambio de colores del panel admin',
      'Conteo correcto de usuarios',
    ],
  },
  {
    version: '1.1.0',
    date: '2025-02-25',
    changes: [
      'Sistema de versiones implementado',
      'Badge de versión en Footer',
      'Historial de cambios accesible',
    ],
  },
  {
    version: '1.0.0',
    date: '2025-02-24',
    changes: [
      'Lanzamiento inicial de PsicoMente',
      'Chat con IA psicológica',
      'Diario emocional',
      'Tests psicológicos',
      'Zona Mindfulness',
      'Sistema de gamificación',
      'Planes Free y Premium',
    ],
  },
];

/**
 * Obtiene la versión actual
 */
export function getCurrentVersion(): string {
  return VERSION;
}

/**
 * Obtiene el historial completo de versiones
 */
export function getVersionHistory(): VersionEntry[] {
  return VERSION_HISTORY;
}

/**
 * Obtiene los cambios de la versión actual
 */
export function getCurrentChanges(): string[] {
  return VERSION_HISTORY[0]?.changes || [];
}
