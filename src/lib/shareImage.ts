/**
 * Utilidad para generar imágenes de compartir artículos
 * Crea tarjetas visuales atractivas para redes sociales
 */

// URL correcta del sitio web
const SITE_URL = 'psicomente.vercel.app';
const SITE_NAME = 'PsicoMente';

interface ShareImageOptions {
  title: string;
  excerpt: string;
  category: string;
  imageUrl?: string;
}

/**
 * Genera una imagen de compartir usando Canvas
 */
export async function generateShareImage(options: ShareImageOptions): Promise<Blob> {
  const { title, excerpt, category, imageUrl } = options;
  
  // Crear canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Dimensiones para Instagram (cuadrado)
  const width = 1080;
  const height = 1080;
  canvas.width = width;
  canvas.height = height;
  
  // Fondo con gradiente
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#6366f1'); // primary
  gradient.addColorStop(0.5, '#8b5cf6'); // accent
  gradient.addColorStop(1, '#6366f1');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Patrón decorativo
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 100 + 50;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  
  // Si hay imagen del artículo, cargarla y mostrarla
  if (imageUrl) {
    try {
      const img = await loadImage(imageUrl);
      
      // Área de imagen (parte superior)
      const imgHeight = 400;
      const imgY = 100;
      const imgX = 60;
      const imgWidth = width - 120;
      
      // Dibujar imagen con bordes redondeados
      ctx.save();
      roundRect(ctx, imgX, imgY, imgWidth, imgHeight, 20);
      ctx.clip();
      
      // Escalar y centrar imagen
      const scale = Math.max(imgWidth / img.width, imgHeight / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const imgDrawX = imgX + (imgWidth - scaledWidth) / 2;
      const imgDrawY = imgY + (imgHeight - scaledHeight) / 2;
      
      ctx.drawImage(img, imgDrawX, imgDrawY, scaledWidth, scaledHeight);
      ctx.restore();
      
      // Overlay gradiente en la imagen
      const imgOverlay = ctx.createLinearGradient(imgX, imgY + imgHeight - 100, imgX, imgY + imgHeight);
      imgOverlay.addColorStop(0, 'rgba(99, 102, 241, 0)');
      imgOverlay.addColorStop(1, 'rgba(99, 102, 241, 0.3)');
      ctx.fillStyle = imgOverlay;
      roundRect(ctx, imgX, imgY, imgWidth, imgHeight, 20);
      ctx.fill();
    } catch (error) {
      console.log('No se pudo cargar la imagen del artículo, usando diseño alternativo');
    }
  }
  
  // Área de contenido
  const contentY = imageUrl ? 550 : 200;
  
  // Categoría badge
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  roundRect(ctx, 60, contentY, 200, 50, 25);
  ctx.fill();
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(category.toUpperCase(), 160, contentY + 33);
  
  // Título
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  
  const titleLines = wrapText(ctx, title, width - 120, 48);
  let titleY = contentY + 100;
  
  titleLines.forEach((line, index) => {
    if (index < 3) { // Máximo 3 líneas
      ctx.fillText(line, 60, titleY);
      titleY += 60;
    }
  });
  
  // Extracto
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = '28px system-ui, -apple-system, sans-serif';
  
  const excerptLines = wrapText(ctx, excerpt, width - 120, 28);
  let excerptY = titleY + 30;
  
  excerptLines.forEach((line, index) => {
    if (index < 3) { // Máximo 3 líneas
      ctx.fillText(line, 60, excerptY);
      excerptY += 38;
    }
  });
  
  // Branding inferior
  const brandingY = height - 120;
  
  // Línea separadora
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, brandingY - 30);
  ctx.lineTo(width - 60, brandingY - 30);
  ctx.stroke();
  
  // Logo/Icono (cerebro estilizado)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🧠', 60, brandingY + 20);
  
  // Nombre del sitio
  ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
  ctx.fillText(SITE_NAME, 120, brandingY + 20);
  
  // URL
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = '24px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(SITE_URL, width - 60, brandingY + 20);
  
  // Convertir a Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('No se pudo generar la imagen'));
      }
    }, 'image/png', 0.95);
  });
}

/**
 * Carga una imagen desde URL
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
    img.src = url;
  });
}

/**
 * Dibuja un rectángulo con bordes redondeados
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Divide texto en líneas que caben en un ancho determinado
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontSize: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

/**
 * Descarga la imagen generada
 */
export function downloadShareImage(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Comparte la imagen usando Web Share API (si está disponible)
 */
export async function shareImage(blob: Blob, title: string, text: string): Promise<boolean> {
  const file = new File([blob], 'articulo.png', { type: 'image/png' });
  
  if (navigator.share && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title,
        text,
        files: [file],
      });
      return true;
    } catch (error) {
      // Usuario canceló o error
      return false;
    }
  }
  
  return false;
}

/**
 * Copia la imagen al portapapeles
 */
export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    const item = new ClipboardItem({ 'image/png': blob });
    await navigator.clipboard.write([item]);
    return true;
  } catch (error) {
    console.error('Error copiando imagen:', error);
    return false;
  }
}
