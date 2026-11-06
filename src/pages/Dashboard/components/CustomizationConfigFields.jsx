const DEFAULT_CONFIG = {
  enabled: true,
  tools: { uploads: true, text: true, stickers: true, graphics: true, templates: true, background: true },
  variants: { sizes: [], colors: [], materials: [] },
  chargePerUnit: 0,
};

const TOOLS = [
  ['uploads', 'Logo uploads'],
  ['text', 'Custom text'],
  ['stickers', 'Stickers'],
  ['graphics', 'Graphics'],
  ['templates', 'Templates'],
  ['background', 'Backgrounds'],
];

const VARIANT_FIELDS = [
  ['sizes', 'Sizes', 'S, M, L'],
  ['colors', 'Colours', 'Black, White'],
  ['materials', 'Materials', 'Wood, Metal'],
];

const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' };
const inputStyle = { width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', color: '#0f172a', background: '#ffffff', boxSizing: 'border-box' };

const splitList = (value) => [...new Set(value.split(',').map((entry) => entry.trim()).filter(Boolean))].slice(0, 30);

/** Lets staff choose which studio tools, options and charges apply to one product. */
const CustomizationConfigFields = ({ value, onChange }) => {
  const config = {
    ...DEFAULT_CONFIG,
    ...value,
    tools: { ...DEFAULT_CONFIG.tools, ...value?.tools },
    variants: { ...DEFAULT_CONFIG.variants, ...value?.variants },
  };
  const update = (patch) => onChange({ ...config, ...patch });

  return (
    <fieldset style={{ margin: 0, padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'grid', gap: '0.85rem' }}>
      <legend style={{ padding: '0 0.4rem', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Customization studio</legend>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
        <input type="checkbox" checked={config.enabled} onChange={(event) => update({ enabled: event.target.checked })} />
        Customers can customize this product
      </label>
      {config.enabled && (
        <>
          <div>
            <span style={labelStyle}>Available tools</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {TOOLS.map(([tool, label]) => (
                <label key={tool} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: '#334155' }}>
                  <input type="checkbox" checked={config.tools[tool]} onChange={(event) => update({ tools: { ...config.tools, [tool]: event.target.checked } })} />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {VARIANT_FIELDS.map(([key, label, placeholder]) => (
              <label key={key}>
                <span style={labelStyle}>{label} <span style={{ fontWeight: 400, color: '#64748b' }}>(comma separated)</span></span>
                <input
                  type="text"
                  style={inputStyle}
                  placeholder={placeholder}
                  defaultValue={config.variants[key].join(', ')}
                  onBlur={(event) => update({ variants: { ...config.variants, [key]: splitList(event.target.value) } })}
                />
              </label>
            ))}
            <label>
              <span style={labelStyle}>Customization charge per unit (₹)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                style={inputStyle}
                value={config.chargePerUnit}
                onChange={(event) => update({ chargePerUnit: Math.max(0, Number(event.target.value) || 0) })}
              />
            </label>
          </div>
        </>
      )}
    </fieldset>
  );
};

export default CustomizationConfigFields;
