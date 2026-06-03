# 🚀 Master AI Prompt: Premium Instagram Reels-Style Video Catalog Web App (Pastel Theme)

Copy and paste this entire document directly into any AI Assistant (Claude, ChatGPT, etc.) to completely scaffold and build this premium, ultra-high-performance single-page Next.js web application from scratch.

---

## 📌 1. Project Overview & Objectives
**Role:** You are an Expert Frontend Developer specializing in React, Next.js (App Router), Tailwind CSS, and Framer Motion animations.
**Task:** Build an ultra-lightweight, blazing-fast single-page video catalog web application for **S.T.D. DENTAL LAB LIMITED PARTNERSHIP**.
**Design Concept:** The app layout is modeled exactly after **Instagram Reels / TikTok**. It displays a full-viewport vertical video player that automatically scales to cover the mobile screen.
**Core Features:**
1. **Dynamic Video Mapping:** Preload a mapping catalog for **STDR01 to STDR40** products. Expose them through query parameters (e.g. `?v=stdr18`).
2. **Auto-Play Next on Ended:** When a video ends, the player automatically increments to the next product (STDR01 -> STDR02 ... up to STDR40) and plays it immediately.
3. **Smooth URL Synchronization:** As the videos transition, programmatically update the browser URL in real time without refreshing the page (`window.history.pushState`), so that sharing the link opens the exact product the customer was watching.
**Strict Constraint - Extreme Performance:** Do NOT use any heavy 3D or WebAR engines (no Three.js, A-Frame, or MindAR) to ensure the page size is extremely small and loads in **under 0.5 seconds** over standard mobile 3G/4G/5G cellular data.

---

## 🎨 2. Design Aesthetics & Branding (Bright Purple Pastel Theme)
- **Theme:** Instagram Reels vertical viewport cover. Floating panels use a premium milky-white frosted glassmorphism (`bg-white/10 backdrop-blur-md border border-white/20 text-white`).
- **Profile overlay (Bottom-Left):** Frosted S.T.D. Dental Lab avatar circle, verified badge, `@std_dentallab` brand tag, dynamic product titles, and clinical descriptions.
- **Vertical Interaction Bar (Bottom-Right):** A vertical tray containing circular interactive buttons:
  - **Like & Share buttons:** Bouncing heart counts and instant link clipboard-copy features.
  - **Auto-Play Next switcher:** A toggle button to turn auto-play on or off.
  - **Mute/Unmute toggle:** Standard audio control.
  - **Line Order CTA:** A pulsing, glowing purple LINE icon with a badge "สั่งทำ" (Order) that converts customers instantly.

---

## 📱 3. Core Mobile Browser UX Bypass (Autoplay Constraint)
Modern mobile browsers (iOS Safari, Android Chrome) strictly block videos with audio from playing automatically. To guarantee a 100% successful autoplay on scan:
1. Initialize the HTML5 `<video>` tag with **hardware-acceleration** and **muted autoplay** attributes: `autoPlay`, `loop`, `muted`, `playsInline`, `webkit-playsinline="true"`.
2. Overlay a bouncing, pulsing glassmorphic floating pill **"แตะเพื่อเปิดเสียง / Tap to Unmute"** over the center of the video player.
3. When the user taps *anywhere* on the screen or the pill:
   - Programmatically set `video.muted = false`.
   - Smoothly fade out the unmute prompt badge.
   - Ensure the video continues playing smoothly with full audio.

---

## 🛠 4. Tech Stack & Dependencies
- **Framework:** Next.js (App Router, Tailwind CSS v4)
- **Animation:** `framer-motion` (for smooth glassmorphic overlay transitions and bouncing effects)
- **Icons:** `lucide-react` (for clinical player controls)

Run these install commands to set up the project:
```bash
npx -y create-next-app@latest std-instant-video-catalog --typescript --tailwind --app --src-dir --import-alias "@/*" --use-npm --yes --disable-git
cd std-instant-video-catalog
npm install framer-motion lucide-react
```

---

