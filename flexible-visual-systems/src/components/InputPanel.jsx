import React, { useRef, useEffect } from 'react';
import { EDGE_STYLE_LIST } from '../utils/shapeModules';
import { drawShape } from '../utils/shapeModules';

export default function InputPanel({
  // Step 1: Logo
  logoSrc,
  onImageUpload,
  // Step 2: Colors
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  bgColor,
  setBgColor,
  // Step 3: FVS Parameters
  edgeStyle,
  setEdgeStyle,
  cornerRadius,
  setCornerRadius,
  gridDensity,
  setGridDensity,
  moduleGap,
  setModuleGap,
  onGenerate,
  hasSystem,
}) {
  const fileRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    onImageUpload(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  }

  return (
    <div className="input-panel">
      {/* STEP 1: Upload */}
      <div className="section">
        <div className="step-badge">1</div>
        <div className="section-title">Upload Logo</div>
        <div
          className={`upload-zone ${logoSrc ? 'has-image' : ''}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
        >
          {logoSrc ? (
            <img src={logoSrc} alt="Uploaded logo" />
          ) : (
            <>Drop logo here or click to upload</>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </div>

      {/* STEP 2: Colors */}
      <div className="section">
        <div className="step-badge">2</div>
        <div className="section-title">Colors</div>
        <div className="field">
          <label>Primary</label>
          <div className="color-row">
            <input
              type="color"
              value={primaryColor}
              onChange={e => setPrimaryColor(e.target.value)}
            />
            <span>{primaryColor}</span>
          </div>
        </div>
        <div className="field" style={{ marginTop: 8 }}>
          <label>Secondary</label>
          <div className="color-row">
            <input
              type="color"
              value={secondaryColor}
              onChange={e => setSecondaryColor(e.target.value)}
            />
            <span>{secondaryColor}</span>
          </div>
        </div>
        <div className="field" style={{ marginTop: 8 }}>
          <label>Background</label>
          <div className="color-row">
            <input
              type="color"
              value={bgColor}
              onChange={e => setBgColor(e.target.value)}
            />
            <span>{bgColor}</span>
          </div>
        </div>
      </div>

      {/* STEP 3: FVS Parameters */}
      <div className="section">
        <div className="step-badge">3</div>
        <div className="section-title">System Parameters</div>

        <div className="field">
          <label>Edge Style</label>
          <div className="edge-picker">
            {EDGE_STYLE_LIST.map(style => (
              <EdgeOption
                key={style}
                style={style}
                active={edgeStyle === style}
                onClick={() => setEdgeStyle(style)}
                color={primaryColor}
              />
            ))}
          </div>
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label>Corner Radius</label>
          <div className="slider-row">
            <input
              type="range"
              min="0.05"
              max="0.5"
              step="0.01"
              value={cornerRadius}
              onChange={e => setCornerRadius(Number(e.target.value))}
            />
            <span className="slider-val">{Math.round(cornerRadius * 100)}%</span>
          </div>
        </div>

        <div className="field" style={{ marginTop: 8 }}>
          <label>Grid Density</label>
          <div className="slider-row">
            <input
              type="range"
              min="2"
              max="8"
              value={gridDensity}
              onChange={e => setGridDensity(Number(e.target.value))}
            />
            <span className="slider-val">{gridDensity}</span>
          </div>
        </div>

        <div className="field" style={{ marginTop: 8 }}>
          <label>Module Gap</label>
          <div className="slider-row">
            <input
              type="range"
              min="0"
              max="12"
              value={moduleGap}
              onChange={e => setModuleGap(Number(e.target.value))}
            />
            <span className="slider-val">{moduleGap}px</span>
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ marginTop: 16, width: '100%' }}
          onClick={onGenerate}
        >
          {hasSystem ? 'Regenerate System' : 'Generate System'}
        </button>
      </div>
    </div>
  );
}

function EdgeOption({ style, active, onClick, color }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const size = 32;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    const corners = [style, style, style, style];
    drawShape(ctx, 2, 2, size - 4, size - 4, corners, 0.3,
      active ? color : null,
      active ? null : '#555',
      1.5
    );
  }, [style, active, color]);

  return (
    <div
      className={`edge-option ${active ? 'active' : ''}`}
      onClick={onClick}
      title={style}
    >
      <canvas ref={canvasRef} width={32} height={32} />
      <span>{style}</span>
    </div>
  );
}
