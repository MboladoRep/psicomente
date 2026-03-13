/**
 * Utilidad para generar imágenes de compartir artículos
 * Optimizado para móviles y redes sociales
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
 * Detecta si el dispositivo es móvil
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Detecta si es iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Detecta si Web Share API está disponible
 */
export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && 
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function';
}

/**
 * Detecta si se pueden compartir archivos
 */
export function canShareFiles(): boolean {
  if (!canNativeShare()) return false;
  const testFile = new File(['test'], 'test.png', { type: 'image/png' });
  return navigator.canShare({ files: [testFile] });
}

/**
 * Genera una imagen de compartir usando Canvas
 * Optimizado para dispositivos móviles
 */
export async function generateShareImage(options: ShareImageOptions): Promise<Blob> {
  const { title, excerpt, category, imageUrl } = options;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  const width = 1080;
  const height = 1080;
  canvas.width = width;
  canvas.height = height;
  
  // Fondo con gradiente
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#6366f1');
  gradient.addColorStop(0.5, '#8b5cf6');
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
  
  let contentY = 200;
  
  if (imageUrl) {
    try {
      const img = await loadImage(imageUrl);
      
      const imgHeight = 400;
      const imgY = 100;
      const imgX = 60;
      const imgWidth = width - 120;
      
      ctx.save();
      roundRect(ctx, imgX, imgY, imgWidth, imgHeight, 20);
      ctx.clip();
      
      const scale = Math.max(imgWidth / img.width, imgHeight / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const imgDrawX = imgX + (imgWidth - scaledWidth) / 2;
      const imgDrawY = imgY + (imgHeight - scaledHeight) / 2;
      
      ctx.drawImage(img, imgDrawX, imgDrawY, scaledWidth, scaledHeight);
      ctx.restore();
      
      const imgOverlay = ctx.createLinearGradient(imgX, imgY + imgHeight - 100, imgX, imgY + imgHeight);
      imgOverlay.addColorStop(0, 'rgba(99, 102, 241, 0)');
      imgOverlay.addColorStop(1, 'rgba(99, 102, 241, 0.3)');
      ctx.fillStyle = imgOverlay;
      roundRect(ctx, imgX, imgY, imgWidth, imgHeight, 20);
      ctx.fill();
      
      contentY = 550;
    } catch (error) {
      console.log('No se pudo cargar la imagen del artículo');
    }
  }
  
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
    if (index < 3) {
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
    if (index < 3) {
      ctx.fillText(line, 60, excerptY);
      excerptY += 38;
    }
  });
  
  // Branding inferior
  const brandingY = height - 120;
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, brandingY - 30);
  ctx.lineTo(width - 60, brandingY - 30);
  ctx.stroke();
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🧠', 60, brandingY + 20);
  
  ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
  ctx.fillText(SITE_NAME, 120, brandingY + 20);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = '24px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(SITE_URL, width - 60, brandingY + 20);
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('No se pudo generar la imagen'));
      }
    }, 'image/png', 0.9);
  });
}

/**
 * Genera un File en lugar de Blob para mejor compatibilidad con Web Share
 */
export async function generateShareFile(options: ShareImageOptions): Promise<File> {
  const blob = await generateShareImage(options);
  const filename = `psicomente-${Date.now()}.png`;
  return new File([blob], filename, { type: 'image/png' });
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
    const separator = url.includes('?') ? '&' : '?';
    img.src = url + separator + '_t=' + Date.now();
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
 * En iOS abre la imagen en una nueva pestaña
 */
export function downloadShareImage(blob: Blob, filename: string): void {
  if (isIOS()) {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    return;
  }
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Comparte nativamente usando Web Share API (móviles)
 */
export async function nativeShare(file: File, title: string, text: string): Promise<boolean> {
  if (!canShareFiles()) return false;
  
  try {
    await navigator.share({ title, text, files: [file] });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Muestra la imagen en pantalla completa para guardar manualmente
 */
export function openImageFullscreen(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  
  const overlay = document.createElement('div');
  overlay.id = 'share-image-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;
  
  const instructions = document.createElement('div');
  instructions.style.cssText = `
    color: white;
    text-align: center;
    margin-bottom: 20px;
    font-family: system-ui, -apple-system, sans-serif;
  `;
  instructions.innerHTML = `
    <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Mantén pulsada la imagen</p>
    <p style="margin: 0; font-size: 14px; opacity: 0.8;">para guardarla o compartirla</p>
  `;
  
  const img = document.createElement('img');
  img.src = url;
  img.style.cssText = `
    max-width: 100%;
    max-height: 70vh;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  `;
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Cerrar';
  closeBtn.style.cssText = `
    margin-top: 20px;
    padding: 12px 32px;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 25px;
    color: white;
    font-size: 16px;
    cursor: pointer;
  `;
  closeBtn.onclick = () => {
    document.body.removeChild(overlay);
    URL.revokeObjectURL(url);
  };
  
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
      URL.revokeObjectURL(url);
    }
  };
  
  overlay.appendChild(instructions);
  overlay.appendChild(img);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);
}

export { SITE_URL, SITE_NAME };
