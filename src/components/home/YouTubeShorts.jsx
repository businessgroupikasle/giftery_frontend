import { useCallback, useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiPlay, FiX, FiYoutube } from 'react-icons/fi';
import { YOUTUBE_SHORTS, YOUTUBE_CHANNEL_SHORTS_URL } from '@constants/youtubeShorts';
import styles from './YouTubeShorts.module.css';

/* Continuous carousel speed, in pixels per second. */
const AUTO_SCROLL_SPEED = 45;
/* How long auto-scroll waits after an arrow click so the smooth scroll can finish. */
const ARROW_HOLD_MS = 700;

const thumbUrl = (id) => `https://i.ytimg.com/vi/${id}/oar2.jpg`;
const fallbackThumbUrl = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/* Muted, looping, chrome-less preview that plays inside a carousel card. */
const previewUrl = (id) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}` +
  '&controls=0&disablekb=1&fs=0&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3';

/* Full player (with sound) used in the popup. */
const playerUrl = (id) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* The list is rendered twice so the carousel can loop without a visible jump. */
const LOOPED_SHORTS = [...YOUTUBE_SHORTS, ...YOUTUBE_SHORTS].map((short, i) => ({
  ...short,
  index: i % YOUTUBE_SHORTS.length,
  isClone: i >= YOUTUBE_SHORTS.length,
}));

/**
 * One carousel card. While it is on screen it plays the short muted on loop;
 * off screen it falls back to the thumbnail so only a handful of players run.
 */
const ShortCard = ({ short, onOpen }) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || !window.IntersectionObserver) return undefined;
    const observer = new window.IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <li ref={cardRef} className={styles.card} aria-hidden={short.isClone || undefined}>
      <div className={styles.cardMedia}>
        <img
          src={thumbUrl(short.id)}
          alt=""
          loading="lazy"
          decoding="async"
          className={styles.thumb}
          onError={(e) => {
            const fallback = fallbackThumbUrl(short.id);
            if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
          }}
        />
        {isVisible && (
          <iframe
            className={styles.preview}
            src={previewUrl(short.id)}
            title={short.title}
            tabIndex={-1}
            allow="autoplay; encrypted-media; picture-in-picture"
            loading="lazy"
          />
        )}
      </div>

      {/* Transparent button over the preview: the iframe would otherwise swallow the click. */}
      <button
        type="button"
        className={styles.cardBtn}
        onClick={() => onOpen(short.index)}
        aria-label={`Play video with sound: ${short.title}`}
        tabIndex={short.isClone ? -1 : 0}
      >
        <span className={styles.playIcon} aria-hidden="true">
          <FiPlay size={20} />
        </span>
        <span className={styles.cardTitle}>{short.title}</span>
      </button>
    </li>
  );
};

const YouTubeShorts = () => {
  const trackRef = useRef(null);
  const positionRef = useRef(0);
  const holdUntilRef = useRef(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const isModalOpen = activeIndex !== null;
  const activeShort = isModalOpen ? YOUTUBE_SHORTS[activeIndex] : null;

  /* Width of one full copy of the list (distance between a card and its clone). */
  const getLoopWidth = useCallback(() => {
    const track = trackRef.current;
    const first = track?.children[0];
    const clone = track?.children[YOUTUBE_SHORTS.length];
    return first && clone ? clone.offsetLeft - first.offsetLeft : 0;
  }, []);

  /* Arrow buttons: move by one card, wrapping through the cloned half. */
  const scrollByCard = useCallback(
    (direction) => {
      const track = trackRef.current;
      const card = track?.firstElementChild;
      if (!card) return;

      const gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
      const step = card.getBoundingClientRect().width + gap;
      const loopWidth = getLoopWidth();

      if (direction < 0 && track.scrollLeft < step && loopWidth) {
        track.scrollLeft += loopWidth;
      } else if (direction > 0 && loopWidth && track.scrollLeft >= loopWidth) {
        track.scrollLeft -= loopWidth;
      }

      holdUntilRef.current = window.performance.now() + ARROW_HOLD_MS;
      track.scrollBy({ left: step * direction, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    },
    [getLoopWidth]
  );

  /* Continuous auto-scroll, paused while the user hovers/touches or the popup is open. */
  useEffect(() => {
    const track = trackRef.current;
    if (!track || isPaused || isModalOpen || prefersReducedMotion()) return undefined;

    positionRef.current = track.scrollLeft;
    let frameId;
    let last = window.performance.now();

    const tick = (now) => {
      const dt = Math.min(now - last, 100);
      last = now;

      if (now >= holdUntilRef.current && document.visibilityState === 'visible') {
        // If the user scrolled (swipe / arrows), continue from where they left it.
        if (Math.abs(track.scrollLeft - positionRef.current) > 2) {
          positionRef.current = track.scrollLeft;
        }
        positionRef.current += (AUTO_SCROLL_SPEED * dt) / 1000;

        const loopWidth = getLoopWidth();
        if (loopWidth && positionRef.current >= loopWidth) {
          positionRef.current -= loopWidth;
        }
        track.scrollLeft = positionRef.current;
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPaused, isModalOpen, getLoopWidth]);

  const closeModal = useCallback(() => setActiveIndex(null), []);
  const showSibling = useCallback((direction) => {
    setActiveIndex((i) => (i + direction + YOUTUBE_SHORTS.length) % YOUTUBE_SHORTS.length);
  }, []);

  /* Modal: keyboard controls + lock page scroll while open. */
  useEffect(() => {
    if (!isModalOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal();
      else if (e.key === 'ArrowRight') showSibling(1);
      else if (e.key === 'ArrowLeft') showSibling(-1);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isModalOpen, closeModal, showSibling]);

  if (YOUTUBE_SHORTS.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="yt-shorts-title">
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <span className={styles.subheading}>Watch &amp; Get Inspired</span>
            <h2 id="yt-shorts-title" className={styles.title}>
              Gift Ideas on <span className={styles.titleGold}>YouTube Shorts</span>
            </h2>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => scrollByCard(-1)}
              aria-label="Previous videos"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => scrollByCard(1)}
              aria-label="Next videos"
            >
              <FiChevronRight size={20} />
            </button>
            <a
              href={YOUTUBE_CHANNEL_SHORTS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.channelLink}
            >
              <FiYoutube size={16} /> View all
            </a>
          </div>
        </div>

        <ul
          ref={trackRef}
          className={styles.track}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {LOOPED_SHORTS.map((short, i) => (
            <ShortCard key={`${short.id}-${i}`} short={short} onOpen={setActiveIndex} />
          ))}
        </ul>
      </div>

      {activeShort && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={activeShort.title}
          onClick={closeModal}
        >
          <div className={styles.modalBody} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={closeModal}
              aria-label="Close video"
              autoFocus
            >
              <FiX size={22} />
            </button>

            <button
              type="button"
              className={`${styles.modalNav} ${styles.modalPrev}`}
              onClick={() => showSibling(-1)}
              aria-label="Previous video"
            >
              <FiChevronLeft size={26} />
            </button>

            <div className={styles.playerFrame}>
              <iframe
                key={activeShort.id}
                src={playerUrl(activeShort.id)}
                title={activeShort.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            <button
              type="button"
              className={`${styles.modalNav} ${styles.modalNext}`}
              onClick={() => showSibling(1)}
              aria-label="Next video"
            >
              <FiChevronRight size={26} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default YouTubeShorts;
