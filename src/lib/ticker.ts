export type TickerSpeedPreset = {
  speed: number;
  seconds: number;
};

// Presets are designed for readability on real-world signage screens.
// `speed` is what we store on the element; `seconds` is the full marquee cycle duration.
export const TICKER_SPEED_PRESETS: TickerSpeedPreset[] = [
  { speed: 0.15, seconds: 120 },
  { speed: 0.2, seconds: 90 },
  { speed: 0.3, seconds: 60 },
  { speed: 0.5, seconds: 40 },
  { speed: 0.8, seconds: 25 },
  { speed: 1, seconds: 20 },
  { speed: 1.5, seconds: 13 },
  { speed: 2, seconds: 10 },
  { speed: 3, seconds: 7 },
];

export function getClosestTickerSpeedPreset(speed?: number): number {
  const normalized = typeof speed === 'number' && Number.isFinite(speed) ? speed : 1;
  return TICKER_SPEED_PRESETS.reduce((prev, curr) =>
    Math.abs(curr.speed - normalized) < Math.abs(prev.speed - normalized) ? curr : prev,
  ).speed;
}

export function getTickerDurationSeconds(speed?: number): number {
  const closest = getClosestTickerSpeedPreset(speed);
  return TICKER_SPEED_PRESETS.find((p) => p.speed === closest)?.seconds ?? 20;
}

// Because the marquee starts at translateX(100%), the text can take a while to
// enter the viewport on slow/readable settings. Negative delay makes it appear immediately.
export function getTickerStartOffsetSeconds(durationSeconds: number): number {
  const d = Number.isFinite(durationSeconds) ? durationSeconds : 20;
  return Math.min(Math.max(d * 0.25, 2), 20);
}
