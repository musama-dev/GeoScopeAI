/** Low-precision moon position + rise/set times (good to a couple of minutes). */

const rad = Math.PI / 180;
const dayMs = 86400000;

function toDays(date: Date) {
  return date.valueOf() / dayMs - 0.5 + 2440588 - 2451545;
}

function moonCoords(d: number) {
  const L = rad * (218.316 + 13.176396 * d);
  const M = rad * (134.963 + 13.064993 * d);
  const F = rad * (93.272 + 13.22935 * d);
  const l = L + rad * 6.289 * Math.sin(M);
  const b = rad * 5.128 * Math.sin(F);
  const e = rad * 23.4397;
  return {
    ra: Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l)),
    dec: Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l)),
  };
}

function altitude(date: Date, lat: number, lng: number) {
  const d = toDays(date);
  const { ra, dec } = moonCoords(d);
  const H = rad * (280.16 + 360.9856235 * d) - rad * -lng - ra;
  const phi = rad * lat;
  return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
}

/** Returns moonrise / moonset for the local day of `date` at the given location. */
export function moonTimes(date: Date, lat: number, lng: number) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  let rise: Date | null = null;
  let set: Date | null = null;
  let prev = altitude(start, lat, lng);
  for (let i = 1; i <= 24 * 6; i++) {
    const t = new Date(start.getTime() + i * 10 * 60000);
    const alt = altitude(t, lat, lng);
    if (prev < 0 && alt >= 0 && !rise) rise = t;
    if (prev > 0 && alt <= 0 && !set) set = t;
    prev = alt;
    if (rise && set) break;
  }
  return { rise, set };
}
