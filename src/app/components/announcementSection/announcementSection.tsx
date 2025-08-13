"use client";

import React, { useState, useEffect, useRef } from "react";
import "./announcementSection.scss";
import { Announcement } from "@/app/models/Announcement";

export function AnnouncementSection() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: number]: boolean }>({});
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true); // Start with true
  const [error, setError] = useState<string | null>(null);
  const [isDataReady, setIsDataReady] = useState(false); // New state to track readiness
  
  // Add throttle for scroll events
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_APIURL || 'http://localhost:3001';
  
  // Placeholder image path
  const placeholderImage = "./images/announcementSection/placeholder.svg";

  // Fetch all announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setIsDataReady(false);
      const response = await fetch(`${API_BASE_URL}/announcements`);
      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }
      const data = await response.json();
      setAnnouncements(data);
      setError(null);
      
      // Initialize image loading states
      const initialLoadingStates: { [key: number]: boolean } = {};
      data.forEach((_: any, index: number) => {
        initialLoadingStates[index] = false;
      });
      setImageLoadingStates(initialLoadingStates);
      
      // Mark data as ready after a small delay to ensure state updates
      setTimeout(() => {
        setIsDataReady(true);
      }, 100);
      
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced calculation for current card with better mobile support
  const calculateCurrentCard = (scrollLeft: number) => {
    const carousel = carouselRef.current;
    if (!carousel || announcements.length === 0) return 0;

    const containerWidth = carousel.clientWidth;
    
    // Get computed styles to get actual card width and gap
    const firstCard = carousel.querySelector('.announcementCard') as HTMLElement;
    if (!firstCard) return 0;
    
    const cardRect = firstCard.getBoundingClientRect();
    const cardWidth = cardRect.width;
    const gap = parseFloat(getComputedStyle(carousel).gap) || 20;
    const cardWithGap = cardWidth + gap;

    // Use center-based calculation for better accuracy
    const viewportCenter = scrollLeft + containerWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    announcements.forEach((_, index) => {
      const cardCenter = index * cardWithGap + cardWidth / 2;
      const distance = Math.abs(viewportCenter - cardCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || !isDataReady) return;

    const updateScrollbar = () => {
      const { scrollWidth, clientWidth } = carousel;
      const maxScrollValue = scrollWidth - clientWidth;
      setMaxScroll(maxScrollValue);

      // Calculate thumb width based on visible ratio
      const visibleRatio = clientWidth / scrollWidth;
      setThumbWidth(Math.max(visibleRatio * 100, 15)); // Min 15% width
    };

    // Use ResizeObserver for better responsiveness
    const resizeObserver = new ResizeObserver(() => {
      updateScrollbar();
      // Recalculate current image after resize
      const currentCard = calculateCurrentCard(carousel.scrollLeft);
      setCurrentImageIndex(currentCard);
    });

    resizeObserver.observe(carousel);
    updateScrollbar();

    return () => {
      resizeObserver.disconnect();
    };
  }, [isDataReady, announcements.length]);

  // Enhanced scroll handler with throttling
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft } = e.currentTarget;
    setScrollPosition(scrollLeft);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Throttle the image update to prevent excessive calculations
    scrollTimeoutRef.current = setTimeout(() => {
      const currentCard = calculateCurrentCard(scrollLeft);
      setCurrentImageIndex(currentCard);
    }, 50); // 50ms throttle
  };

  // Add touch event handlers for better mobile support
  const handleTouchStart = () => {
    // Clear any pending scroll updates when user starts touching
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  };

  const handleTouchEnd = () => {
    // Force immediate update when touch ends
    const carousel = carouselRef.current;
    if (carousel) {
      const currentCard = calculateCurrentCard(carousel.scrollLeft);
      setCurrentImageIndex(currentCard);
    }
  };

  // Handle image load error for specific image
  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({
      ...prev,
      [index]: true,
    }));
    setImageLoadingStates((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  // Handle successful image load
  const handleImageLoad = (index: number) => {
    setImageLoadingStates((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  // Get current image source with fallback logic - only after data is ready
  const getCurrentImageSrc = () => {
    // Return placeholder immediately if data isn't ready
    if (!isDataReady || announcements.length === 0) {
      return placeholderImage;
    }

    const currentAnnouncement = announcements[currentImageIndex];

    // Check if current announcement exists
    if (!currentAnnouncement) {
      return placeholderImage;
    }

    // Check if image exists, hasn't failed to load, and has a valid URL
    if (
      currentAnnouncement.imageUrl &&
      currentAnnouncement.imageUrl.trim() !== "" &&
      !imageErrors[currentImageIndex]
    ) {
      return currentAnnouncement.imageUrl;
    }

    return placeholderImage;
  };

  // Calculate thumb position as percentage
  const thumbPosition =
    maxScroll > 0 ? (scrollPosition / maxScroll) * (100 - thumbWidth) : 0;

  // Handle scrollbar track click
  const handleTrackClick = (e: React.MouseEvent) => {
    if (!scrollbarRef.current || !carouselRef.current) return;

    const rect = scrollbarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const trackWidth = rect.width;
    const clickPercentage = clickX / trackWidth;

    const newScrollLeft = clickPercentage * maxScroll;
    carouselRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });

    // Update image immediately for smooth scrollbar clicks
    setTimeout(() => {
      const currentCard = calculateCurrentCard(newScrollLeft);
      setCurrentImageIndex(currentCard);
    }, 100);
  };

  // Handle thumb drag start
  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      scrollLeft: scrollPosition,
    });
  };

  // Handle drag movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !scrollbarRef.current || !carouselRef.current) return;

      const rect = scrollbarRef.current.getBoundingClientRect();
      const trackWidth = rect.width;
      const deltaX = e.clientX - dragStart.x;
      const deltaPercentage = deltaX / trackWidth;
      const deltaScroll = deltaPercentage * maxScroll;

      const newScrollLeft = Math.max(
        0,
        Math.min(maxScroll, dragStart.scrollLeft + deltaScroll)
      );
      carouselRef.current.scrollLeft = newScrollLeft;

      // Update current image during drag
      const currentCard = calculateCurrentCard(newScrollLeft);
      setCurrentImageIndex(currentCard);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "grabbing";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging, dragStart, maxScroll]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="announcementSection">
        <div className="sec1 flex">
          <h3 className="sectionTitle">// 03 //</h3>
          <h3 className="sectionTitle">Recent Announcements</h3>
        </div>
        <div className="sec2 flex">
          <div className="leftSection flex">
            <img className="verticalWingLeft" src="./images/announcementSection/verticalWing.svg" alt="" />
            <div className="announcementImageContainer">
              <img
                className="announcementImage"
                src={placeholderImage}
                alt="Loading..."
              />
            </div>
            <img className="verticalWingRight" src="./images/announcementSection/verticalWingRight.svg" alt="" />
          </div>
          <div className="announcementsContainer">
            <div className="loading-message">Loading announcements...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="announcementSection">
        <div className="sec1 flex">
          <h3 className="sectionTitle">// 03 //</h3>
          <h3 className="sectionTitle">Recent Announcements</h3>
        </div>
        <div className="sec2 flex">
          <div className="leftSection flex">
            <img className="verticalWingLeft" src="./images/announcementSection/verticalWing.svg" alt="" />
            <div className="announcementImageContainer">
              <img
                className="announcementImage"
                src={placeholderImage}
                alt="Error"
              />
            </div>
            <img className="verticalWingRight" src="./images/announcementSection/verticalWingRight.svg" alt="" />
          </div>
          <div className="announcementsContainer">
            <div className="error-message">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (announcements.length === 0) {
    return (
      <div className="announcementSection">
        <div className="sec1 flex">
          <h3 className="sectionTitle">// 03 //</h3>
          <h3 className="sectionTitle">Recent Announcements</h3>
        </div>
        <div className="sec2 flex">
          <div className="leftSection flex">
            <img className="verticalWingLeft" src="./images/announcementSection/verticalWing.svg" alt="" />
            <div className="announcementImageContainer">
              <img
                className="announcementImage"
                src={placeholderImage}
                alt="No announcements available"
              />
            </div>
            <img className="verticalWingRight" src="./images/announcementSection/verticalWingRight.svg" alt="" />
          </div>
          <div className="announcementsContainer">
            <div className="empty-message">No announcements available</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="announcementSection">
      <div className="sec1 flex">
        <h3 className="sectionTitle">// 03 //</h3>
        <h3 className="sectionTitle">Recent Announcements</h3>
      </div>
      <div className="sec2 flex">
        <div className="leftSection flex">
          <img className="verticalWingLeft" src="./images/announcementSection/verticalWing.svg" alt="" />
          <div className="announcementImageContainer">
            <img
              className="announcementImage"
              src={getCurrentImageSrc()}
              alt={announcements[currentImageIndex]?.heading || "Announcement"}
              onError={() => handleImageError(currentImageIndex)}
              onLoad={() => handleImageLoad(currentImageIndex)}
            />
          </div>
          <img className="verticalWingRight" src="./images/announcementSection/verticalWingRight.svg" alt="" />
        </div>
        <div className="announcementsContainer">
          {/* Carousel Container */}
          <div
            ref={carouselRef}
            className="announcementCarousel"
            onScroll={handleScroll}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {announcements.map((announcement, index) => (
              <div
                key={announcement.id || index} // Use announcement.id if available
                className={`announcementCard ${
                  index === currentImageIndex ? "active" : ""
                }`}
              >
                <div className="announcementContent">
                  <h4 className="announcementTitle unboundedLight">
                    {index + 1}. {announcement.heading}
                  </h4>
                  <p className="announcementDescription satoshi">
                    {announcement.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Scrollbar */}
          <div className="customScrollbarContainer">
            <div
              ref={scrollbarRef}
              className="customScrollbarTrack"
              onClick={handleTrackClick}
            >
              <div
                className={`customScrollbarThumb ${
                  isDragging ? "dragging" : ""
                }`}
                style={{
                  width: `${thumbWidth}%`,
                  left: `${thumbPosition}%`,
                  transitionProperty: isDragging ? "none" : "all",
                  backgroundImage:
                    "url(./images/announcementSection/customScrollbarThumb.svg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                onMouseDown={handleThumbMouseDown}
              />
            </div>
          </div>
          <p className="slideCount unbounded">
            {currentImageIndex + 1} / {announcements.length}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementSection;