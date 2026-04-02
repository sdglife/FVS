/**
 * Shape Modules — Rectangle edge modification primitives.
 * Core of the Flexible Visual Systems methodology:
 * Start from a rectangle, modify its edges/corners to create a library of shapes.
 */

// Edge modification types
export const EDGE_STYLES = {
  straight: 'straight',
  rounded: 'rounded',
  cut: 'cut',         // 45° chamfer
  concave: 'concave', // inward curve
  wavy: 'wavy',
  notch: 'notch',     // rectangular notch
  scallop: 'scallop', // semicircle bite
};

export const EDGE_STYLE_LIST = Object.keys(EDGE_STYLES);

/**
 * Draw a rectangle with modified corners/edges.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w - width
 * @param {number} h - height
 * @param {object} opts
 * @param {string} opts.topLeft - corner style
 * @param {string} opts.topRight
 * @param {string} opts.bottomRight
 * @param {string} opts.bottomLeft
 * @param {number} opts.radius - corner radius / modification amount (0-1 fraction of min side)
 * @param {string} opts.fill
 * @param {string} opts.stroke
 * @param {number} opts.strokeWidth
 */
export function drawModifiedRect(ctx, x, y, w, h, opts = {}) {
  const {
    topLeft = 'straight',
    topRight = 'straight',
    bottomRight = 'straight',
    bottomLeft = 'straight',
    radius = 0.2,
    fill = null,
    stroke = null,
    strokeWidth = 2,
  } = opts;

  const r = Math.min(w, h) * Math.min(radius, 0.5);

  ctx.beginPath();

  // Top-left corner
  drawCorner(ctx, x, y, r, topLeft, 'tl', w, h);
  // Top edge → top-right corner
  drawCorner(ctx, x + w, y, r, topRight, 'tr', w, h);
  // Right edge → bottom-right corner
  drawCorner(ctx, x + w, y + h, r, bottomRight, 'br', w, h);
  // Bottom edge → bottom-left corner
  drawCorner(ctx, x, y + h, r, bottomLeft, 'bl', w, h);

  ctx.closePath();

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }
}

function drawCorner(ctx, cx, cy, r, style, position, w, h) {
  switch (position) {
    case 'tl': return drawTL(ctx, cx, cy, r, style);
    case 'tr': return drawTR(ctx, cx, cy, r, style);
    case 'br': return drawBR(ctx, cx, cy, r, style);
    case 'bl': return drawBL(ctx, cx, cy, r, style);
  }
}

function drawTL(ctx, x, y, r, style) {
  switch (style) {
    case 'rounded':
      ctx.moveTo(x + r, y);
      break;
    case 'cut':
      ctx.moveTo(x + r, y);
      break;
    case 'concave':
      ctx.moveTo(x + r, y);
      break;
    case 'notch':
      ctx.moveTo(x + r, y);
      break;
    case 'scallop':
      ctx.moveTo(x + r, y);
      break;
    case 'wavy':
      ctx.moveTo(x + r, y);
      break;
    default:
      ctx.moveTo(x, y);
      break;
  }
}

function drawTR(ctx, x, y, r, style) {
  // Line from current position to top-right area, then corner
  switch (style) {
    case 'rounded':
      ctx.lineTo(x - r, y);
      ctx.quadraticCurveTo(x, y, x, y + r);
      break;
    case 'cut':
      ctx.lineTo(x - r, y);
      ctx.lineTo(x, y + r);
      break;
    case 'concave':
      ctx.lineTo(x - r, y);
      ctx.quadraticCurveTo(x - r, y + r, x, y + r);
      break;
    case 'notch':
      ctx.lineTo(x - r, y);
      ctx.lineTo(x - r, y + r);
      ctx.lineTo(x, y + r);
      break;
    case 'scallop':
      ctx.lineTo(x - r, y);
      ctx.arc(x - r, y + r, r, -Math.PI / 2, 0, true);
      break;
    case 'wavy':
      ctx.lineTo(x - r, y);
      ctx.bezierCurveTo(x - r / 2, y + r / 2, x, y, x, y + r);
      break;
    default:
      ctx.lineTo(x, y);
      break;
  }
}

