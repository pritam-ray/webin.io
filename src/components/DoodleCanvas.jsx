import { useRef, useState, useEffect } from 'react';
import { Pencil, Trash2, Eraser, Download } from 'lucide-react';
import './DoodleCanvas.css';

const DoodleCanvas = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#052626');
  const [brushSize, setBrushSize] = useState(5);
  const [isErasing, setIsErasing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    
    // Set display size (css pixels)
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    
    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;
    
    // Fill white background inside canvas so it's downloadable cleanly
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, rect.width, rect.height);
  }, []);

  // Re-run window resize layout adjustment
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      
      // Save canvas state
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(canvas, 0, 0);
      
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      
      const context = canvas.getContext('2d');
      context.scale(2, 2);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      contextRef.current = context;
      
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, rect.width, rect.height);
      context.drawImage(tempCanvas, 0, 0, tempCanvas.width / 2, tempCanvas.height / 2);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startDrawing = ({ nativeEvent }) => {
    let clientX, clientY;
    if (nativeEvent.touches && nativeEvent.touches.length > 0) {
      clientX = nativeEvent.touches[0].clientX;
      clientY = nativeEvent.touches[0].clientY;
    } else {
      clientX = nativeEvent.clientX;
      clientY = nativeEvent.clientY;
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    contextRef.current.strokeStyle = isErasing ? '#ffffff' : color;
    contextRef.current.lineWidth = isErasing ? 30 : brushSize;
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    nativeEvent.preventDefault(); // Stop scroll gestures on mobile

    let clientX, clientY;
    if (nativeEvent.touches && nativeEvent.touches.length > 0) {
      clientX = nativeEvent.touches[0].clientX;
      clientY = nativeEvent.touches[0].clientY;
    } else {
      clientX = nativeEvent.clientX;
      clientY = nativeEvent.clientY;
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, rect.width, rect.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'webing-io-doodle.png';
    link.href = image;
    link.click();
  };

  return (
    <section className="doodle-section" id="doodle">
      <div className="container">
        <div className="doodle-header">
          <span className="doodle-badge">INTERACTIVE</span>
          <h2 className="doodle-title">WHAT IS WRITTEN HERE?</h2>
          <p className="doodle-subtitle">
            Pick a tool, draw your ideas, sketch a wireframe, or simply sign your name. 
            The canvas belongs to you.
          </p>
        </div>

        <div className="doodle-editor-card glass">
          <div className="doodle-toolbar">
            <div className="tool-group">
              <button 
                onClick={() => { setIsErasing(false); }} 
                className={`tool-btn ${!isErasing ? 'active' : ''}`}
                aria-label="Pencil Tool"
              >
                <Pencil size={18} />
                <span className="btn-label">PENCIL</span>
              </button>
              
              <button 
                onClick={() => { setIsErasing(true); }} 
                className={`tool-btn ${isErasing ? 'active' : ''}`}
                aria-label="Eraser Tool"
              >
                <Eraser size={18} />
                <span className="btn-label">ERASER</span>
              </button>
            </div>

            <div className="divider-line" />

            <div className="color-palette-group">
              <span className="group-label">COLOR:</span>
              <div className="colors-grid">
                {[
                  { hex: '#052626', name: 'Slate' },
                  { hex: '#f25c27', name: 'Orange' },
                  { hex: '#f3c63f', name: 'Yellow' },
                  { hex: '#005b5b', name: 'Teal' }
                ].map((item) => (
                  <button
                    key={item.hex}
                    onClick={() => { setColor(item.hex); setIsErasing(false); }}
                    className={`color-dot ${color === item.hex && !isErasing ? 'selected' : ''}`}
                    style={{ backgroundColor: item.hex }}
                    aria-label={`Color ${item.name}`}
                  />
                ))}
              </div>
            </div>

            <div className="divider-line" />

            <div className="brush-size-group">
              <span className="group-label">SIZE:</span>
              <div className="sizes-grid">
                {[3, 6, 12].map((size) => (
                  <button
                    key={size}
                    onClick={() => setBrushSize(size)}
                    className={`size-btn ${brushSize === size ? 'selected' : ''}`}
                  >
                    <div className="dot-indicator" style={{ width: size, height: size }} />
                  </button>
                ))}
              </div>
            </div>

            <div className="toolbar-actions">
              <button onClick={clearCanvas} className="action-btn clear-btn">
                <Trash2 size={16} />
                <span>CLEAR</span>
              </button>
              <button onClick={downloadCanvas} className="action-btn download-btn">
                <Download size={16} />
                <span>SAVE</span>
              </button>
            </div>
          </div>

          <div className="canvas-wrapper">
            <div className="canvas-dot-grid" />
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="doodle-canvas"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DoodleCanvas;
