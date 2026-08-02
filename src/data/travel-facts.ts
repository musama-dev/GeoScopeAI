/**
 * Reference travel + connectivity facts that are not part of the open datasets
 * used elsewhere (plug types, emergency numbers, price bands, internet stats).
 * Values fall back to sensible regional defaults for countries not listed.
 */

type Facts = {
  plug: string;
  emergency: string; // police / fire / ambulance
  safety: string;
  hotel: string; // USD per night
  meal: string; // USD per meal
  ipv4: string;
  ipv6: string;
  speedRank: string;
  isp: string;
};

const TABLE: Record<string, Partial<Facts>> = {
  jp: { plug: "Type A, B (100V)", emergency: "110 / 119 / 118", safety: "Very Safe", hotel: "120 – 250 USD", meal: "10 – 25 USD", ipv4: "99.8%", ipv6: "46.3%", speedRank: "#23", isp: "NTT Communications" },
  us: { plug: "Type A, B (120V)", emergency: "911 / 911 / 911", safety: "Moderate", hotel: "140 – 300 USD", meal: "15 – 35 USD", ipv4: "99.9%", ipv6: "51.2%", speedRank: "#6", isp: "Comcast Xfinity" },
  gb: { plug: "Type G (230V)", emergency: "999 / 999 / 999", safety: "Safe", hotel: "130 – 280 USD", meal: "15 – 30 USD", ipv4: "99.7%", ipv6: "39.8%", speedRank: "#28", isp: "BT / Openreach" },
  fr: { plug: "Type C, E (230V)", emergency: "17 / 18 / 15", safety: "Safe", hotel: "110 – 240 USD", meal: "14 – 30 USD", ipv4: "99.6%", ipv6: "76.5%", speedRank: "#8", isp: "Orange" },
  de: { plug: "Type C, F (230V)", emergency: "110 / 112 / 112", safety: "Very Safe", hotel: "100 – 220 USD", meal: "12 – 25 USD", ipv4: "99.6%", ipv6: "68.4%", speedRank: "#31", isp: "Deutsche Telekom" },
  pk: { plug: "Type C, D, G (230V)", emergency: "15 / 16 / 1122", safety: "Moderate", hotel: "35 – 90 USD", meal: "3 – 8 USD", ipv4: "97.1%", ipv6: "6.4%", speedRank: "#141", isp: "PTCL" },
  in: { plug: "Type C, D, M (230V)", emergency: "112 / 101 / 102", safety: "Moderate", hotel: "30 – 90 USD", meal: "3 – 10 USD", ipv4: "98.2%", ipv6: "72.6%", speedRank: "#89", isp: "Reliance Jio" },
  ae: { plug: "Type G (230V)", emergency: "999 / 997 / 998", safety: "Very Safe", hotel: "120 – 320 USD", meal: "12 – 30 USD", ipv4: "99.4%", ipv6: "28.9%", speedRank: "#3", isp: "Etisalat" },
  au: { plug: "Type I (230V)", emergency: "000 / 000 / 000", safety: "Very Safe", hotel: "120 – 260 USD", meal: "15 – 32 USD", ipv4: "99.5%", ipv6: "38.1%", speedRank: "#57", isp: "Telstra" },
  sg: { plug: "Type G (230V)", emergency: "999 / 995 / 995", safety: "Very Safe", hotel: "130 – 300 USD", meal: "8 – 20 USD", ipv4: "99.9%", ipv6: "55.4%", speedRank: "#1", isp: "Singtel" },
  cn: { plug: "Type A, C, I (220V)", emergency: "110 / 119 / 120", safety: "Safe", hotel: "60 – 160 USD", meal: "5 – 15 USD", ipv4: "99.5%", ipv6: "42.7%", speedRank: "#4", isp: "China Telecom" },
  it: { plug: "Type C, F, L (230V)", emergency: "112 / 115 / 118", safety: "Safe", hotel: "100 – 220 USD", meal: "12 – 28 USD", ipv4: "99.4%", ipv6: "12.6%", speedRank: "#44", isp: "TIM" },
  es: { plug: "Type C, F (230V)", emergency: "112 / 080 / 061", safety: "Safe", hotel: "90 – 200 USD", meal: "11 – 25 USD", ipv4: "99.5%", ipv6: "8.4%", speedRank: "#7", isp: "Movistar" },
  br: { plug: "Type C, N (127/220V)", emergency: "190 / 193 / 192", safety: "Moderate", hotel: "50 – 130 USD", meal: "6 – 16 USD", ipv4: "98.6%", ipv6: "48.9%", speedRank: "#20", isp: "Vivo" },
  za: { plug: "Type D, M, N (230V)", emergency: "10111 / 10177 / 10177", safety: "Caution", hotel: "50 – 140 USD", meal: "6 – 18 USD", ipv4: "98.1%", ipv6: "3.1%", speedRank: "#95", isp: "Telkom SA" },
  tr: { plug: "Type C, F (230V)", emergency: "155 / 110 / 112", safety: "Moderate", hotel: "45 – 120 USD", meal: "6 – 15 USD", ipv4: "98.9%", ipv6: "3.6%", speedRank: "#98", isp: "Türk Telekom" },
  ca: { plug: "Type A, B (120V)", emergency: "911 / 911 / 911", safety: "Very Safe", hotel: "120 – 250 USD", meal: "14 – 30 USD", ipv4: "99.8%", ipv6: "39.4%", speedRank: "#17", isp: "Bell Canada" },
  kr: { plug: "Type C, F (220V)", emergency: "112 / 119 / 119", safety: "Very Safe", hotel: "80 – 190 USD", meal: "8 – 20 USD", ipv4: "99.9%", ipv6: "24.8%", speedRank: "#2", isp: "KT Corporation" },
};

