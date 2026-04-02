import React, { useRef, useEffect } from 'react';
import { getUniqueModuleTypes } from './ModuleExtractor';

const CONTEXTS = ['App Icon', 'Website Header', 'Social Media', 'Print', 'Favicon'];
const TREATMENTS = ['Primary Fill', 'Outline', 'Monochrome', 'Inverted', 'Scaled Down'];

export default function LogicTable({ modules, primaryColor, secondaryColor, bgColor }) {
  if (!modules) {
    return (
      <div className="empty-state">
        <div className="empty-icon">&#9638;</div>
        <div>Extract modules to generate the visual logic table</div>
      </div>
    );
  }

  const uniqueTypes = getUniqueModuleTypes(modules);

  return (
    <div>
      <div className="section">
        <div className="section-title">Visual Logic Table</div>
        <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 16 }}>
          How each module behaves across different contexts and treatments.
        </p>
      </div>
      <table className="logic-table">
        <thead>
          <tr>
            <th>Module</th>
            {TREATMENTS.map(t => (
              <th key={t}>{t}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {uniqueTypes.map(mod => (
            <tr key={mod.type}>
              <td style={{ fontWeight: 600 }}>{mod.type}</td>
              {TREATMENTS.map(treatment => (
                <td key={treatment}>
                  <LogicCell
                    mod={mod}
                    treatment={treatment}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                    bgColor={bgColor}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="section" style={{ marginTop: 24 }}>
        <div className="section-title">Context Usage</div>
        <table className="logic-table">
          <thead>
            <tr>
              <th>Context</th>
              <th>Recommended Module</th>
              <th>Treatment</th>
              <th>Preview</th>
            </tr>
          </thead>
          <tbody>
            {CONTEXTS.map((context, i) => {
              const mod = uniqueTypes[i % uniqueTypes.length];
              const treatment = TREATMENTS[i % TREATMENTS.length];
              return (
                <tr key={context}>
                  <td>{context}</td>
                  <td>{mod.type}</td>
                  <td>{treatment}</td>
                  <td>
                    <LogicCell
                      mod={mod}
                      treatment={treatment}
                      primaryColor={primaryColor}
                      secondaryColor={secondaryColor}
                      bgColor={bgColor}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LogicCell({ mod, treatment, primaryColor, secondaryColor, bgColor }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const size = 36;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    let fillColor = primaryColor;
    let bg = 'transparent';

    switch (treatment) {
      case 'Primary Fill':
        fillColor = primaryColor;
        break;
      case 'Outline':
        fillColor = 'transparent';
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2;
        break;
      case 'Monochrome':
        fillColor = '#888888';
        break;
      case 'Inverted':
        bg = primaryColor;
        fillColor = bgColor;
        break;
      case 'Scaled Down':
        fillColor = secondaryColor;
        break;
    }

    ctx.clearRect(0, 0, size, size);
    if (bg !== 'transparent') {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, size, size);
    }

    if (treatment === 'Outline') {
      // Draw outline version
      ctx.beginPath();
      drawOutlineShape(ctx, mod.type, 4, 4, size - 8);
      ctx.stroke();
    } else {
      const drawSize = treatment === 'Scaled Down' ? (size - 8) * 0.6 : size - 8;
      const offset = (size - drawSize) / 2;
      mod.drawer(ctx, offset, offset, drawSize, fillColor);
    }
  }, [mod, treatment, primaryColor, secondaryColor, bgColor]);

  return <canvas ref={canvasRef} width={36} height={36} style={{ display: 'block' }} />;
}

function drawOutlineShape(ctx, type, x, y, size) {
  switch (type) {
    case 'circle':
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      break;
    case 'triangle':
      ctx.moveTo(x + size / 2, y);
      ctx.lineTo(x + size, y + size);
      ctx.lineTo(x, y + size);
      ctx.closePath();
      break;
    default:
      ctx.rect(x, y, size, size);
  }
}
