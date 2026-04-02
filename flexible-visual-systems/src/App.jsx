import React, { useState, useCallback } from 'react';
import InputPanel from './components/InputPanel';
import ModuleLibrary from './components/ModuleLibrary';
import AssetsView from './components/AssetsView';
import ApplicationsView from './components/ApplicationsView';
import ExportButton from './components/ExportButton';
import { generateModuleSet } from './utils/shapeModules';
import { loadImage } from './utils/canvasHelpers';

const TABS = [
  { id: 'modules', label: 'Components' },
  { id: 'assets', label: 'Assets' },
  { id: 'applications', label: 'Applications' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('modules');

  // Step 1: Logo
  const [logoSrc, setLogoSrc] = useState(null);
  const [logoImg, setLogoImg] = useState(null);

  // Step 2: Colors
  const [primaryColor, setPrimaryColor] = useState('#00a651');
  const [secondaryColor, setSecondaryColor] = useState('#ff6347');
  const [bgColor, setBgColor] = useState('#0e0e0e');

  // Step 3: FVS Parameters
  const [edgeStyle, setEdgeStyle] = useState('rounded');
  const [cornerRadius, setCornerRadius] = useState(0.25);
  const [gridDensity, setGridDensity] = useState(4);
  const [moduleGap, setModuleGap] = useState(4);

  // Generated system
  const [modules, setModules] = useState(null);

  const handleImageUpload = useCallback(async (file) => {
    const url = URL.createObjectURL(file);
    setLogoSrc(url);
    const img = await loadImage(url);
    setLogoImg(img);
  }, []);

  const handleGenerate = useCallback(() => {
    const moduleSet = generateModuleSet(edgeStyle);
    setModules(moduleSet);
  }, [edgeStyle]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Flexible Visual Systems</h1>
        <div className="export-bar">
          <ExportButton
            modules={modules}
            cornerRadius={cornerRadius}
            gridDensity={gridDensity}
            moduleGap={moduleGap}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            bgColor={bgColor}
          />
        </div>
      </header>

      <InputPanel
        logoSrc={logoSrc}
        onImageUpload={handleImageUpload}
        primaryColor={primaryColor}
        setPrimaryColor={setPrimaryColor}
        secondaryColor={secondaryColor}
        setSecondaryColor={setSecondaryColor}
        bgColor={bgColor}
        setBgColor={setBgColor}
        edgeStyle={edgeStyle}
        setEdgeStyle={setEdgeStyle}
        cornerRadius={cornerRadius}
        setCornerRadius={setCornerRadius}
        gridDensity={gridDensity}
        setGridDensity={setGridDensity}
        moduleGap={moduleGap}
        setModuleGap={setModuleGap}
        onGenerate={handleGenerate}
        hasSystem={!!modules}
      />

      <div className="main-area">
        <div className="tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="tab-content">
          {activeTab === 'modules' && (
            <ModuleLibrary
              modules={modules}
              cornerRadius={cornerRadius}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              bgColor={bgColor}
            />
          )}
          {activeTab === 'assets' && (
            <AssetsView
              modules={modules}
              cornerRadius={cornerRadius}
              gridDensity={gridDensity}
              moduleGap={moduleGap}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              bgColor={bgColor}
            />
          )}
          {activeTab === 'applications' && (
            <ApplicationsView
              modules={modules}
              cornerRadius={cornerRadius}
              gridDensity={gridDensity}
              moduleGap={moduleGap}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              bgColor={bgColor}
              logoImg={logoImg}
            />
          )}
        </div>
      </div>
    </div>
  );
}
