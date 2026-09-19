/**
 * DevDate DiceBear Avatar Engine
 * Pop Art & Doodle Art themed developer avatars using DiceBear API
 * Default Style: voxel-bot (DiceBear 10.x Voxel 3D Robot Art)
 */

export const DICEBEAR_STYLES = [
  { id: 'voxel-bot', name: 'VOXEL', description: '3D Voxel Robot Art (Default)', version: '10.x' },
  { id: 'bottts', name: 'BOT', description: 'Tech Robot', version: '9.x' },
  { id: 'croodles', name: 'DOODLE', description: 'Hand-drawn Doodle', version: '9.x' },
  { id: 'pixel-art', name: 'PIXEL', description: '8-Bit Retro Dev', version: '9.x' },
  { id: 'adventurer', name: 'HERO', description: 'Comic Adventurer', version: '9.x' },
  { id: 'avataaars', name: 'COMIC', description: 'Pop Art Character', version: '9.x' },
];

/**
 * Generate a high-res DiceBear avatar PNG URL with Pop Art background colors
 */
export function getDiceBearAvatar(seed = 'Developer', style = 'voxel-bot') {
  const cleanSeed = encodeURIComponent(String(seed || 'DevDate').trim().toLowerCase().replace(/\s+/g, '-'));
  const version = style === 'voxel-bot' ? '10.x' : '9.x';
  return `https://api.dicebear.com/${version}/${style}/png?seed=${cleanSeed}&backgroundColor=ffe600,00f5d4,ff2a85,7928ca,4361ee,ffb703`;
}

/**
 * Resolves any avatar URL to DiceBear Voxel Art if empty or if using legacy stock photos
 */
export function resolveProfileAvatar(avatarUrl, nameOrSeed = 'Developer', preferredStyle = 'voxel-bot') {
  if (avatarUrl && typeof avatarUrl === 'string' && avatarUrl.trim().length > 0) {
    // If it's a legacy stock photo or unset placeholder, upgrade to DiceBear voxel-bot
    if (avatarUrl.includes('images.unsplash.com') || avatarUrl.includes('placeholder')) {
      return getDiceBearAvatar(nameOrSeed, preferredStyle);
    }
    return avatarUrl.trim();
  }
  return getDiceBearAvatar(nameOrSeed, preferredStyle);
}
