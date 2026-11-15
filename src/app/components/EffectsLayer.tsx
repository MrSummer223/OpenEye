import { CSSProperties } from 'react';
import { motion } from 'motion/react';

export const EFFECT_NAMES = [
  'Blur Background',
  'Parallax Scroll',
  'Smooth Animations',
  'Particle Effects',
  'Glass Morphism',
  'Neon Glow',
] as const;

export type EffectName = typeof EFFECT_NAMES[number];

export function getEffectFrameStyle(effect: EffectName | null, primaryColor: string): CSSProperties {
  if (effect === 'Neon Glow') {
    return { boxShadow: `0 0 28px ${primaryColor}99, inset 0 0 0 1px ${primaryColor}` };
  }
  return {};
}

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: (i * 37) % 100,
  size: 3 + (i % 4) * 2,
  duration: 6 + (i % 5) * 2,
  delay: i * 0.4,
}));

export function EffectsLayer({ effect, primaryColor }: { effect: EffectName | null; primaryColor: string }) {
  if (effect === 'Blur Background') {
    return <div className="absolute inset-0 z-0 pointer-events-none" style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }} />;
  }
  if (effect === 'Glass Morphism') {
    return (
      <div
        className="absolute inset-0 z-0 pointer-events-none bg-white/5"
        style={{ backdropFilter: 'blur(18px) saturate(160%)', WebkitBackdropFilter: 'blur(18px) saturate(160%)' }}
      />
    );
  }
  if (effect === 'Particle Effects') {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {PARTICLES.map(p => (
          <motion.span
            key={p.id}
            className="absolute bottom-0 rounded-full"
            style={{ left: `${p.left}%`, width: p.size, height: p.size, backgroundColor: primaryColor, opacity: 0.6 }}
            animate={{ y: [0, -680], opacity: [0, 0.7, 0] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>
    );
  }
  return null;
}
