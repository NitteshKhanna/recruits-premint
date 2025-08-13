'use client';
import React, { useEffect, useRef, useState } from 'react';
import './carousel.scss';

type Image = {
  path: string;
  alt: string;
};

type CarouselProps = {
  images: Image[];
  speed: number; // pixels per frame
};

export const Carousel: React.FC<CarouselProps> = ({ images, speed }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const animationRef = useRef<number>();

  // Continuous scroll animation
  useEffect(() => {
    const scroll = () => {
      const container = containerRef.current;
      if (!container) return;

      // Only scroll if not hovered and not dragging
      if (!isHovered && !isDragging) {
        container.scrollLeft += speed;
        
        // Smooth loop back - check if we've scrolled past halfway point
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScroll) {
          container.scrollLeft = 0;
        }
      }
      
      animationRef.current = requestAnimationFrame(scroll);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(scroll);

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [speed, isHovered, isDragging]);

  // Drag behavior
  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    setIsDragging(true);
    setStartX(pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const dragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    const x = pageX - containerRef.current.offsetLeft;
    const walk = x - startX;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const endDrag = () => {
    setIsDragging(false);
  };

  // Separate hover handlers to prevent conflicts
  const handleMouseEnter = () => {
    if (!isDragging) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    endDrag();
  };

  const handleTouchEnd = () => {
    endDrag();
    // Small delay before allowing auto-scroll to resume
    setTimeout(() => setIsHovered(false), 100);
  };

  return (
    <div
      className="carousel"
      ref={containerRef}
      onMouseDown={startDrag}
      onMouseMove={dragMove}
      onMouseUp={endDrag}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onTouchStart={startDrag}
      onTouchMove={dragMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Duplicate images for seamless loop */}
      {images.concat(images).map((img, index) => (
        <img 
          key={`${index}-${img.path}`} 
          src={img.path} 
          alt={img.alt} 
          draggable={false} 
        />
      ))}
    </div>
  );
};

export default Carousel;