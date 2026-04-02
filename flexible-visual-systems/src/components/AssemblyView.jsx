import React, { useRef, useEffect } from 'react';
import { getUniqueModuleTypes } from './ModuleExtractor';
import { clearCanvas, drawGrid } from '../utils/canvasHelpers';
import { renderModules } from './ModuleExtractor';

export default function AssemblyView({ modules, rows, cols, primaryColor, bgColor, moduleScale }) {
  const canvasRef = useRef(null);
  const uniqueModules = modules ? getUniqueModuleTypes(modules) : [];

  useEffect(() => {
    if (!modules || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const cellSize = Math.floor(32 * moduleScale);
    canvas.width = cols * cellSize + 40;
    canvas.height = rows * cellSize + 40;
    const ctx = canvas.getContext('2d');
    clearCanvas(ctx, bgColor);
    drawGrid(ctx, cellSize);
    renderModules(ctx, modules, cellSize, 20, 20, primaryColor);
  }, [modules, rows, cols, primaryColor, bgColor, moduleScale]);

  if (!modules) {
    return (
      <div className="empty-state">
        <div className="empty-icon">&#9633;</div>
        <div>Upload a logo and extract modules to see the assembly</div>
      </div>
    );
  }

  return (
    <div>
      <div className="section">
        <div className="section-title">Extracted Modules ({uniqueModules.length} types)</div>
        <div className="module-grid">
          {uniqueModules.map(mod => (
            <ModuleCard key={mod.type} mod={mod} primaryColor={primaryColor} />
          ))}
        </div>
      </div>

      <div className="section" style={{ marginTop: 24 }}>
        <div className="section-title">Assembly</div>
        <div className="assembly-canvas-wrap">
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ mod, primaryColor }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 60;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 60, 60);
    mod.drawer(ctx, 10, 10, 40, primaryColor);
  }, [mod, primaryColor]);

  return (
    <div className="module-card">
      <canvas ref={canvasRef} width={60} height={60} />
      <div className="module-label">{mod.type}</div>
    </div>
  );
}
