export const PRESET_AVATARS = Array.from({ length: 24 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  const id = `avatar_${num}`;
  return {
    id,
    name: `Avatar ${i + 1}`,
    filename: `${id}.png`,
    url: `/avatars/${id}.png`
  };
});

export const getPresetAvatar = (avatarId) => {
  if (!avatarId) return PRESET_AVATARS[0];
  const found = PRESET_AVATARS.find((a) => a.id === avatarId);
  if (found) return found;
  
  const numMatch = avatarId.match(/\d+/);
  if (numMatch) {
    const idx = parseInt(numMatch[0], 10) - 1;
    if (idx >= 0 && idx < PRESET_AVATARS.length) {
      return PRESET_AVATARS[idx];
    }
  }
  
  return PRESET_AVATARS[0];
};
