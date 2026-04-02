import React, { useRef, useEffect } from 'react';
import { drawShape, drawPattern, drawFrame } from '../utils/shapeModules';
import { renderBitmapText } from '../utils/bitmapFont';
import { clearCanvas } from '../utils/canvasHelpers';

export default function ApplicationsView({
  modules, cornerRadius, gridDensity, moduleGap,
  primaryColor, secondaryColor, bgColor, logoImg,
}) {
  if (!modules) {
    return (
      <div className="empty-state">
        <div className="empty-icon">&#9744;</div>
        <div>Generate a system to see application mockups</div>
      </div>
    );
  }

  const props = { modules, cornerRadius, gridDensity, moduleGap, primaryColor, secondaryColor, bgColor, logoImg };

  return (
    <div>
      <div className="section">
        <div className="section-title">Applications — Loud & Quiet</div>
        <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 16 }}>
          How the system adapts across formats and expression levels.
          Loud = maximum visual expression. Quiet = restrained, minimal.
        </p>
      </div>

      <div className="preview-row">
        <div className="preview-card">
          <div className="preview-label">Loud — Poster</div>
          <PosterLoud {...props} />
        </div>
        <div className="preview-card">
          <div className="preview-label">Quiet — Poster</div>
          <PosterQuiet {...props} />
        </div>
      </div>

      <div className="preview-row" style={{ marginTop: 16 }}>
        <div className="preview-card">
          <div className="preview-label">Loud — Social Banner</div>
          <BannerLoud {...props} />
        </div>
        <div className="preview-card">
          <div className="preview-label">Quiet — Social Banner</div>
          <BannerQuiet {...props} />
        </div>
      </div>

      <div className="preview-row" style={{ marginTop: 16 }}>
        <div className="preview-card">
          <div className="preview-label">Loud — Business Card</div>
          <CardLoud {...props} />
        </div>
        <div className="preview-card">
          <div className="preview-label">Quiet — Business Card</div>
          <CardQuiet {...props} />
        </div>
      </div>

      <div className="preview-row" style={{ marginTop: 16 }}>
        <div className="preview-card">
          <div className="preview-label">App Icon</div>
          <AppIcon {...props} />
        </div>
        <div className="preview-card">
          <div className="preview-label">Favicon</div>
          <Favicon {...props} />
        </div>
      </div>
    </div>
  );
}

// --- LOUD Poster ---
function PosterLoud({ modules, cornerRadius, gridDensity, primaryColor, secondaryColor, bgColor, moduleGap }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    c.width = 380; c.height = 500;
    const ctx = c.getContext('2d');
    clearCanvas(ctx, primaryColor);

    // Background pattern
    const cell = 38;
    ctx.globalAlpha = 0.12;
    drawPattern(ctx, 0, 0, 10, 14, cell, 2, modules, cornerRadius, secondaryColor, null);
    ctx.globalAlpha = 1;

    // Central large shape
    drawShape(ctx, 60, 80, 260, 260, modules[0].corners, cornerRadius, bgColor, null);

    // Logo placement area
    if (modules.length > 1) {
      drawShape(ctx, 90, 110, 60, 60, modules[1]?.corners || modules[0].corners, cornerRadius, primaryColor, null);
    }

    // Title using bitmap type
    const drawMod = (c2, x, y, s) => drawShape(c2, x, y, s * 0.85, s * 0.85, modules[0].corners, cornerRadius, bgColor, null);
    renderBitmapText(ctx, 'VISUAL', drawMod, 7, 50, 420, 1);
    renderBitmapText(ctx, 'SYSTEM', drawMod, 7, 50, 460, 1);
  }, [modules, cornerRadius, primaryColor, secondaryColor, bgColor]);
  return <canvas ref={ref} />;
}

