import { useRef } from 'react';
import { getImageUrl } from '@utils/imageUrl';
import { normalizeRotation, scaleElement } from './designModel';
import { PATTERN_TILE_PERCENT, patternDataUrl, shapeDataUrl, stickerDataUrl } from './studioLibrary';
import styles from './Customize.module.css';

const PLACEHOLDER = '/images/product-placeholder.svg';

const elementLabel = (element) => ({
  text: `Text: ${element.text}`,
  logo: 'Uploaded logo',
  graphic: 'Uploaded graphic',
  sticker: 'Sticker',
  shape: 'Graphic',
}[element.type]);

const BackgroundPanel = ({ background, getAssetUrl }) => {
  const imageUrl = background.imageAssetId ? getAssetUrl(background.imageAssetId) : null;
  const radius = { rect: 0, rounded: '6cqw', circle: '50%' }[background.shape];
  return (
    <div
      className={styles.backgroundPanel}
      data-testid="design-background"
      style={{
        left: `${background.x}%`,
        top: `${background.y}%`,
        width: `${background.width}%`,
        height: `${background.height}%`,
        borderRadius: radius,
        ...(background.borderStyle !== 'none' ? { border: `${background.borderWidth * 0.2}cqw ${background.borderStyle} ${background.borderColor}` } : {}),
      }}
    >
      <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', overflow: 'hidden', opacity: background.opacity }}>
        {background.color && <div style={{ position: 'absolute', inset: 0, background: background.color }} />}
        {imageUrl && <img src={imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
        {background.pattern && (
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("${patternDataUrl(background.pattern, background.patternColor)}")`, backgroundSize: `${PATTERN_TILE_PERCENT}cqw ${PATTERN_TILE_PERCENT}cqw` }} />
        )}
      </div>
    </div>
  );
};

const ElementContent = ({ element, getAssetUrl }) => {
  if (element.type === 'text') {
    return (
      <div
        className={styles.textContent}
        style={{
          fontFamily: `"${element.fontFamily}", sans-serif`,
          fontSize: `${element.fontSize}cqw`,
          fontWeight: element.bold ? 700 : 400,
          fontStyle: element.italic ? 'italic' : 'normal',
          textAlign: element.align,
          color: element.color,
          padding: `${element.fontSize * 0.15}cqw`,
          background: element.backgroundColor || 'transparent',
          ...(element.outlineColor && element.outlineWidth > 0 ? { WebkitTextStroke: `${element.outlineWidth * 0.1}cqw ${element.outlineColor}`, paintOrder: 'stroke fill' } : {}),
        }}
      >
        {element.text || ' '}
      </div>
    );
  }
  const src = element.type === 'sticker' ? stickerDataUrl(element.stickerId)
    : element.type === 'shape' ? shapeDataUrl(element.shapeId, element.color)
      : getAssetUrl(element.assetId);
  if (!src) return <div className={styles.elementLoading}>Loading…</div>;
  return <img className={styles.elementImage} src={src} alt="" draggable="false" style={{ objectFit: element.keepAspect === false || element.type === 'shape' ? 'fill' : 'contain' }} />;
};

/**
 * The interactive mockup. Elements are positioned in percentages of the stage, and every
 * gesture is converted from screen pixels using the stage's current on-screen size, so
 * dragging behaves the same at any zoom level or screen width.
 */
export default function DesignCanvas({ design, getAssetUrl, selectedId, onSelect, onChange, onGestureEnd, showGuides = true, readOnly = false }) {
  const stage = useRef(null);
  const gesture = useRef(null);

  const beginGesture = (event, element, mode, axis = null) => {
    if (readOnly || event.button > 0) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = stage.current.getBoundingClientRect();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const centerX = rect.left + (element.x / 100) * rect.width;
    const centerY = rect.top + (element.y / 100) * rect.height;
    gesture.current = {
      mode, axis, origin: element, rect, centerX, centerY,
      startX: event.clientX,
      startY: event.clientY,
      startDistance: Math.max(1, Math.hypot(event.clientX - centerX, event.clientY - centerY)),
    };
    onSelect(element.id);
  };

  const onPointerMove = (event) => {
    const active = gesture.current;
    if (!active) return;
    event.preventDefault();
    const { mode, axis, origin, rect, centerX, centerY } = active;
    const groupKey = `${mode}-${origin.id}`;
    if (mode === 'move') {
      onChange(origin.id, {
        x: origin.x + ((event.clientX - active.startX) / rect.width) * 100,
        y: origin.y + ((event.clientY - active.startY) / rect.height) * 100,
      }, groupKey);
    } else if (mode === 'rotate') {
      const angle = (Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180) / Math.PI + 90;
      const step = event.shiftKey ? 15 : 1;
      onChange(origin.id, { rotation: normalizeRotation(Math.round(angle / step) * step) }, groupKey);
    } else if (axis) {
      // Side handles stretch one axis around the centre, measured along the element's own rotation.
      const radians = (origin.rotation * Math.PI) / 180;
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      const along = axis === 'width' ? dx * Math.cos(radians) + dy * Math.sin(radians) : -dx * Math.sin(radians) + dy * Math.cos(radians);
      onChange(origin.id, { [axis]: Math.max(1, (Math.abs(along) * 2 / rect.width) * 100) }, groupKey);
    } else {
      const factor = Math.hypot(event.clientX - centerX, event.clientY - centerY) / active.startDistance;
      onChange(origin.id, scaleElement(origin, factor), groupKey);
    }
  };

  const endGesture = () => {
    if (!gesture.current) return;
    gesture.current = null;
    onGestureEnd?.();
  };

  const background = design.background;
  const hasBackground = background.color || background.imageAssetId || background.pattern || background.borderStyle !== 'none';

  return (
    <div
      ref={stage}
      className={styles.stage}
      data-testid="design-stage"
      onPointerDown={() => { if (!readOnly) onSelect(null); }}
      onPointerMove={onPointerMove}
      onPointerUp={endGesture}
      onPointerCancel={endGesture}
    >
      <img
        className={styles.mockupImage}
        src={getImageUrl(design.productImage)}
        alt="Product mockup"
        draggable="false"
        onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = PLACEHOLDER; }}
      />
      {hasBackground && <BackgroundPanel background={background} getAssetUrl={getAssetUrl} />}
      {showGuides && !readOnly && (
        <div
          className={styles.designGuide}
          style={{ left: `${background.x}%`, top: `${background.y}%`, width: `${background.width}%`, height: `${background.height}%` }}
        >
          <span>Illustrative design area, not a print boundary</span>
        </div>
      )}
      {design.elements.filter((element) => !element.hidden).map((element) => {
        const selected = !readOnly && element.id === selectedId;
        return (
          <div
            key={element.id}
            role={readOnly ? undefined : 'button'}
            tabIndex={readOnly ? undefined : 0}
            aria-label={readOnly ? undefined : elementLabel(element)}
            aria-pressed={readOnly ? undefined : selected}
            data-element-id={element.id}
            data-element-type={element.type}
            className={`${styles.element} ${selected ? styles.elementSelected : ''} ${readOnly ? styles.elementReadOnly : ''}`}
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              width: `${element.width}%`,
              ...(element.type === 'text' ? {} : { height: `${element.height}%` }),
              transform: `translate(-50%, -50%) rotate(${element.rotation}deg)`,
            }}
            onPointerDown={(event) => beginGesture(event, element, 'move')}
            onFocus={() => { if (!readOnly && gesture.current === null) onSelect(element.id); }}
          >
            <div className={styles.elementInner} style={{ opacity: element.opacity }}>
              <ElementContent element={element} getAssetUrl={getAssetUrl} />
            </div>
            {selected && (
              <>
                {['nw', 'ne', 'sw', 'se'].map((corner) => (
                  <span key={corner} data-handle={corner} className={`${styles.handle} ${styles[`handle_${corner}`]}`} onPointerDown={(event) => beginGesture(event, element, 'scale')} />
                ))}
                {(element.type === 'text' || element.keepAspect === false || element.type === 'shape') && (
                  <span data-handle="e" className={`${styles.handle} ${styles.handle_e}`} onPointerDown={(event) => beginGesture(event, element, 'scale', 'width')} />
                )}
                {(element.keepAspect === false || element.type === 'shape') && (
                  <span data-handle="s" className={`${styles.handle} ${styles.handle_s}`} onPointerDown={(event) => beginGesture(event, element, 'scale', 'height')} />
                )}
                <span data-handle="rotate" className={`${styles.rotateHandle} ${element.y - (element.type === 'text' ? 8 : element.height / 2) < 12 ? styles.rotateBelow : ''}`} aria-hidden="true" onPointerDown={(event) => beginGesture(event, element, 'rotate')}>↻</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