const REGION_DEFAULT: Record<string, Partial<Facts>> = {
  Europe: { plug: "Type C, F (230V)", emergency: "112 / 112 / 112", safety: "Safe", hotel: "90 – 200 USD", meal: "10 – 25 USD", ipv4: "99.3%", ipv6: "35.0%", speedRank: "#40", isp: "National carrier" },
  Asia: { plug: "Type A, C, G (220V)", emergency: "112 / 112 / 112", safety: "Moderate", hotel: "50 – 140 USD", meal: "5 – 15 USD", ipv4: "98.4%", ipv6: "26.0%", speedRank: "#60", isp: "National carrier" },
  Africa: { plug: "Type C, D, G (230V)", emergency: "112 / 112 / 112", safety: "Caution", hotel: "40 – 120 USD", meal: "5 – 12 USD", ipv4: "97.2%", ipv6: "8.0%", speedRank: "#120", isp: "National carrier" },
  Americas: { plug: "Type A, B (120V)", emergency: "911 / 911 / 911", safety: "Moderate", hotel: "70 – 180 USD", meal: "8 – 22 USD", ipv4: "99.0%", ipv6: "30.0%", speedRank: "#55", isp: "National carrier" },
  Oceania: { plug: "Type I (230V)", emergency: "000 / 000 / 000", safety: "Very Safe", hotel: "110 – 240 USD", meal: "14 – 30 USD", ipv4: "99.4%", ipv6: "34.0%", speedRank: "#50", isp: "National carrier" },
};

const BASE: Facts = {
  plug: "Type C (230V)",
  emergency: "112 / 112 / 112",
  safety: "Moderate",
  hotel: "60 – 160 USD",
  meal: "8 – 20 USD",
  ipv4: "98.5%",
  ipv6: "20.0%",
  speedRank: "#80",
  isp: "National carrier",
};

export function travelFacts(cca2: string | undefined, region: string | undefined): Facts {
  const code = (cca2 ?? "").toLowerCase();
  return { ...BASE, ...(REGION_DEFAULT[region ?? ""] ?? {}), ...(TABLE[code] ?? {}) };
}

export function safetyTone(safety: string) {
  if (safety.startsWith("Very")) return "text-good";
  if (safety === "Safe") return "text-good";
  if (safety === "Caution") return "text-destructive";
  return "text-sunny";
}
