import { useMemo, useRef, useState } from 'react';
import { FiArrowDown, FiArrowUp, FiEye, FiEyeOff, FiSearch, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { ACCEPTED_IMAGE_INPUT, BORDER_STYLES, TEXT_ROLES } from './designModel';
import { COLOR_SWATCHES, getShape, getSticker, PATTERNS, SHAPES, shapeDataUrl, searchStickers, stickerDataUrl, STICKER_CATEGORIES, TEMPLATES } from './studioLibrary';
import styles from './Customize.module.css';

/** Click-or-drop upload target. Files are validated by the caller and again on the server. */
export const DropZone = ({ label, hint, multiple = true, disabled, onFiles, testId }) => {
  const input = useRef(null);
  const [over, setOver] = useState(false);
  const take = (files) => { if (files?.length && !disabled) onFiles(Array.from(files)); };
  return (
    <div
      className={`${styles.dropZone} ${over ? styles.dropZoneOver : ''}`}
      data-testid={testId}
      onDragOver={(event) => { event.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => { event.preventDefault(); setOver(false); take(event.dataTransfer.files); }}
    >
      <FiUploadCloud aria-hidden="true" />
      <button type="button" className={styles.linkButton} disabled={disabled} onClick={() => input.current?.click()}>{label}</button>
      <small>{hint}</small>
      <input
        ref={input}
        type="file"
        hidden
        multiple={multiple}
        accept={ACCEPTED_IMAGE_INPUT}
        aria-label={label}
        onChange={(event) => { take(event.target.files); event.target.value = ''; }}
      />
    </div>
  );
};

const FILE_HINT = 'PNG, JPG, JPEG or SVG up to 5 MB. Stored privately.';

export const AssetTile = ({ asset, getAssetUrl, onUse, onDelete, disabled }) => {
  const url = getAssetUrl(asset.id);
  return (
    <div className={styles.assetTile}>
      <button type="button" disabled={disabled} onClick={() => onUse(asset)} title={`Add ${asset.originalName || 'image'} to the design`}>
        {url ? <img src={url} alt={asset.originalName || 'Uploaded image'} /> : <span className={styles.elementLoading}>…</span>}
      </button>
      {onDelete && (
        <button type="button" className={styles.assetDelete} disabled={disabled} onClick={() => onDelete(asset)} aria-label={`Delete ${asset.originalName || 'image'}`}>
          <FiTrash2 aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export const UploadsPanel = ({ assets, getAssetUrl, uploading, onUpload, onUse, onDelete }) => (
  <div className={styles.panelBody}>
    <h3>Upload your logo</h3>
    <DropZone label="Choose logos or drag them here" hint={FILE_HINT} disabled={uploading} onFiles={(files) => onUpload(files, 'LOGO')} testId="logo-dropzone" />
    {uploading && <p className={styles.panelNote} role="status">Uploading…</p>}
    <p className={styles.panelNote}>Select a placed logo to resize, rotate, move or replace it. Proportions stay locked unless you turn that off.</p>
    <h4>Your uploads</h4>
    {assets.length === 0 ? <p className={styles.panelNote}>Nothing uploaded yet.</p> : (
      <div className={styles.assetGrid}>
        {assets.map((asset) => <AssetTile key={asset.id} asset={asset} getAssetUrl={getAssetUrl} disabled={uploading} onUse={onUse} onDelete={onDelete} />)}
      </div>
    )}
  </div>
);

export const TextPanel = ({ onAdd, textElements, selectedId, onSelect }) => (
  <div className={styles.panelBody}>
    <h3>Add custom text</h3>
    <div className={styles.buttonStack}>
      {Object.entries(TEXT_ROLES).map(([role, preset]) => (
        <button type="button" key={role} className={styles.toolButton} onClick={() => onAdd(role)}>+ {preset.label}</button>
      ))}
    </div>
    <p className={styles.panelNote}>Select text on the mockup to change its wording, font, colour, background and outline.</p>
    {textElements.length > 0 && <h4>On this design</h4>}
    <div className={styles.buttonStack}>
      {textElements.map((element) => (
        <button type="button" key={element.id} className={`${styles.listRow} ${element.id === selectedId ? styles.listRowActive : ''}`} onClick={() => onSelect(element.id)}>
          {element.text || '(empty text)'}
        </button>
      ))}
    </div>
  </div>
);

export const StickersPanel = ({ onAdd }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const results = useMemo(() => searchStickers(query, category), [query, category]);
  return (
    <div className={styles.panelBody}>
      <h3>Stickers</h3>
      <label className={styles.searchField}>
        <FiSearch aria-hidden="true" />
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stickers" aria-label="Search stickers" />
      </label>
      <div className={styles.chipRow} role="group" aria-label="Sticker categories">
        {['All', ...STICKER_CATEGORIES].map((name) => (
          <button type="button" key={name} className={`${styles.chip} ${category === name ? styles.chipActive : ''}`} aria-pressed={category === name} onClick={() => setCategory(name)}>{name}</button>
        ))}
      </div>
      {results.length === 0 ? <p className={styles.panelNote}>No stickers match your search.</p> : (
        <div className={styles.libraryGrid}>
          {results.map((sticker) => (
            <button type="button" key={sticker.id} className={styles.libraryItem} title={sticker.name} aria-label={`Add ${sticker.name} sticker`} onClick={() => onAdd(sticker.id)}>
              <img src={stickerDataUrl(sticker.id)} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const GraphicsPanel = ({ onAddShape, assets, getAssetUrl, uploading, onUpload, onUse, onDelete }) => (
  <div className={styles.panelBody}>
    <h3>Graphics</h3>
    <DropZone label="Upload your own graphic" hint={FILE_HINT} disabled={uploading} onFiles={(files) => onUpload(files, 'GRAPHIC')} testId="graphic-dropzone" />
    {assets.length > 0 && (
      <>
        <h4>Your graphics</h4>
        <div className={styles.assetGrid}>
          {assets.map((asset) => <AssetTile key={asset.id} asset={asset} getAssetUrl={getAssetUrl} disabled={uploading} onUse={onUse} onDelete={onDelete} />)}
        </div>
      </>
    )}
    {['Shapes', 'Decorative'].map((group) => (
      <div key={group}>
        <h4>{group === 'Decorative' ? 'Decorative elements' : group}</h4>
        <div className={styles.libraryGrid}>
          {SHAPES.filter((shape) => shape.group === group).map((shape) => (
            <button type="button" key={shape.id} className={styles.libraryItem} title={shape.name} aria-label={`Add ${shape.name}`} onClick={() => onAddShape(shape.id)}>
              <img src={shapeDataUrl(shape.id, '#b8832a')} alt="" />
            </button>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const TemplatesPanel = ({ onApply }) => (
  <div className={styles.panelBody}>
    <h3>Design templates</h3>
    <p className={styles.panelNote}>A template replaces text, stickers and background. Your logos stay, and Undo restores everything.</p>
    <div className={styles.buttonStack}>
      {TEMPLATES.map((template) => (
        <button type="button" key={template.id} className={styles.templateRow} onClick={() => onApply(template)}>
          <span
            className={styles.templateSwatch}
            style={{ background: template.background.color || '#fff', borderColor: template.background.borderColor || '#cbd5e1' }}
            aria-hidden="true"
          >
            {template.items.filter((item) => item.kind === 'sticker').slice(0, 1).map((item) => <img key={item.stickerId} src={stickerDataUrl(item.stickerId)} alt="" />)}
          </span>
          <span><strong>{template.name}</strong><small>{template.category}</small></span>
        </button>
      ))}
    </div>
  </div>
);

export const ColorField = ({ label, value, onChange, allowNone = false, showSwatches = false }) => (
  <div className={styles.field}>
    <span className={styles.fieldLabel}>{label}</span>
    <div className={styles.colorRow}>
      {showSwatches && COLOR_SWATCHES.map((swatch) => (
        <button type="button" key={swatch} className={`${styles.swatch} ${value === swatch ? styles.swatchActive : ''}`} style={{ background: swatch }} aria-label={`${label} ${swatch}`} onClick={() => onChange(swatch)} />
      ))}
      <input type="color" value={value || '#ffffff'} aria-label={`${label} custom colour`} onChange={(event) => onChange(event.target.value)} />
      {allowNone && <button type="button" className={`${styles.chip} ${!value ? styles.chipActive : ''}`} aria-pressed={!value} onClick={() => onChange(null)}>None</button>}
    </div>
  </div>
);

export const RangeField = ({ label, value, min, max, step = 1, suffix = '', onChange }) => (
  <label className={styles.field}>
    <span className={styles.fieldLabel}>{label}<em>{Math.round(value * 100) / 100}{suffix}</em></span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
  </label>
);

export const BackgroundDesignPanel = ({ background, onChange, getAssetUrl, uploading, onUploadImage, onReset }) => (
  <div className={styles.panelBody}>
    <h3>Background and design</h3>
    <ColorField label="Background colour" value={background.color} onChange={(color) => onChange({ color })} allowNone showSwatches />
    <div className={styles.field}>
      <span className={styles.fieldLabel}>Background image</span>
      {background.imageAssetId ? (
        <div className={styles.inlineImage}>
          {getAssetUrl(background.imageAssetId) && <img src={getAssetUrl(background.imageAssetId)} alt="Background" />}
          <button type="button" className={styles.linkButton} onClick={() => onChange({ imageAssetId: null })}>Remove image</button>
        </div>
      ) : (
        <DropZone label="Upload a background" hint={FILE_HINT} multiple={false} disabled={uploading} onFiles={(files) => onUploadImage(files[0])} testId="background-dropzone" />
      )}
    </div>
    <div className={styles.field}>
      <span className={styles.fieldLabel}>Pattern</span>
      <div className={styles.chipRow}>
        <button type="button" className={`${styles.chip} ${!background.pattern ? styles.chipActive : ''}`} aria-pressed={!background.pattern} onClick={() => onChange({ pattern: null })}>None</button>
        {PATTERNS.map((pattern) => (
          <button type="button" key={pattern.id} className={`${styles.chip} ${background.pattern === pattern.id ? styles.chipActive : ''}`} aria-pressed={background.pattern === pattern.id} onClick={() => onChange({ pattern: pattern.id })}>{pattern.name}</button>
        ))}
      </div>
    </div>
    {background.pattern && <ColorField label="Pattern colour" value={background.patternColor} onChange={(patternColor) => onChange({ patternColor })} />}
    <label className={styles.field}>
      <span className={styles.fieldLabel}>Border style</span>
      <select value={background.borderStyle} onChange={(event) => onChange({ borderStyle: event.target.value })}>
        {BORDER_STYLES.map((style) => <option key={style} value={style}>{style[0].toUpperCase() + style.slice(1)}</option>)}
      </select>
    </label>
    {background.borderStyle !== 'none' && (
      <>
        <RangeField label="Border width" value={background.borderWidth} min={0.5} max={10} step={0.5} onChange={(borderWidth) => onChange({ borderWidth })} />
        <ColorField label="Border colour" value={background.borderColor} onChange={(borderColor) => onChange({ borderColor })} />
      </>
    )}
    <label className={styles.field}>
      <span className={styles.fieldLabel}>Area shape</span>
      <select value={background.shape} onChange={(event) => onChange({ shape: event.target.value })}>
        <option value="rect">Rectangle</option>
        <option value="rounded">Rounded</option>
        <option value="circle">Circle</option>
      </select>
    </label>
    <RangeField label="Area width" value={background.width} min={5} max={100} suffix="%" onChange={(width) => onChange({ width })} />
    <RangeField label="Area height" value={background.height} min={5} max={100} suffix="%" onChange={(height) => onChange({ height })} />
    <RangeField label="Area left–right" value={background.x} min={0} max={100} suffix="%" onChange={(x) => onChange({ x })} />
    <RangeField label="Area up–down" value={background.y} min={0} max={100} suffix="%" onChange={(y) => onChange({ y })} />
    <RangeField label="Fill opacity" value={background.opacity} min={0} max={1} step={0.05} onChange={(opacity) => onChange({ opacity })} />
    <button type="button" className={styles.dangerButton} onClick={onReset}>Reset design</button>
  </div>
);

const layerName = (element, assets) => {
  if (element.type === 'text') return element.text || '(empty text)';
  if (element.type === 'sticker') return getSticker(element.stickerId)?.name || 'Sticker';
  if (element.type === 'shape') return getShape(element.shapeId)?.name || 'Graphic';
  return assets.find((asset) => asset.id === element.assetId)?.originalName || (element.type === 'logo' ? 'Logo' : 'Graphic');
};

export const LayersPanel = ({ elements, assets, selectedId, onSelect, onMove, onToggle, onDelete }) => (
  <div className={styles.panelBody}>
    <h3>Layers</h3>
    {elements.length === 0 && <p className={styles.panelNote}>Elements you add appear here. The top row is drawn in front.</p>}
    <ol className={styles.layerList}>
      {[...elements].reverse().map((element, index) => (
        <li key={element.id} className={`${styles.layerRow} ${element.id === selectedId ? styles.listRowActive : ''}`}>
          <button type="button" className={styles.layerName} onClick={() => onSelect(element.id)}>{layerName(element, assets)}</button>
          <button type="button" aria-label="Bring forward" disabled={index === 0} onClick={() => onMove(element.id, 1)}><FiArrowUp aria-hidden="true" /></button>
          <button type="button" aria-label="Send back" disabled={index === elements.length - 1} onClick={() => onMove(element.id, -1)}><FiArrowDown aria-hidden="true" /></button>
          <button type="button" aria-label={element.hidden ? 'Show layer' : 'Hide layer'} onClick={() => onToggle(element.id)}>{element.hidden ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}</button>
          <button type="button" aria-label="Delete layer" onClick={() => onDelete(element.id)}><FiTrash2 aria-hidden="true" /></button>
        </li>
      ))}
    </ol>
  </div>
);
