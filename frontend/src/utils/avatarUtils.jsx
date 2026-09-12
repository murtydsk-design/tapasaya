export const AVAILABLE_AVATAR_IDS = [
  'avatar_01', 'avatar_02', 'avatar_03', 'avatar_04',
  'avatar_05', 'avatar_06', 'avatar_07', 'avatar_08',
  'avatar_09', 'avatar_10', 'avatar_11', 'avatar_12',
  'avatar_15', 'avatar_16', 'avatar_17', 'avatar_20'
];

export const PRESET_AVATARS = AVAILABLE_AVATAR_IDS.map((id, index) => ({
  id,
  name: `Avatar ${index + 1}`,
  filename: `${id}.png`,
  url: `/avatars/${id}.png`
}));

export const getPresetAvatar = (avatarId) => {
  if (!avatarId) return PRESET_AVATARS[0];
  const found = PRESET_AVATARS.find((a) => a.id === avatarId);
  if (found) return found;
  return PRESET_AVATARS[0];
};
