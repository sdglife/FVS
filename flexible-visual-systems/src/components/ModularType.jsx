import React, { useRef, useEffect, useState } from 'react';
import { renderBitmapText } from '../utils/bitmapFont';
import { clearCanvas, drawGrid } from '../utils/canvasHelpers';
import { getUniqueModuleTypes } from './ModuleExtractor';

export default function ModularType({ modules, primaryColor, secondaryColor, bgColor, moduleScale }) {
  const [text, setText] = useState('HELLO');
  const [selectedType, setSelectedType] = useState(null);
  const canvasRef = useRef(null);
  const uniqueTypes = modules ? getUniqueModuleTypes(modules) : [];

  const activeType = selectedType || (uniqueTypes[0]?.type ?? 'square');
  const activeMod = uniqueTypes.find(m => m.type === activeType) || uniqueTypes[0];

  useEffect(() => {
    if (!modules || !canvasRef.current || !activeMod) return;
    const canvas = canvasRef.current;
    const cellSize = Math.floor(10 * moduleScale);
    const charWidth = 5 * cellSize;
    const charHeight = 7 * cellSize;
    const gap = 1;
    const totalWidth = text.length * (5 + gap) * cellSize + 40;

    canvas.width = Math.max(totalWidth, 200);
    canvas.height = charHeight + 40;
    const ctx = canvas.getContext('2d');
    clearCanvas(ctx, bgColor);
    drawGrid(ctx, cellSize, 'rgba(255,255,255,0.03)');

    const drawModule = (ctx, x, y, size) => {
      activeMod.drawer(ctx, x, y, size * 0.9, primaryColor);
    };

    renderBitmapText(ctx, text, drawModule, cellSize, 20, 20, gap);
  }, [text, modules, activeMod, primaryColor, bgColor, moduleScale]);

  if (!modules) {
    return (
      <div className="empty-state">
        <div className="empty-icon">A</div>
        <div>Extract modules to generate modular typography</div>
      </div>
    );
  }

  return (
    <div>
      <div className="section">
        <div className="section-title">Modular Typography</div>
        <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 12 }}>
          Type text below. Each pixel is rendered using extracted module shapes.
        </p>
      </div>

      <div className="type-preview">
        <div className="type-input-row">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value.toUpperCase())}
            placeholder="TYPE SOMETHING..."
            maxLength={20}
          />
          <select
            value={activeType}
            onChange={e => setSelectedType(e.target.value)}
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              padding: '8px',
              borderRadius: 'var(--radius)',
            }}
          >
            {uniqueTypes.map(m => (
              <option key={m.type} value={m.type}>
                {m.type}
              </option>
            ))}
          </select>
        </div>
        <div style={{ overflow: 'auto' }}>
          <canvas ref={canvasRef} />
        </div>
      </div>

      <div className="section" style={{ marginTop: 24 }}>
        <div className="section-title">Module Shapes Available</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {uniqueTypes.map(m => (
            <button
              key={m.type}
              className={`btn ${m.type === activeType ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedType(m.type)}
            >
              {m.type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
