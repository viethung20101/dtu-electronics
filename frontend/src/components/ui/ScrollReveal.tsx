import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import './ScrollReveal.css';

export type ScrollRevealDirection = 'up' | 'down' | 'left' | 'right' | 'none';

export interface ScrollRevealProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: ElementType;
  direction?: ScrollRevealDirection;
  /** Stagger delay in ms */
  delay?: number;
  /** Animation duration in ms */
  duration?: number;
  /** Travel distance in px */
  distance?: number;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  /** Play on mount (hero / above-the-fold) */
  eager?: boolean;
}

export function ScrollReveal({
  children,
  as: Tag = 'div',
  className = '',
  direction = 'up',
  delay = 0,
  duration = 720,
  distance = 28,
  threshold = 0.12,
  rootMargin = '0px 0px -8% 0px',
  once = true,
  eager = false,
  style,
  ...rest
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (eager) {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [eager, threshold, rootMargin, once]);

  const revealStyle = {
    '--reveal-delay': `${delay}ms`,
    '--reveal-duration': `${duration}ms`,
    '--reveal-distance': `${distance}px`,
    ...style,
  } as CSSProperties;

  const classes = [
    'scroll-reveal',
    `scroll-reveal--${direction}`,
    visible ? 'scroll-reveal--visible' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag ref={ref} className={classes} style={revealStyle} {...rest}>
      {children}
    </Tag>
  );
}
