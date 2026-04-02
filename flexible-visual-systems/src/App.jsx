import React, { useState, useCallback } from 'react';
import InputPanel from './components/InputPanel';
import AssemblyView from './components/AssemblyView';
import LogicTable from './components/LogicTable';
import TransformEngine from './components/TransformEngine';
import ModularType from './components/ModularType';
import AppPreview from './components/AppPreview';
import ExportButton from './components/ExportButton';
import { extractModules } from './components/ModuleExtractor';
import { loadImage } from './utils/canvasHelpers';

const TABS = [
  { id: 'assembly', label: 'Assembly' },
  { id: 'logic', label: 'Logic Table' },
  { id: 'transform', label: 'Transforms' },
  { id: 'type', label: 'Typography' },
  { id: 'preview', label: 'Preview' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('assembly');
  const [logoSrc, setLogoSrc] = useState(null);
  const [logoImg, setLogoImg] = useState(null);

  // Colors
  const [primaryColor, setPrimaryColor] = useState('#4f8cff');
  const [secondaryColor, setSecondaryColor] = useState('#ff6b4f');
  const [bgColor, setBgColor] = useState('#0e0e0e');

  // Extraction params
  const [gridSize, setGridSize] = useState(8);
  const [moduleScale, setModuleScale] = useState(1);

  // Extracted data
  const [moduleData, setModuleData] = useState(null);

  const handleImageUpload = useCallback(async (file) => {
    const url = URL.createObjectURL(file);
    setLogoSrc(url);
    const img = await loadImage(url);
    setLogoImg(img);
    setModuleData(null);
  }, []);

  const handleExtract = useCallback(() => {
    if (!logoImg) return;
    const data = extractModules(logoImg, gridSize);
    setModuleData(data);
  }, [logoImg, gridSize]);

  const modules = moduleData?.modules || null;
  const rows = moduleData?.rows || 0;
  const cols = moduleData?.cols || 0;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Flexible Visual Systems</h1>
        <div className="export-bar">
          <ExportButton
            modules={modules}
            rows={rows}
            cols={cols}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            bgColor={bgColor}
            moduleScale={moduleScale}
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
        gridSize={gridSize}
        setGridSize={setGridSize}
        moduleScale={moduleScale}
        setModuleScale={setModuleScale}
        onExtract={handleExtract}
        hasModules={!!modules}
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
          {activeTab === 'assembly' && (
            <AssemblyView
              modules={modules}
              rows={rows}
              cols={cols}
              primaryColor={primaryColor}
              bgColor={bgColor}
              moduleScale={moduleScale}
            />
          )}
          {activeTab === 'logic' && (
            <LogicTable
              modules={modules}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              bgColor={bgColor}
            />
          )}
          {activeTab === 'transform' && (
            <TransformEngine
              modules={modules}
              rows={rows}
              cols={cols}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              bgColor={bgColor}
              moduleScale={moduleScale}
            />
          )}
          {activeTab === 'type' && (
            <ModularType
              modules={modules}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              bgColor={bgColor}
              moduleScale={moduleScale}
            />
          )}
          {activeTab === 'preview' && (
            <AppPreview
              modules={modules}
              rows={rows}
              cols={cols}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              bgColor={bgColor}
              moduleScale={moduleScale}
            />
          )}
        </div>
      </div>
    </div>
  );
}