// --- QUIET Poster ---
function PosterQuiet({ modules, cornerRadius, primaryColor, secondaryColor, bgColor }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    c.width = 380; c.height = 500;
    const ctx = c.getContext('2d');
    clearCanvas(ctx, '#ffffff');

    // Small mark top-left
    drawShape(ctx, 30, 30, 40, 40, modules[0].corners, cornerRadius, primaryColor, null);

    // Thin accent line
    ctx.fillStyle = primaryColor;
    ctx.fillRect(30, 85, 80, 2);

    // Faux headline
    ctx.fillStyle = '#222';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('Flexible', 30, 130);
    ctx.fillText('Visual System', 30, 158);

    // Faux body text lines
    ctx.fillStyle = '#ccc';
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(30, 200 + i * 22, 200 + Math.random() * 100, 8);
    }

    // Bottom frame
    drawFrame(ctx, 30, 400, 320, 60, modules[0].corners, cornerRadius, primaryColor, 1.5);
    ctx.fillStyle = '#bbb';
    ctx.fillRect(46, 424, 120, 6);
  }, [modules, cornerRadius, primaryColor, bgColor]);
  return <canvas ref={ref} />;
}

// --- LOUD Banner ---
function BannerLoud({ modules, cornerRadius, gridDensity, primaryColor, secondaryColor, bgColor, moduleGap }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    c.width = 380; c.height = 200;
    const ctx = c.getContext('2d');
    clearCanvas(ctx, secondaryColor);

    // Tiled pattern
    ctx.globalAlpha = 0.15;
    drawPattern(ctx, 0, 0, 12, 6, 34, 2, modules.slice(0, 3), cornerRadius, primaryColor, null);
    ctx.globalAlpha = 1;

    // Central title bar
    drawShape(ctx, 40, 50, 300, 100, modules[0].corners, cornerRadius, primaryColor, null);

    const drawMod = (c2, x, y, s) => drawShape(c2, x, y, s * 0.85, s * 0.85, modules[0].corners, cornerRadius, bgColor, null);
    renderBitmapText(ctx, 'BRAND', drawMod, 9, 80, 72, 1);
  }, [modules, cornerRadius, primaryColor, secondaryColor, bgColor]);
  return <canvas ref={ref} />;
}

// --- QUIET Banner ---
function BannerQuiet({ modules, cornerRadius, primaryColor, secondaryColor, bgColor }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    c.width = 380; c.height = 200;
    const ctx = c.getContext('2d');
    clearCanvas(ctx, '#ffffff');

    // Small logo mark
    drawShape(ctx, 20, 20, 30, 30, modules[0].corners, cornerRadius, primaryColor, null);

    // Accent line
    ctx.fillStyle = primaryColor;
    ctx.fillRect(20, 60, 340, 1);

    // Faux text
    ctx.fillStyle = '#222';
    ctx.font = '16px sans-serif';
    ctx.fillText('Visual Identity System', 20, 100);

    ctx.fillStyle = '#bbb';
    ctx.fillRect(20, 120, 200, 6);
    ctx.fillRect(20, 134, 160, 6);

    // Small decorative shapes bottom-right
    ctx.globalAlpha = 0.2;
    drawShape(ctx, 300, 140, 24, 24, modules[0].corners, cornerRadius, primaryColor, null);
    drawShape(ctx, 330, 155, 18, 18, (modules[1] || modules[0]).corners, cornerRadius, secondaryColor, null);
    ctx.globalAlpha = 1;
  }, [modules, cornerRadius, primaryColor, secondaryColor, bgColor]);
  return <canvas ref={ref} />;
}

// --- LOUD Card ---
function CardLoud({ modules, cornerRadius, primaryColor, secondaryColor, bgColor }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    c.width = 380; c.height = 220;
    const ctx = c.getContext('2d');
    clearCanvas(ctx, primaryColor);

    // Pattern fill
    ctx.globalAlpha = 0.1;
    drawPattern(ctx, 0, 0, 14, 8, 28, 2, [modules[0]], cornerRadius, bgColor, null);
    ctx.globalAlpha = 1;

    // Name area
    drawShape(ctx, 20, 20, 160, 80, modules[0].corners, cornerRadius, bgColor, null);
    ctx.fillStyle = primaryColor;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('JANE DOE', 36, 56);
    ctx.font = '11px sans-serif';
    ctx.fillText('Creative Director', 36, 76);

    // Contact
    ctx.fillStyle = bgColor;
    ctx.font = '10px monospace';
    ctx.fillText('hello@studio.com', 20, 140);
    ctx.fillText('+1 234 567 890', 20, 158);
    ctx.fillText('studio.com', 20, 176);

    // Decorative shape
    drawShape(ctx, 280, 120, 70, 70, (modules[5] || modules[0]).corners, cornerRadius, secondaryColor, null);
  }, [modules, cornerRadius, primaryColor, secondaryColor, bgColor]);
  return <canvas ref={ref} />;
}

