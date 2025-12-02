import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

const MermaidDiagram = ({ chart }) => {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState('');

  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });
  }, []);

  useEffect(() => {
    const renderChart = async () => {
      if (chart && containerRef.current) {
        try {
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          setSvg(svg);
        } catch (error) {
          console.error("Mermaid render error:", error);
          setSvg('<div class="error">Failed to render diagram</div>');
        }
      }
    };

    renderChart();
  }, [chart]);

  return (
    <div 
      className="mermaid-container" 
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default MermaidDiagram;
