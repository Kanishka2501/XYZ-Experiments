import React from 'react';

interface NexusLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const NexusLogo: React.FC<NexusLogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const iconDimensions = {
    sm: { width: 22, height: 22 },
    md: { width: 30, height: 30 },
    lg: { width: 44, height: 44 },
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Abstract connection between two nodes: Student <-> Understanding */}
        <svg
          width={iconDimensions.width}
          height={iconDimensions.height}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[var(--accent)] drop-shadow-[0_0_12px_var(--accent-glow)]"
        >
          {/* Subtle orbital path */}
          <circle cx="18" cy="18" r="15" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="3 3" />
          
          {/* Connecting resonance wave between the two nodes */}
          <path
            d="M 10 18 C 14 12, 22 24, 26 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 10 18 C 14 24, 22 12, 26 18"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.5"
            strokeLinecap="round"
          />

          {/* Node 1: Student (Origin) */}
          <circle cx="10" cy="18" r="4.5" fill="var(--bg-base)" stroke="currentColor" strokeWidth="2" />
          <circle cx="10" cy="18" r="2" fill="currentColor" />

          {/* Node 2: Understanding (Destination) */}
          <circle cx="26" cy="18" r="4.5" fill="var(--bg-base)" stroke="currentColor" strokeWidth="2" />
          <circle cx="26" cy="18" r="2" fill="currentColor" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-display-title font-semibold tracking-wider text-base uppercase text-[var(--text-primary)]">
              Nexus
            </span>
            <span className="font-serif-academic italic text-xs tracking-wide text-[var(--accent)] font-normal">
              Tutor
            </span>
          </div>
          <span className="text-[9px] tracking-widest uppercase font-mono text-[var(--text-muted)] mt-0.5">
            Socratic Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