// --- QUIET Card ---
function CardQuiet({ modules, cornerRadius, primaryColor, secondaryColor, bgColor }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    c.width = 380; c.height = 220;
    const ctx = c.getContext('2d');
    clearCanvas(ctx, '#ffffff');

    // Tiny mark
    drawShape(ctx, 20, 20, 24, 24, modules[0].corners, cornerRadius, primaryColor, null);

    // Name
    ctx.fillStyle = '#222';
    ctx.font = '13px sans-serif';
    ctx.fillText('Jane Doe', 20, 76);
    ctx.fillStyle = '#999';
    ctx.font = '11px sans-serif';
    ctx.fillText('Creative Director', 20, 94);

    // Divider
    ctx.fillStyle = primaryColor;
    ctx.fillRect(20, 110, 60, 1);

    // Contact
    ctx.fillStyle = '#666';
    ctx.font = '10px monospace';
    ctx.fillText('hello@studio.com', 20, 138);
    ctx.fillText('+1 234 567 890', 20, 154);

    // Subtle frame bottom-right
    drawFrame(ctx, 280, 140, 80, 60, modules[0].corners, cornerRadius, primaryColor + '44', 1);
  }, [modules, cornerRadius, primaryColor, secondaryColor, bgColor]);
  return <canvas ref={ref} />;
}

// --- App Icon ---
function AppIcon({ modules, cornerRadius, primaryColor, secondaryColor, bgColor }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    c.width = 380; c.height = 240;
    const ctx = c.getContext('2d');
    clearCanvas(ctx, bgColor);

    // Large icon with rounded outer frame
    const iconSize = 180;
    const ox = (380 - iconSize) / 2;
    const oy = (240 - iconSize) / 2;

    // Icon background
    drawShape(ctx, ox, oy, iconSize, iconSize,
      ['rounded', 'rounded', 'rounded', 'rounded'], 0.2, primaryColor, null);

    // Inner mark
    const inner = iconSize * 0.5;
    const ix = ox + (iconSize - inner) / 2;
    const iy = oy + (iconSize - inner) / 2;
    drawShape(ctx, ix, iy, inner, inner, modules[0].corners, cornerRadius, bgColor, null);

    // Small accent
    drawShape(ctx, ix + inner + 8, iy + inner - 20, 20, 20,
      (modules[1] || modules[0]).corners, cornerRadius, secondaryColor, null);
  }, [modules, cornerRadius, primaryColor, secondaryColor, bgColor]);
  return <canvas ref={ref} />;
}

// --- Favicon ---
function Favicon({ modules, cornerRadius, primaryColor, bgColor }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    c.width = 380; c.height = 240;
    const ctx = c.getContext('2d');
    clearCanvas(ctx, bgColor);

    // Show at multiple sizes
    const sizes = [128, 64, 32, 16];
    let x = 30;
    for (const s of sizes) {
      const y = (240 - s) / 2;
      drawShape(ctx, x, y, s, s, modules[0].corners, cornerRadius, primaryColor, null);
      ctx.fillStyle = 'var(--text-dim)';
      ctx.fillStyle = '#888';
      ctx.font = '10px monospace';
      ctx.fillText(`${s}px`, x, y + s + 16);
      x += s + 30;
    }
  }, [modules, cornerRadius, primaryColor, bgColor]);
  return <canvas ref={ref} />;
}
