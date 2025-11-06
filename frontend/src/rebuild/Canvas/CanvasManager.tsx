import React, { useEffect, useRef, useState } from 'react';
import styles from './Canvas.module.css';

type Shape = { type: 'rect' | 'circle' | 'line' | 'path'; props: any };

export default function CanvasRebuild() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const drag = useRef<{down: boolean; x: number; y: number}>({ down: false, x: 0, y: 0 });

  useEffect(() => {
    const onStructured = (ev: Event) => {
      // Accept messages from Chat rebuild that include a `canvas` field with shapes
      // @ts-ignore
      const detail = (ev as CustomEvent).detail;
      if (detail && detail.canvas && Array.isArray(detail.canvas.shapes)) {
        setShapes(detail.canvas.shapes as Shape[]);
      }
    };
    window.addEventListener('chat:structured', onStructured as EventListener);
    return () => window.removeEventListener('chat:structured', onStructured as EventListener);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, pan.x * dpr, pan.y * dpr);
    ctx.clearRect(-pan.x, -pan.y, canvas.width, canvas.height);
    // simple renderer
    shapes.forEach(s => {
      try {
        if (s.type === 'rect') {
          const { x=0,y=0,w=100,h=100,fill='#ddd' } = s.props || {};
          ctx.fillStyle = fill;
          ctx.fillRect(x, y, w, h);
        } else if (s.type === 'circle') {
          const { x=50,y=50,r=20,fill='#cce' } = s.props || {};
          ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle = fill; ctx.fill();
        } else if (s.type === 'line') {
          const { x1=0,y1=0,x2=100,y2=100,stroke='#333',width=2 } = s.props || {};
          ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        } else if (s.type === 'path') {
          const { d, stroke='#333', fill } = s.props || {};
          if (d && typeof d === 'string') {
            // very small path parser for M/L commands
            const cmds = d.split(/\s+/);
            ctx.beginPath();
            for (let i=0;i<cmds.length;i+=3) {
              const c = cmds[i];
              const x = parseFloat(cmds[i+1]);
              const y = parseFloat(cmds[i+2]);
              if (c === 'M') ctx.moveTo(x,y);
              else if (c === 'L') ctx.lineTo(x,y);
            }
            if (fill) { ctx.fillStyle = fill; ctx.fill(); }
            ctx.strokeStyle = stroke; ctx.stroke();
          }
        }
      } catch (e) { /* ignore malformed shapes */ }
    });
  }, [shapes, pan, zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(z => Math.min(4, Math.max(0.25, z * delta)));
      }
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel as any);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    drag.current.down = true; drag.current.x = e.clientX; drag.current.y = e.clientY;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!drag.current.down) return;
    const dx = e.clientX - drag.current.x; const dy = e.clientY - drag.current.y;
    drag.current.x = e.clientX; drag.current.y = e.clientY;
    setPan(p => ({ x: p.x + dx / zoom, y: p.y + dy / zoom }));
  };
  const onMouseUp = () => { drag.current.down = false; };

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <button onClick={() => { setShapes([{ type: 'rect', props: { x:20,y:20,w:120,h:80,fill:'#cde' } }]); }}>Load demo</button>
        <button onClick={() => { setShapes([]); }}>Clear</button>
        <div>Zoom: {Math.round(zoom*100)}%</div>
      </div>
      <div className={styles.canvasContainer}>
        <canvas ref={canvasRef} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} />
      </div>
    </div>
  );
}
