import React, { useRef, useEffect, useState } from 'react';
import { drawShape, drawPattern, drawFrame } from '../utils/shapeModules';
import { renderBitmapText, getCharBitmap } from '../utils/bitmapFont';
import { clearCanvas } from '../utils/canvasHelpers';

export default function AssetsView({ modules, cornerRadius, gridDensity, moduleGap, primaryColor, secondaryColor, bgColor }) {
  const [typeText, setTypeText] = useState('BRAND');

  if (!modules) {
    return (
      <div className="empty-state">
        <div className="empty-icon">&#9638;</div>
        <div>Generate a system to see assembled assets</div>
      </div>
    );
  }

  return (
    <div>
      {/* Patterns */}
      <div className="section">
        <div className="section-title">Patterns</div>
        <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 16 }}>
          Tiled module patterns for backgrounds, textures, and surfaces.
        </p>
        <div className="asset-row">
          <PatternCanvas
            label="Single Module"
            modules={[modules[0]]}
            radius={cornerRadius}
            density={gridDensity}
            gap={moduleGap}
            fill={primaryColor}
            bg={bgColor}
          />
          <PatternCanvas
            label="Alternating"
            modules={modules.length >= 6 ? [modules[5], modules[6]] : [modules[0], modules[modules.length - 1]]}
            radius={cornerRadius}
            density={gridDensity}
            gap={moduleGap}
            fill={primaryColor}
            bg={bgColor}
          />
          <PatternCanvas
            label="All Variations"
            modules={modules.slice(0, 4)}
            radius={cornerRadius}
            density={gridDensity}
            gap={moduleGap}
            fill={secondaryColor}
            bg={bgColor}
          />
          <PatternCanvas
            label="Outline Grid"
            modules={[modules[0]]}
            radius={cornerRadius}
            density={gridDensity}
            gap={0}
            fill={null}
            stroke={primaryColor}
            bg={bgColor}
          />
        </div>
      </div>

      {/* Frames */}
      <div className="section" style={{ marginTop: 28 }}>
        <div className="section-title">Frames</div>
        <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 16 }}>
          Container shapes for text, images, and interactive elements.
        </p>
        <div className="asset-row">
          {modules.slice(0, 6).map((mod, i) => (
            <FrameCanvas
              key={mod.name}
              mod={mod}
              radius={cornerRadius}
              stroke={primaryColor}
              bg={bgColor}
              label={mod.label}
            />
          ))}
        </div>
      </div>

      {/* Symbols */}
      <div className="section" style={{ marginTop: 28 }}>
        <div className="section-title">Symbols</div>
        <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 16 }}>
          Iconic marks assembled from your modules.
        </p>
        <div className="asset-row">
          <SymbolCanvas
            label="Mark"
            modules={modules}
            radius={cornerRadius}
            primary={primaryColor}
            secondary={secondaryColor}
            bg={bgColor}
            variant="mark"
          />
          <SymbolCanvas
            label="Stacked"
            modules={modules}
            radius={cornerRadius}
            primary={primaryColor}
            secondary={secondaryColor}
            bg={bgColor}
            variant="stacked"
          />
          <SymbolCanvas
            label="Arrow"
            modules={modules}
            radius={cornerRadius}
            primary={primaryColor}
            secondary={secondaryColor}
            bg={bgColor}
            variant="arrow"
          />
          <SymbolCanvas
            label="Grid Mark"
            modules={modules}
            radius={cornerRadius}
            primary={primaryColor}
            secondary={secondaryColor}
            bg={bgColor}
            variant="grid"
          />
        </div>
      </div>

      {/* Modular Typography */}
      <div className="section" style={{ marginTop: 28 }}>
        <div className="section-title">Modular Typography</div>
        <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 16 }}>
          Characters built pixel-by-pixel from your module shapes.
        </p>
        <div className="type-input-row" style={{ marginBottom: 16 }}>
          <input
            type="text"
            value={typeText}
            onChange={e => setTypeText(e.target.value.toUpperCase())}
            placeholder="TYPE SOMETHING..."
            maxLength={16}
            style={{
              flex: 1, background: 'var(--bg)', border: '1px solid var(--border)',
              color: 'var(--text)', padding: '8px 12px', borderRadius: 'var(--radius)',
              fontSize: 14,
            }}
          />
        </div>
        <TypeCanvas
          text={typeText}
          mod={modules[0]}
          radius={cornerRadius}
          fill={primaryColor}
          bg={bgColor}
        />
        <div style={{ marginTop: 12 }}>
          <TypeCanvas
            text="ABCDEFGHIJ"
            mod={modules[0]}
            radius={cornerRadius}
            fill={secondaryColor}
            bg={bgColor}
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <TypeCanvas
            text="KLMNOPQRST"
            mod={modules[0]}
            radius={cornerRadius}
            fill={secondaryColor}
            bg={bgColor}
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <TypeCanvas
            text="UVWXYZ 0123"
            mod={modules[0]}
            radius={cornerRadius}
            fill={secondaryColor}
            bg={bgColor}
          />
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function PatternCanvas({ label, modules, radius, density, gap, fill, stroke, bg }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = 200, h = 200;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    clearCanvas(ctx, bg);
    const cellSize = Math.floor((w - gap * density) / density);
    drawPattern(ctx, gap / 2, gap / 2, density, density, cellSize, gap, modules, radius, fill, stroke || null);
  }, [modules, radius, density, gap, fill, stroke, bg]);

  return (
    <div className="asset-card">
      <canvas ref={canvasRef} />
      <div className="asset-label">{label}</div>
    </div>
  );
}

