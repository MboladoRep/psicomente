/**
 * Sistema de versiones de PsicoMente
 */

export const VERSION = '1.7.2';

export interface VersionEntry {
  version: string;
  date: string;
  changes: string[];
}

export const VERSION_HISTORY: VersionEntry[] = [

    {
    version: '1.7.2',
    date: '2025-02-26',
    changes: [
      'Corregido guardado de chats para usuarios Premium',
      'Verificación estricta de estado premium (=== true)',
      'Añadido logging para debug en API de conversaciones',
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

export function getCurrentVersion(): string {
  return VERSION;
}

export function getVersionHistory(): VersionEntry[] {
  return VERSION_HISTORY;
}

export function getCurrentChanges(): string[] {
  return VERSION_HISTORY[0]?.changes || [];
}
