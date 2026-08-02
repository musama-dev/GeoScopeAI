// Facts the bundled `world-countries` build does not ship (continent + driving side).

const LEFT_HAND_DRIVE = new Set([
  "AG","AU","BS","BD","BB","BM","BT","BW","BN","KY","CX","CC","CK","CY","DM","TL","FK","FJ","GD","GG","GY","HK","IN","ID","IE","IM","JM","JP","JE","KE","KI","LS","MO","MW","MY","MV","MT","MU","MS","MZ","NA","NR","NP","NZ","NU","NF","PK","PG","PN","SH","KN","LC","VC","WS","SC","SG","SB","SO","ZA","SS","LK","SR","SZ","TZ","TH","TK","TO","TT","TC","TV","UG","GB","VG","VI","ZM","ZW",
]);

const REGION_TO_CONTINENT: Record<string, string> = {
  Africa: "Africa",
  Americas: "Americas",
  Asia: "Asia",
  Europe: "Europe",
  Oceania: "Oceania",
  Antarctic: "Antarctica",
};

export function drivingSide(cca2: string) {
  return LEFT_HAND_DRIVE.has(cca2.toUpperCase()) ? "Left" : "Right";
}

export function continentOf(cca2: string, region: string, subregion: string) {
  const code = cca2.toUpperCase();
  if (region === "Americas") {
    return subregion === "South America" ? "South America" : "North America";
  }
  if (code === "RU" || code === "TR") return "Europe / Asia";
  return REGION_TO_CONTINENT[region] ?? region ?? "—";
}