## 📂 5. Directory Structure & Asset Placement
1. Save the catalog video file (compressed MP4, H.264/AAC under 3-5MB) as:
   `/public/videos/retainer-promo.mp4`
2. Implement the following files exactly in the `/src` directory:

---

## 💻 6. Full Source Code (Copy-Pasteable)

### 📄 File 1: `src/app/layout.tsx`
Create the global layout wrapping structure with full viewport constraints:

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "S.T.D. Dental Lab | Premium Orthodontic Video Catalog",
  description: "Welcome to S.T.D. Dental Lab Limited Partnership. Scan the catalog QR Code to watch our premium orthodontic retainer showcase video instantly with zero loading times.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased light`}
    >
      <body className="min-h-full bg-purple-50 text-slate-800 flex flex-col overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
```

---

### 📄 File 2: `src/app/page.tsx`
Create the high-performance client-side player component implementing all control bars and unmute overlays:

```typescript
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
  Sparkles, 
  Volume1, 
  Plus, 
  RotateCw,
  Eye
} from "lucide-react";

// ========================================================
// 📦 40 DYNAMIC RETAINER MODELS MAPPING CATALOG
// ========================================================
interface CatalogItem {
  id: string;
  name: string;
  description: string;
  videoSrc: string;
  badge: string;
  likes: number;
  views: number;
}

const DEFAULT_ITEM: CatalogItem = {
  id: "default",
  name: "รีเทนเนอร์เกรดพรีเมียม S.T.D. DENTAL LAB",
  description: "พบกับผลิตภัณฑ์รีเทนเนอร์คุณภาพสูงทางการแพทย์ ผลิตด้วยเทคโนโลยีล้ำสมัยจากแล็บทันตกรรมชั้นนำ แข็งแรง ยืดหยุ่นสูง เพื่อรอยยิ้มที่มั่นใจของคุณในทุกๆ วัน",
  videoSrc: "/videos/retainer-promo.mp4",
  badge: "Premium Catalog",
  likes: 1248,
  views: 8942
};

// Generates 40 items representing STDR01 to STDR40 dynamically with specific customized clinical values
const generateCatalog = (): Record<string, CatalogItem> => {
  const catalog: Record<string, CatalogItem> = {};
  
  for (let i = 1; i <= 40; i++) {
    const idStr = i < 10 ? `0${i}` : `${i}`;
    const id = `stdr${idStr}`;
    
    // Customize specific highlights based on collections
    let badge = "All New Collection";
    let desc = `รีเทนเนอร์เกรดการแพทย์พรีเมียมรหัส ${id.toUpperCase()} ผลิตด้วยเครื่องพิมพ์ 3 มิติและวัสดุนำเข้าหนาพิเศษ ทนแรงบดเคี้ยวได้ดีเยี่ยม สวมใส่สบายเรียบเนียนไปกับผิวฟัน`;
    
    if (i > 30) {
      badge = "Classic Collection";
      desc = `รีเทนเนอร์ลายลวดระดับคลาสสิกรหัส ${id.toUpperCase()} โครงสร้างสแตนเลสเครื่องมือแพทย์ ผสานฐานอะคริลิกหล่อพิเศษ แข็งแรงทนทาน ปรับลวดง่าย รองรับการตกแต่งดีไซน์ทุกรูปแบบ`;
    }

    catalog[id] = {
      id: id,
      name: `รีเทนเนอร์พรีเมียม รหัส ${id.toUpperCase()}`,
      description: desc,
      videoSrc: `/videos/${id}.mp4`,
      badge: badge,
      likes: Math.floor(Math.random() * 800) + 150,
      views: Math.floor(Math.random() * 5000) + 2000
    };
  }
  
  return catalog;
};

