import React from 'react';

export const PRESET_AVATARS = [
  {
    id: 'aarav',
    name: 'Aarav',
    title: 'The Motivated',
    bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    borderColor: '#f59e0b',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.15)"/>
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="rgba(255,255,255,0.3)"/>
      </svg>
    )
  },
  {
    id: 'ira',
    name: 'Ira',
    title: 'The Dreamer',
    bgGradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    borderColor: '#ec4899',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" fill="rgba(255,255,255,0.2)"/>
        <path d="M9 21h6"/>
      </svg>
    )
  },
  {
    id: 'kian',
    name: 'Kian',
    title: 'The Coder',
    bgGradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    borderColor: '#06b6d4',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="14" y1="4" x2="10" y2="20" strokeOpacity="0.6"/>
      </svg>
    )
  },
  {
    id: 'meera',
    name: 'Meera',
    title: 'The Scholar',
    bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderColor: '#10b981',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="rgba(255,255,255,0.2)" />
      </svg>
    )
  },
  {
    id: 'rohan',
    name: 'Rohan',
    title: 'The Disciplined',
    bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    borderColor: '#3b82f6',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(255,255,255,0.2)"/>
        <polyline points="9 12 11 14 15 10" />
      </svg>
    )
  },
  {
    id: 'tara',
    name: 'Tara',
    title: 'The Balanced',
    bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    borderColor: '#8b5cf6',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="7" r="4" fill="rgba(255,255,255,0.2)"/>
        <path d="M5.5 21a8.5 8.5 0 0 1 13 0" />
      </svg>
    )
  },
  {
    id: 'vivaan',
    name: 'Vivaan',
    title: 'The Explorer',
    bgGradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
    borderColor: '#14b8a6',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="rgba(255,255,255,0.3)"/>
      </svg>
    )
  },
  {
    id: 'anaya',
    name: 'Anaya',
    title: 'The Creator',
    bgGradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
    borderColor: '#f43f5e',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="rgba(255,255,255,0.25)"/>
      </svg>
    )
  },
  {
    id: 'dev',
    name: 'Dev',
    title: 'The Builder',
    bgGradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    borderColor: '#64748b',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" fill="rgba(255,255,255,0.2)"/>
        <line x1="6" y1="12" x2="10" y2="12"/>
        <line x1="14" y1="12" x2="18" y2="12"/>
      </svg>
    )
  },
  {
    id: 'sana',
    name: 'Sana',
    title: 'The Optimist',
    bgGradient: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
    borderColor: '#fbbf24',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" fill="rgba(255,255,255,0.3)"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    )
  },
  {
    id: 'arjun',
    name: 'Arjun',
    title: 'The Strategist',
    bgGradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    borderColor: '#6366f1',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L15 8L21 9L16.5 13.5L18 19.5L12 16L6 19.5L7.5 13.5L3 9L9 8L12 2Z" fill="rgba(255,255,255,0.2)"/>
      </svg>
    )
  },
  {
    id: 'kiara',
    name: 'Kiara',
    title: 'The Focused',
    bgGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    borderColor: '#0284c7',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" fill="rgba(255,255,255,0.2)"/>
        <circle cx="12" cy="12" r="2" fill="#ffffff"/>
      </svg>
    )
  },
  {
    id: 'reyansh',
    name: 'Reyansh',
    title: 'The Visionary',
    bgGradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
    borderColor: '#a855f7',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="rgba(255,255,255,0.2)"/>
        <circle cx="12" cy="12" r="3" fill="#ffffff"/>
      </svg>
    )
  },
  {
    id: 'nisha',
    name: 'Nisha',
    title: 'The Kind One',
    bgGradient: 'linear-gradient(135deg, #f472b6 0%, #e11d48 100%)',
    borderColor: '#f472b6',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="rgba(255,255,255,0.3)"/>
      </svg>
    )
  },
  {
    id: 'kabir',
    name: 'Kabir',
    title: 'The Calm',
    bgGradient: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
    borderColor: '#38bdf8',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="rgba(255,255,255,0.3)"/>
      </svg>
    )
  },
  {
    id: 'diya',
    name: 'Diya',
    title: 'The Patient',
    bgGradient: 'linear-gradient(135deg, #fb7185 0%, #e11d48 100%)',
    borderColor: '#fb7185',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
  },
  {
    id: 'advait',
    name: 'Advait',
    title: 'The Achiever',
    bgGradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
    borderColor: '#eab308',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" fill="rgba(255,255,255,0.2)"/>
      </svg>
    )
  },
  {
    id: 'zara',
    name: 'Zara',
    title: 'The Adventurer',
    bgGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    borderColor: '#10b981',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="rgba(255,255,255,0.2)"/>
        <circle cx="12" cy="10" r="3" fill="#ffffff"/>
      </svg>
    )
  },
  {
    id: 'neil',
    name: 'Neil',
    title: 'The Positive',
    bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    borderColor: '#3b82f6',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.2)"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3"/>
        <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3"/>
      </svg>
    )
  },
  {
    id: 'piya',
    name: 'Piya',
    title: 'The Creative',
    bgGradient: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
    borderColor: '#f43f5e',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="#fff"/>
        <circle cx="17.5" cy="10.5" r=".5" fill="#fff"/>
        <circle cx="8.5" cy="7.5" r=".5" fill="#fff"/>
        <circle cx="6.5" cy="12.5" r=".5" fill="#fff"/>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.66-.74 1.66-1.66 0-.43-.17-.83-.45-1.12-.27-.29-.44-.68-.44-1.12 0-.92.74-1.66 1.66-1.66H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9z" fill="rgba(255,255,255,0.2)"/>
      </svg>
    )
  },
  {
    id: 'sam',
    name: 'Sam',
    title: 'The Curious',
    bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    borderColor: '#8b5cf6',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" fill="rgba(255,255,255,0.2)"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2.5"/>
      </svg>
    )
  },
  {
    id: 'lavanya',
    name: 'Lavanya',
    title: 'The Learner',
    bgGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    borderColor: '#10b981',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" fill="rgba(255,255,255,0.2)"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    )
  },
  {
    id: 'ishaan',
    name: 'Ishaan',
    title: 'The Resilient',
    bgGradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
    borderColor: '#ea580c',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    )
  }
];

const LEGACY_MAP = {
  avatar_01: 'arjun',
  avatar_02: 'meera',
  avatar_03: 'tara',
  avatar_04: 'kian',
  avatar_05: 'aarav',
  avatar_06: 'advait',
  avatar_07: 'rohan',
  avatar_08: 'anaya'
};

export const getPresetAvatar = (avatarId) => {
  const targetId = LEGACY_MAP[avatarId] || avatarId;
  return PRESET_AVATARS.find((a) => a.id === targetId) || PRESET_AVATARS[0];
};
