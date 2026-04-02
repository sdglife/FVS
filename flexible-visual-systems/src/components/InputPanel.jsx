import React, { useRef } from 'react';

export default function InputPanel({
  logoSrc,
  onImageUpload,
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  bgColor,
  setBgColor,
  gridSize,
  setGridSize,
  moduleScale,
  setModuleScale,
  onExtract,
  hasModules,
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
      <div className="section">
        <div className="section-title">Logo Input</div>
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

      {logoSrc && (
        <>
          <div className="section">
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

          <div className="section">
            <div className="section-title">Extraction</div>
            <div className="field">
              <label>Grid Resolution</label>
              <div className="slider-row">
                <input
                  type="range"
                  min="4"
                  max="16"
                  value={gridSize}
                  onChange={e => setGridSize(Number(e.target.value))}
                />
                <span className="slider-val">{gridSize}</span>
              </div>
            </div>
            <div className="field" style={{ marginTop: 8 }}>
              <label>Module Scale</label>
              <div className="slider-row">
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={moduleScale}
                  onChange={e => setModuleScale(Number(e.target.value))}
                />
                <span className="slider-val">{moduleScale}x</span>
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ marginTop: 12, width: '100%' }}
              onClick={onExtract}
            >
              {hasModules ? 'Re-extract Modules' : 'Extract Modules'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
