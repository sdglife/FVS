import React, { useRef, useEffect } from 'react';
import { clearCanvas } from '../utils/canvasHelpers';
import { renderModules, getUniqueModuleTypes } from './ModuleExtractor';
import { renderBitmapText } from '../utils/bitmapFont';

export default function AppPreview({ modules, rows, cols, primaryColor, secondaryColor, bgColor, moduleScale }) {
  if (!modules) {
    return (
      <div className="empty-state">
        <div className="empty-icon">&#9744;</div>
        <div>Extract modules to see application previews</div>
      </div>
    );
  }

  return (
    <div>
      <div className="section">
        <div className="section-title">Application Previews</div>
        <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 16 }}>
          Loud (maximum expression) and Quiet (minimal, restrained) treatments.
        </p>
      </div>

      <div className="preview-row">
        <div className="preview-card">
          <div className="preview-label">Loud — Poster</div>
          <LoudPreview
            modules={modules}
            rows={rows}
            cols={cols}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            bgColor={bgColor}
            moduleScale={moduleScale}
          />
        </div>
        <div className="preview-card">
          <div className="preview-label">Quiet — Business Card</div>
          <QuietPreview
            modules={modules}
            rows={rows}
            cols={cols}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            bgColor={bgColor}
            moduleScale={moduleScale}
          />
        </div>
      </div>

      <div className="preview-row" style={{ marginTop: 16 }}>
        <div className="preview-card">
          <div className="preview-label">Loud — Social Banner</div>
          <BannerPreview
            modules={modules}
            rows={rows}
            cols={cols}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            bgColor={bgColor}
            moduleScale={moduleScale}
          />
        </div>
        <div className="preview-card">
          <div className="preview-label">Quiet — Letterhead</div>
          <LetterheadPreview
            modules={modules}
            rows={rows}
            cols={cols}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            bgColor={bgColor}
            moduleScale={moduleScale}
          />
        </div>
      </div>
    </div>
  );
}

function LoudPreview({ modules, rows, cols, primaryColor, secondaryColor, bgColor, moduleScale }) {
  const canvasRef = useRef(null);
  const uniqueTypes = getUniqueModuleTypes(modules);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = 400, h = 500;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    clearCanvas(ctx, primaryColor);

    // Large tiled pattern background
    const cellSize = Math.floor(20 * moduleScale);
    ctx.globalAlpha = 0.15;
    for (let tileY = 0; tileY < 3; tileY++) {
      for (let tileX = 0; tileX < 3; tileX++) {
        renderModules(ctx, modules, cellSize, tileX * cols * cellSize, tileY * rows * cellSize, secondaryColor);
      }
    }
    ctx.globalAlpha = 1;

    // Central mark
    const markCell = Math.floor(40 * moduleScale);
    const markW = cols * markCell;
    const markH = rows * markCell;
    const ox = (w - markW) / 2;
    const oy = (h - markH) / 2 - 40;
    renderModules(ctx, modules, markCell, ox, oy, bgColor);

    // Title text
    if (uniqueTypes[0]) {
      const drawMod = (ctx2, x, y, size) => {
        uniqueTypes[0].drawer(ctx2, x, y, size * 0.9, bgColor);
      };
      renderBitmapText(ctx, 'BRAND', drawMod, 6, w / 2 - 90, h - 80, 1);
    }
  }, [modules, rows, cols, primaryColor, secondaryColor, bgColor, moduleScale]);

  return <canvas ref={canvasRef} />;
}

function QuietPreview({ modules, rows, cols, primaryColor, secondaryColor, bgColor, moduleScale }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = 400, h = 240;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    clearCanvas(ctx, '#ffffff');

    // Small logo mark top-left
    const cellSize = Math.floor(8 * moduleScale);
    renderModules(ctx, modules, cellSize, 20, 20, primaryColor);

    // Faux text lines
    ctx.fillStyle = '#ddd';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(20, h - 80 + i * 18, 160, 8);
    }

    // Divider line
    ctx.fillStyle = primaryColor;
    ctx.fillRect(20, h - 100, w - 40, 1);

    // Contact area
    ctx.fillStyle = '#ccc';
    ctx.fillRect(w - 180, h - 80, 140, 8);
    ctx.fillRect(w - 180, h - 60, 100, 8);
  }, [modules, rows, cols, primaryColor, bgColor, moduleScale]);

  return <canvas ref={canvasRef} />;
}

function BannerPreview({ modules, rows, cols, primaryColor, secondaryColor, bgColor, moduleScale }) {
  const canvasRef = useRef(null);
  const uniqueTypes = getUniqueModuleTypes(modules);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = 400, h = 200;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    clearCanvas(ctx, secondaryColor);

    // Tiled pattern
    const cellSize = Math.floor(16 * moduleScale);
    ctx.globalAlpha = 0.2;
    for (let tileX = 0; tileX < 4; tileX++) {
      renderModules(ctx, modules, cellSize, tileX * cols * cellSize - 20, 10, primaryColor);
    }
    ctx.globalAlpha = 1;

    // Central large title
    if (uniqueTypes[0]) {
      const drawMod = (ctx2, x, y, size) => {
        uniqueTypes[0].drawer(ctx2, x, y, size * 0.9, bgColor);
      };
      renderBitmapText(ctx, 'VISUAL', drawMod, 8, w / 2 - 140, h / 2 - 28, 1);
    }
  }, [modules, rows, cols, primaryColor, secondaryColor, bgColor, moduleScale]);

  return <canvas ref={canvasRef} />;
}

function LetterheadPreview({ modules, rows, cols, primaryColor, secondaryColor, bgColor, moduleScale }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = 400, h = 500;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    clearCanvas(ctx, '#ffffff');

    // Tiny logo top-left
    const cellSize = Math.floor(6 * moduleScale);
    renderModules(ctx, modules, cellSize, 30, 30, primaryColor);

    // Accent line
    ctx.fillStyle = primaryColor;
    ctx.fillRect(30, 30 + rows * cellSize + 10, 60, 2);

    // Faux body text
    ctx.fillStyle = '#e0e0e0';
    for (let i = 0; i < 12; i++) {
      const lineW = 200 + Math.random() * 120;
      ctx.fillRect(30, 120 + i * 22, lineW, 8);
    }

    // Footer line
    ctx.fillStyle = primaryColor;
    ctx.fillRect(30, h - 50, w - 60, 1);
    ctx.fillStyle = '#ccc';
    ctx.fillRect(30, h - 35, 140, 6);
  }, [modules, rows, cols, primaryColor, bgColor, moduleScale]);

  return <canvas ref={canvasRef} />;
}
