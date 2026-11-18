/** Pure story model: scroll steps, scales and layouts for the FP3 scroll story. */

export const W = 760;
export const H = 540;

export const DAY_COLORS = { 1: '#1f5a8a', 2: '#2f7db8', 3: '#9cc3e0' };
export const PHILLIPS = ['Midtown Phillips', 'Phillips West', 'Ventura Village', 'East Phillips'];

export const steps = [
  { id: 'year', scene: 1, sceneTitle: 'The hook', view: 'year',
    title: 'One rule for every street',
    body: 'When snow piles up, Minneapolis declares a Snow Emergency. For three days, parking rules change street by street, and cars in the wrong spot get towed. Each bar is one year of public-street tows.' },
  { id: 'year-slice', scene: 1, view: 'year-slice',
    title: 'In 2025, about 1 in 9 tows was a snow tow',
    body: 'Snow-emergency tows were 3.7% of street tows in 2023 and 2.2% in 2024, then 10.9% in 2025: 3,650 cars in just three storms.' },
  { id: 'storms', scene: 2, sceneTitle: 'When', view: 'storms',
    title: '29 storms, 27,839 tows',
    body: 'The slice unfolds into storms. Each column is one storm in date order, split by rule day: Day 1 snow routes, Day 2 even side, Day 3 odd side. Hover or tab to a column for details.' },
  { id: 'storms-avg', scene: 2, view: 'storms-avg',
    title: 'Each storm now tows about half as many cars',
    body: 'Storms averaged 1,143 tows in 2015–20 and 612 in 2022–25, a 46% drop. Day 2 is still the biggest day in 22 of 29 storms.' },
  { id: 'storms-snow', scene: 2, view: 'storms-snow',
    title: 'More snow does not mean more tows',
    body: 'The gray strip shows snowfall on Day 1 and the two days before. Snowfall and tows barely move together (ρ = −0.21). Caveat: the 2025 layers hold fewer tows than the City’s official total, so part of the drop may be missing records.' },
  { id: 'map-snow', scene: 3, sceneTitle: 'Where', view: 'map-snow',
    title: 'Where snow tows land',
    body: 'Each neighborhood’s share of 5,355 mapped snow tows from the nine most recent storms. Marcy Holmes, next to the University, holds 10.8% on its own.' },
  { id: 'map-ordinary', scene: 3, view: 'map-ordinary',
    title: 'Where everyday tows land',
    body: 'The same map for 1,332 ordinary winter tows: police stops that ended in a tow, on winter days outside any storm. The hot spots move north and into Phillips.' },
  { id: 'map-gap', scene: 3, view: 'map-gap',
    title: 'Two different maps',
    body: 'Blue areas gain share during storms; orange areas lose it. Only 3 neighborhoods make both top-10 lists. The two tow types differ, so we compare where, not how many.' },
  { id: 'dumbbell', scene: 3, view: 'dumbbell',
    title: 'The biggest swings',
    body: 'Marcy Holmes gains 9.6 points in storms; Jordan loses 5.9. Click a row to follow that neighborhood through the rest of the story and the dashboard.' },
  { id: 'scatter', scene: 4, sceneTitle: 'Why', view: 'scatter',
    title: 'Car-light, renter-dense areas carry the snow tows',
    body: 'Each dot is a neighborhood, moved from its place on the map. Right means more households without a car; up means more snow tows per kilometer of street; size is residents; color is the storm share gap.' },
  { id: 'scatter-notes', scene: 4, view: 'scatter-notes',
    title: 'Every storm gainer sits high',
    body: 'All blue dots have more than 5 tows per street-km. Car-free share is the strongest link (ρ 0.47, 95% interval 0.28–0.65). East Bde Maka Ska is the exception: few car-free homes, likely lake-visitor parking.' },
  { id: 'groups', scene: 4, view: 'groups',
    title: 'Not simply “poorer means more”',
    body: 'Neighborhoods sorted by poverty rate into five groups of about 17. The richest group has 21% of the streets but 2% of snow tows. Snow tows peak in the lower-middle group; everyday tows peak in the poorest.' },
  { id: 'phillips', scene: 4, view: 'phillips',
    title: 'The Phillips puzzle',
    body: 'Midtown Phillips, Phillips West, Ventura Village and East Phillips are poor, dense and renter-heavy, much like South Uptown. Yet they record 0–21 snow tows, while South Uptown records 356. Our data cannot explain this yet.' },
  { id: 'explore', scene: 5, sceneTitle: 'Explore', view: 'explore',
    title: 'Now find your own street',
    body: 'Keep scrolling to the dashboard. Pick a storm and a rule day, switch the denominator, and click any neighborhood. The findings explorer below replays every chart with its own controls.' }
];

