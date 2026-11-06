/**
 * studioLibrary.js — Built-in stickers, graphics, patterns and templates.
 * All artwork here is original and drawn as inline SVG, so it needs no network
 * access and can be painted into the exported preview image.
 */

const svg = (body, attributes = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 100 100"${attributes}>${body}</svg>`;
export const svgDataUrl = (markup) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;

const heart = (fill, transform = '') => `<path transform="${transform}" fill="${fill}" d="M50 86 16 52C5 41 8 22 24 18c10-2 20 2 26 12 6-10 16-14 26-12 16 4 19 23 8 34z"/>`;
const star = (fill, transform = '') => `<path transform="${transform}" fill="${fill}" d="m50 8 12.4 26 28.6 3.7-21 19.8 5.5 28.3L50 72l-25.500 13.800 5.500-28.300-21-19.800 28.600-3.700z"/>`;
const burst = (fill) => `<path fill="${fill}" d="m50 4 8 17 15-11 1 19 19-1-11 15 17 8-17 8 11 15-19-1-1 19-15-11-8 17-8-17-15 11-1-19-19 1 11-15-17-8 17-8-11-15 19 1 1-19 15 11z"/>`;
const label = (text, size = 13, fill = '#fff') => `<text x="50" y="${50 + size * 0.36}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${size}" fill="${fill}">${text}</text>`;

export const STICKER_CATEGORIES = ['Birthday', 'Wedding', 'Corporate', 'Love', 'Celebration', 'Kids', 'General'];

export const STICKERS = [
  // Birthday
  { id: 'birthday-cake', name: 'Birthday cake', category: 'Birthday', keywords: 'cake candles party', svg: svg('<rect x="18" y="52" width="64" height="34" rx="5" fill="#f4a9c0"/><rect x="18" y="52" width="64" height="11" rx="5" fill="#fff"/><rect x="26" y="34" width="48" height="20" rx="4" fill="#f9d5e1"/><path d="M26 42c4 5 8 5 12 0s8-5 12 0 8 5 12 0 8-5 12 0" fill="none" stroke="#fff" stroke-width="3"/><rect x="36" y="20" width="5" height="14" fill="#6aa7e8"/><rect x="48" y="20" width="5" height="14" fill="#f2c14e"/><rect x="60" y="20" width="5" height="14" fill="#7bc98f"/><circle cx="38.500" cy="15" r="3.500" fill="#f28c28"/><circle cx="50.500" cy="15" r="3.500" fill="#f28c28"/><circle cx="62.500" cy="15" r="3.500" fill="#f28c28"/>') },
  { id: 'birthday-balloons', name: 'Balloons', category: 'Birthday', keywords: 'balloon party float', svg: svg('<path d="M36 52 46 92M64 48 50 92M50 44v48" stroke="#94a3b8" stroke-width="1.500" fill="none"/><ellipse cx="33" cy="32" rx="16" ry="20" fill="#ef6f6c"/><ellipse cx="67" cy="30" rx="16" ry="20" fill="#6aa7e8"/><ellipse cx="50" cy="26" rx="16" ry="20" fill="#f2c14e"/><ellipse cx="45" cy="18" rx="3" ry="5" fill="#fff" opacity=".6"/>') },
  { id: 'birthday-gift', name: 'Gift box', category: 'Birthday', keywords: 'present box ribbon', svg: svg('<rect x="14" y="42" width="72" height="44" rx="4" fill="#dfa843"/><rect x="10" y="30" width="80" height="16" rx="3" fill="#b8832a"/><rect x="43" y="30" width="14" height="56" fill="#ef6f6c"/><path d="M50 30C38 10 18 14 24 24c3 5 16 6 26 6zM50 30c12-20 32-16 26-6-3 5-16 6-26 6z" fill="#ef6f6c"/>') },
  { id: 'birthday-hat', name: 'Party hat', category: 'Birthday', keywords: 'hat cone party', svg: svg('<path d="M50 12 20 84c18 8 42 8 60 0z" fill="#8b5cf6"/><path d="M38 40c8 3 16 3 24 0l4 10c-10 4-22 4-32 0zM28 64c14 5 30 5 44 0l4 10c-16 6-36 6-52 0z" fill="#f2c14e"/><circle cx="50" cy="12" r="7" fill="#ef6f6c"/>') },
  { id: 'birthday-happy', name: 'Happy Birthday badge', category: 'Birthday', keywords: 'happy birthday text badge', svg: svg(`${burst('#ef6f6c')}<text x="50" y="47" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="12" fill="#fff">HAPPY</text><text x="50" y="61" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="10" fill="#fff">BIRTHDAY</text>`) },
  // Wedding
  { id: 'wedding-rings', name: 'Wedding rings', category: 'Wedding', keywords: 'rings engagement marriage', svg: svg('<circle cx="38" cy="56" r="22" fill="none" stroke="#dfa843" stroke-width="7"/><circle cx="62" cy="56" r="22" fill="none" stroke="#c9ced6" stroke-width="7"/><path d="m62 20 7 8-7 8-7-8z" fill="#9ad9ee"/>') },
  { id: 'wedding-bells', name: 'Wedding bells', category: 'Wedding', keywords: 'bells ceremony', svg: svg('<path d="M30 28c-8 0-14 8-14 18 0 12-6 16-6 20h40c0-4-6-8-6-20 0-10-6-18-14-18z" fill="#dfa843" transform="rotate(-14 30 50)"/><path d="M70 28c-8 0-14 8-14 18 0 12-6 16-6 20h40c0-4-6-8-6-20 0-10-6-18-14-18z" fill="#f2c14e" transform="rotate(14 70 50)"/><circle cx="26" cy="74" r="5" fill="#b8832a"/><circle cx="74" cy="74" r="5" fill="#b8832a"/><path d="M42 18c3-8 13-8 16 0-4 6-12 6-16 0z" fill="#ef6f6c"/>') },
  { id: 'wedding-bouquet', name: 'Bouquet', category: 'Wedding', keywords: 'flowers bride bouquet', svg: svg('<path d="m42 54 8 38 8-38z" fill="#7bc98f"/><circle cx="50" cy="28" r="14" fill="#f9d5e1"/><circle cx="32" cy="38" r="13" fill="#f4a9c0"/><circle cx="68" cy="38" r="13" fill="#f4a9c0"/><circle cx="50" cy="48" r="13" fill="#fff" stroke="#f4a9c0"/><circle cx="50" cy="28" r="5" fill="#f2c14e"/><circle cx="32" cy="38" r="4" fill="#f2c14e"/><circle cx="68" cy="38" r="4" fill="#f2c14e"/><circle cx="50" cy="48" r="4" fill="#f2c14e"/><rect x="42" y="66" width="16" height="7" fill="#dfa843"/>') },
  { id: 'wedding-mr-mrs', name: 'Just married tag', category: 'Wedding', keywords: 'just married tag couple', svg: svg(`<rect x="6" y="30" width="88" height="40" rx="20" fill="#b8832a"/><rect x="10" y="34" width="80" height="32" rx="16" fill="none" stroke="#f5d886" stroke-width="1.500"/>${label('Just Married', 12)}`) },
  { id: 'wedding-cake', name: 'Wedding cake', category: 'Wedding', keywords: 'cake tiers', svg: svg('<rect x="14" y="66" width="72" height="22" rx="3" fill="#fff" stroke="#e2c98f" stroke-width="2"/><rect x="26" y="44" width="48" height="22" rx="3" fill="#fff" stroke="#e2c98f" stroke-width="2"/><rect x="36" y="26" width="28" height="18" rx="3" fill="#fff" stroke="#e2c98f" stroke-width="2"/><path d="M50 22 42 14c-3-3 0-8 4-7l4 3 4-3c4-1 7 4 4 7z" fill="#ef6f6c"/>') },
  // Corporate
  { id: 'corporate-briefcase', name: 'Briefcase', category: 'Corporate', keywords: 'business work office', svg: svg('<rect x="12" y="32" width="76" height="52" rx="6" fill="#334155"/><path d="M36 32v-8c0-4 3-6 6-6h16c3 0 6 2 6 6v8" fill="none" stroke="#334155" stroke-width="6"/><rect x="12" y="50" width="76" height="6" fill="#1e293b"/><rect x="44" y="46" width="12" height="14" rx="2" fill="#dfa843"/>') },
  { id: 'corporate-trophy', name: 'Trophy', category: 'Corporate', keywords: 'award winner achievement', svg: svg('<path d="M28 16h44v22c0 14-10 24-22 24S28 52 28 38z" fill="#dfa843"/><path d="M28 22H14c0 16 6 24 16 26M72 22h14c0 16-6 24-16 26" fill="none" stroke="#b8832a" stroke-width="5"/><rect x="44" y="60" width="12" height="14" fill="#b8832a"/><rect x="30" y="74" width="40" height="11" rx="2" fill="#334155"/>') },
  { id: 'corporate-medal', name: 'Medal', category: 'Corporate', keywords: 'badge recognition best', svg: svg(`<path d="m30 8 14 34h12l14-34H56L50 24 44 8z" fill="#6aa7e8"/><circle cx="50" cy="62" r="28" fill="#dfa843"/><circle cx="50" cy="62" r="21" fill="#f2c14e"/>${star('#b8832a', 'translate(29 42) scale(.42)')}`) },
  { id: 'corporate-thanks', name: 'Thank you tag', category: 'Corporate', keywords: 'thanks appreciation team', svg: svg(`<rect x="6" y="30" width="88" height="40" rx="6" fill="#0f172a"/><rect x="6" y="30" width="10" height="40" fill="#dfa843"/>${label('THANK YOU', 12, '#f5d886')}`) },
  { id: 'corporate-growth', name: 'Growth chart', category: 'Corporate', keywords: 'chart growth success', svg: svg('<rect x="18" y="60" width="14" height="26" rx="2" fill="#94a3b8"/><rect x="40" y="44" width="14" height="42" rx="2" fill="#64748b"/><rect x="62" y="26" width="14" height="60" rx="2" fill="#dfa843"/><path d="m14 44 26-18 16 8 26-22" fill="none" stroke="#059669" stroke-width="4"/><path d="m82 12-10 1 7 8z" fill="#059669"/>') },
  // Love
  { id: 'love-heart', name: 'Heart', category: 'Love', keywords: 'heart red romance', svg: svg(heart('#e0475b')) },
  { id: 'love-hearts', name: 'Two hearts', category: 'Love', keywords: 'hearts couple pair', svg: svg(`${heart('#f4a9c0', 'translate(30 2) scale(.7)')}${heart('#e0475b', 'translate(2 28) scale(.7)')}`) },
  { id: 'love-arrow', name: 'Heart and arrow', category: 'Love', keywords: 'cupid arrow valentine', svg: svg(`<path d="m8 80 84-60" stroke="#b8832a" stroke-width="4"/><path d="m92 20-14 1 6 9zM8 80l5-11 6 8z" fill="#b8832a"/>${heart('#e0475b', 'translate(16 12) scale(.68)')}`) },
  { id: 'love-letter', name: 'Love letter', category: 'Love', keywords: 'envelope letter mail', svg: svg(`<rect x="10" y="26" width="80" height="54" rx="5" fill="#f9d5e1"/><path d="m10 30 40 30 40-30" fill="#f4a9c0"/>${heart('#e0475b', 'translate(36 42) scale(.28)')}`) },
  { id: 'love-rose', name: 'Rose', category: 'Love', keywords: 'flower rose romance', svg: svg('<path d="M50 54v38" stroke="#4d9c63" stroke-width="4"/><path d="M50 74c10-10 22-8 26-4-6 8-18 10-26 4zM50 82c-8-8-18-6-22-3 5 7 15 8 22 3z" fill="#7bc98f"/><circle cx="50" cy="32" r="24" fill="#e0475b"/><path d="M50 18c10 0 16 8 12 16-3 6-12 7-16 2-3-4 0-9 5-9" fill="none" stroke="#a72539" stroke-width="3"/>') },
  // Celebration
  { id: 'celebration-confetti', name: 'Confetti', category: 'Celebration', keywords: 'confetti party pieces', svg: svg('<rect x="14" y="18" width="8" height="14" fill="#ef6f6c" transform="rotate(20 18 25)"/><rect x="70" y="14" width="8" height="14" fill="#6aa7e8" transform="rotate(-25 74 21)"/><rect x="44" y="30" width="8" height="14" fill="#f2c14e" transform="rotate(50 48 37)"/><rect x="20" y="62" width="8" height="14" fill="#7bc98f" transform="rotate(-40 24 69)"/><rect x="72" y="60" width="8" height="14" fill="#8b5cf6" transform="rotate(30 76 67)"/><circle cx="34" cy="44" r="4" fill="#6aa7e8"/><circle cx="62" cy="48" r="4" fill="#ef6f6c"/><circle cx="50" cy="74" r="4" fill="#dfa843"/><circle cx="84" cy="40" r="3" fill="#7bc98f"/><circle cx="12" cy="44" r="3" fill="#8b5cf6"/>') },
  { id: 'celebration-popper', name: 'Party popper', category: 'Celebration', keywords: 'popper party fun', svg: svg('<path d="m10 90 22-56 34 34z" fill="#dfa843"/><path d="m20 64 16 16m-8-34 26 26" stroke="#ef6f6c" stroke-width="5"/><path d="M58 30c4-8 12-10 18-8M70 46c8-4 14-2 18 2" fill="none" stroke="#6aa7e8" stroke-width="3"/><circle cx="52" cy="14" r="4" fill="#ef6f6c"/><circle cx="84" cy="30" r="4" fill="#7bc98f"/><circle cx="90" cy="62" r="4" fill="#f2c14e"/>') },
  { id: 'celebration-firework', name: 'Firework', category: 'Celebration', keywords: 'firework sparkle new year', svg: svg('<g stroke="#dfa843" stroke-width="4" stroke-linecap="round"><path d="M50 6v22M50 72v22M6 50h22M72 50h22"/></g><g stroke="#ef6f6c" stroke-width="4" stroke-linecap="round"><path d="m19 19 15 15M66 66l15 15M81 19 66 34M34 66 19 81"/></g><circle cx="50" cy="50" r="8" fill="#6aa7e8"/>') },
  { id: 'celebration-cheers', name: 'Cheers', category: 'Celebration', keywords: 'champagne toast drink', svg: svg('<path d="M24 14h22l-3 30c-1 8-15 8-16 0z" fill="#f5d886" transform="rotate(-12 35 30)"/><path d="M54 14h22l-3 30c-1 8-15 8-16 0z" fill="#f5d886" transform="rotate(12 65 30)"/><path d="m32 50 4 32M28 86h16M68 50l-4 32M56 86h16" stroke="#94a3b8" stroke-width="3"/>') },
  { id: 'celebration-congrats', name: 'Congrats badge', category: 'Celebration', keywords: 'congratulations well done', svg: svg(`${burst('#8b5cf6')}${label('CONGRATS', 12)}`) },
  // Kids
  { id: 'kids-teddy', name: 'Teddy bear', category: 'Kids', keywords: 'bear toy cute', svg: svg('<circle cx="26" cy="24" r="12" fill="#b08968"/><circle cx="74" cy="24" r="12" fill="#b08968"/><circle cx="50" cy="42" r="30" fill="#c8a27c"/><ellipse cx="50" cy="52" rx="14" ry="11" fill="#ead7c1"/><circle cx="38" cy="36" r="4" fill="#1e293b"/><circle cx="62" cy="36" r="4" fill="#1e293b"/><circle cx="50" cy="48" r="4" fill="#1e293b"/><path d="M42 58c4 4 12 4 16 0" stroke="#1e293b" stroke-width="2.500" fill="none"/><path d="M26 92c0-20 48-20 48 0z" fill="#c8a27c"/>') },
  { id: 'kids-rocket', name: 'Rocket', category: 'Kids', keywords: 'space rocket fly', svg: svg('<path d="M50 6c16 12 20 32 14 56H36C30 38 34 18 50 6z" fill="#e2e8f0"/><path d="M50 6c6 4 10 10 12 16H38c2-6 6-12 12-16z" fill="#ef6f6c"/><circle cx="50" cy="36" r="8" fill="#6aa7e8"/><path d="M36 50 20 70l18-4zM64 50l16 20-18-4z" fill="#ef6f6c"/><path d="M42 64c0 12 4 20 8 28 4-8 8-16 8-28z" fill="#f28c28"/>') },
  { id: 'kids-rainbow', name: 'Rainbow', category: 'Kids', keywords: 'rainbow colours sky', svg: svg('<g fill="none" stroke-width="8"><path d="M10 72a40 40 0 0 1 80 0" stroke="#ef6f6c"/><path d="M18 72a32 32 0 0 1 64 0" stroke="#f2c14e"/><path d="M26 72a24 24 0 0 1 48 0" stroke="#7bc98f"/><path d="M34 72a16 16 0 0 1 32 0" stroke="#6aa7e8"/></g><circle cx="14" cy="76" r="9" fill="#fff" stroke="#e2e8f0"/><circle cx="86" cy="76" r="9" fill="#fff" stroke="#e2e8f0"/>') },
  { id: 'kids-icecream', name: 'Ice cream', category: 'Kids', keywords: 'ice cream sweet treat', svg: svg('<path d="m32 50 18 44 18-44z" fill="#dfa843"/><circle cx="50" cy="32" r="22" fill="#f4a9c0"/><circle cx="36" cy="44" r="12" fill="#f9d5e1"/><circle cx="64" cy="44" r="12" fill="#f9d5e1"/><circle cx="50" cy="10" r="5" fill="#e0475b"/>') },
  { id: 'kids-robot', name: 'Robot', category: 'Kids', keywords: 'robot toy fun', svg: svg('<path d="M50 6v12" stroke="#64748b" stroke-width="3"/><circle cx="50" cy="6" r="4" fill="#ef6f6c"/><rect x="24" y="18" width="52" height="38" rx="8" fill="#94a3b8"/><circle cx="38" cy="36" r="6" fill="#fff"/><circle cx="62" cy="36" r="6" fill="#fff"/><circle cx="38" cy="36" r="3" fill="#1e293b"/><circle cx="62" cy="36" r="3" fill="#1e293b"/><rect x="38" y="46" width="24" height="4" rx="2" fill="#1e293b"/><rect x="30" y="60" width="40" height="32" rx="6" fill="#64748b"/><circle cx="50" cy="76" r="6" fill="#f2c14e"/>') },
  // General
  { id: 'general-star', name: 'Star', category: 'General', keywords: 'star gold rating', svg: svg(star('#dfa843')) },
  { id: 'general-sun', name: 'Sun', category: 'General', keywords: 'sun bright summer', svg: svg('<g stroke="#f2c14e" stroke-width="6" stroke-linecap="round"><path d="M50 6v12M50 82v12M6 50h12M82 50h12M19 19l8 8M73 73l8 8M81 19l-8 8M27 73l-8 8"/></g><circle cx="50" cy="50" r="24" fill="#f2c14e"/>') },
  { id: 'general-flower', name: 'Flower', category: 'General', keywords: 'flower bloom nature', svg: svg('<g fill="#f4a9c0"><circle cx="50" cy="24" r="16"/><circle cx="76" cy="44" r="16"/><circle cx="66" cy="74" r="16"/><circle cx="34" cy="74" r="16"/><circle cx="24" cy="44" r="16"/></g><circle cx="50" cy="52" r="13" fill="#f2c14e"/>') },
  { id: 'general-leaf', name: 'Leaf', category: 'General', keywords: 'leaf nature eco green', svg: svg('<path d="M86 14C40 12 12 36 14 86 62 88 88 60 86 14z" fill="#7bc98f"/><path d="M14 86 66 34M34 66V48M50 50V36M46 54h16M30 70h16" fill="none" stroke="#4d9c63" stroke-width="3"/>') },
  { id: 'general-smile', name: 'Smile', category: 'General', keywords: 'smile happy face', svg: svg('<circle cx="50" cy="50" r="42" fill="#f2c14e"/><circle cx="35" cy="40" r="6" fill="#1e293b"/><circle cx="65" cy="40" r="6" fill="#1e293b"/><path d="M28 60c8 16 36 16 44 0" fill="none" stroke="#1e293b" stroke-width="5" stroke-linecap="round"/>') },
  { id: 'general-sparkle', name: 'Sparkle', category: 'General', keywords: 'sparkle shine magic', svg: svg('<path d="M46 8c4 22 10 28 32 32-22 4-28 10-32 32-4-22-10-28-32-32 22-4 28-10 32-32z" fill="#dfa843"/><path d="M78 58c2 10 5 13 14 15-9 2-12 5-14 15-2-10-5-13-14-15 9-2 12-5 14-15z" fill="#f5d886"/>') },
];

const stickerById = new Map(STICKERS.map((sticker) => [sticker.id, sticker]));
export const getSticker = (id) => stickerById.get(id) || null;
export const stickerDataUrl = (id) => {
  const sticker = getSticker(id);
  return sticker ? svgDataUrl(sticker.svg) : null;
};

export const searchStickers = (query, category) => {
  const needle = query.trim().toLowerCase();
  return STICKERS.filter((sticker) => (!category || category === 'All' || sticker.category === category)
    && (!needle || `${sticker.name} ${sticker.category} ${sticker.keywords}`.toLowerCase().includes(needle)));
};

// ── Recolourable graphics and decorative elements ──
export const SHAPES = [
  { id: 'circle', name: 'Circle', group: 'Shapes', draw: (c) => `<circle cx="50" cy="50" r="46" fill="${c}"/>` },
  { id: 'square', name: 'Square', group: 'Shapes', draw: (c) => `<rect x="6" y="6" width="88" height="88" rx="4" fill="${c}"/>` },
  { id: 'triangle', name: 'Triangle', group: 'Shapes', draw: (c) => `<path d="M50 8 94 88H6z" fill="${c}"/>` },
  { id: 'star', name: 'Star', group: 'Shapes', draw: (c) => star(c) },
  { id: 'heart', name: 'Heart', group: 'Shapes', draw: (c) => heart(c) },
  { id: 'hexagon', name: 'Hexagon', group: 'Shapes', draw: (c) => `<path d="M50 6 88 28v44L50 94 12 72V28z" fill="${c}"/>` },
  { id: 'diamond', name: 'Diamond', group: 'Shapes', draw: (c) => `<path d="M50 6 92 50 50 94 8 50z" fill="${c}"/>` },
  { id: 'burst', name: 'Burst', group: 'Shapes', draw: (c) => burst(c) },
  { id: 'speech', name: 'Speech bubble', group: 'Shapes', draw: (c) => `<path d="M14 12h72a8 8 0 0 1 8 8v44a8 8 0 0 1-8 8H42L22 90V72h-8a8 8 0 0 1-8-8V20a8 8 0 0 1 8-8z" fill="${c}"/>` },
  { id: 'arrow', name: 'Arrow', group: 'Shapes', draw: (c) => `<path d="M6 40h52V20l36 30-36 30V60H6z" fill="${c}"/>` },
  { id: 'ribbon', name: 'Ribbon banner', group: 'Decorative', draw: (c) => `<path d="M2 34h18v32H2l8-16zM98 34H80v32h18l-8-16z" fill="${c}" opacity=".7"/><rect x="14" y="28" width="72" height="34" fill="${c}"/>` },
  { id: 'seal', name: 'Seal badge', group: 'Decorative', draw: (c) => `${burst(c)}<circle cx="50" cy="50" r="28" fill="none" stroke="#fff" stroke-width="2"/>` },
  { id: 'frame-square', name: 'Square frame', group: 'Decorative', draw: (c) => `<rect x="6" y="6" width="88" height="88" fill="none" stroke="${c}" stroke-width="4"/><rect x="12" y="12" width="76" height="76" fill="none" stroke="${c}" stroke-width="1.500"/>` },
  { id: 'frame-circle', name: 'Round frame', group: 'Decorative', draw: (c) => `<circle cx="50" cy="50" r="45" fill="none" stroke="${c}" stroke-width="4"/><circle cx="50" cy="50" r="39" fill="none" stroke="${c}" stroke-width="1.500"/>` },
  { id: 'divider', name: 'Divider', group: 'Decorative', draw: (c) => `<path d="M4 50h34M62 50h34" stroke="${c}" stroke-width="3"/><path d="m50 40 10 10-10 10-10-10z" fill="${c}"/>` },
  { id: 'corner', name: 'Corner flourish', group: 'Decorative', draw: (c) => `<path d="M8 92V30C8 18 18 8 30 8h62" fill="none" stroke="${c}" stroke-width="4"/><path d="M20 72V38c0-10 8-18 18-18h34" fill="none" stroke="${c}" stroke-width="2"/><circle cx="20" cy="82" r="4" fill="${c}"/><circle cx="82" cy="20" r="4" fill="${c}"/>` },
  { id: 'laurel', name: 'Laurel', group: 'Decorative', draw: (c) => `<g fill="${c}"><path d="M50 92C22 86 8 62 12 30c8 22 22 44 38 56z"/><path d="M50 92c28-6 42-30 38-62-8 22-22 44-38 56z"/></g>` },
  { id: 'swirl', name: 'Swirl', group: 'Decorative', draw: (c) => `<path d="M8 60c14-30 34-30 42-10s-14 24-16 8 22-26 42-14 12 30 12 30" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/>` },
];

const shapeById = new Map(SHAPES.map((shape) => [shape.id, shape]));
export const getShape = (id) => shapeById.get(id) || null;
export const shapeDataUrl = (id, color) => {
  const shape = getShape(id);
  // Graphics may be stretched to any proportion with their side handles.
  return shape ? svgDataUrl(svg(shape.draw(color), ' preserveAspectRatio="none"')) : null;
};

// ── Background patterns ──
export const PATTERNS = [
  { id: 'dots', name: 'Dots', tile: (c) => `<circle cx="10" cy="10" r="3" fill="${c}"/><circle cx="30" cy="30" r="3" fill="${c}"/>` },
  { id: 'stripes', name: 'Stripes', tile: (c) => `<path d="M-5 45 45-5M-25 25 25-25M15 65l50-50" stroke="${c}" stroke-width="5"/>` },
  { id: 'checks', name: 'Checks', tile: (c) => `<rect width="20" height="20" fill="${c}" opacity=".6"/><rect x="20" y="20" width="20" height="20" fill="${c}" opacity=".6"/>` },
  { id: 'hearts', name: 'Hearts', tile: (c) => `${heart(c, 'translate(3 3) scale(.14)')}${heart(c, 'translate(23 23) scale(.14)')}` },
  { id: 'confetti', name: 'Confetti', tile: (c) => `<rect x="6" y="6" width="3" height="8" fill="${c}" transform="rotate(30 7 10)"/><rect x="28" y="12" width="3" height="8" fill="${c}" transform="rotate(-30 29 16)"/><circle cx="14" cy="30" r="2" fill="${c}"/><circle cx="32" cy="32" r="2" fill="${c}"/>` },
  { id: 'waves', name: 'Waves', tile: (c) => `<path d="M0 10c7-7 13-7 20 0s13 7 20 0M0 30c7-7 13-7 20 0s13 7 20 0" fill="none" stroke="${c}" stroke-width="2.500"/>` },
];

export const PATTERN_TILE_PERCENT = 8;
export const patternDataUrl = (id, color) => {
  const pattern = PATTERNS.find((entry) => entry.id === id);
  if (!pattern) return null;
  return svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 40 40">${pattern.tile(color)}</svg>`);
};

export const COLOR_SWATCHES = ['#111111', '#ffffff', '#b8832a', '#dfa843', '#e0475b', '#f4a9c0', '#8b5cf6', '#2563eb', '#0ea5e9', '#059669', '#f28c28', '#64748b'];

// ── Starting points. Applying one replaces text, stickers and graphics; uploaded logos stay. ──
const text = (role, value, overrides) => ({ kind: 'text', role, value, ...overrides });
const sticker = (stickerId, x, y, size, rotation = 0) => ({ kind: 'sticker', stickerId, x, y, size, rotation });
const shape = (shapeId, color, x, y, size, rotation = 0) => ({ kind: 'shape', shapeId, color, x, y, size, rotation });

export const TEMPLATES = [
  {
    id: 'birthday-bash', name: 'Birthday bash', category: 'Birthday',
    background: { color: '#fff4f8', pattern: 'confetti', patternColor: '#f4a9c0', borderStyle: 'dashed', borderWidth: 2, borderColor: '#e0475b' },
    items: [sticker('birthday-balloons', 28, 32, 20, -8), sticker('birthday-cake', 72, 66, 20), text('heading', 'Happy Birthday', { fontFamily: 'Dancing Script', fontSize: 9, color: '#e0475b', y: 45, width: 66 }), text('name', 'Your name', { fontSize: 5, color: '#334155', y: 58, width: 50 })],
  },
  {
    id: 'wedding-classic', name: 'Wedding classic', category: 'Wedding',
    background: { color: '#fffdf7', borderStyle: 'double', borderWidth: 3, borderColor: '#b8832a' },
    items: [sticker('wedding-rings', 50, 30, 16), text('heading', 'Together Forever', { fontFamily: 'Playfair Display', fontSize: 7, color: '#7a5508', y: 47, width: 62 }), text('name', 'Name & Name', { fontFamily: 'Dancing Script', fontSize: 7, color: '#b8832a', y: 58, width: 62 }), shape('divider', '#b8832a', 50, 70, 30)],
  },
  {
    id: 'corporate-clean', name: 'Corporate clean', category: 'Corporate',
    background: { color: '#f8fafc', borderStyle: 'solid', borderWidth: 2, borderColor: '#0f172a' },
    items: [shape('ribbon', '#0f172a', 50, 34, 44), text('company', 'COMPANY NAME', { fontFamily: 'Bebas Neue', fontSize: 6, color: '#f5d886', y: 33, width: 40, bold: false }), text('heading', 'With appreciation', { fontFamily: 'Montserrat', fontSize: 5, color: '#0f172a', y: 54, width: 60 }), text('description', 'For outstanding contribution', { fontSize: 3.2, color: '#475569', y: 63, width: 60 })],
  },
  {
    id: 'love-note', name: 'Love note', category: 'Love',
    background: { color: '#fff1f3', pattern: 'hearts', patternColor: '#f9d5e1', shape: 'rounded' },
    items: [sticker('love-hearts', 50, 32, 18), text('message', 'Always & forever', { fontFamily: 'Dancing Script', fontSize: 8, color: '#a72539', y: 52, width: 64 }), text('name', 'Your name', { fontSize: 4, color: '#475569', y: 64, width: 50 })],
  },
  {
    id: 'kids-party', name: 'Kids party', category: 'Kids',
    background: { color: '#eff8ff', pattern: 'dots', patternColor: '#bfdcf7', shape: 'rounded', borderStyle: 'dotted', borderWidth: 3, borderColor: '#2563eb' },
    items: [sticker('kids-rocket', 28, 36, 20, 20), sticker('kids-rainbow', 72, 34, 22), text('heading', 'Super Star', { fontFamily: 'Impact', fontSize: 8, color: '#2563eb', y: 55, width: 60, bold: false }), text('name', 'Child name', { fontSize: 5, color: '#f28c28', y: 67, width: 50 })],
  },
  {
    id: 'minimal-name', name: 'Minimal name', category: 'General',
    background: {},
    items: [text('name', 'Your name', { fontFamily: 'Playfair Display', fontSize: 8, color: '#111111', y: 50, width: 70 }), shape('divider', '#b8832a', 50, 60, 26)],
  },
];
