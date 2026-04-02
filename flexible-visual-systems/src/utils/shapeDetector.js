/**
 * Geometric primitive classifier.
 * Analyzes a region of pixel data and classifies it as a shape type.
 */

/**
 * Detect the dominant shape in a binary region.
 * @param {ImageData} imageData - pixel data for the region
 * @returns {{ type: string, confidence: number, metrics: object }}
 */
export function detectShape(imageData) {
  const { width, height, data } = imageData;
  const pixels = [];

  // Collect filled pixel coordinates
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const alpha = data[i + 3];
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (alpha > 128 && brightness < 200) {
        pixels.push({ x, y });
      }
    }
  }

  if (pixels.length === 0) {
    return { type: 'empty', confidence: 1, metrics: {} };
  }

  const fillRatio = pixels.length / (width * height);
  const bounds = getBounds(pixels);
  const aspect = bounds.width / Math.max(bounds.height, 1);
  const centroid = getCentroid(pixels);
  const radialVariance = getRadialVariance(pixels, centroid);
  const cornerDensity = getCornerDensity(pixels, bounds);

  // Classification heuristics
  if (fillRatio > 0.85) {
    if (Math.abs(aspect - 1) < 0.15) {
      return { type: 'square', confidence: 0.9, metrics: { fillRatio, aspect } };
    }
    return { type: 'rectangle', confidence: 0.85, metrics: { fillRatio, aspect } };
  }

  if (radialVariance < 0.15 && fillRatio > 0.6) {
    return { type: 'circle', confidence: 0.85 - radialVariance, metrics: { fillRatio, radialVariance } };
  }

  if (fillRatio > 0.4 && fillRatio < 0.65 && cornerDensity > 0.5) {
    return { type: 'triangle', confidence: 0.7, metrics: { fillRatio, cornerDensity } };
  }

  if (fillRatio < 0.3) {
    if (aspect > 2.5) {
      return { type: 'line-h', confidence: 0.8, metrics: { fillRatio, aspect } };
    }
    if (aspect < 0.4) {
      return { type: 'line-v', confidence: 0.8, metrics: { fillRatio, aspect } };
    }
    return { type: 'dot', confidence: 0.6, metrics: { fillRatio } };
  }

  if (radialVariance > 0.3) {
    return { type: 'polygon', confidence: 0.6, metrics: { fillRatio, radialVariance } };
  }

  return { type: 'organic', confidence: 0.5, metrics: { fillRatio, aspect, radialVariance } };
}

function getBounds(pixels) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pixels) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function getCentroid(pixels) {
  let sx = 0, sy = 0;
  for (const p of pixels) {
    sx += p.x;
    sy += p.y;
  }
  return { x: sx / pixels.length, y: sy / pixels.length };
}

function getRadialVariance(pixels, centroid) {
  const distances = pixels.map(p =>
    Math.sqrt((p.x - centroid.x) ** 2 + (p.y - centroid.y) ** 2)
  );
  const mean = distances.reduce((a, b) => a + b, 0) / distances.length;
  if (mean === 0) return 0;
  const variance = distances.reduce((a, d) => a + (d - mean) ** 2, 0) / distances.length;
  return Math.sqrt(variance) / mean;
}

function getCornerDensity(pixels, bounds) {
  const qw = bounds.width / 4;
  const qh = bounds.height / 4;
  let corners = 0;
  for (const p of pixels) {
    const rx = p.x - bounds.minX;
    const ry = p.y - bounds.minY;
    if ((rx < qw || rx > bounds.width - qw) && (ry < qh || ry > bounds.height - qh)) {
      corners++;
    }
  }
  return corners / pixels.length;
}

/**
 * Returns a canonical draw function for a shape type.
 */
export function getShapeDrawer(type) {
  switch (type) {
    case 'circle':
      return (ctx, x, y, size, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
      };
    case 'triangle':
      return (ctx, x, y, size, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x + size / 2, y);
        ctx.lineTo(x + size, y + size);
        ctx.lineTo(x, y + size);
        ctx.closePath();
        ctx.fill();
      };
    case 'line-h':
      return (ctx, x, y, size, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y + size * 0.35, size, size * 0.3);
      };
    case 'line-v':
      return (ctx, x, y, size, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x + size * 0.35, y, size * 0.3, size);
      };
    case 'dot':
      return (ctx, x, y, size, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 4, 0, Math.PI * 2);
        ctx.fill();
      };
    case 'square':
    case 'rectangle':
    default:
      return (ctx, x, y, size, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, size, size);
      };
  }
}
