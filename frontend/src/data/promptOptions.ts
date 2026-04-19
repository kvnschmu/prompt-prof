export interface PromptOption {
  label: string;
  value: string;
  icon?: string;
}

export interface PromptCategory {
  id: string;
  label: string;
  icon: string;
  options: PromptOption[];
}

export const promptCategories: PromptCategory[] = [
  {
    id: 'subject',
    label: 'Motiv & Szene',
    icon: '🎯',
    options: [
      { label: 'Portrait', value: 'portrait of a person' },
      { label: 'Landschaft', value: 'epic landscape' },
      { label: 'Architektur', value: 'architectural photography' },
      { label: 'Fantasy', value: 'fantasy scene' },
      { label: 'Sci-Fi', value: 'futuristic sci-fi scene' },
      { label: 'Natur', value: 'nature scene' },
      { label: 'Urban', value: 'urban street photography' },
      { label: 'Abstrakt', value: 'abstract composition' },
      { label: 'Tier', value: 'animal photography' },
      { label: 'Stillleben', value: 'still life arrangement' },
      { label: 'Makro', value: 'macro photography' },
      { label: 'Unterwasser', value: 'underwater scene' },
    ],
  },
  {
    id: 'style',
    label: 'Stil / Medium',
    icon: '🎨',
    options: [
      { label: 'Fotorealistisch', value: 'photorealistic' },
      { label: 'Digital Art', value: 'digital art' },
      { label: 'Ölgemälde', value: 'oil painting' },
      { label: 'Aquarell', value: 'watercolor painting' },
      { label: 'Anime', value: 'anime style' },
      { label: 'Pixel Art', value: 'pixel art' },
      { label: '3D Render', value: '3D render' },
      { label: 'Cinematisch', value: 'cinematic' },
      { label: 'Illustration', value: 'illustration' },
      { label: 'Concept Art', value: 'concept art' },
      { label: 'Cartoon', value: 'cartoon style' },
      { label: 'Sketch', value: 'pencil sketch' },
    ],
  },
  {
    id: 'lighting',
    label: 'Licht',
    icon: '💡',
    options: [
      { label: 'Golden Hour', value: 'golden hour lighting' },
      { label: 'Blue Hour', value: 'blue hour lighting' },
      { label: 'Studio', value: 'studio lighting' },
      { label: 'Neon', value: 'neon lighting' },
      { label: 'Natürlich', value: 'natural light' },
      { label: 'Dramatisch', value: 'dramatic lighting' },
      { label: 'Backlighting', value: 'backlighting silhouette' },
      { label: 'Volumetrisch', value: 'volumetric lighting, god rays' },
      { label: 'Rembrandt', value: 'Rembrandt lighting' },
      { label: 'Moonlight', value: 'moonlight illumination' },
    ],
  },
  {
    id: 'camera',
    label: 'Kamera',
    icon: '📷',
    options: [
      { label: '85mm f/1.4', value: 'shot on 85mm f/1.4 lens' },
      { label: '35mm Film', value: 'shot on 35mm film' },
      { label: '24mm Wide', value: '24mm wide angle lens' },
      { label: 'Macro 100mm', value: '100mm macro lens' },
      { label: 'Tilt-Shift', value: 'tilt-shift lens effect' },
      { label: 'Fisheye', value: 'fisheye lens distortion' },
      { label: 'Telephoto', value: '200mm telephoto lens' },
      { label: 'Drone', value: 'aerial drone photography' },
      { label: 'Hasselblad', value: 'shot on Hasselblad medium format' },
      { label: 'Polaroid', value: 'instant Polaroid photo' },
    ],
  },
  {
    id: 'perspective',
    label: 'Perspektive',
    icon: '👁️',
    options: [
      { label: 'Augenhöhe', value: 'eye level perspective' },
      { label: 'Vogelperspektive', value: 'birds eye view' },
      { label: 'Froschperspektive', value: 'low angle shot, worms eye view' },
      { label: 'Close-up', value: 'extreme close-up' },
      { label: 'Weitwinkel', value: 'wide angle shot' },
      { label: 'Over-the-shoulder', value: 'over the shoulder shot' },
      { label: 'Isometrisch', value: 'isometric view' },
      { label: 'Symmetrisch', value: 'symmetrical composition' },
    ],
  },
  {
    id: 'quality',
    label: 'Qualität',
    icon: '⭐',
    options: [
      { label: '8K Ultra HD', value: '8k resolution, ultra HD' },
      { label: '4K Detailed', value: '4k, highly detailed' },
      { label: 'Sharp Focus', value: 'sharp focus, intricate details' },
      { label: 'RAW Photo', value: 'RAW photo, unprocessed' },
      { label: 'HDR', value: 'HDR, high dynamic range' },
      { label: 'Award Winning', value: 'award winning photography' },
      { label: 'Professional', value: 'professional quality' },
      { label: 'Masterpiece', value: 'masterpiece, best quality' },
    ],
  },
  {
    id: 'mood',
    label: 'Stimmung',
    icon: '🌊',
    options: [
      { label: 'Episch', value: 'epic and grandiose atmosphere' },
      { label: 'Mysteriös', value: 'mysterious and enigmatic mood' },
      { label: 'Romantisch', value: 'romantic and dreamy atmosphere' },
      { label: 'Düster', value: 'dark and moody atmosphere' },
      { label: 'Fröhlich', value: 'joyful and vibrant mood' },
      { label: 'Nostalgisch', value: 'nostalgic and vintage feel' },
      { label: 'Surreal', value: 'surreal and dreamlike' },
      { label: 'Minimalistisch', value: 'minimalist and clean' },
      { label: 'Energetisch', value: 'energetic and dynamic' },
      { label: 'Friedlich', value: 'peaceful and serene' },
    ],
  },
];

export const surpriseMeOptions = {
  subjects: ['a majestic dragon', 'a cyberpunk city', 'an enchanted forest', 'a space station', 'a steampunk workshop', 'a crystal cave', 'a floating island', 'an ancient temple'],
  styles: ['digital art', 'oil painting', 'cinematic', 'anime style', '3D render', 'concept art', 'watercolor', 'photorealistic'],
  lighting: ['golden hour lighting', 'neon lighting', 'volumetric lighting', 'dramatic lighting', 'moonlight illumination'],
  cameras: ['shot on 85mm f/1.4', '24mm wide angle', 'aerial drone photography', 'shot on Hasselblad medium format'],
  qualities: ['8k resolution', 'highly detailed', 'masterpiece', 'award winning'],
  moods: ['epic atmosphere', 'mysterious mood', 'surreal and dreamlike', 'peaceful and serene'],
};
