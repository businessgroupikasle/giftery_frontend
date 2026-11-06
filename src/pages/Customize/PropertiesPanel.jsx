import { FiAlignCenter, FiAlignLeft, FiAlignRight, FiArrowDown, FiArrowUp, FiCopy, FiTrash2 } from 'react-icons/fi';
import { FONT_FAMILIES } from './designModel';
import { ColorField, DropZone, RangeField } from './StudioPanels';
import styles from './Customize.module.css';

const NumberField = ({ label, value, min, max, step = 1, onChange, disabled }) => (
  <label className={styles.numberField}>
    <span>{label}</span>
    <input
      type="number"
      value={Math.round(value * 100) / 100}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onChange={(event) => {
        const next = Number(event.target.value);
        if (event.target.value !== '' && Number.isFinite(next)) onChange(next);
      }}
    />
  </label>
);

/** Right-hand panel: position, size, rotation, opacity and type-specific styling for the selected element. */
export default function PropertiesPanel({ element, onChange, onDelete, onDuplicate, onMoveLayer, uploading, onReplace }) {
  if (!element) {
    return (
      <div className={styles.panelBody}>
        <h3>Properties</h3>
        <p className={styles.panelNote}>Select an element on the mockup to edit it. Drag to move, use the corners to resize and the top handle to rotate.</p>
      </div>
    );
  }

  const isText = element.type === 'text';
  const isUpload = element.type === 'logo' || element.type === 'graphic';
  const aspect = element.width / element.height;

  const proportional = element.keepAspect || element.type === 'sticker';
  const setWidth = (width) => onChange(proportional ? { width, height: width / aspect } : { width }, `size-${element.id}`);
  const setHeight = (height) => onChange(proportional ? { height, width: height * aspect } : { height }, `size-${element.id}`);

  return (
    <div className={styles.panelBody} data-testid="properties-panel">
      <h3>{{ text: 'Text', logo: 'Logo', graphic: 'Graphic', sticker: 'Sticker', shape: 'Graphic' }[element.type]} properties</h3>

      {isText && (
        <>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Your text</span>
            <textarea rows="3" maxLength={500} value={element.text} aria-label="Your text" onChange={(event) => onChange({ text: event.target.value }, `text-${element.id}`)} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Font</span>
            <select value={element.fontFamily} onChange={(event) => onChange({ fontFamily: event.target.value })} style={{ fontFamily: `"${element.fontFamily}"` }}>
              {FONT_FAMILIES.map((font) => <option key={font} value={font} style={{ fontFamily: `"${font}"` }}>{font}</option>)}
            </select>
          </label>
          <RangeField label="Font size" value={element.fontSize} min={1} max={30} step={0.25} onChange={(fontSize) => onChange({ fontSize }, `font-${element.id}`)} />
          <div className={styles.toggleRow} role="group" aria-label="Text style">
            <button type="button" className={element.bold ? styles.toggleActive : ''} aria-pressed={element.bold} onClick={() => onChange({ bold: !element.bold })}><strong>B</strong></button>
            <button type="button" className={element.italic ? styles.toggleActive : ''} aria-pressed={element.italic} onClick={() => onChange({ italic: !element.italic })}><em>I</em></button>
            {[['left', FiAlignLeft], ['center', FiAlignCenter], ['right', FiAlignRight]].map(([align, Icon]) => (
              <button type="button" key={align} className={element.align === align ? styles.toggleActive : ''} aria-pressed={element.align === align} aria-label={`Align ${align}`} onClick={() => onChange({ align })}><Icon aria-hidden="true" /></button>
            ))}
          </div>
          <ColorField label="Text colour" value={element.color} onChange={(color) => onChange({ color })} showSwatches />
          <ColorField label="Text background" value={element.backgroundColor} onChange={(backgroundColor) => onChange({ backgroundColor })} allowNone />
          <ColorField label="Text outline" value={element.outlineColor} onChange={(outlineColor) => onChange({ outlineColor, ...(outlineColor && !element.outlineWidth ? { outlineWidth: 1 } : {}) })} allowNone />
          {element.outlineColor && <RangeField label="Outline width" value={element.outlineWidth} min={0} max={5} step={0.25} onChange={(outlineWidth) => onChange({ outlineWidth }, `outline-${element.id}`)} />}
        </>
      )}

      {element.type === 'shape' && <ColorField label="Colour" value={element.color} onChange={(color) => onChange({ color })} showSwatches />}

      {isUpload && (
        <>
          <label className={styles.checkField}>
            <input type="checkbox" checked={element.keepAspect} onChange={(event) => onChange({ keepAspect: event.target.checked })} />
            Keep proportions
          </label>
          <DropZone label={`Replace this ${element.type}`} hint="Keeps its position and rotation." multiple={false} disabled={uploading} onFiles={(files) => onReplace(files[0])} testId="replace-dropzone" />
        </>
      )}

      <h4>Position and size</h4>
      <div className={styles.numberGrid}>
        <NumberField label="X %" value={element.x} min={-50} max={150} onChange={(x) => onChange({ x }, `position-${element.id}`)} />
        <NumberField label="Y %" value={element.y} min={-50} max={150} onChange={(y) => onChange({ y }, `position-${element.id}`)} />
        <NumberField label="Width %" value={element.width} min={1} max={300} onChange={(width) => setWidth(width)} />
        <NumberField label="Height %" value={isText ? 0 : element.height} min={1} max={300} disabled={isText} onChange={(height) => setHeight(height)} />
      </div>
      {isText && <p className={styles.panelNote}>Text height follows its wording and font size.</p>}
      <RangeField label="Rotation" value={element.rotation} min={-180} max={180} suffix="°" onChange={(rotation) => onChange({ rotation }, `rotation-${element.id}`)} />
      <RangeField label="Opacity" value={element.opacity} min={0} max={1} step={0.05} onChange={(opacity) => onChange({ opacity }, `opacity-${element.id}`)} />

      <div className={styles.toggleRow}>
        <button type="button" aria-label="Bring forward" title="Bring forward" onClick={() => onMoveLayer(1)}><FiArrowUp aria-hidden="true" /></button>
        <button type="button" aria-label="Send back" title="Send back" onClick={() => onMoveLayer(-1)}><FiArrowDown aria-hidden="true" /></button>
        <button type="button" aria-label="Duplicate element" title="Duplicate" onClick={onDuplicate}><FiCopy aria-hidden="true" /></button>
      </div>
      <button type="button" className={styles.dangerButton} onClick={onDelete}><FiTrash2 aria-hidden="true" /> Delete element</button>
    </div>
  );
}