export const fmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
export const fmt0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/** Linear scale. */
export function linear(d0, d1, r0, r1) {
  const k = (r1 - r0) / ((d1 - d0) || 1);
  return (v) => r0 + (v - d0) * k;
}

/** Storm columns: equal slots in date order with one empty slot for the quarantined 2020–22 storms. */
export function stormLayout(storms, { x0 = 70, x1 = 740, top = 110, base = 430, max = 2000, gapBefore = '2022-01-01' } = {}) {
  const gapIndex = storms.findIndex((s) => s.start >= gapBefore);
  const slots = storms.length + (gapIndex >= 0 ? 1 : 0);
  const slot = (x1 - x0) / slots;
  const width = Math.max(4, slot * 0.68);
  const y = linear(0, max, base, top);
  const columns = storms.map((s, i) => {
    const pos = i + (gapIndex >= 0 && i >= gapIndex ? 1 : 0);
    const x = x0 + pos * slot + (slot - width) / 2;
    let cursor = base;
    const segments = [1, 2, 3].map((day) => {
      const h = base - y(s['day' + day]);
      cursor -= h;
      return { day, y: cursor, h };
    });
    return { ...s, x, width, center: x + width / 2, top: y(s.tows), segments, late: s.start >= gapBefore };
  });
  const gapX = gapIndex >= 0 ? x0 + gapIndex * slot + slot / 2 : null;
  return { columns, gapX, y, slot };
}

export function mean(values) {
  return values.reduce((a, b) => a + b, 0) / Math.max(1, values.length);
}

/** Snowfall bins in millimetres (3-day totals), shown in centimetres. */
export function snowColor(mm) {
  if (mm < 130) return '#eef2f6';
  if (mm < 200) return '#c9d3dd';
  if (mm < 270) return '#93a3b4';
  return '#5b6e82';
}

export function gapCategory(gap) {
  if (gap >= 2) return 'gain';
  if (gap <= -2) return 'loss';
  return 'flat';
}

/** Sequential ramp from snow white to a deep colour, t in [0,1]. */
export function ramp(t, to = [24, 80, 112], from = [232, 240, 246]) {
  const c = from.map((f, i) => Math.round(f + (to[i] - f) * Math.min(1, Math.max(0, t))));
  return `rgb(${c.join(',')})`;
}

/** Diverging: gains blue, losses orange, zero near white. */
export function diverging(value, limit) {
  const t = Math.min(1, Math.abs(value) / limit);
  return value >= 0 ? ramp(Math.sqrt(t), [31, 90, 138]) : ramp(Math.sqrt(t), [190, 98, 52]);
}

/** Scatter: x is a percent attribute, y is snow tows per street-km on a square-root scale. */
export function scatterLayout(rows, xKey, { left = 80, right = 560, top = 90, bottom = 470, yMax = 30 } = {}) {
  const usable = rows.filter((r) => r[xKey] != null && r.perStreetKm != null && r.population);
  const raw = Math.max(...usable.map((r) => r[xKey]));
  const tickStep = raw <= 60 ? 20 : 25;
  const xMax = Math.max(tickStep, Math.ceil(raw / tickStep) * tickStep);
  const x = linear(0, xMax, left, right);
  const y = (v) => bottom - (Math.sqrt(Math.max(0, v)) / Math.sqrt(yMax)) * (bottom - top);
  const popMax = Math.max(...usable.map((r) => r.population));
  const points = usable.map((r) => ({ name: r.name, x: x(r[xKey]), y: y(r.perStreetKm), r: 3 + 9 * Math.sqrt(r.population / popMax), row: r }));
  return { points, x, y, xMax, xTicks: Array.from({ length: xMax / tickStep + 1 }, (_, i) => i * tickStep) };
}

/** Top movers for the dumbbell: six largest gains, four largest losses. */
export function topMovers(rows, gains = 6, losses = 4) {
  const sorted = [...rows].sort((a, b) => b.gap - a.gap);
  return [...sorted.slice(0, gains), ...sorted.slice(-losses)];
}

export const X_ATTRIBUTES = {
  noVehicle: 'Households without a vehicle (%)',
  renters: 'Renter households (%)',
  poverty: 'People below poverty (%)',
  age1824: 'Residents aged 18–24 (%)'
};
