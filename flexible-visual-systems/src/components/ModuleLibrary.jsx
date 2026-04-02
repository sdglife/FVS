import React, { useRef, useEffect } from 'react';
import { drawShape, drawSuperShape } from '../utils/shapeModules';

export default function ModuleLibrary({ modules, cornerRadius, primaryColor, secondaryColor, bgColor }) {
  if (!modules) {
    return (
      <div className="empty-state">
        <div className="empty-icon">&#9633;</div>
        <div>Configure parameters and generate a system to see your module library</div>
      </div>
    );
  }

  return (
    <div>
      <div className="section">
        <div className="section-title">Components — Shape Primitives</div>
        <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 16 }}>
          Your module library: all corner variations derived from the chosen edge style.
          These are the building blocks of your visual system.
        </p>
        <div className="module-grid-large">
          {modules.map(mod => (
            <ModuleCard
              key={mod.name}
              mod={mod}
              radius={cornerRadius}
              fill={primaryColor}
              bg={bgColor}
            />
          ))}
        </div>
      </div>

      <div className="section" style={{ marginTop: 32 }}>
        <div className="section-title">Super Shapes — 2x2 Combinations</div>
        <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 16 }}>
          Combine four modules into composite shapes for larger applications.
        </p>
        <div className="supershape-grid">
          {generateSuperCombos(modules).map((combo, i) => (
            <SuperShapeCard
              key={i}
              modules={combo.mods}
              label={combo.label}
              radius={cornerRadius}
              fill={primaryColor}
              stroke={secondaryColor}
              bg={bgColor}
            />
          ))}
        </div>
      </div>

      <div className="section" style={{ marginTop: 32 }}>
        <div className="section-title">Color Variations</div>
        <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 16 }}>
          Each module in all system colors — primary fill, secondary fill, outlined, and inverted.
        </p>
        <div className="color-var-grid">
          {modules.slice(0, 6).map(mod => (
            <ColorVariationRow
              key={mod.name}
              mod={mod}
              radius={cornerRadius}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              bgColor={bgColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ mod, radius, fill, bg }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const size = 80;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    drawShape(ctx, 8, 8, size - 16, size - 16, mod.corners, radius, fill, null);
  }, [mod, radius, fill]);

  return (
    <div className="module-card">
      <canvas ref={canvasRef} width={80} height={80} />
      <div className="module-label">{mod.label}</div>
    </div>
  );
}

function SuperShapeCard({ modules: mods, label, radius, fill, stroke, bg }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 100, 100);
    drawSuperShape(ctx, 8, 8, 84, mods, radius, fill, null);
  }, [mods, radius, fill, stroke]);

  return (
    <div className="module-card">
      <canvas ref={canvasRef} width={100} height={100} />
      <div className="module-label">{label}</div>
    </div>
  );
}

function ColorVariationRow({ mod, radius, primaryColor, secondaryColor, bgColor }) {
  const variations = [
    { fill: primaryColor, stroke: null, bg: bgColor, label: 'Primary' },
    { fill: secondaryColor, stroke: null, bg: bgColor, label: 'Secondary' },
    { fill: null, stroke: primaryColor, bg: null, label: 'Outline' },
    { fill: bgColor, stroke: null, bg: primaryColor, label: 'Inverted' },
  ];

  return (
    <div className="color-var-row">
      <span className="color-var-label">{mod.label}</span>
      {variations.map((v, i) => (
        <ColorVarCell key={i} mod={mod} radius={radius} {...v} />
      ))}
    </div>
  );
}

function ColorVarCell({ mod, radius, fill, stroke, bg, label }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const size = 48;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    if (bg) {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, size, size);
    }
    drawShape(ctx, 6, 6, size - 12, size - 12, mod.corners, radius, fill, stroke, 2);
  }, [mod, radius, fill, stroke, bg]);

  return (
    <div className="color-var-cell" title={label}>
      <canvas ref={canvasRef} width={48} height={48} />
    </div>
  );
}

function generateSuperCombos(modules) {
  const combos = [];
  if (modules.length < 4) return combos;

  // Combo 1: All same (first module)
  combos.push({ label: 'Uniform', mods: [modules[0], modules[0], modules[0], modules[0]] });

  // Combo 2: Corners pointing inward
  if (modules.length >= 5) {
    combos.push({ label: 'Inward', mods: [modules[2], modules[1], modules[4], modules[3]] });
  }

  // Combo 3: Diagonal
  if (modules.length >= 6) {
    combos.push({ label: 'Diagonal', mods: [modules[5], modules[11] || modules[0], modules[5], modules[11] || modules[0]] });
  }

  // Combo 4: Mixed
  combos.push({ label: 'Mixed', mods: [modules[0], modules[11] || modules[0], modules[11] || modules[0], modules[0]] });

  // Combo 5: Top/Bottom split
  if (modules.length >= 9) {
    combos.push({ label: 'Split H', mods: [modules[7], modules[7], modules[8], modules[8]] });
  }

  // Combo 6: Alternating
  if (modules.length >= 10) {
    combos.push({ label: 'Alternate', mods: [modules[1], modules[3], modules[2], modules[4]] });
  }

  return combos;
}
