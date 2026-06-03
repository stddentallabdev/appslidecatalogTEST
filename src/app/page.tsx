"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  PhoneCall, 
  Heart, 
  Share2, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Volume1, 
  Plus, 
  RotateCw,
  Eye,
  Loader2
} from "lucide-react";

// ========================================================
// 📦 interfaces
// ========================================================
interface CatalogItem {
  id: string;
  name: string;
  badge: string;
  description: string;
  media: string[];
}

export default function Home() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  // Global exception catcher to render runtime failures gracefully
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      setRuntimeError(e.message || "Unknown client-side exception");
    };
    const handleRejection = (e: PromiseRejectionEvent) => {
      setRuntimeError(e.reason?.message || e.reason || "Unhandled promise rejection");
    };
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);


  // Active indexes
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  
  // Animation state
  const [slideDirection, setSlideDirection] = useState<"next-product" | "prev-product" | "next-media" | "prev-media">("next-product");

  // Video playback states
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showUnmutePrompt, setShowUnmutePrompt] = useState(true);
  const [isAutoPlayNext, setIsAutoPlayNext] = useState(true);

  // Likes & Shares animation state
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [showShareNotification, setShowShareNotification] = useState(false);

  // Auto-advance progress bar for images
  const [imageProgress, setImageProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch catalog from API
  useEffect(() => {
    async function fetchCatalog() {
      try {
        const res = await fetch("/api/catalog");
        if (!res.ok) throw new Error("Failed to fetch catalog");
        const data: CatalogItem[] = await res.json();
        
        if (data.length === 0) {
          setError(true);
          return;
        }

        setCatalog(data);

        // Initialize likes/views values dynamically to preserve across sessions
        const initialLikes: Record<string, number> = {};
        const initialViews: Record<string, number> = {};
        data.forEach(item => {
          initialLikes[item.id] = Math.floor(Math.random() * 800) + 150;
          initialViews[item.id] = Math.floor(Math.random() * 5000) + 2000;
        });
        setLikeCounts(initialLikes);
        setViewCounts(initialViews);

        // Parse search params to find specific product ID
        const searchParams = new URLSearchParams(window.location.search);
        const vParam = searchParams.get("v")?.toLowerCase() || "";
        
        if (vParam) {
          const index = data.findIndex(item => item.id === vParam);
          if (index !== -1) {
            setActiveProductIndex(index);
          }
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchCatalog();
  }, []);

  const activeItem = catalog[activeProductIndex];
  const activeMedia = activeItem?.media[activeMediaIndex] || "/images/placeholder.png";

  const isVideoFile = (src: string) => {
    const ext = src.split("?")[0].split(".").pop()?.toLowerCase();
    return ext === "mp4" || ext === "webm" || ext === "mov";
  };

  const isCurrentMediaVideo = isVideoFile(activeMedia);

  // 1. Navigation helper (syncs URL parameter)
  const navigateTo = (prodIndex: number, mediaIndex: number, direction: typeof slideDirection) => {
    if (prodIndex < 0 || prodIndex >= catalog.length) return;
    const targetProduct = catalog[prodIndex];
    if (mediaIndex < 0 || mediaIndex >= targetProduct.media.length) return;

    setSlideDirection(direction);
    setActiveProductIndex(prodIndex);
    setActiveMediaIndex(mediaIndex);
    setImageProgress(0); // Reset timer progress bar

    // Smooth URL updating without full page reload
    const newUrl = `${window.location.pathname}?v=${targetProduct.id}`;
    window.history.pushState({ path: newUrl }, "", newUrl);

    // Increase view count slightly on navigate
    setViewCounts(prev => ({
      ...prev,
      [targetProduct.id]: (prev[targetProduct.id] || 0) + 1
    }));
  };

  const handleNextProduct = () => {
    const nextIndex = (activeProductIndex + 1) % catalog.length;
    navigateTo(nextIndex, 0, "next-product");
  };

  const handlePrevProduct = () => {
    const prevIndex = activeProductIndex === 0 ? catalog.length - 1 : activeProductIndex - 1;
    navigateTo(prevIndex, 0, "prev-product");
  };

  const handleNextMedia = () => {
    if (!activeItem) return;
    if (activeMediaIndex < activeItem.media.length - 1) {
      navigateTo(activeProductIndex, activeMediaIndex + 1, "next-media");
    } else {
      // Loop to next product if at the end of current media
      handleNextProduct();
    }
  };

  const handlePrevMedia = () => {
    if (!activeItem) return;
    if (activeMediaIndex > 0) {
      navigateTo(activeProductIndex, activeMediaIndex - 1, "prev-media");
    } else {
      // Go to previous product if at the start of current media
      const prevIndex = activeProductIndex === 0 ? catalog.length - 1 : activeProductIndex - 1;
      const prevProduct = catalog[prevIndex];
      navigateTo(prevIndex, prevProduct.media.length - 1, "prev-product");
    }
  };

  // 2. Gesture Controls: Scroll wheel listener
  const lastScrollTime = useRef(0);
  useEffect(() => {
    if (loading || error || catalog.length === 0) return;

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScrollTime.current < 800) return; // Cooldown to prevent scroll spamming

      const threshold = 30; // Min delta to trigger swipe
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        // Vertical Scroll -> change product
        if (e.deltaY > threshold) {
          lastScrollTime.current = now;
          handleNextProduct();
        } else if (e.deltaY < -threshold) {
          lastScrollTime.current = now;
          handlePrevProduct();
        }
      } else {
        // Horizontal Scroll -> change media inside product
        if (e.deltaX > threshold) {
          lastScrollTime.current = now;
          handleNextMedia();
        } else if (e.deltaX < -threshold) {
          lastScrollTime.current = now;
          handlePrevMedia();
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [loading, error, activeProductIndex, activeMediaIndex, catalog]);

  // 3. Gesture Controls: Keyboard Up/Down/Left/Right arrows
  useEffect(() => {
    if (loading || error || catalog.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        handleNextProduct();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handlePrevProduct();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextMedia();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevMedia();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, error, activeProductIndex, activeMediaIndex, catalog]);

  // 4. Gesture Controls: Mobile Swipe (touchStart & touchEnd)
  const touchStart = useRef({ x: 0, y: 0 });
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = e.changedTouches[0].clientX - touchStart.current.x;
    const diffY = e.changedTouches[0].clientY - touchStart.current.y;
    const minSwipeDistance = 50; // threshold in pixels

    if (Math.abs(diffY) > Math.abs(diffX)) {
      // Vertical swipe
      if (Math.abs(diffY) > minSwipeDistance) {
        if (diffY < 0) {
          // swiped UP -> Next product
          handleNextProduct();
        } else {
          // swiped DOWN -> Prev product
          handlePrevProduct();
        }
      }
    } else {
      // Horizontal swipe
      if (Math.abs(diffX) > minSwipeDistance) {
        if (diffX < 0) {
          // swiped LEFT -> Next photo
          handleNextMedia();
        } else {
          // swiped RIGHT -> Prev photo
          handlePrevMedia();
        }
      }
    }
  };

  // 5. Image Auto-advance Timer / Video Ended Handler
  useEffect(() => {
    if (loading || error || !activeItem || !isAutoPlayNext) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (isCurrentMediaVideo) {
      // For videos: clear image timer, wait for video onEnded event to trigger next
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setImageProgress(0);
      return;
    }

    // For images: create a 6-second timer progress
    setImageProgress(0);
    const duration = 6000; // 6 seconds
    const intervalTime = 100; // update every 100ms
    const step = (intervalTime / duration) * 100;

    timerRef.current = setInterval(() => {
      setImageProgress(prev => {
        if (prev >= 100) {
          clearInterval(timerRef.current!);
          // Advance to next media/product
          handleNextMedia();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, error, activeProductIndex, activeMediaIndex, isAutoPlayNext, isCurrentMediaVideo]);

  // Handle Video Autoplay setup
  useEffect(() => {
    if (loading || error || !isCurrentMediaVideo) return;

    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setIsMuted(video.muted);
      if (!video.muted) {
        setShowUnmutePrompt(false);
      }
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolumeChange);

    // Mute and play
    video.muted = isMuted;
    video.play().catch(() => {
      console.log("Autoplay blocked. User tap required.");
      setIsPlaying(false);
    });

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolumeChange);
    };
  }, [loading, error, activeProductIndex, activeMediaIndex, isCurrentMediaVideo]);

  const handleVideoEnded = () => {
    if (isAutoPlayNext) {
      handleNextMedia();
    }
  };

  const handleTogglePlay = () => {
    if (!isCurrentMediaVideo) return;
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCurrentMediaVideo) return;
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
    if (!video.muted) {
      setShowUnmutePrompt(false);
    }
  };

  const handleTapToUnmute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCurrentMediaVideo) return;
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    setIsMuted(false);
    setShowUnmutePrompt(false);
    video.play().catch(() => {});
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeItem) return;
    const itemId = activeItem.id;
    const isLiked = !likedItems[itemId];
    
    setLikedItems(prev => ({ ...prev, [itemId]: isLiked }));
    setLikeCounts(prev => ({
      ...prev,
      [itemId]: isLiked ? (prev[itemId] || 0) + 1 : (prev[itemId] || 0) - 1
    }));
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeItem) return;
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?v=${activeItem.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShowShareNotification(true);
      setTimeout(() => setShowShareNotification(false), 2000);
    });
  };

  if (runtimeError) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 font-sans text-white p-6 text-center">
        <div className="rounded-3xl border border-red-500/30 bg-red-950/20 p-8 max-w-md backdrop-blur-md">
          <Sparkles className="h-12 w-12 text-red-400 mx-auto animate-pulse" />
          <h2 className="mt-4 text-lg font-black tracking-wide text-red-300">ระบบขัดข้อง (Client Error)</h2>
          <p className="mt-2 text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/50 p-3 rounded-xl border border-white/5">
            {runtimeError}
          </p>
        </div>
      </div>
    );
  }

  // Render Loader
  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 font-sans text-white">
        <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
        <span className="mt-4 text-xs font-black tracking-widest uppercase text-purple-300 animate-pulse">
          Loading S.T.D. Catalog...
        </span>
      </div>
    );
  }

  // Render Error
  if (error || catalog.length === 0) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 font-sans text-white p-6 text-center">
        <div className="rounded-3xl border border-rose-500/30 bg-rose-950/20 p-8 max-w-md backdrop-blur-md">
          <Sparkles className="h-12 w-12 text-rose-400 mx-auto animate-pulse" />
          <h2 className="mt-4 text-lg font-black tracking-wide text-rose-300">ไม่พบโฟลเดอร์แคตตาล็อก</h2>
          <p className="mt-2 text-xs text-slate-300 leading-relaxed">
            กรุณาตรวจสอบให้แน่ใจว่ามีโฟลเดอร์ใน <code className="bg-slate-900 px-1 py-0.5 rounded text-rose-300 text-[10px]">public/catalog/</code> เช่น <code className="bg-slate-900 px-1 py-0.5 rounded text-rose-300 text-[10px]">stdr01</code> พร้อมรูปภาพและไฟล์ <code className="bg-slate-900 px-1 py-0.5 rounded text-rose-300 text-[10px]">info.md</code>
          </p>
        </div>
      </div>
    );
  }

  // Motion variants for sliding transitions
  const slideVariants = {
    enter: (dir: typeof slideDirection) => ({
      x: dir === "next-media" ? "100%" : dir === "prev-media" ? "-100%" : 0,
      y: dir === "next-product" ? "100%" : dir === "prev-product" ? "-100%" : 0,
      opacity: 0.85,
      scale: 0.98,
    }),
    center: {
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        y: { type: "spring" as const, stiffness: 300, damping: 30 },
        scale: { duration: 0.2 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (dir: typeof slideDirection) => ({
      x: dir === "next-media" ? "-100%" : dir === "prev-media" ? "100%" : 0,
      y: dir === "next-product" ? "-100%" : dir === "prev-product" ? "100%" : 0,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        y: { type: "spring" as const, stiffness: 300, damping: 30 },
        scale: { duration: 0.2 },
        opacity: { duration: 0.2 }
      }
    }),
  };

  const isLiked = likedItems[activeItem.id] || false;
  const currentLikeCount = likeCounts[activeItem.id] || 0;
  const currentViewCount = viewCounts[activeItem.id] || 0;

  return (
    <main 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative flex flex-1 h-[100dvh] w-screen bg-slate-950 overflow-hidden select-none font-sans text-white justify-center items-center touch-none"
    >
      
      {/* ========================================================
          1. 2D FULL-SCREEN MEDIA SLIDER LAYER
         ======================================================== */}
      <div className="relative w-full h-full sm:w-[480px] sm:h-[90vh] sm:max-h-[900px] sm:rounded-3xl sm:border sm:border-white/10 sm:shadow-2xl overflow-hidden bg-slate-900">
        
        {/* Slide Canvas Wrapper */}
        <div 
          onClick={handleTogglePlay}
          className="absolute inset-0 h-full w-full bg-slate-950 flex items-center justify-center cursor-pointer overflow-hidden"
        >
          <AnimatePresence initial={false} custom={slideDirection} mode="wait">
            <motion.div
              key={`${activeProductIndex}-${activeMediaIndex}`}
              custom={slideDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 h-full w-full flex items-center justify-center"
            >
              {isCurrentMediaVideo ? (
                <video
                  ref={videoRef}
                  src={encodeURI(activeMedia)}
                  autoPlay
                  playsInline
                  webkit-playsinline="true"
                  muted={isMuted}
                  onEnded={handleVideoEnded}
                  className="h-full w-full object-cover bg-slate-950"
                  onError={() => {
                    console.log("Media resource fail fallback");
                  }}
                />
              ) : (
                <img
                  src={encodeURI(activeMedia)}
                  alt={activeItem.name}
                  className="h-full w-full object-cover bg-slate-950"
                  draggable={false}
                  onError={(e) => {
                    // Fallback to default placeholder image
                    const target = e.target as HTMLImageElement;
                    if (target.src !== "/images/placeholder.png") {
                      target.src = "/images/placeholder.png";
                    }
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Cinematic shade gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950/85 pointer-events-none z-10" />
        </div>

        {/* ========================================================
            2. AUTO-PLAY PROGRESS BAR (Top Edge of Slider)
           ======================================================== */}
        {isAutoPlayNext && !isCurrentMediaVideo && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-40 pointer-events-none">
            <div 
              className="h-full bg-purple-400 transition-all duration-100 ease-linear"
              style={{ width: `${imageProgress}%` }}
            />
          </div>
        )}

        {/* ========================================================
            3. TOP HEADER OVERLAY (Badge & Branding)
           ======================================================== */}
        <header className="absolute top-0 left-0 right-0 z-30 flex items-start justify-between p-4 pointer-events-none mt-2">
          {/* Dynamic active model tags */}
          <div className="flex flex-col gap-1.5 pointer-events-auto">
            <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur-md shadow-lg">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-ping" />
              <span className="text-[9px] font-black tracking-widest uppercase text-slate-100">
                {activeItem.badge}
              </span>
            </div>

            {/* Navigation buttons for desktop display */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevProduct(); }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 border border-white/15 text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-90 cursor-pointer"
                title="ก่อนหน้า (ขึ้น)"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNextProduct(); }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 border border-white/15 text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-90 cursor-pointer"
                title="ถัดไป (ลง)"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              {activeItem.media.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrevMedia(); }}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 border border-white/15 text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-90 cursor-pointer ml-1"
                    title="รูปก่อนหน้า (ซ้าย)"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNextMedia(); }}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 border border-white/15 text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-90 cursor-pointer"
                    title="รูปถัดไป (ขวา)"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* S.T.D. DENTAL LAB Premium Branding */}
          <div className="flex flex-col items-end rounded-2xl border border-white/20 bg-white/10 p-3 text-right backdrop-blur-md shadow-2xl pointer-events-auto">
            <span className="text-xs font-black tracking-widest text-purple-400">S.T.D.</span>
            <span className="text-[9px] font-extrabold tracking-widest text-slate-100 uppercase mt-0.5 animate-pulse">
              DENTAL LAB
            </span>
            <span className="text-[7px] text-slate-300 font-semibold tracking-wider uppercase mt-1">
              LIMITED PARTNERSHIP
            </span>
          </div>
        </header>

        {/* ========================================================
            4. BOTTOM DESCRIPTION OVERLAY (IG Reels Style)
           ======================================================== */}
        <div className="absolute bottom-0 left-0 w-full z-20 p-5 pb-8 flex flex-col gap-3 text-white pointer-events-none">
          
          {/* Lab Profile Avatar & Username */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-purple-400 bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-md">
              <span className="text-[10px] font-black text-slate-950">STD</span>
              <span className="absolute bottom-0 right-0 flex h-3 w-3 items-center justify-center rounded-full bg-purple-400 border border-slate-950 text-slate-950">
                <Plus className="h-2 w-2 stroke-[4px]" />
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wider text-slate-100">@std_dentallab</span>
                <span className="rounded bg-purple-400/20 border border-purple-400/30 px-1 py-0.2 text-[7px] font-black text-purple-300 tracking-widest uppercase">Verified</span>
              </div>
              <span className="text-[8px] text-slate-300 flex items-center gap-1 font-semibold">
                <Sparkles className="h-3 w-3 text-purple-400 shrink-0" />
                Orthodontic Specialists
              </span>
            </div>
          </div>

          {/* Retainer Product Name */}
          <h2 className="text-base font-black tracking-wide text-white drop-shadow-md pointer-events-auto">
            {activeItem.name}
          </h2>

          {/* Dynamic parsed descriptions */}
          {activeItem.description && (
            <p className="text-[11px] text-slate-200 leading-relaxed font-semibold max-w-[85%] drop-shadow-sm pointer-events-auto max-h-24 overflow-y-auto scrollbar-thin">
              {activeItem.description}
            </p>
          )}

          {/* Small reels view-count badge */}
          <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-300 bg-white/5 border border-white/10 rounded-full px-2.5 py-1 w-max pointer-events-auto backdrop-blur-sm">
            <Eye className="h-3 w-3 text-purple-400" />
            <span>ยอดเข้าชม {currentViewCount.toLocaleString()} ครั้ง</span>
          </div>

          {/* ========================================================
              5. HORIZONTAL MEDIA PAGINATION DOTS (Carousel Indicators)
             ======================================================== */}
          {activeItem.media.length > 1 && (
            <div className="flex items-center gap-1.5 mt-1 pointer-events-auto">
              {activeItem.media.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); navigateTo(activeProductIndex, idx, idx > activeMediaIndex ? "next-media" : "prev-media"); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeMediaIndex 
                      ? "w-4 bg-purple-400 shadow-md shadow-purple-400/50" 
                      : "w-1.5 bg-white/30 hover:bg-white/50"
                  }`}
                  title={`ดูภาพที่ ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ========================================================
            6. RIGHT-SIDE VERTICAL INTERACTIONS TRAY
           ======================================================== */}
        <div className="absolute bottom-0 right-0 z-30 p-4 pb-8 flex flex-col items-center gap-5 pointer-events-auto">
          
          {/* Bouncing Heart (Like) Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={handleLike}
              className={`flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition-all active:scale-75 shadow-lg cursor-pointer ${
                isLiked 
                  ? "bg-rose-500 border-rose-400 text-white shadow-rose-500/30 scale-105" 
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              }`}
            >
              <Heart className={`h-4.5 w-4.5 ${isLiked ? "fill-white animate-pulse" : ""}`} />
            </button>
            <span className="text-[8px] font-extrabold tracking-wider drop-shadow-md">{currentLikeCount.toLocaleString()}</span>
          </div>

          {/* Share (Copy Link) Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={handleShare}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-75 shadow-lg cursor-pointer"
              title="คัดลอกลิงก์แชร์"
            >
              <Share2 className="h-4.5 w-4.5" />
            </button>
            <span className="text-[8px] font-extrabold tracking-wider drop-shadow-md">แชร์ภาพ</span>
          </div>

          {/* Auto-Next Toggle (Loop vs Auto-scroll) */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsAutoPlayNext(!isAutoPlayNext);
              }}
              className={`flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition-all active:scale-75 shadow-lg cursor-pointer ${
                isAutoPlayNext 
                  ? "bg-purple-600 border-purple-400 text-white shadow-purple-500/30" 
                  : "bg-white/10 border-white/20 text-slate-400 hover:text-white"
              }`}
              title="เล่นไฟล์ถัดไปอัตโนมัติ"
            >
              <RotateCw className={`h-4.5 w-4.5 ${isAutoPlayNext ? "animate-spin-slow" : ""}`} />
            </button>
            <span className="text-[7px] font-black tracking-widest uppercase drop-shadow-md">
              {isAutoPlayNext ? "Auto ON" : "Auto OFF"}
            </span>
          </div>

          {/* Mute/Unmute (Only visible if current media is video) */}
          {isCurrentMediaVideo && (
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={handleToggleMute}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-75 shadow-lg cursor-pointer"
              >
                {isMuted ? <VolumeX className="h-4.5 w-4.5 text-purple-400" /> : <Volume2 className="h-4.5 w-4.5" />}
              </button>
              <span className="text-[8px] font-extrabold tracking-wider drop-shadow-md">
                {isMuted ? "ปิดเสียง" : "เปิดเสียง"}
              </span>
            </div>
          )}

          {/* Glowing LINE CTA Button */}
          <div className="flex flex-col items-center gap-1 mt-1">
            <a
              href="https://line.me/R/ti/p/@std-dentallab"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 border border-purple-300 text-slate-950 font-black shadow-lg shadow-purple-500/30 transition-all hover:scale-105 active:scale-75 scale-105 cursor-pointer animate-pulse"
            >
              <PhoneCall className="h-5 w-5 text-white" />
            </a>
            <span className="text-[7px] font-black tracking-widest text-purple-400 drop-shadow-md uppercase mt-1">ติดต่อ LINE</span>
          </div>
        </div>

        {/* ========================================================
            7. MOBILE/ON-SCREEN VIDEO UNMUTE POPUPS
           ======================================================== */}
        <AnimatePresence>
          {showUnmutePrompt && isCurrentMediaVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleTapToUnmute}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/20 cursor-pointer"
            >
              <div className="flex items-center gap-2 rounded-full border border-purple-200 bg-white/95 px-5 py-3 text-[10px] font-black text-purple-700 shadow-2xl animate-pulse">
                <Volume1 className="h-4.5 w-4.5 animate-bounce" />
                แตะเพื่อเปิดเสียง / Tap to Unmute
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ========================================================
          8. MICRO-INTERACTION NOTIFICATIONS
         ======================================================== */}
      <AnimatePresence>
        {showShareNotification && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 z-50 rounded-full border border-purple-200 bg-white/95 px-5 py-2.5 text-xs font-extrabold text-purple-800 shadow-2xl backdrop-blur-md flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4 text-purple-500 animate-spin" />
            คัดลอกลิงก์แชร์รหัสนี้เรียบร้อย!
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
