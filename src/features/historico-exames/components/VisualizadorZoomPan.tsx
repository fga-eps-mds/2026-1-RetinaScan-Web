import React, { useState, useRef, useEffect } from 'react';

interface VisualizadorZoomPanProps {
  /** URL da imagem de retinografia (pode ser HTTP/HTTPS ou base64) a ser renderizada. */
  imageUrl: string;
}
export const VisualizadorZoomPan: React.FC<VisualizadorZoomPanProps> = ({ imageUrl }) => {
  // --- ESTADOS DE TRANSFORMAÇÃO ESPACIAL ---
  // Controla o nível de aproximação. 1 = 100% (tamanho original). Máximo definido em 5x.
  const [scale, setScale] = useState(1);
  
  // Controla o deslocamento nos eixos X e Y quando o usuário arrasta a imagem.
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // Flag de interação: define se o mouse está atualmente pressionado e movendo a imagem.
  const [isDragging, setIsDragging] = useState(false);
  
  // --- REFERÊNCIAS DE MEMÓRIA (Evitam re-renderizações desnecessárias) ---
  // Guarda a coordenada exata de onde o clique inicial ocorreu, descontando a translação atual.
  const dragStart = useRef({ x: 0, y: 0 });
  
  // Referência do nó no DOM para atrelar eventos nativos de forma não-passiva.
  const containerRef = useRef<HTMLDivElement>(null);

  // --- EFEITOS E EVENT LISTENERS ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /**
     * Intercepta a rolagem do mouse (Scroll/Wheel) para aplicar o zoom.
     * Necessita ser acoplado via addEventListener nativo para contornar o comportamento 
     * padrão do React e permitir o `e.preventDefault()`, travando a rolagem da página externa.
     */
    const handleWheel = (e: WheelEvent) => {
      // Bloqueia a rolagem da página inteira enquanto o mouse estiver sobre a imagem
      e.preventDefault(); 

      const zoomIntensity = 0.1;
      const isZoomOut = e.deltaY > 0;
      
      setScale((prevScale) => {
        const newScale = isZoomOut ? prevScale - zoomIntensity : prevScale + zoomIntensity;
        // Clamp matemático: garante que o zoom nunca seja menor que 1x e não ultrapasse 5x
        return Math.min(Math.max(1, newScale), 5);
      });
    };

    // O parâmetro { passive: false } é obrigatório para que o navegador respeite o preventDefault()
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      // Cleanup: Remove o listener ao desmontar para evitar vazamento de memória (Memory Leak)
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // --- HANDLERS DE INTERAÇÃO DO MOUSE (PAN) ---

  /** Inicia o processo de arrastar a imagem */
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    // Calcula a posição do mouse relativa à translação atual da imagem
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  /** Calcula o deslocamento em tempo real enquanto o mouse se move */
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  /** Encerra o arraste quando o botão é solto ou o mouse sai da área */
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  /** Restaura a visualização para a escala e posição originais (1x, centro) */
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-137.5 bg-black rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} 
    >
      <img
        src={imageUrl}
        alt="Visualização da Retina"
        style={{
          // APLICAÇÃO DA MATEMÁTICA: O transform CSS é executado na GPU, garantindo fluidez
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          // Se estiver arrastando, removemos a transição CSS para o elemento colar no mouse sem atraso (delay)
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        // pointer-events-none: Impede o navegador de tentar arrastar o arquivo de imagem nativamente (ghost drag)
        className="w-full h-full object-contain pointer-events-none select-none"
        draggable={false}
      />

      {/* --- HUD DE CONTROLES (Heads-Up Display) --- */}
      <div className="absolute top-4 right-4 bg-slate-900/85 backdrop-blur-sm text-[11px] text-slate-300 p-2 rounded-lg border border-slate-700 pointer-events-none flex items-center gap-4">
        <div><span className="text-emerald-400 font-bold">Scroll:</span> Zoom</div>
        <div><span className="text-emerald-400 font-bold">Arrastar:</span> Mover</div>
        
        {/* Renderização Condicional: O botão de reset só surge se a imagem foi manipulada */}
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