function drawBR(ctx, x, y, r, style) {
  switch (style) {
    case 'rounded':
      ctx.lineTo(x, y - r);
      ctx.quadraticCurveTo(x, y, x - r, y);
      break;
    case 'cut':
      ctx.lineTo(x, y - r);
      ctx.lineTo(x - r, y);
      break;
    case 'concave':
      ctx.lineTo(x, y - r);
      ctx.quadraticCurveTo(x - r, y - r, x - r, y);
      break;
    case 'notch':
      ctx.lineTo(x, y - r);
      ctx.lineTo(x - r, y - r);
      ctx.lineTo(x - r, y);
      break;
    case 'scallop':
      ctx.lineTo(x, y - r);
      ctx.arc(x - r, y - r, r, 0, Math.PI / 2, true);
      break;
    case 'wavy':
      ctx.lineTo(x, y - r);
      ctx.bezierCurveTo(x - r / 2, y - r / 2, x, y, x - r, y);
      break;
    default:
      ctx.lineTo(x, y);
      break;
  }
}

function drawBL(ctx, x, y, r, style) {
  switch (style) {
    case 'rounded':
      ctx.lineTo(x + r, y);
      ctx.quadraticCurveTo(x, y, x, y - r);
      break;
    case 'cut':
      ctx.lineTo(x + r, y);
      ctx.lineTo(x, y - r);
      break;
    case 'concave':
      ctx.lineTo(x + r, y);
      ctx.quadraticCurveTo(x + r, y - r, x, y - r);
      break;
    case 'notch':
      ctx.lineTo(x + r, y);
      ctx.lineTo(x + r, y - r);
      ctx.lineTo(x, y - r);
      break;
    case 'scallop':
      ctx.lineTo(x + r, y);
      ctx.arc(x + r, y - r, r, Math.PI / 2, Math.PI, true);
      break;
    case 'wavy':
      ctx.lineTo(x + r, y);
      ctx.bezierCurveTo(x + r / 2, y - r / 2, x, y, x, y - r);
      break;
    default:
      ctx.lineTo(x, y);
      break;
  }
}

// Complete the path back to the top-left
function drawTLClose(ctx, x, y, r, style) {
  switch (style) {
    case 'rounded':
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      break;
    case 'cut':
      ctx.lineTo(x, y + r);
      ctx.lineTo(x + r, y);
      break;
    case 'concave':
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x + r, y + r, x + r, y);
      break;
    case 'notch':
      ctx.lineTo(x, y + r);
      ctx.lineTo(x + r, y + r);
      ctx.lineTo(x + r, y);
      break;
    case 'scallop':
      ctx.lineTo(x, y + r);
      ctx.arc(x + r, y + r, r, Math.PI, -Math.PI / 2, true);
      break;
    case 'wavy':
      ctx.lineTo(x, y + r);
      ctx.bezierCurveTo(x + r / 2, y + r / 2, x, y, x + r, y);
      break;
    default:
      // straight — just close
      break;
  }
}

/**
 * Draw a complete modified rectangle with proper path.
 * This is the main drawing function that handles the full shape.
 */
export function drawShape(ctx, x, y, w, h, corners, radius, fill, stroke, strokeWidth = 2) {
  const r = Math.min(w, h) * Math.min(radius, 0.5);
  const [tl, tr, br, bl] = corners;

  ctx.beginPath();

  // Start: top-left
  if (tl === 'straight') {
    ctx.moveTo(x, y);
  } else {
    ctx.moveTo(x + r, y);
  }

  // Top-right
  drawTR(ctx, x + w, y, r, tr);
  // Bottom-right
  drawBR(ctx, x + w, y + h, r, br);
  // Bottom-left
  drawBL(ctx, x, y + h, r, bl);
  // Close to top-left
  drawTLClose(ctx, x, y, r, tl);

  ctx.closePath();

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }
}

