import React, { useRef, useEffect, useState } from 'react';
import { clearCanvas } from '../utils/canvasHelpers';
import { renderModules } from './ModuleExtractor';

const TRANSFORMS = [
  { name: 'Original', fn: (ctx, mods, cell, color) => renderModules(ctx, mods, cell, 10, 10, color) },
  {
    name: 'Rotate 90°',
    fn: (ctx, mods, cell, color) => {
      ctx.save();
      ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.translate(-ctx.canvas.width / 2, -ctx.canvas.height / 2);
      renderModules(ctx, mods, cell, 10, 10, color);
      ctx.restore();
    },
  },
  {
    name: 'Mirror X',
    fn: (ctx, mods, cell, color) => {
      ctx.save();
      ctx.translate(ctx.canvas.width, 0);
      ctx.scale(-1, 1);
      renderModules(ctx, mods, cell, 10, 10, color);
      ctx.restore();
    },
  },
  {
    name: 'Mirror Y',
    fn: (ctx, mods, cell, color) => {
      ctx.save();
      ctx.translate(0, ctx.canvas.height);
      ctx.scale(1, -1);
      renderModules(ctx, mods, cell, 10, 10, color);
      ctx.restore();
    },
  },
  {
    name: 'Scale 50%',
    fn: (ctx, mods, cell, color) => {
      ctx.save();
      ctx.translate(ctx.canvas.width * 0.25, ctx.canvas.height * 0.25);
      ctx.scale(0.5, 0.5);
      renderModules(ctx, mods, cell, 10, 10, color);
      ctx.restore();
    },
  },
  {
    name: 'Rotate 45°',
    fn: (ctx, mods, cell, color) => {
      ctx.save();
      ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
      ctx.rotate(Math.PI / 4);
      ctx.translate(-ctx.canvas.width / 2, -ctx.canvas.height / 2);
      renderModules(ctx, mods, cell, 10, 10, color);
      ctx.restore();
    },
  },
  {
    name: 'Tile 2×2',
    fn: (ctx, mods, cell, color) => {
      const w = ctx.canvas.width;
      const h = ctx.canvas.height;
      ctx.save();
      ctx.scale(0.5, 0.5);
      renderModules(ctx, mods, cell, 10, 10, color);
      ctx.translate(w, 0);
      renderModules(ctx, mods, cell, 10, 10, color);
      ctx.translate(-w, h);
      renderModules(ctx, mods, cell, 10, 10, color);
      ctx.translate(w, 0);
      renderModules(ctx, mods, cell, 10, 10, color);
      ctx.restore();
    },
  },
  {
    name: 'Offset Grid',
    fn: (ctx, mods, cell, color) => {
      const halfCell = Math.floor(cell / 2);
      const shifted = mods.map((m, i) => ({
        ...m,
        col: m.col + (m.row % 2 === 0 ? 0 : 0.5),
      }));
      renderModules(ctx, shifted, cell, 10, 10, color);
    },
  },
];

export default function TransformEngine({ modules, rows, cols, primaryColor, secondaryColor, bgColor, moduleScale }) {
  const [activeTransforms, setActiveTransforms] = useState(
    TRANSFORMS.map(() => true)
  );

  if (!modules) {
    return (
      <div className="empty-state">
        <div className="empty-icon">&#8634;</div>
        <div>Extract modules to see transformation sequences</div>
      </div>
    );
  }

  const cellSize = Math.floor(24 * moduleScale);

  function toggleTransform(i) {
    setActiveTransforms(prev => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }

  return (
    <div>
      <div className="section">
        <div className="section-title">Transformation Sequence</div>
        <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 12 }}>
          Toggle transforms to build a sequence. Each step shows how the module assembly changes.
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {TRANSFORMS.map((t, i) => (
            <button
              key={t.name}
              className={`btn ${activeTransforms[i] ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => toggleTransform(i)}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="transform-timeline">
        {TRANSFORMS.map((t, i) =>
          activeTransforms[i] ? (
            <TransformStep
              key={t.name}
              transform={t}
              modules={modules}
              rows={rows}
              cols={cols}
              cellSize={cellSize}
              primaryColor={primaryColor}
              bgColor={bgColor}
            />
          ) : null
        )}
      </div>
    </div>
  );
}

function TransformStep({ transform, modules, rows, cols, cellSize, primaryColor, bgColor }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = cols * cellSize + 20;
    canvas.height = rows * cellSize + 20;
    const ctx = canvas.getContext('2d');
    clearCanvas(ctx, bgColor);
    transform.fn(ctx, modules, cellSize, primaryColor);
  }, [transform, modules, rows, cols, cellSize, primaryColor, bgColor]);

  return (
    <div className="transform-step">
      <canvas ref={canvasRef} />
      <div className="step-label">{transform.name}</div>
    </div>
  );
}
