const MAX_INPUT_BYTES = 15 * 1024 * 1024;
const MAX_DIMENSION = 1600;
const QUALITY = 0.85;

export class ImageError extends Error {}

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new ImageError('No se pudo leer la imagen.'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Redimensiona (máx. 1600 px) y comprime una captura antes de embeberla en el documento.
 * Una captura típica pasa de 1–3 MB a 150–400 KB, lo que mantiene el autoguardado rápido
 * y por debajo del límite de tamaño del servidor.
 */
export async function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new ImageError('El archivo no es una imagen.');
  if (file.size > MAX_INPUT_BYTES) throw new ImageError('La imagen supera los 15 MB.');

  // GIF y SVG se conservan tal cual (animación / vectores).
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    if (file.size > 1_500_000) throw new ImageError('Los GIF/SVG deben pesar menos de 1,5 MB.');
    return readAsDataUrl(file);
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new ImageError('No se pudo procesar la imagen.');
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new ImageError('Tu navegador no permite procesar imágenes.');
  // Fondo blanco para capturas PNG con transparencia (JPEG no tiene canal alfa).
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
  if (!blob) throw new ImageError('No se pudo comprimir la imagen.');
  // Si la original ya era más liviana (p. ej. un PNG pequeño), se usa la original.
  return readAsDataUrl(blob.size < file.size ? blob : file);
}
