import React from 'react';

export const PRESET_AVATARS = [
  {
    id: 'avatar_01',
    name: 'Arjuna',
    title: 'The Seeker',
    bgGradient: 'linear-gradient(135deg, #c9a86a 0%, #8c6a2e 100%)',
    borderColor: '#c9a86a',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L15 8L21 9L16.5 13.5L18 19.5L12 16L6 19.5L7.5 13.5L3 9L9 8L12 2Z" fill="rgba(255,255,255,0.2)"/>
      </svg>
    )
  },
  {
    id: 'avatar_02',
    name: 'Scholar',
    title: 'Knowledge Keeper',
    bgGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    borderColor: '#10b981',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="rgba(255,255,255,0.2)" />
      </svg>
    )
  },
  {
    id: 'avatar_03',
    name: 'Monk',
    title: 'The Meditator',
    bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #5b21b6 100%)',
    borderColor: '#8b5cf6',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="7" r="4" fill="rgba(255,255,255,0.2)"/>
        <path d="M5.5 21a8.5 8.5 0 0 1 13 0" />
      </svg>
    )
  },
  {
    id: 'avatar_04',
    name: 'Coder',
    title: 'Cyber Architect',
    bgGradient: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
    borderColor: '#06b6d4',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    )
  },
  {
    id: 'avatar_05',
    name: 'Athlete',
    title: 'Fitness Champion',
    bgGradient: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
    borderColor: '#f43f5e',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="rgba(255,255,255,0.2)" />
      </svg>
    )
  },
  {
    id: 'avatar_06',
    name: 'Alchemist',
    title: 'Productivity Master',
    bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    borderColor: '#f59e0b',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2v7.31L4.75 18.1A2 2 0 0 0 6.47 21h11.06a2 2 0 0 0 1.72-2.9L14 9.31V2" />
        <line x1="8.5" y1="2" x2="15.5" y2="2" />
      </svg>
    )
  },
  {
    id: 'avatar_07',
    name: 'Guardian',
    title: 'Streak Keeper',
    bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    borderColor: '#3b82f6',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(255,255,255,0.2)"/>
      </svg>
    )
  },
  {
    id: 'avatar_08',
    name: 'Mystic',
    title: 'Life Adventurer',
    bgGradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    borderColor: '#ec4899',
    renderIcon: (color = '#ffffff') => (
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="rgba(255,255,255,0.2)" />
      </svg>
    )
  }
];

export const getPresetAvatar = (avatarId) => {
  return PRESET_AVATARS.find((a) => a.id === avatarId) || PRESET_AVATARS[0];
};