const VIDEO_CATALOG = generateCatalog();

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showUnmutePrompt, setShowUnmutePrompt] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isAutoPlayNext, setIsAutoPlayNext] = useState(true);

  // Likes & Shares animation state
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showShareNotification, setShowShareNotification] = useState(false);

  // Dynamic state for active video item
  const [activeItem, setActiveItem] = useState<CatalogItem>(DEFAULT_ITEM);
  const [activeId, setActiveId] = useState<string>("default");

  // Client-side mounting & Search params extraction
  useEffect(() => {
    setIsMounted(true);

    const searchParams = new URLSearchParams(window.location.search);
    const vParam = searchParams.get("v")?.toLowerCase() || "";
    
    if (vParam && VIDEO_CATALOG[vParam]) {
      const item = VIDEO_CATALOG[vParam];
      setActiveItem(item);
      setActiveId(vParam);
      setLikeCount(item.likes);
    } else {
      setActiveItem(DEFAULT_ITEM);
      setActiveId("default");
      setLikeCount(DEFAULT_ITEM.likes);
    }
  }, []);

  // Handle Autoplay & Dynamic Video Sync
  useEffect(() => {
    if (!isMounted) return;

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

    // Attempt autoplay
    video.play().catch(() => {
      console.log("Autoplay blocked. Awaiting user interaction.");
      setIsPlaying(false);
    });

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolumeChange);
    };
  }, [isMounted, activeItem]);

  // IG Reels Style Auto-Play Next on Ended Event
  const handleVideoEnded = () => {
    if (!isAutoPlayNext) return;

    const currentIndex = activeId === "default" ? 0 : parseInt(activeId.replace("stdr", "")) || 1;
    const nextIndex = (currentIndex % 40) + 1;
    const nextIdStr = nextIndex < 10 ? `0${nextIndex}` : `${nextIndex}`;
    const nextId = `stdr${nextIdStr}`;

    navigateToItem(nextId);
  };

  // Navigation Helper that dynamically syncs standard browser URLs
  const navigateToItem = (id: string) => {
    if (!VIDEO_CATALOG[id]) return;

    const item = VIDEO_CATALOG[id];
    setActiveItem(item);
    setActiveId(id);
    setLikeCount(item.likes);
    setLiked(false);

    const newUrl = `${window.location.pathname}?v=${id}`;
    window.history.pushState({ path: newUrl }, "", newUrl);

    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  };

  const handleNextVideo = () => {
    const currentIndex = activeId === "default" ? 0 : parseInt(activeId.replace("stdr", "")) || 1;
    const nextIndex = (currentIndex % 40) + 1;
    const nextIdStr = nextIndex < 10 ? `0${nextIndex}` : `${nextIndex}`;
    navigateToItem(`stdr${nextIdStr}`);
  };

  const handlePrevVideo = () => {
    const currentIndex = activeId === "default" ? 1 : parseInt(activeId.replace("stdr", "")) || 1;
    const prevIndex = currentIndex === 1 ? 40 : currentIndex - 1;
    const prevIdStr = prevIndex < 10 ? `0${prevIndex}` : `${prevIndex}`;
    navigateToItem(`stdr${prevIdStr}`);
  };

  const handleTogglePlay = () => {
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
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
    if (!video.muted) {
      setShowUnmutePrompt(false);
    }
  };

  const handleTapToUnmute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering play/pause toggle
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    setIsMuted(false);
    setShowUnmutePrompt(false);
    video.play().catch(() => {});
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShowShareNotification(true);
      setTimeout(() => setShowShareNotification(false), 2000);
    });
  };

  if (!isMounted) return null;

  const videoSource = activeId === "default" ? "/videos/retainer-promo.mp4" : activeItem.videoSrc;

  return (
    <main className="relative flex flex-1 h-screen w-screen bg-slate-950 overflow-hidden select-none font-sans text-white">
      
      {/* 1. VERTICAL FULL-SCREEN VIDEO CANVAS (Reels Layer) */}
      <div 
        onClick={handleTogglePlay}
        className="absolute inset-0 h-full w-full bg-slate-950 flex items-center justify-center cursor-pointer"
      >
        <video
          key={videoSource}
          ref={videoRef}
          src={videoSource}
          loop={!isAutoPlayNext}
          autoPlay
          muted={isMuted}
          playsInline
          webkit-playsinline="true"
          onEnded={handleVideoEnded}
          className="h-full w-full object-cover sm:object-contain bg-slate-950"
          onError={(e) => {
            console.log("Custom video clip not found, falling back to promotional video.");
            if (videoRef.current && videoRef.current.src !== "/videos/retainer-promo.mp4") {
              videoRef.current.src = "/videos/retainer-promo.mp4";
              videoRef.current.play().catch(() => {});
            }
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950/80 pointer-events-none" />
      </div>

      {/* 2. TOP HEADER OVERLAY (Logo & Controls) */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-start justify-between p-4 sm:p-6 pointer-events-none">
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur-md shadow-lg">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-ping" />
            <span className="text-[9px] font-black tracking-widest uppercase text-slate-100">
              {activeItem.badge}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevVideo}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 border border-white/15 text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-90 cursor-pointer"
              title="Previous Video"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextVideo}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 border border-white/15 text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-90 cursor-pointer"
              title="Next Video"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-end rounded-2xl border border-white/20 bg-white/10 p-3.5 text-right backdrop-blur-md shadow-2xl pointer-events-auto">
          <span className="text-xs font-black tracking-widest text-purple-400">S.T.D.</span>
          <span className="text-[9px] font-extrabold tracking-widest text-slate-100 uppercase mt-0.5">
            DENTAL LAB
          </span>
          <span className="text-[7px] text-slate-300 font-semibold tracking-wider uppercase mt-1">
            LIMITED PARTNERSHIP
          </span>
        </div>
      </header>

      {/* 3. BOTTOM-LEFT PRODUCT DESCRIPTION OVERLAY (IG Style) */}
      <div className="absolute bottom-0 left-0 w-full sm:w-[75%] z-20 p-5 sm:p-8 flex flex-col gap-3.5 text-white pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-purple-400 bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-md">
            <span className="text-xs font-black text-slate-950">STD</span>
            <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-purple-400 border border-slate-950 text-slate-950">
              <Plus className="h-2 w-2 stroke-[4px]" />
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wider text-slate-100">@std_dentallab</span>
              <span className="rounded bg-purple-400/20 border border-purple-400/30 px-1 py-0.2 text-[7px] font-black text-purple-300 tracking-widest uppercase">Verified</span>
            </div>
            <span className="text-[9px] text-slate-300 mt-0.5 flex items-center gap-1 font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0" />
              Orthodontic Specialists
            </span>
          </div>
        </div>

        <h2 className="text-lg font-black tracking-wide text-white drop-shadow-md pointer-events-auto">
          {activeItem.name}
        </h2>

        <p className="text-xs text-slate-200 leading-relaxed font-semibold max-w-md drop-shadow-sm pointer-events-auto">
          {activeItem.description}
        </p>

        <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-300 bg-white/5 border border-white/10 rounded-full px-2.5 py-1 w-max pointer-events-auto backdrop-blur-sm">
          <Eye className="h-3 w-3 text-purple-400" />
          <span>ยอดเข้าชม {activeItem.views.toLocaleString()} ครั้ง</span>
        </div>
      </div>

      {/* 4. RIGHT-SIDE VERTICAL INTERACTIONS TRAY (IG Style) */}
      <div className="absolute bottom-0 right-0 z-30 p-5 sm:p-8 flex flex-col items-center gap-6 pointer-events-auto">
        <AnimatePresence>
          {showUnmutePrompt && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute bottom-60 right-20 z-40 hidden sm:flex items-center gap-2 rounded-full border border-purple-300 bg-white/95 px-5 py-3 text-[10px] font-black text-purple-700 shadow-2xl backdrop-blur-md whitespace-nowrap animate-pulse"
            >
              <VolumeX className="h-4 w-4 animate-bounce" />
              คลิกเพื่อเปิดเสียงวีดีโอ!
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleLike}
            className={`flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur-md transition-all active:scale-75 shadow-lg cursor-pointer ${
              liked 
                ? "bg-rose-500 border-rose-400 text-white shadow-rose-500/30 scale-105" 
                : "bg-white/10 border-white/20 text-white hover:bg-white/20"
            }`}
          >
            <Heart className={`h-5 w-5 ${liked ? "fill-white animate-pulse" : ""}`} />
          </button>
          <span className="text-[9px] font-extrabold tracking-wider drop-shadow-md">{likeCount.toLocaleString()}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleShare}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-75 shadow-lg cursor-pointer"
            title="Copy URL"
          >
            <Share2 className="h-5 w-5" />
          </button>
          <span className="text-[9px] font-extrabold tracking-wider drop-shadow-md">แชร์คลิม</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsAutoPlayNext(!isAutoPlayNext);
            }}
            className={`flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur-md transition-all active:scale-75 shadow-lg cursor-pointer ${
              isAutoPlayNext 
                ? "bg-purple-600 border-purple-400 text-white shadow-purple-500/30" 
                : "bg-white/10 border-white/20 text-slate-400 hover:text-white"
            }`}
            title="Auto Play Next"
          >
            <RotateCw className={`h-5 w-5 ${isAutoPlayNext ? "animate-spin-slow" : ""}`} />
          </button>
          <span className="text-[8px] font-black tracking-widest uppercase drop-shadow-md">
            {isAutoPlayNext ? "Auto ON" : "Auto OFF"}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleToggleMute}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-75 shadow-lg cursor-pointer"
          >
            {isMuted ? <VolumeX className="h-5 w-5 text-purple-400" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <span className="text-[9px] font-extrabold tracking-wider drop-shadow-md">
            {isMuted ? "ปิดเสียง" : "เปิดเสียง"}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1 mt-2">
          <a
            href="https://line.me/R/ti/p/@std-dentallab"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 border border-purple-300 text-slate-950 font-black shadow-lg shadow-purple-500/30 transition-all hover:scale-105 active:scale-75 scale-110 cursor-pointer animate-pulse"
          >
            <PhoneCall className="h-6 w-6 text-white" />
          </a>
          <span className="text-[8px] font-black tracking-widest text-purple-400 drop-shadow-md uppercase mt-1">ติดต่อ LINE</span>
        </div>
      </div>

      {/* 5. MICRO-INTERACTION NOTIFICATIONS */}
      <AnimatePresence>
        {showShareNotification && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-50 rounded-full border border-purple-200 bg-white/95 px-5 py-2.5 text-xs font-extrabold text-purple-800 shadow-2xl backdrop-blur-md flex items-center gap-2"
          >
            <Sparkles className="h-4.5 w-4.5 text-purple-500 animate-spin" />
            คัดลอกลิงก์แคตตาล็อกรุ่นนี้เรียบร้อย!
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUnmutePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleTapToUnmute}
            className="absolute inset-0 z-10 sm:hidden flex flex-col items-center justify-center bg-slate-950/20 cursor-pointer"
          >
            <div className="flex items-center gap-2 rounded-full border border-purple-200 bg-white/95 px-5 py-3 text-[10px] font-black text-purple-700 shadow-2xl animate-pulse">
              <Volume1 className="h-4.5 w-4.5 animate-bounce" />
              แตะเพื่อเปิดเสียง / Tap to Unmute
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
```

---

## 🚀 7. Step-by-Step AI Instructions
When generating this codebase, execute the following workflow:
1. **Scaffold standard structure** with TypeScript, Tailwind v4, App Router, and standard directories.
2. **Setup package scripts:** Include a `"dev:ssl": "next dev --experimental-https"` command inside `package.json` for secure local HTTPS testing.
3. **Write the files exactly as provided:** Copy-paste the exact code for `layout.tsx` and `page.tsx`.
4. **Optimize CSS layout:** In `src/app/globals.css`, configure standard Tailwind `@import "tailwindcss";`.
5. **Compile checks:** Verify that `npm run build` succeeds with zero errors and generates optimized static prerendered files.
