export function MarketingOrchestrationVisual() {
  return (
    <div className="relative isolate min-h-[23rem] overflow-hidden rounded-5xl border border-canvas-line/80 bg-gradient-to-br from-white via-canvas-raised to-brand-50 p-6 shadow-panel-lg">
      <div className="absolute inset-0 bg-spotlight-grid bg-[size:32px_32px] opacity-30" />
      <div className="absolute -start-10 top-8 h-40 w-40 rounded-full bg-brand-100/80 blur-3xl animate-pulse-soft" />
      <div className="absolute end-2 top-6 h-32 w-32 rounded-full bg-ai-100/70 blur-3xl animate-float-soft" />
      <div className="absolute bottom-8 start-1/4 h-28 w-28 rounded-full bg-sand-100/70 blur-3xl animate-pulse-soft" />

      <svg aria-hidden="true" className="relative z-10 h-full w-full" viewBox="0 0 520 360" fill="none">
        <path d="M70 88h148c17 0 30 13 30 30v74c0 17-13 30-30 30H70c-17 0-30-13-30-30v-74c0-17 13-30 30-30Z" fill="url(#panelA)" stroke="#CFE3DC" />
        <path d="M302 52h148c17 0 30 13 30 30v74c0 17-13 30-30 30H302c-17 0-30-13-30-30V82c0-17 13-30 30-30Z" fill="url(#panelB)" stroke="#CDD8F9" />
        <path d="M202 228h148c17 0 30 13 30 30v50c0 17-13 30-30 30H202c-17 0-30-13-30-30v-50c0-17 13-30 30-30Z" fill="url(#panelC)" stroke="#EAD8B6" />

        <path d="M248 145h30m-15-15v30" stroke="#2F8373" strokeLinecap="round" strokeWidth="6" />
        <path d="M248 145h22c24 0 44-20 44-44v-7" stroke="#90AADF" strokeWidth="5" strokeDasharray="8 10" />
        <path d="M248 145h-22c-24 0-44 20-44 44v15" stroke="#7FC3B1" strokeWidth="5" strokeDasharray="8 10" />
        <path d="M334 186v18c0 21-17 38-38 38h-18" stroke="#D7B97E" strokeWidth="5" strokeDasharray="8 10" />

        <circle cx="122" cy="125" r="32" fill="#2F8373" fillOpacity=".12" />
        <circle cx="122" cy="125" r="18" fill="#2F8373" />
        <circle cx="364" cy="104" r="26" fill="#5773F5" fillOpacity=".14" />
        <circle cx="364" cy="104" r="14" fill="#5773F5" />
        <circle cx="286" cy="278" r="24" fill="#BC8341" fillOpacity=".14" />
        <circle cx="286" cy="278" r="13" fill="#BC8341" />

        <path d="M95 184h54" stroke="#2F8373" strokeLinecap="round" strokeWidth="7" />
        <path d="M95 204h82" stroke="#A6B1BD" strokeLinecap="round" strokeWidth="7" />
        <path d="M328 149h64" stroke="#5773F5" strokeLinecap="round" strokeWidth="7" />
        <path d="M328 167h96" stroke="#A6B1BD" strokeLinecap="round" strokeWidth="7" />
        <path d="M224 303h76" stroke="#BC8341" strokeLinecap="round" strokeWidth="7" />
        <path d="M224 321h110" stroke="#A6B1BD" strokeLinecap="round" strokeWidth="7" />

        <defs>
          <linearGradient id="panelA" x1="40" y1="88" x2="248" y2="222" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FBFDFB" />
            <stop offset="1" stopColor="#EEF8F5" />
          </linearGradient>
          <linearGradient id="panelB" x1="272" y1="52" x2="480" y2="186" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FCFCFF" />
            <stop offset="1" stopColor="#EEF5FF" />
          </linearGradient>
          <linearGradient id="panelC" x1="172" y1="228" x2="380" y2="338" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEFCF8" />
            <stop offset="1" stopColor="#FBF7EF" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute bottom-5 end-5 rounded-full border border-white/70 bg-white/85 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-brand-700 shadow-panel">
        AI OPERATIONS
      </div>
    </div>
  );
}
