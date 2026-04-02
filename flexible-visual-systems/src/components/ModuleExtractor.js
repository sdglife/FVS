/**
 * Canvas-based logo analysis.
 * Splits an uploaded image into a grid and extracts visual "modules" —
 * distinct shape primitives that make up the logo.
 */
import { createCanvas } from '../utils/canvasHelpers';
import { detectShape, getShapeDrawer } from '../utils/shapeDetector';
import { getAverageColor } from '../utils/canvasHelpers';

/**
 * Extract modules from an image.
 * @param {HTMLImageElement} img
 * @param {number} gridSize - number of cells along the longest axis
 * @returns {Array<{ id, row, col, type, color, confidence, drawer }>}
 */
export function extractModules(img, gridSize = 8) {
  const aspect = img.width / img.height;
  let cols, rows;
  if (aspect >= 1) {
    cols = gridSize;
    rows = Math.max(1, Math.round(gridSize / aspect));
  } else {
    rows = gridSize;
    cols = Math.max(1, Math.round(gridSize * aspect));
  }

  const cellW = Math.floor(img.width / cols);
  const cellH = Math.floor(img.height / rows);

  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const modules = [];
  let id = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellW;
      const y = row * cellH;
      const imageData = ctx.getImageData(x, y, cellW, cellH);
      const shape = detectShape(imageData);

      if (shape.type !== 'empty') {
        const color = getAverageColor(imageData);
        modules.push({
          id: id++,
          row,
          col,
          type: shape.type,
          color,
          confidence: shape.confidence,
          drawer: getShapeDrawer(shape.type),
          cellW,
          cellH,
        });
      }
    }
  }

  return { modules, rows, cols, cellW, cellH };
}

/**
 * Render extracted modules onto a canvas.
 */
export function renderModules(ctx, modules, cellSize, offsetX = 0, offsetY = 0, overrideColor = null) {
  for (const mod of modules) {
    const x = offsetX + mod.col * cellSize;
    const y = offsetY + mod.row * cellSize;
    mod.drawer(ctx, x, y, cellSize * 0.9, overrideColor || mod.color);
  }
}

/**
 * Get unique module types from a module set.
 */
export function getUniqueModuleTypes(modules) {
  const seen = new Map();
  for (const mod of modules) {
    if (!seen.has(mod.type)) {
      seen.set(mod.type, mod);
    }
  }
  return Array.from(seen.values());
}
