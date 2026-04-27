export type Segment = {
  id: string;
  label: string;
  emoji?: string;
  color: string; // hsl string e.g. "hsl(145 22% 38%)"
  weight: number; // 1..10
  mediaUrl?: string; // data URL
  mediaType?: "image" | "video";
};

export type Roulette = {
  id: string;
  name: string;
  emoji?: string;
  themeColor: string; // accent color
  segments: Segment[];
  createdAt: number;
  updatedAt: number;
  spinCount: number;
  lastSpinDate?: string; // YYYY-MM-DD
  spinsToday?: number;
};

export const PALETTE = [
  "hsl(145 22% 48%)", // sage
  "hsl(18 38% 65%)",  // clay
  "hsl(200 30% 55%)", // ocean
  "hsl(38 55% 62%)",  // ochre
  "hsl(110 18% 55%)", // moss
  "hsl(25 25% 55%)",  // walnut
  "hsl(180 15% 50%)", // mist
  "hsl(340 25% 65%)", // dusty rose
];