export type ElementType = 'image' | 'slideshow' | 'video' | 'ticker' | 'text' | 'audio';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BaseElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  zIndex: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  alt?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
}

export interface SlideshowElement extends BaseElement {
  type: 'slideshow';
  images: { src: string; duration: number }[];
  transition: 'fade' | 'slide' | 'none';
  autoPlay: boolean;
}

export interface VideoElement extends BaseElement {
  type: 'video';
  src: string;
  videos?: { src: string }[]; // Multiple videos support
  autoPlay: boolean;
  loop: boolean;
  muted: boolean;
}

export interface TickerElement extends BaseElement {
  type: 'ticker';
  text: string;
  speed: number;
  fontSize: number;
  color: string;
  backgroundColor: string;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  color: string;
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right';
  fontFamily: string;
}

export interface AudioElement extends BaseElement {
  type: 'audio';
  src: string;
  autoPlay: boolean;
  loop: boolean;
  volume: number;
}

export type CanvasElement = ImageElement | SlideshowElement | VideoElement | TickerElement | TextElement | AudioElement;

export interface AspectRatio {
  label: string;
  value: string;
  width: number;
  height: number;
}

export interface SignageProject {
  id: string;
  name: string;
  ratio: string;
  canvasWidth: number;
  canvasHeight: number;
  elements: CanvasElement[];
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateElement {
  type: ElementType;
  position: Position;
  size: Size;
  // Image properties
  src?: string;
  alt?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  // Text properties
  content?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontFamily?: string;
  // Ticker properties
  text?: string;
  speed?: number;
  // Video properties
  videos?: { src: string }[];
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  // Slideshow properties
  images?: { src: string; duration: number }[];
  transition?: 'fade' | 'slide' | 'none';
  // Audio properties
  volume?: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  ratio: string;
  elements: TemplateElement[];
}

export const ASPECT_RATIOS: AspectRatio[] = [
  { label: '16:9', value: '16:9', width: 1920, height: 1080 },
  { label: '9:16', value: '9:16', width: 1080, height: 1920 },
  { label: '1:1', value: '1:1', width: 1080, height: 1080 },
  { label: '4:3', value: '4:3', width: 1440, height: 1080 },
];