/**
 * Generate a set of module variations from a base corner config.
 * Returns all meaningful permutations for the system.
 */
export function generateModuleSet(baseStyle, secondaryStyle = 'straight') {
  const modules = [];

  // All same
  modules.push({
    name: `${baseStyle}-all`,
    label: `All ${baseStyle}`,
    corners: [baseStyle, baseStyle, baseStyle, baseStyle],
  });

  // Single corner
  modules.push({
    name: `${baseStyle}-tl`,
    label: `Top-left`,
    corners: [baseStyle, secondaryStyle, secondaryStyle, secondaryStyle],
  });
  modules.push({
    name: `${baseStyle}-tr`,
    label: `Top-right`,
    corners: [secondaryStyle, baseStyle, secondaryStyle, secondaryStyle],
  });
  modules.push({
    name: `${baseStyle}-br`,
    label: `Bottom-right`,
    corners: [secondaryStyle, secondaryStyle, baseStyle, secondaryStyle],
  });
  modules.push({
    name: `${baseStyle}-bl`,
    label: `Bottom-left`,
    corners: [secondaryStyle, secondaryStyle, secondaryStyle, baseStyle],
  });

  // Diagonal pairs
  modules.push({
    name: `${baseStyle}-diag-tlbr`,
    label: `Diagonal TL-BR`,
    corners: [baseStyle, secondaryStyle, baseStyle, secondaryStyle],
  });
  modules.push({
    name: `${baseStyle}-diag-trbl`,
    label: `Diagonal TR-BL`,
    corners: [secondaryStyle, baseStyle, secondaryStyle, baseStyle],
  });

  // Top pair
  modules.push({
    name: `${baseStyle}-top`,
    label: `Top`,
    corners: [baseStyle, baseStyle, secondaryStyle, secondaryStyle],
  });

  // Bottom pair
  modules.push({
    name: `${baseStyle}-bottom`,
    label: `Bottom`,
    corners: [secondaryStyle, secondaryStyle, baseStyle, baseStyle],
  });

  // Left pair
  modules.push({
    name: `${baseStyle}-left`,
    label: `Left`,
    corners: [baseStyle, secondaryStyle, secondaryStyle, baseStyle],
  });

  // Right pair
  modules.push({
    name: `${baseStyle}-right`,
    label: `Right`,
    corners: [secondaryStyle, baseStyle, baseStyle, secondaryStyle],
  });

  // Straight (base rectangle)
  modules.push({
    name: 'straight-all',
    label: 'Rectangle',
    corners: ['straight', 'straight', 'straight', 'straight'],
  });

  return modules;
}

/**
 * Generate a pattern by tiling modules on a grid.
 */
export function drawPattern(ctx, x, y, gridW, gridH, cellSize, gap, modules, radius, fill, stroke) {
  for (let row = 0; row < gridH; row++) {
    for (let col = 0; col < gridW; col++) {
      const mod = modules[(row * gridW + col) % modules.length];
      const cx = x + col * (cellSize + gap);
      const cy = y + row * (cellSize + gap);
      drawShape(ctx, cx, cy, cellSize, cellSize, mod.corners, radius, fill, stroke);
    }
  }
}

/**
 * Draw a frame (outlined rectangle with modified edges).
 */
export function drawFrame(ctx, x, y, w, h, corners, radius, stroke, strokeWidth = 2) {
  drawShape(ctx, x, y, w, h, corners, radius, null, stroke, strokeWidth);
}

/**
 * Create a supershape by combining 4 modules in a 2×2 grid.
 */
export function drawSuperShape(ctx, x, y, size, modules, radius, fill, stroke) {
  const half = size / 2;
  const gap = 2;
  for (let i = 0; i < Math.min(modules.length, 4); i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    drawShape(
      ctx,
      x + col * (half + gap),
      y + row * (half + gap),
      half - gap,
      half - gap,
      modules[i].corners,
      radius,
      fill,
      stroke
    );
  }
}
