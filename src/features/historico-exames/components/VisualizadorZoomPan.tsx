import React, { useState, useRef, useEffect } from 'react';

interface VisualizadorZoomPanProps {
  imageUrl: string;
}

export const VisualizadorZoomPan: React.FC<VisualizadorZoomPanProps> = ({ imageUrl }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const dragStart = useRef({ x: 0, y: 0 });
  
  // 1. Criamos uma referência para capturar a div pai
  const containerRef = useRef<HTMLDivElement>(null);

  // 2. Usamos o useEffect para interceptar o scroll na raiz do navegador
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // ISSO AQUI impede que a página inteira role!
      e.preventDefault(); 

      const zoomIntensity = 0.1;
      const isZoomOut = e.deltaY > 0;
      
      setScale((prevScale) => {
        let newScale = isZoomOut ? prevScale - zoomIntensity : prevScale + zoomIntensity;
        return Math.min(Math.max(1, newScale), 5);
      });
    };

    // { passive: false } é o grande segredo. Obriga o navegador a respeitar o e.preventDefault()
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef} // Atrelamos a referência aqui
      className="relative w-full h-[550px] bg-black rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden"
      // Removemos o onWheel daqui, pois o useEffect já está cuidando dele
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} 
    >
      <img
        src={imageUrl}
        alt="Visualização da Retina"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        className="w-full h-full object-contain pointer-events-none select-none"
        draggable={false}
      />

      <div className="absolute top-4 right-4 bg-slate-900/85 backdrop-blur-sm text-[11px] text-slate-300 p-2 rounded-lg border border-slate-700 pointer-events-none flex items-center gap-4">
        <div><span className="text-emerald-400 font-bold">Scroll:</span> Zoom</div>
        <div><span className="text-emerald-400 font-bold">Arrastar:</span> Mover</div>
        
        {(scale !== 1 || position.x !== 0 || position.y !== 0) && (
          <button 
            onClick={handleReset}
            className="pointer-events-auto ml-2 bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded transition-colors"
          >
            Resetar
          </button>
        )}
      </div>
    </div>
  );
};