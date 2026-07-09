import { useEffect, useRef } from 'react';
import './CustomCursor.css';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);

  useEffect(() => {
    // Only render on desktop
    if (window.innerWidth <= 768) return;

    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;
    if (!cursor || !dot) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let animationId;
    let isVisible = false;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
      if (!isVisible) {
        isVisible = true;
        cursor.classList.add('visible');
        dot.classList.add('visible');
      }
    };

    const onMouseEnterInteractive = () => {
      cursor.classList.add('hovering');
      dot.classList.add('hovering');
    };

    const onMouseLeaveInteractive = () => {
      cursor.classList.remove('hovering');
      dot.classList.remove('hovering');
    };

    const animate = () => {
      cursorX += (mouseX - cursorX) * 0.12;
      cursorY += (mouseY - cursorY) * 0.12;
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      animationId = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', onMouseMove);
    animationId = requestAnimationFrame(animate);

    const attachListeners = () => {
      const interactives = document.querySelectorAll('a, button, [data-cursor-hover]');
      interactives.forEach(el => {
        el.addEventListener('mouseenter', onMouseEnterInteractive);
        el.addEventListener('mouseleave', onMouseLeaveInteractive);
      });
    };

    attachListeners();

    const observer = new MutationObserver(() => {
      attachListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, []);

  // Only render on desktop
  if (typeof window !== 'undefined' && window.innerWidth <= 768) return null;

  return (
    <>
      <div ref={cursorRef} className="custom-cursor" />
      <div ref={cursorDotRef} className="custom-cursor-dot" />
    </>
  );
};

export default CustomCursor;