function FrameCanvas({ mod, radius, stroke, bg, label }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 140;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    clearCanvas(ctx, bg);
    drawFrame(ctx, 12, 12, 116, 76, mod.corners, radius, stroke, 2);
    // Faux content lines
    ctx.fillStyle = stroke + '33';
    ctx.fillRect(24, 36, 60, 6);
    ctx.fillRect(24, 48, 80, 6);
    ctx.fillRect(24, 60, 50, 6);
  }, [mod, radius, stroke, bg]);

  return (
    <div className="asset-card">
      <canvas ref={canvasRef} />
      <div className="asset-label">{label}</div>
    </div>
  );
}

function SymbolCanvas({ label, modules, radius, primary, secondary, bg, variant }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    clearCanvas(ctx, bg);

    const s = 40;
    switch (variant) {
      case 'mark': {
        // Single large module
        drawShape(ctx, 20, 20, 80, 80, modules[0].corners, radius, primary, null);
        break;
      }
      case 'stacked': {
        // Two overlapping modules
        drawShape(ctx, 15, 30, 50, 50, modules[0].corners, radius, primary, null);
        ctx.globalAlpha = 0.7;
        drawShape(ctx, 45, 30, 50, 50,
          (modules[5] || modules[modules.length - 1]).corners, radius, secondary, null);
        ctx.globalAlpha = 1;
        break;
      }
      case 'arrow': {
        // Three modules forming a direction
        drawShape(ctx, 10, 35, s, s, modules[0].corners, radius, primary, null);
        drawShape(ctx, 55, 15, s, s,
          (modules[1] || modules[0]).corners, radius, secondary, null);
        drawShape(ctx, 55, 60, s, s,
          (modules[3] || modules[0]).corners, radius, secondary, null);
        break;
      }
      case 'grid': {
        // 3×3 mini grid
        const gs = 28;
        const gg = 4;
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const mod = modules[(r * 3 + c) % modules.length];
            const isFilled = (r + c) % 2 === 0;
            drawShape(ctx, 10 + c * (gs + gg), 10 + r * (gs + gg), gs, gs,
              mod.corners, radius, isFilled ? primary : null, isFilled ? null : primary, 1.5);
          }
        }
        break;
      }
    }
  }, [modules, radius, primary, secondary, bg, variant]);

  return (
    <div className="asset-card">
      <canvas ref={canvasRef} />
      <div className="asset-label">{label}</div>
    </div>
  );
}

function TypeCanvas({ text, mod, radius, fill, bg }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cellSize = 8;
    const gapCells = 1;
    const totalW = text.length * (5 + gapCells) * cellSize + 20;
    canvas.width = Math.max(totalW, 100);
    canvas.height = 7 * cellSize + 20;
    const ctx = canvas.getContext('2d');
    clearCanvas(ctx, bg);

    const drawMod = (ctx2, x, y, size) => {
      drawShape(ctx2, x, y, size * 0.9, size * 0.9, mod.corners, radius, fill, null);
    };
    renderBitmapText(ctx, text, drawMod, cellSize, 10, 10, gapCells);
  }, [text, mod, radius, fill, bg]);

  return (
    <div style={{ overflow: 'auto' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}
