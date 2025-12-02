import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

const MermaidDiagram = ({ chart, onRender }) => {
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
        // Defensive trimming
        const cleanedChart = String(chart).trim(); 
        if (!cleanedChart) { // If it's empty after trimming
            setSvg('<div class="error">No chart data provided after cleanup.</div>');
            return;
        }

        console.log("Mermaid chart string being rendered:", cleanedChart); // Log the input
        
        try {
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, cleanedChart); // Use cleanedChart
          setSvg(svg);
          if (onRender) onRender(svg);
        } catch (error) {
          console.error("Mermaid render error:", error);
          setSvg(`
            <div style="color: red; padding: 10px; border: 1px solid red; background: #fff0f0;">
              <strong>Diagram Syntax Error:</strong><br/>
              ${error.message}<br/>
              <pre style="background: #eee; padding: 5px; margin-top: 5px; overflow: auto; white-space: pre-wrap; word-break: break-all;">${cleanedChart}</pre>
            </div>
          `);
        }
      } else if (!chart) {
         setSvg(''); // Clear if chart is empty
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
