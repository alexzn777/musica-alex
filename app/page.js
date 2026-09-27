'use client';
import { useState, useRef, useEffect } from 'react';
import { CANCIONES } from '../canciones';

// ── SVG Icons ─────────────────────────────────────────────────────────────
const IconShuffle = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 3 21 3 21 8"/><polyline points="16 21 21 21 21 16"/>
    <line x1="4" y1="4" x2="21" y2="21"/><line x1="21" y1="4" x2="14.5" y2="10.5"/>
    <line x1="3" y1="21" x2="9.5" y2="14.5"/>
  </svg>
);
const IconPrev = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
  </svg>
);
const IconNext = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 6h2v12h-2zm-2.5 6L5 6v12z"/>
  </svg>
);
const IconPlay = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);
const IconPause = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);
const IconRepeat = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);
const IconVolume = ({ level }) => level === 0 ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
  </svg>
) : level < 50 ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconPlus = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconX = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconDisc = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9.2"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/>
  </svg>
);

export default function Home() {
  const [playlist] = useState(CANCIONES);
  const [cancionActual, setCancionActual] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [cola, setCola] = useState([]);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [volume, setVolume] = useState(80);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('playlist');
  const [toastMsg, setToastMsg] = useState('');

  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const volBarRef = useRef(null);
  const videoRef = useRef(null);

  const filteredPlaylist = playlist.filter(c =>
    c.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.artista.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (volBarRef.current) volBarRef.current.style.setProperty('--val', `${volume}%`);
  }, [volume]);

  // Paleta dinámica por canción — discreta, no neón. Cada tono es un tinte
  // apagado sobre el mismo gris base, así el acento cambia sin gritar.
  const accentColors = [
    '#B98BFF', '#FF8FB3', '#5FA8FF', '#4ADE9A', '#F2B84B',
    '#FF7A6E', '#4FD1D9', '#C79CFF', '#FF9E5C', '#3FC1B0'
  ];
  const accentColor = cancionActual
    ? accentColors[cancionActual.id % accentColors.length]
    : '#B98BFF';

  const currentIndex = cancionActual
    ? playlist.findIndex(s => s.id === cancionActual.id)
    : -1;

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const togglePlay = () => {
    if (!cancionActual) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const seleccionarCancion = (cancion) => {
    setCancionActual(cancion);
    setIsPlaying(true);
  };

  const agregarAlCola = (e, cancion) => {
    e.stopPropagation();
    setCola(prev => [...prev, cancion]);
    showToast(`"${cancion.titulo}" añadida a la cola`);
  };

  const quitarDeCola = (index) => {
    setCola(prev => prev.filter((_, i) => i !== index));
  };

  const siguienteCancion = () => {
    if (!cancionActual) return;
    if (cola.length > 0) {
      setCancionActual(cola[0]);
      setCola(prev => prev.slice(1));
      setIsPlaying(true);
      return;
    }
    if (isShuffle) {
      setCancionActual(playlist[Math.floor(Math.random() * playlist.length)]);
    } else {
      const idx = playlist.findIndex(s => s.id === cancionActual.id);
      setCancionActual(playlist[idx < playlist.length - 1 ? idx + 1 : 0]);
    }
    setIsPlaying(true);
  };

  const anteriorCancion = () => {
    if (!cancionActual) return;
    const idx = playlist.findIndex(s => s.id === cancionActual.id);
    setCancionActual(playlist[idx > 0 ? idx - 1 : playlist.length - 1]);
    setIsPlaying(true);
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const onTimeUpdate = () => {
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration || 0;
    const pct = (current / total) * 100 || 0;
    if (progressBarRef.current) {
      progressBarRef.current.value = pct;
      progressBarRef.current.style.setProperty('--val', `${pct}%`);
    }
    setCurrentTime(formatTime(current));
    if (audioRef.current.duration) setDuration(formatTime(total));
  };

  const handleProgressChange = (e) => {
    if (!cancionActual || !audioRef.current.duration) return;
    const val = parseFloat(e.target.value);
    audioRef.current.currentTime = (val / 100) * audioRef.current.duration;
    if (progressBarRef.current) progressBarRef.current.style.setProperty('--val', `${val}%`);
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol / 100;
  };

  const onEnded = () => {
    if (isRepeat) { audioRef.current.currentTime = 0; audioRef.current.play(); }
    else siguienteCancion();
  };

  useEffect(() => {
    if (audioRef.current && cancionActual) {
      audioRef.current.load();
      if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [cancionActual]);

  // Control del video de fondo para que funcione en producción
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(err => {
          console.log('Video autoplay blocked:', err);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;1,500;1,600&family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --accent: ${accentColor};
          --accent-dim: ${accentColor}22;
          --accent-mid: ${accentColor}66;
          --bg: #0b0b0d;
          --s1: #131316;
          --s2: #1a1a1e;
          --s3: #232327;
          --border: #ffffff0f;
          --tp: #eeeef0;
          --ts: #85858d;
          --tm: #3f3f45;
          --r-sm: 6px; --r-md: 10px; --r-lg: 16px;
          --ease: 0.2s cubic-bezier(0.4,0,0.2,1);
          --ease-spring: 0.45s cubic-bezier(0.16,1,0.3,1);
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
        }

        html,body { height:100%; background:var(--bg); }

        .app {
          font-family:'Inter',sans-serif;
          background:var(--bg);
          color:var(--tp);
          min-height:100vh;
          display:flex;
          flex-direction:column;
          padding-bottom:96px;
          position:relative;
          overflow-x:hidden;
        }

        .bg-glow {
          position:fixed; inset:0; pointer-events:none; z-index:0;
          background: radial-gradient(ellipse 60% 40% at 20% 0%, ${accentColor}0e 0%, transparent 65%);
          transition: background 1.1s ease;
        }

        /* DISCO CLUB NEON LIGHTS */
        .neon-lights {
          position:fixed; inset:0; pointer-events:none; z-index:1;
          overflow:hidden;
        }
        .neon-light {
          position:absolute;
          border-radius:50%;
          filter:blur(80px);
          opacity:0.6;
          animation:neonMove 8s ease-in-out infinite;
        }
        .neon-light:nth-child(1) {
          width:300px; height:300px;
          background:#ff00ff;
          top:10%; left:5%;
          animation-delay:0s;
        }
        .neon-light:nth-child(2) {
          width:250px; height:250px;
          background:#00ffff;
          top:60%; right:10%;
          animation-delay:2s;
        }
        .neon-light:nth-child(3) {
          width:200px; height:200px;
          background:#ff0080;
          bottom:20%; left:20%;
          animation-delay:4s;
        }
        .neon-light:nth-child(4) {
          width:280px; height:280px;
          background:#80ff00;
          top:30%; right:30%;
          animation-delay:6s;
        }
        @keyframes neonMove {
          0%,100% { transform:translate(0,0) scale(1); opacity:0.6; }
          25% { transform:translate(50px,30px) scale(1.1); opacity:0.8; }
          50% { transform:translate(-30px,50px) scale(0.9); opacity:0.5; }
          75% { transform:translate(-50px,-30px) scale(1.05); opacity:0.7; }
        }

        /* NEON BORDER EFFECTS */
        .neon-border {
          position:relative;
        }
        .neon-border::before {
          content:'';
          position:absolute;
          inset:-2px;
          border-radius:inherit;
          background:linear-gradient(45deg, #ff00ff, #00ffff, #ff0080, #80ff00, #ff00ff);
          background-size:400% 400%;
          animation:neonBorder 3s ease infinite;
          z-index:-1;
          opacity:0.5;
        }
        @keyframes neonBorder {
          0% { background-position:0% 50%; }
          50% { background-position:100% 50%; }
          100% { background-position:0% 50%; }
        }

        .search-input.neon-border {
          position:relative;
          z-index:1;
        }

        /* PULSE GLOW EFFECT */
        .pulse-glow {
          animation:pulseGlow 2s ease-in-out infinite;
        }
        @keyframes pulseGlow {
          0%,100% { box-shadow:0 0 20px ${accentColor}40, 0 0 40px ${accentColor}20; }
          50% { box-shadow:0 0 30px ${accentColor}60, 0 0 60px ${accentColor}30; }
        }

        /* HEADER */
        .header {
          position:relative; z-index:10;
          display:flex; align-items:center; justify-content:space-between;
          padding:20px 28px 16px;
          border-bottom:1px solid var(--border);
          background:linear-gradient(135deg, var(--s1) 0%, var(--s2) 100%);
        }
        .logo { display:flex; align-items:baseline; gap:3px; }
        .logo-text {
          font-family:'Fraunces',serif;
          font-style:italic; font-weight:500;
          font-size:1.3rem; letter-spacing:-0.01em;
          color:var(--tp);
        }
        .logo-text b { font-weight:600; color:var(--accent); transition:color 0.9s; }
        .logo-eq {
          display:flex; align-items:flex-end; gap:2px; height:12px; margin-left:9px;
        }
        .logo-eq span {
          width:2.5px; border-radius:1px; background:var(--accent);
          transition: background 0.9s, transform 0.3s;
          transform: scaleY(0.3);
        }
        .logo-eq.live span { animation: eq 0.9s ease-in-out infinite; }
        .logo-eq span:nth-child(1){height:6px;animation-delay:0s}
        .logo-eq span:nth-child(2){height:12px;animation-delay:0.2s}
        .logo-eq span:nth-child(3){height:9px;animation-delay:0.1s}
        @keyframes eq { 0%,100%{transform:scaleY(0.35)} 50%{transform:scaleY(1)} }

        .track-count { font-size:0.8rem; color:var(--ts); }
        .track-count b { color:var(--tp); font-weight:600; }

        /* SEARCH */
        .search-wrap { position:relative; z-index:10; padding:16px 28px 0; }
        .search-icon-wrap {
          position:absolute; left:44px; top:50%; transform:translateY(-50%);
          color:var(--tp); pointer-events:none; display:flex; align-items:center;
        }
        .search-input {
          width:100%; max-width:380px;
          background:var(--s3); border:1px solid var(--accent-mid);
          border-radius:var(--r-md); color:var(--tp);
          font-family:'Inter',sans-serif; font-size:0.875rem;
          padding:9px 14px 9px 38px; outline:none;
          transition:border-color var(--ease), box-shadow var(--ease);
        }
        .search-input:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-dim); }
        .search-input::placeholder { color:var(--ts); }

        /* VIDEO SHOWCASE — el único momento de escena grande de la página */
        .video-showcase {
          position:relative; z-index:5;
          margin:20px 28px 4px;
          border-radius:var(--r-lg);
          overflow:hidden;
          border:1px solid var(--border);
          background:#000;
          box-shadow: 0 1px 0 var(--border) inset;
        }
        .video-frame {
          position:relative;
          width:100%;
          aspect-ratio:16/6.2;
          background:#000;
        }
        .video-frame video {
          width:100%; height:100%; object-fit:cover; display:block;
        }
        .video-caption {
          position:absolute; left:0; right:0; bottom:0;
          padding:22px 24px;
          background:linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 65%, transparent 100%);
          pointer-events:none;
          display:flex; align-items:flex-end; justify-content:space-between; gap:16px;
        }
        .video-caption h2 {
          font-family:'Fraunces',serif; font-style:italic; font-weight:500;
          font-size:1.15rem; color:#fff; max-width:60%;
        }
        .video-caption span {
          font-size:0.72rem; color:rgba(255,255,255,0.65);
          white-space:nowrap;
        }
        @media(max-width:600px){
          .video-showcase { margin:14px 12px 4px; }
          .video-frame { aspect-ratio:16/10; }
          .video-caption h2 { font-size:0.95rem; max-width:100%; }
          .video-caption span { display:none; }
        }

        /* MAIN GRID */
        .main {
          position:relative; z-index:5;
          display:grid;
          grid-template-columns:1fr 300px;
          gap:14px;
          padding:16px 28px;
          flex:1;
        }
        @media(max-width:900px){
          .main { grid-template-columns:1fr; }
          .right-panel { order:-1; }
        }
        @media(max-width:600px){
          .main { padding:10px 12px; }
          .header { padding:16px 14px 12px; }
          .search-wrap { padding:10px 12px 0; }
          .search-icon-wrap { left:28px; }
          .app { padding-bottom:120px; }
          .footer-left,.footer-right { display:none; }
          .player-footer { grid-template-columns:1fr; height:auto; padding:10px 14px; }
        }

        /* LEFT PANEL */
        .left-panel {
          background:var(--s1); border:1px solid var(--border);
          border-radius:var(--r-lg); overflow:hidden;
          display:flex; flex-direction:column;
        }
        .panel-tabs { display:flex; border-bottom:1px solid var(--border); padding:0 18px; }
        .tab-btn {
          background:none; border:none; color:var(--ts);
          font-family:'Inter',sans-serif; font-size:0.85rem; font-weight:600;
          padding:13px 14px; cursor:pointer; position:relative;
          transition:color var(--ease); display:flex; align-items:center; gap:7px;
        }
        .tab-btn.active { color:var(--tp); }
        .tab-btn.active::after {
          content:''; position:absolute; bottom:0; left:14px; right:14px; height:2px;
          background:var(--accent); border-radius:2px 2px 0 0; transition:background 0.9s;
        }
        .tab-count {
          background:var(--s3); color:var(--ts); font-size:0.68rem; font-weight:700;
          min-width:17px; height:17px; border-radius:99px; padding:0 4px;
          display:inline-flex; align-items:center; justify-content:center;
        }
        .tab-btn.active .tab-count { background:var(--accent-dim); color:var(--accent); }

        .table-header {
          display:grid; grid-template-columns:38px 1fr 1fr 40px; gap:6px;
          padding:10px 18px; font-size:0.74rem; font-weight:500; color:var(--tm);
          border-bottom:1px solid var(--border);
        }

        .playlist-scroll { overflow-y:auto; flex:1; }
        .playlist-scroll::-webkit-scrollbar { width:3px; }
        .playlist-scroll::-webkit-scrollbar-track { background:transparent; }
        .playlist-scroll::-webkit-scrollbar-thumb { background:var(--tm); border-radius:2px; }

        .song-row {
          display:grid; grid-template-columns:38px 1fr 1fr 40px; gap:6px;
          align-items:center; padding:9px 18px 9px 14px; cursor:pointer;
          transition:background var(--ease); border-bottom:1px solid var(--border);
          position:relative; border-left:2px solid transparent;
        }
        .song-row:last-child { border-bottom:none; }
        .song-row:hover { background:var(--s2); box-shadow:0 0 15px var(--accent-dim); }
        .song-row:hover .row-num { opacity:0; }
        .song-row:hover .row-play-ico { opacity:1; }
        .song-row.active {
          background:var(--s2);
          border-left:2px solid var(--accent);
          transition: border-color 0.9s, background var(--ease);
          box-shadow:0 0 20px var(--accent-mid);
        }

        .row-num-wrap { position:relative; display:flex; align-items:center; justify-content:center; width:30px; height:30px; }
        .row-num { font-size:0.8rem; color:var(--ts); transition:opacity var(--ease); }
        .song-row.active .row-num { color:var(--accent); font-weight:700; }
        .row-play-ico { position:absolute; opacity:0; color:var(--tp); transition:opacity var(--ease); display:flex; align-items:center; }

        .row-title { font-size:0.88rem; font-weight:500; color:var(--tp); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; padding-right:6px; }
        .song-row.active .row-title { color:var(--accent); }
        .row-artist { font-size:0.8rem; color:var(--ts); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; padding-right:6px; }

        .queue-add-btn {
          width:26px; height:26px; border-radius:50%; background:none; border:1px solid var(--tm);
          color:var(--tm); display:flex; align-items:center; justify-content:center;
          cursor:pointer; opacity:0; transition:all var(--ease);
        }
        .song-row:hover .queue-add-btn { opacity:1; }
        .queue-add-btn:hover { background:var(--accent); border-color:var(--accent); color:#000; transform:scale(1.1); }

        .playing-bars { display:flex; align-items:flex-end; gap:2px; height:14px; }
        .bar { width:3px; border-radius:1px; background:var(--accent); animation:bbar 0.9s ease-in-out infinite; box-shadow:0 0 8px var(--accent); }
        .bar:nth-child(1){animation-delay:0s;height:6px}
        .bar:nth-child(2){animation-delay:0.2s;height:10px}
        .bar:nth-child(3){animation-delay:0.35s;height:7px}
        @keyframes bbar{0%,100%{transform:scaleY(0.3)}50%{transform:scaleY(1)}}

        .queue-empty, .empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:50px 20px; color:var(--tm); font-size:0.88rem; }
        .queue-item-row {
          display:flex; align-items:center; justify-content:space-between; gap:10px;
          padding:11px 18px; border-bottom:1px solid var(--border); transition:background var(--ease);
        }
        .queue-item-row:hover { background:var(--s2); }
        .queue-pos {
          width:18px; height:18px; background:var(--accent-dim); color:var(--accent);
          border-radius:50%; display:inline-flex; align-items:center; justify-content:center;
          font-size:0.62rem; font-weight:700; flex-shrink:0; margin-right:10px;
        }
        .queue-remove { background:none; border:none; color:var(--tm); cursor:pointer; padding:5px; border-radius:4px; display:flex; align-items:center; transition:color var(--ease); }
        .queue-remove:hover { color:#ef4444; }

        /* RIGHT PANEL */
        .right-panel { display:flex; flex-direction:column; gap:12px; }

        .now-playing-card {
          background:var(--s1); border:1px solid var(--border); border-radius:var(--r-lg);
          padding:24px 20px; text-align:center; position:relative; overflow:hidden;
        }
        .np-eyebrow { font-size:0.76rem; color:var(--ts); margin-bottom:18px; }

        .album-art {
          width:150px; height:150px; border-radius:50%;
          background:var(--s3); margin:0 auto 18px;
          display:flex; align-items:center; justify-content:center;
          color:var(--ts); position:relative; overflow:hidden;
          border:1px solid var(--border);
          box-shadow:0 12px 30px rgba(0,0,0,0.45), 0 0 25px var(--accent-dim);
          transition:box-shadow 0.3s ease;
        }
        .album-art.playing {
          box-shadow:0 12px 30px rgba(0,0,0,0.45), 0 0 40px var(--accent-mid), 0 0 60px var(--accent-dim);
        }
        .album-art .disc-spin { display:flex; transition:transform 0.4s; }
        .album-art.playing .disc-spin { animation: spin 6s linear infinite; }
        @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }

        .np-title-wrap { min-height:30px; }
        .np-title {
          font-family:'Fraunces',serif; font-style:italic; font-weight:500;
          font-size:1.15rem; color:var(--tp); margin-bottom:4px;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
          animation: trackIn 0.4s var(--ease-spring);
        }
        @keyframes trackIn { from{opacity:0; transform:translateY(4px)} to{opacity:1; transform:translateY(0)} }
        .np-artist { font-size:0.82rem; color:var(--ts); }

        .stats-card { background:var(--s1); border:1px solid var(--border); border-radius:var(--r-lg); padding:18px 20px; }
        .stats-title { font-size:0.76rem; color:var(--ts); margin-bottom:12px; }
        .stat-row { display:flex; justify-content:space-between; align-items:center; padding:7px 0; border-bottom:1px solid var(--border); font-size:0.83rem; }
        .stat-row:last-child { border-bottom:none; }
        .stat-label { color:var(--ts); }
        .stat-value { font-weight:600; color:var(--tp); }
        .stat-value.accented { color:var(--accent); transition:color 0.9s; }

        /* FOOTER */
        .player-footer {
          position:fixed; bottom:0; left:0; right:0; height:88px;
          background:rgba(10,10,12,0.92);
          backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
          border-top:1px solid var(--border);
          display:grid; grid-template-columns:1fr 1fr 1fr; align-items:center;
          padding:0 22px; z-index:100;
        }
        .footer-left { display:flex; align-items:center; gap:11px; min-width:0; }
        .footer-art {
          width:42px; height:42px; border-radius:8px; background:var(--s3); flex-shrink:0;
          display:flex; align-items:center; justify-content:center; color:var(--ts);
          border:1px solid var(--border); position:relative; overflow:hidden;
        }
        .footer-meta { min-width:0; }
        .footer-title { font-size:0.83rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .footer-artist { font-size:0.73rem; color:var(--ts); }

        .footer-center { display:flex; flex-direction:column; align-items:center; gap:5px; justify-self:center; width:100%; max-width:460px; }
        .controls { display:flex; align-items:center; gap:14px; }
        .ctrl-btn {
          background:none; border:none; color:var(--ts); cursor:pointer; padding:5px; border-radius:6px;
          display:flex; align-items:center; justify-content:center;
          transition:color var(--ease), transform var(--ease);
        }
        .ctrl-btn:hover { color:var(--tp); transform:scale(1.08); }
        .ctrl-btn.active { color:var(--accent); }
        .play-btn {
          width:36px; height:36px; border-radius:50%; background:var(--tp); border:none;
          display:flex; align-items:center; justify-content:center; cursor:pointer; color:#000;
          transition:transform 0.15s var(--ease-spring);
        }
        .play-btn:active { transform:scale(0.92); }

        .progress-row { display:flex; align-items:center; gap:8px; width:100%; }
        .time-lbl { font-size:0.68rem; color:var(--tm); min-width:28px; text-align:center; }

        .am-slider {
          flex:1; -webkit-appearance:none; appearance:none;
          height:3px; border-radius:99px; outline:none; cursor:pointer;
          background:linear-gradient(to right, var(--accent) 0%, var(--accent) var(--val,0%), var(--s3) var(--val,0%), var(--s3) 100%);
          transition:height var(--ease), background-color 0.9s;
        }
        .am-slider:hover { height:5px; }
        .am-slider::-webkit-slider-thumb {
          -webkit-appearance:none; appearance:none; width:12px; height:12px; border-radius:50%;
          background:var(--tp); cursor:pointer; opacity:0; transition:opacity var(--ease);
        }
        .am-slider:hover::-webkit-slider-thumb { opacity:1; }
        .am-slider::-moz-range-thumb { width:12px; height:12px; border-radius:50%; background:var(--tp); border:none; cursor:pointer; }

        .footer-right { display:flex; align-items:center; justify-content:flex-end; }
        .volume-row { display:flex; align-items:center; gap:8px; }
        .vol-ico { display:flex; align-items:center; color:var(--ts); }
        .vol-slider { width:82px; --val:80%; }

        .toast {
          position:fixed; bottom:104px; left:50%; transform:translateX(-50%) translateY(8px);
          background:var(--s3); border:1px solid var(--border); color:var(--tp);
          font-size:0.8rem; font-weight:500; padding:9px 16px; border-radius:99px;
          z-index:200; pointer-events:none; box-shadow:0 8px 24px rgba(0,0,0,0.4);
          white-space:nowrap; opacity:0; transition:all 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .toast.show { opacity:1; transform:translateX(-50%) translateY(0); }
      `}</style>

      <div className="app">
        <div className="bg-glow" />
        <div className="neon-lights">
          <div className="neon-light" />
          <div className="neon-light" />
          <div className="neon-light" />
          <div className="neon-light" />
        </div>

        {/* HEADER */}
        <header className="header">
          <div className="logo">
            <span className="logo-text">alexander<b>_music</b></span>
            <span className={`logo-eq ${isPlaying ? 'live' : ''}`}>
              <span /><span /><span />
            </span>
          </div>
          <span className="track-count"><b>{playlist.length}</b> canciones</span>
        </header>

        {/* SEARCH */}
        <div className="search-wrap">
          <span className="search-icon-wrap"><IconSearch /></span>
          <input
            className="search-input"
            placeholder="Buscar canciones o artistas..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* VIDEO SHOWCASE ---------------------------------------------------
            1) Sube tu archivo de video a la carpeta /public de tu proyecto
               Next.js, por ejemplo: /public/video-presentacion.mp4
            2) Cambia el src de abajo por esa ruta, siempre empezando con "/"
               (todo lo que está en /public se sirve desde la raíz del sitio).
            3) Opcional: agrega un poster (imagen de portada) en /public y
               referencia su ruta en el atributo poster del <video>.
        ------------------------------------------------------------------ */}
        <section className="video-showcase neon-border">
          <div className="video-frame">
            <video controls playsInline preload="metadata" poster="/video-poster.jpg">
              <source src="/video-presentacion.mp4" type="video/mp4" />
            </video>
            <div className="video-caption">
              <h2>Detrás de la música</h2>
              <span>alexander_music</span>
            </div>
          </div>
        </section>

        {/* MAIN */}
        <main className="main">
          {/* LEFT */}
          <div className="left-panel neon-border">
            <div className="panel-tabs">
              <button className={`tab-btn ${activeTab === 'playlist' ? 'active' : ''}`} onClick={() => setActiveTab('playlist')}>
                Playlist <span className="tab-count">{filteredPlaylist.length}</span>
              </button>
              <button className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`} onClick={() => setActiveTab('queue')}>
                Cola <span className="tab-count">{cola.length}</span>
              </button>
            </div>

            {activeTab === 'playlist' && (
              <>
                <div className="table-header">
                  <span style={{ textAlign: 'center' }}>#</span>
                  <span>Título</span>
                  <span>Artista</span>
                  <span />
                </div>
                <div className="playlist-scroll">
                  {filteredPlaylist.length === 0 ? (
                    <div className="empty-state"><span>No se encontraron canciones</span></div>
                  ) : filteredPlaylist.map((cancion, index) => {
                    const isActive = cancionActual?.id === cancion.id;
                    return (
                      <div
                        key={cancion.id}
                        className={`song-row ${isActive ? 'active' : ''}`}
                        onClick={() => seleccionarCancion(cancion)}
                      >
                        <div className="row-num-wrap">
                          {isActive && isPlaying ? (
                            <div className="playing-bars"><div className="bar"/><div className="bar"/><div className="bar"/></div>
                          ) : (
                            <>
                              <span className="row-num">{index + 1}</span>
                              <span className="row-play-ico"><IconPlay /></span>
                            </>
                          )}
                        </div>
                        <span className="row-title">{cancion.titulo}</span>
                        <span className="row-artist">{cancion.artista}</span>
                        <button className="queue-add-btn" onClick={(e) => agregarAlCola(e, cancion)} title="Añadir a la cola">
                          <IconPlus />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {activeTab === 'queue' && (
              <div className="playlist-scroll">
                {cola.length === 0 ? (
                  <div className="queue-empty">
                    <span>Tu cola está vacía</span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--tm)' }}>Añade canciones con el botón +</span>
                  </div>
                ) : cola.map((c, i) => (
                  <div key={i} className="queue-item-row">
                    <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                      <span className="queue-pos">{i + 1}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.titulo}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ts)' }}>{c.artista}</div>
                      </div>
                    </div>
                    <button className="queue-remove" onClick={() => quitarDeCola(i)} title="Quitar"><IconX /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="right-panel">
            <div className="now-playing-card neon-border pulse-glow">
              <div className="np-eyebrow">Reproduciendo ahora</div>
              <div className={`album-art ${isPlaying ? 'playing' : ''}`}>
                <video 
                  ref={videoRef}
                  src="/video_goku.mp4" 
                  loop 
                  muted 
                  playsInline
                  preload="auto"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              </div>
              <div className="np-title-wrap">
                <div className="np-title" key={cancionActual?.id ?? 'none'}>
                  {cancionActual ? cancionActual.titulo : 'Elige una canción'}
                </div>
                <div className="np-artist">{cancionActual ? cancionActual.artista : 'Tu biblioteca te espera'}</div>
              </div>
            </div>

            <div className="stats-card neon-border">
              <div className="stats-title">Sesión</div>
              <div className="stat-row"><span className="stat-label">Total canciones</span><span className="stat-value">{playlist.length}</span></div>
              <div className="stat-row"><span className="stat-label">En cola</span><span className="stat-value">{cola.length}</span></div>
              <div className="stat-row"><span className="stat-label">Modo</span>
                <span className="stat-value accented">{isShuffle ? 'Shuffle' : isRepeat ? 'Repeat' : 'Normal'}</span>
              </div>
              {cancionActual && (
                <div className="stat-row"><span className="stat-label">Pista</span><span className="stat-value">{currentIndex + 1} / {playlist.length}</span></div>
              )}
            </div>
          </div>
        </main>

        <audio ref={audioRef} onTimeUpdate={onTimeUpdate} onEnded={onEnded}>
          {cancionActual && <source src={cancionActual.url} type="audio/mpeg" />}
        </audio>

        {/* FOOTER */}
        <footer className="player-footer neon-border">
          <div className="footer-left">
            {cancionActual && (
              <>
                <div className="footer-art"><IconDisc /></div>
                <div className="footer-meta">
                  <div className="footer-title">{cancionActual.titulo}</div>
                  <div className="footer-artist">{cancionActual.artista}</div>
                </div>
              </>
            )}
          </div>

          <div className="footer-center">
            <div className="controls">
              <button className={`ctrl-btn ${isShuffle ? 'active' : ''}`} onClick={() => setIsShuffle(!isShuffle)} title="Shuffle">
                <IconShuffle active={isShuffle} />
              </button>
              <button className="ctrl-btn" onClick={anteriorCancion} title="Anterior"><IconPrev /></button>
              <button className="play-btn" onClick={togglePlay} title={isPlaying ? 'Pausar' : 'Reproducir'}>
                {isPlaying ? <IconPause /> : <IconPlay />}
              </button>
              <button className="ctrl-btn" onClick={siguienteCancion} title="Siguiente"><IconNext /></button>
              <button className={`ctrl-btn ${isRepeat ? 'active' : ''}`} onClick={() => setIsRepeat(!isRepeat)} title="Repetir">
                <IconRepeat active={isRepeat} />
              </button>
            </div>
            <div className="progress-row">
              <span className="time-lbl">{currentTime}</span>
              <input
                ref={progressBarRef}
                type="range" min="0" max="100" defaultValue="0"
                onChange={handleProgressChange}
                className="am-slider"
                style={{ '--val': '0%' }}
              />
              <span className="time-lbl">{duration}</span>
            </div>
          </div>

          <div className="footer-right">
            <div className="volume-row">
              <span className="vol-ico"><IconVolume level={Number(volume)} /></span>
              <input
                ref={volBarRef}
                type="range" min="0" max="100" defaultValue="80"
                onChange={handleVolumeChange}
                className="am-slider vol-slider"
                style={{ '--val': '80%' }}
              />
            </div>
          </div>
        </footer>

        <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
      </div>
    </>
  );
}