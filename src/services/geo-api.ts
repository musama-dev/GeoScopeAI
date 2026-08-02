// Live data helpers — all keyless, CORS-enabled public APIs.

export type Place = {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone: string;
  population?: number;
};

const j = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed (${res.status}) for ${url}`);
  return (await res.json()) as T;
};

export const DEFAULT_PLACE: Place = {
  id: 1857910,
  name: "Kyoto",
  country: "Japan",
  countryCode: "JP",
  admin1: "Kyoto",
  latitude: 35.0116,
  longitude: 135.7681,
  elevation: 97,
  timezone: "Asia/Tokyo",
  population: 1459640,
};

export async function searchPlaces(query: string): Promise<Place[]> {
  if (!query.trim()) return [];
  const data = await j<{ results?: any[] }>(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`,
  );
  return (data.results ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    country: r.country ?? "",
    countryCode: r.country_code ?? "",
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
    elevation: r.elevation,
    timezone: r.timezone ?? "UTC",
    population: r.population,
  }));
}

export async function fetchCurrentLocationPlace(latitude: number, longitude: number): Promise<Place> {
  const validLat = Number.isFinite(latitude) ? latitude : 24.8607;
  const validLng = Number.isFinite(longitude) ? longitude : 67.0011;

  // 1. Try Nominatim (OpenStreetMap) for structured city & country
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${validLat}&lon=${validLng}&format=json&accept-language=en`,
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const cityName =
        typeof addr.city === "string" ? addr.city :
        typeof addr.town === "string" ? addr.town :
        typeof addr.village === "string" ? addr.village :
        typeof addr.municipality === "string" ? addr.municipality :
        typeof addr.suburb === "string" ? addr.suburb :
        typeof addr.county === "string" ? addr.county :
        typeof addr.state_district === "string" ? addr.state_district :
        typeof addr.state === "string" ? addr.state : undefined;

      const countryName = typeof addr.country === "string" ? addr.country : "";
      const countryCode = (typeof addr.country_code === "string" ? addr.country_code : "").toUpperCase();

      if (cityName) {
        let match: Place | undefined;
        try {
          const searchResults = await searchPlaces(cityName);
          match =
            searchResults.find(
              (s) => s.countryCode === countryCode || s.country.toLowerCase() === countryName.toLowerCase(),
            ) || searchResults[0];
        } catch {}

        if (match) {
          return {
            ...match,
            name: cityName,
            country: countryName || match.country || "",
            countryCode: countryCode || match.countryCode || "",
            latitude: validLat,
            longitude: validLng,
          };
        }

        return {
          id: Date.now(),
          name: cityName,
          country: countryName,
          countryCode,
          admin1: typeof addr.state === "string" ? addr.state : "",
          latitude: validLat,
          longitude: validLng,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
      }
    }
  } catch {}

  // 2. Fallback to BigDataCloud
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${validLat}&longitude=${validLng}&localityLanguage=en`,
    );
    if (res.ok) {
      const d = await res.json();
      const cityName = d.city || d.locality || d.principalSubdivision;
      if (cityName && typeof cityName === "string") {
        return {
          id: Date.now(),
          name: cityName,
          country: d.countryName ?? "",
          countryCode: (d.countryCode ?? "").toUpperCase(),
          admin1: d.principalSubdivision || "",
          latitude: validLat,
          longitude: validLng,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
      }
    }
  } catch {}

  // 3. Fallback generic
  return {
    id: Date.now(),
    name: "My Location",
    country: "",
    countryCode: "",
    latitude: validLat,
    longitude: validLng,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

export async function fetchIpLocationPlace(): Promise<Place> {
  // 1. Try ipapi.co
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) {
      const d = await res.json();
      if (d.city || d.region) {
        const cityName = d.city || d.region;
        const searchResults = await searchPlaces(cityName);
        const match = searchResults[0];
        if (match) {
          return {
            ...match,
            latitude: Number.isFinite(d.latitude) ? d.latitude : match.latitude,
            longitude: Number.isFinite(d.longitude) ? d.longitude : match.longitude,
          };
        }

        return {
          id: Date.now(),
          name: cityName,
          country: d.country_name || "",
          countryCode: d.country_code || "",
          admin1: d.region,
          latitude: Number.isFinite(d.latitude) ? d.latitude : 0,
          longitude: Number.isFinite(d.longitude) ? d.longitude : 0,
          timezone: d.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
      }
    }
  } catch {}

  // 2. Fallback to ip-api.com
  try {
    const res = await fetch("http://ip-api.com/json/?fields=status,country,countryCode,regionName,city,lat,lon,timezone");
    if (res.ok) {
      const d = await res.json();
      if (d.status === "success" && (d.city || d.regionName)) {
        const cityName = d.city || d.regionName;
        const searchResults = await searchPlaces(cityName);
        const match = searchResults[0];
        if (match) {
          return {
            ...match,
            latitude: Number.isFinite(d.lat) ? d.lat : match.latitude,
            longitude: Number.isFinite(d.lon) ? d.lon : match.longitude,
          };
        }

        return {
          id: Date.now(),
          name: cityName,
          country: d.country || "",
          countryCode: d.countryCode || "",
          admin1: d.regionName,
          latitude: Number.isFinite(d.lat) ? d.lat : 0,
          longitude: Number.isFinite(d.lon) ? d.lon : 0,
          timezone: d.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
      }
    }
  } catch {}

  return DEFAULT_PLACE;
}

/* ---------------------------------- weather --------------------------------- */

export type WeatherData = {
  current: {
    temperature: number;
    apparent: number;
    humidity: number;
    windSpeed: number;
    windDir: number;
    pressure: number;
    visibility: number;
    uv: number;
    cloud: number;
    code: number;
    isDay: boolean;
  };
  hourly: { time: string; temp: number; precipProb: number; code: number }[];
  daily: {
    date: string;
    hi: number;
    lo: number;
    code: number;
    sunrise: string;
    sunset: string;
  }[];
  timezone: string;
  utcOffsetSeconds: number;
};

export async function fetchWeather(p: Place): Promise<WeatherData> {
  const d = await j<any>(
    `https://api.open-meteo.com/v1/forecast?latitude=${p.latitude}&longitude=${p.longitude}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure,cloud_cover,weather_code,is_day,visibility` +
      `&hourly=temperature_2m,precipitation_probability,weather_code` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max` +
      `&forecast_days=10&timezone=auto`,
  );
  const nowIdx = Math.max(
    0,
    d.hourly.time.findIndex((t: string) => new Date(t).getTime() >= Date.now() - 3600_000),
  );
  return {
    current: {
      temperature: d.current.temperature_2m,
      apparent: d.current.apparent_temperature,
      humidity: d.current.relative_humidity_2m,
      windSpeed: d.current.wind_speed_10m,
      windDir: d.current.wind_direction_10m,
      pressure: d.current.surface_pressure,
      visibility: d.current.visibility,
      uv: d.daily.uv_index_max?.[0] ?? 0,
      cloud: d.current.cloud_cover,
      code: d.current.weather_code,
      isDay: d.current.is_day === 1,
    },
    hourly: d.hourly.time.slice(nowIdx, nowIdx + 9).map((t: string, i: number) => ({
      time: t,
      temp: d.hourly.temperature_2m[nowIdx + i],
      precipProb: d.hourly.precipitation_probability?.[nowIdx + i] ?? 0,
      code: d.hourly.weather_code[nowIdx + i],
    })),
    daily: d.daily.time.map((t: string, i: number) => ({
      date: t,
      hi: d.daily.temperature_2m_max[i],
      lo: d.daily.temperature_2m_min[i],
      code: d.daily.weather_code[i],
      sunrise: d.daily.sunrise[i],
      sunset: d.daily.sunset[i],
    })),
    timezone: d.timezone,
    utcOffsetSeconds: d.utc_offset_seconds,
  };
}

export function weatherLabel(code: number): string {
  const map: Record<number, string> = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime Fog",
    51: "Light Drizzle",
    53: "Drizzle",
    55: "Dense Drizzle",
    56: "Freezing Drizzle",
    57: "Freezing Drizzle",
    61: "Light Rain",
    63: "Rain",
    65: "Heavy Rain",
    66: "Freezing Rain",
    67: "Freezing Rain",
    71: "Light Snow",
    73: "Snow",
    75: "Heavy Snow",
    77: "Snow Grains",
    80: "Rain Showers",
    81: "Rain Showers",
    82: "Violent Showers",
    85: "Snow Showers",
    86: "Snow Showers",
    95: "Thunderstorm",
    96: "Thunderstorm + Hail",
    99: "Thunderstorm + Hail",
  };
  return map[code] ?? "—";
}

/* -------------------------------- air quality ------------------------------- */

export type AirData = {
  usAqi: number;
  pm25: number;
  pm10: number;
  co: number;
  no2: number;
  so2: number;
  o3: number;
  time: string;
};

export async function fetchAir(p: Place): Promise<AirData> {
  const d = await j<any>(
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${p.latitude}&longitude=${p.longitude}` +
      `&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`,
  );
  const c = d.current;
  return {
    usAqi: Math.round(c.us_aqi ?? 0),
    pm25: c.pm2_5 ?? 0,
    pm10: c.pm10 ?? 0,
    co: c.carbon_monoxide ?? 0,
    no2: c.nitrogen_dioxide ?? 0,
    so2: c.sulphur_dioxide ?? 0,
    o3: c.ozone ?? 0,
    time: c.time,
  };
}

export function aqiCategory(aqi: number) {
  if (aqi <= 50) return { label: "Good", color: "var(--good)" };
  if (aqi <= 100) return { label: "Moderate", color: "var(--sunny)" };
  if (aqi <= 150) return { label: "Unhealthy (SG)", color: "oklch(0.72 0.18 45)" };
  if (aqi <= 200) return { label: "Unhealthy", color: "var(--destructive)" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "oklch(0.5 0.2 320)" };
  return { label: "Hazardous", color: "oklch(0.45 0.18 20)" };
}

/* ---------------------------------- country --------------------------------- */

export type CountryData = {
  name: string;
  nativeName: string;
  flag: string;
  capital: string;
  population: number;
  area: number;
  currencyCode: string;
  currencyName: string;
  callingCode: string;
  languages: string;
  region: string;
  subregion: string;
  continent: string;
  drivingSide: string;
  code: string;
  tld: string;
  populationYear: string;
  latlng: number[];
};

/* --------------------------------- currency --------------------------------- */

export type FxData = { rate: number; base: string; target: string; trend: { d: string; v: number }[] };

/* -------------------------------- attractions ------------------------------- */

export type Attraction = { title: string; image?: string | undefined; distance: number };

// Titles that are geo-tagged but never make a good "top attraction" photo.
const NOT_ATTRACTION =
  /(station|airport|university|school|hospital|prefecture|municipality|district|ward|county|list of|census|highway|road|bridge over|power plant|company|bank|stadium seating)/i;

const CURATED_ATTRACTIONS: Record<string, Attraction[]> = {
  Karachi: [
    { title: "Mazar-e-Quaid", image: "/images/mazar-e-quaid.png", distance: 1200 },
    { title: "Frere Hall", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Frere_Hall_Karachi_01.jpg/800px-Frere_Hall_Karachi_01.jpg", distance: 2100 },
    { title: "Mohatta Palace", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Mohatta_Palace_Museum_Karachi.jpg/800px-Mohatta_Palace_Museum_Karachi.jpg", distance: 2800 },
    { title: "Empress Market", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Empress_Market_Karachi_01.jpg/800px-Empress_Market_Karachi_01.jpg", distance: 1800 },
  ],
  Multan: [
    { title: "Shrine of Shah Rukn-e-Alam", image: "/images/multan.png", distance: 1000 },
    { title: "Multan Fort", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Multan_Fort_01.jpg/800px-Multan_Fort_01.jpg", distance: 1500 },
    { title: "Ghanta Ghar", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Ghanta_Ghar_Multan.jpg/800px-Ghanta_Ghar_Multan.jpg", distance: 1800 },
  ],
  Lahore: [
    { title: "Badshahi Mosque", image: "/images/lahore.jpg", distance: 1000 },
    { title: "Minar-e-Pakistan", image: "/images/lahore.jpg", distance: 1800 },
    { title: "Lahore Fort", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Lahore_Fort_Alamgiri_Gate.jpg/800px-Lahore_Fort_Alamgiri_Gate.jpg", distance: 1200 },
  ],
  Islamabad: [
    { title: "Faisal Mosque", image: "/images/faisal-mosque.jpg", distance: 1200 },
    { title: "Pakistan Monument", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Pakistan_monument_Islamabad.jpg/800px-Pakistan_monument_Islamabad.jpg", distance: 2100 },
  ],
  Paris: [
    { title: "Eiffel Tower", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/800px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg", distance: 1500 },
    { title: "Louvre Museum", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Louvre_Museum_Wikimedia_Commons.jpg/800px-Louvre_Museum_Wikimedia_Commons.jpg", distance: 900 },
  ],
  London: [
    { title: "Big Ben", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Clock_Tower_-_Big_Ben_-_London.jpg/800px-Clock_Tower_-_Big_Ben_-_London.jpg", distance: 1000 },
  ],
};

const CITY_LANDMARKS: Record<string, string[]> = {
  Karachi: [
    "Mazar-e-Quaid",
    "Clifton_Beach,_Karachi",
    "Mohatta_Palace",
    "Frere_Hall",
    "Port_Grand_Karachi",
  ],
  Multan: [
    "Tomb_of_Shah_Rukn-e-Alam",
    "Multan_Fort",
    "Shrine_of_Bahauddin_Zakariya",
    "Ghanta_Ghar_(Multan)",
    "Hussain_Agahi_Bazaar",
  ],
  Lahore: [
    "Badshahi_Mosque",
    "Lahore_Fort",
    "Minar-e-Pakistan",
    "Shalimar_Gardens_(Lahore)",
    "Wazir_Khan_Mosque",
  ],
  Paris: [
    "Eiffel_Tower",
    "Louvre",
    "Arc_de_Triomphe",
    "Notre-Dame_de_Paris",
    "Sacré-Cœur,_Paris",
  ],
  Dubai: [
    "Burj_Khalifa",
    "Burj_Al_Arab",
    "The_Dubai_Mall",
    "Palm_Jumeirah",
    "Museum_of_the_Future",
  ],
  London: [
    "Big_Ben",
    "Tower_Bridge",
    "London_Eye",
    "British_Museum",
    "Buckingham_Palace",
  ],
  "New York": [
    "Statue_of_Liberty",
    "Central_Park",
    "Empire_State_Building",
    "Times_Square",
    "Brooklyn_Bridge",
  ],
  Tokyo: [
    "Sensō-ji",
    "Tokyo_Tower",
    "Shibuya_Crossing",
    "Tokyo_Skytree",
    "Meiji_Shrine",
  ],
  Islamabad: [
    "Faisal_Mosque",
    "Pakistan_Monument",
    "Daman-e-Koh",
    "Margalla_Hills",
    "Rawal_Lake",
  ],
  Riyadh: ["Kingdom_Centre", "Al_Masmak_Palace", "Diriyah"],
  Singapore: ["Marina_Bay_Sands", "Gardens_by_the_Bay", "Merlion"],
  Sydney: ["Sydney_Opera_House", "Sydney_Harbour_Bridge", "Bondi_Beach"],
  Rome: ["Colosseum", "Pantheon,_Rome", "Trevi_Fountain"],
  Cairo: ["Giza_pyramid_complex", "Great_Sphinx_of_Giza", "Egyptian_Museum"],
  Beijing: ["Great_Wall_of_China", "Forbidden_City", "Tiananmen_Square"],
  Agra: ["Taj_Mahal", "Agra_Fort"],
  Peshawar: ["Khyber_Pass", "Bala_Hissar,_Peshawar", "Qissa_Khwani_Bazaar"],
  Quetta: ["Hanna_Lake", "Urak_Valley"],
  Sahiwal: ["Sahiwal_railway_station", "Harappa", "Harappa_Museum"],
};

export function toHdUrl(url?: string): string | undefined {
  if (!url) return undefined;
  // Return direct valid image URL without string modification that causes 404s
  return url;
}

const BAD_TITLE_PATTERNS =
  /^(list of|tourism in|geography of|history of|demographics of|economy of|climate of|culture of|transport in|category:|outline of|index of|famous places in)/i;

export function cleanLandmarkTitle(rawTitle: string): string {
  if (!rawTitle) return "";
  const trimmed = rawTitle.trim();
  if (BAD_TITLE_PATTERNS.test(trimmed)) return "";

  return trimmed
    .replace(/,\s*[A-Za-z\s]+$/, "")
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/_/g, " ")
    .trim();
}

export async function fetchAttractions(p: Place): Promise<Attraction[]> {
  const items: Attraction[] = [];
  const cityClean = cleanCityName(p.name);
  const cityCleanLower = cityClean.toLowerCase();

  if (cityCleanLower === "sahiwal" || p.name.toLowerCase().includes("sahiwal")) {
    items.push({
      title: "Sahiwal Railway Station",
      image: "/images/sahiwal.jpg",
      distance: 800,
    });
  }

  // 1. Fetch direct Wikipedia page summaries for top landmark titles of this city
  const landmarkTitles = CITY_LANDMARKS[cityClean] || CITY_LANDMARKS[p.name] || [
    `${cityClean}_Fort`,
    `${cityClean}_Museum`,
    `${cityClean}_Park`,
    `${cityClean}_Cathedral`,
    `${cityClean}_Mosque`,
    `${cityClean}_Palace`,
  ];

  for (const title of landmarkTitles) {
    if (items.length >= 10) break;
    const cleanTitle = cleanLandmarkTitle(title);
    if (!cleanTitle) continue;

    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      );
      if (res.ok) {
        const d = await res.json();
        const rawImg = d?.originalimage?.source || d?.thumbnail?.source;
        const imgUrl = toHdUrl(rawImg);
        const displayTitle = cleanLandmarkTitle(d.title) || cleanTitle;
        if (displayTitle && imgUrl && !imgUrl.includes(".svg") && !imgUrl.includes("logo")) {
          items.push({
            title: displayTitle,
            image: imgUrl,
            distance: 1000 + items.length * 400,
          });
        }
      }
    } catch {}
  }

  // 2. Search Wikipedia for city landmark tourism with strict city verification
  if (items.length < 8) {
    try {
      const searchRes = await j<any>(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent('"' + cityClean + '" landmark tourist attraction')}&srlimit=15`,
      );
      const searchResults: any[] = searchRes.query?.search ?? [];
      for (const s of searchResults) {
        if (items.length >= 10) break;
        const cleanTitle = cleanLandmarkTitle(s.title);
        if (!cleanTitle) continue;
        if (items.some((i) => i.title.toLowerCase() === cleanTitle.toLowerCase())) continue;

        try {
          const res = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(s.title)}`,
          );
          if (res.ok) {
            const d = await res.json();

            // Strict Geographic Verification: The article summary or title MUST reference the searched city
            const extractLower = (d.extract || "").toLowerCase();
            const titleLower = (d.title || s.title || "").toLowerCase();
            const descLower = (d.description || "").toLowerCase();

            const isVerifiedCity =
              titleLower.includes(cityCleanLower) ||
              descLower.includes(cityCleanLower) ||
              extractLower.includes(cityCleanLower);

            if (!isVerifiedCity) {
              // Discard place if it belongs to another city!
              continue;
            }

            const rawImg = d?.originalimage?.source || d?.thumbnail?.source;
            const imgUrl = toHdUrl(rawImg);
            const displayTitle = cleanLandmarkTitle(d.title) || cleanTitle;
            if (displayTitle && imgUrl && !imgUrl.includes(".svg") && !imgUrl.includes("logo")) {
              items.push({
                title: displayTitle,
                image: imgUrl,
                distance: 1200,
              });
            }
          }
        } catch {}
      }
    } catch {}
  }

  // 3. Fallback curated if Wikipedia API returned fewer than 2 items
  if (items.length < 2 && CURATED_ATTRACTIONS[cityClean]) {
    for (const ca of CURATED_ATTRACTIONS[cityClean]!) {
      const cleanTitle = cleanLandmarkTitle(ca.title);
      if (
        cleanTitle &&
        ca.image &&
        !items.some((i) => i.title.toLowerCase() === cleanTitle.toLowerCase())
      ) {
        items.push({ ...ca, title: cleanTitle });
      }
    }
  }

  return items;
}

const BAD_IMAGE_PATTERNS =
  /(compass|rose|diagram|map|flag|logo|coat_of_arms|icon|toy|figure|action|doll|guard|imperial|figurine|chart|symbol|drawing|\.svg|stormtrooper|star_wars|food|popcorn|meal|snack|dish|recipe|fruit|burger|pizza|pasta|drink|restaurant|coffee|biscuit|cake|bread|portrait|selfie|person|people|man|woman|face|crowd|model|product|office|desk|furniture|indoor|room|interior|advertisement|poster|text|vector|car|automobile|vehicle|cat|dog|animal|pet|office_building|headquarters|stadium_seating|food_stand|supermarket)/i;

export function isValidPhotoUrl(url?: string, contextText?: string): boolean {
  if (!url) return false;
  if (BAD_IMAGE_PATTERNS.test(url)) return false;
  if (contextText && BAD_IMAGE_PATTERNS.test(contextText)) return false;
  return true;
}

export function cleanCityName(rawName: string): string {
  if (!rawName) return "";
  return rawName.split(",")[0]!.trim();
}

export function normalizeCountryName(country?: string): string | undefined {
  if (!country) return undefined;
  const c = country.trim().toLowerCase();

  if (c.includes("united states") || c.includes("usa") || c.includes("us")) return "United States";
  if (c.includes("united kingdom") || c.includes("uk") || c.includes("britain") || c.includes("england")) return "United Kingdom";
  if (c.includes("pakistan")) return "Pakistan";
  if (c.includes("india")) return "India";
  if (c.includes("emirates") || c.includes("uae") || c.includes("dubai")) return "United Arab Emirates";
  if (c.includes("saudi")) return "Saudi Arabia";
  if (c.includes("france")) return "France";
  if (c.includes("japan")) return "Japan";
  if (c.includes("turkey") || c.includes("türkiye")) return "Turkey";
  if (c.includes("italy")) return "Italy";
  if (c.includes("spain")) return "Spain";
  if (c.includes("china")) return "China";
  if (c.includes("germany")) return "Germany";
  if (c.includes("canada")) return "Canada";
  if (c.includes("brazil")) return "Brazil";
  if (c.includes("russia")) return "Russia";
  if (c.includes("korea")) return "South Korea";

  return country.trim();
}

export const CITY_PHOTO_MAP: Record<string, string> = {
  // Major Cities — Direct Iconic Landmarks Only (Reliable HD Unsplash CDN)
  Islamabad: "/images/faisal-mosque.jpg", // Faisal Mosque
  Lahore: "/images/lahore.jpg", // Badshahi Mosque / Minar-e-Pakistan
  Karachi: "/images/mazar-e-quaid.png", // Mazar-e-Quaid
  Multan: "/images/multan.png", // Tomb of Shah Rukn-e-Alam with flying pigeons
  Sahiwal: "/images/sahiwal.jpg", // Sahiwal Railway Station
  Peshawar: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800&auto=format&fit=crop&q=80", // Bab-e-Khyber
  Quetta: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80", // Hanna Lake
  Rawalpindi: "/images/faisal-mosque.jpg",
  Dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80", // Burj Khalifa
  London: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80", // Big Ben
  Tokyo: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80", // Shibuya / Tokyo Tower
  Paris: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&auto=format&fit=crop&q=80", // Eiffel Tower
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=80", // Manhattan Skyline
  "New York City": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=80",
  Istanbul: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&auto=format&fit=crop&q=80", // Hagia Sophia
  Riyadh: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=800&auto=format&fit=crop&q=80", // Kingdom Centre
  Singapore: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop&q=80", // Marina Bay Sands
  Sydney: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop&q=80", // Sydney Opera House
  Rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80", // Colosseum
  Cairo: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&auto=format&fit=crop&q=80", // Pyramids of Giza
  Beijing: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&auto=format&fit=crop&q=80", // Great Wall
  Kyoto: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80", // Kinkaku-ji
  Agra: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80", // Taj Mahal
  "Cape Town": "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&auto=format&fit=crop&q=80", // Table Mountain
  Reykjavík: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&auto=format&fit=crop&q=80", // Hallgrímskirkja
  "Rio de Janeiro": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&auto=format&fit=crop&q=80", // Christ the Redeemer
  Bangkok: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&auto=format&fit=crop&q=80", // Grand Palace
  Toronto: "https://images.unsplash.com/photo-1517935703635-27c707886130?w=800&auto=format&fit=crop&q=80", // CN Tower
  Berlin: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&auto=format&fit=crop&q=80", // Brandenburg Gate
  Madrid: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&auto=format&fit=crop&q=80", // Royal Palace
  Barcelona: "https://images.unsplash.com/photo-1583422409516-2895a771deda?w=800&auto=format&fit=crop&q=80", // Sagrada Familia
  "Los Angeles": "https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=800&auto=format&fit=crop&q=80", // Hollywood Sign
  "San Francisco": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&auto=format&fit=crop&q=80", // Golden Gate Bridge
  Chicago: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800&auto=format&fit=crop&q=80", // Millennium Park
  Moscow: "https://images.unsplash.com/photo-1513326718677-b964603b136b?w=800&auto=format&fit=crop&q=80", // Saint Basil's
  Seoul: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&auto=format&fit=crop&q=80", // N Seoul Tower
  Mecca: "https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=800&auto=format&fit=crop&q=80", // Kaaba / Masjid al-Haram
  Medina: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&auto=format&fit=crop&q=80", // Al-Masjid an-Nabawi

  // Iconic Country Landmark Fallbacks
  Pakistan: "/images/faisal-mosque.jpg",
  "United States": "https://images.unsplash.com/photo-1605130284535-11dd9ede6523?w=800&auto=format&fit=crop&q=80",
  USA: "https://images.unsplash.com/photo-1605130284535-11dd9ede6523?w=800&auto=format&fit=crop&q=80",
  France: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&auto=format&fit=crop&q=80",
  India: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80",
  "United Kingdom": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80",
  UK: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80",
  Japan: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80",
  Turkey: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&auto=format&fit=crop&q=80",
  "United Arab Emirates": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80",
  "Saudi Arabia": "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=800&auto=format&fit=crop&q=80",
  Italy: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80",
  Spain: "https://images.unsplash.com/photo-1583422409516-2895a771deda?w=800&auto=format&fit=crop&q=80",
  China: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&auto=format&fit=crop&q=80",
  Egypt: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&auto=format&fit=crop&q=80",
  Australia: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop&q=80",
};

/** Lead photo for a city / place name — queried directly from Wikipedia REST API */
export async function fetchPlacePhoto(name: string): Promise<string | undefined> {
  const citySimple = cleanCityName(name);

  if (CITY_PHOTO_MAP[citySimple]) return CITY_PHOTO_MAP[citySimple];
  if (CITY_PHOTO_MAP[name]) return CITY_PHOTO_MAP[name];

  const normalized = normalizeCountryName(name);
  if (normalized && CITY_PHOTO_MAP[normalized]) return CITY_PHOTO_MAP[normalized];

  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(citySimple)}`,
    );
    if (res.ok) {
      const d = (await res.json()) as any;
      const src = d?.thumbnail?.source || d?.originalimage?.source;
      if (src && isValidPhotoUrl(src, d.description)) return src;
    }
  } catch {}

  return CITY_PHOTO_MAP[citySimple] ?? CITY_PHOTO_MAP[name];
}

/** Large lead image (original) for a title, used for the hero card. */
async function fetchLargePhoto(title: string): Promise<string | undefined> {
  const queryTitle = title === "New York" ? "New_York_City" : title;
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(queryTitle)}`,
    );
    if (!res.ok) return undefined;
    const d = (await res.json()) as any;
    if (d?.type === "disambiguation") return undefined;
    const src: string | undefined = d?.originalimage?.source ?? d?.thumbnail?.source;
    if (src && isValidPhotoUrl(src, d.description || d.title)) return toHdUrl(src);
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Hero photo: famous picture of the searched city or country landmark.
 * Enforces strict 5-stage landmark search priority:
 * 1. "[City] famous landmark"
 * 2. "[City] iconic landmark"
 * 3. "[City] monument"
 * 4. "[City] skyline"
 * 5. "[City] aerial view"
 */
export async function fetchHeroPhoto(
  place: Pick<Place, "name" | "country" | "admin1">,
  capital?: string,
): Promise<string | undefined> {
  const citySimple = cleanCityName(place.name);

  // 1. Direct city match in curated map
  if (citySimple && CITY_PHOTO_MAP[citySimple]) return CITY_PHOTO_MAP[citySimple];
  if (place.name && CITY_PHOTO_MAP[place.name]) return CITY_PHOTO_MAP[place.name];

  // 2. Strict landmark search queries in exact priority order
  const searchQueries = [
    `${citySimple} famous landmark`,
    `${citySimple} iconic landmark`,
    `${citySimple} monument`,
    `${citySimple} skyline`,
    `${citySimple} aerial view`,
    `${citySimple}`,
  ];

  for (const q of searchQueries) {
    try {
      const searchRes = await j<any>(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(q)}&srlimit=5`,
      );
      const results: any[] = searchRes.query?.search ?? [];
      for (const item of results) {
        const title = item.title;
        if (NOT_ATTRACTION.test(title)) continue;
        const img = await fetchLargePhoto(title);
        if (img && isValidPhotoUrl(img, title)) {
          return img;
        }
      }
    } catch {}
  }

  // 3. Fallback: Province / State / Country iconic landmark
  if (place.admin1 && CITY_PHOTO_MAP[place.admin1]) return CITY_PHOTO_MAP[place.admin1];
  const normCountry = normalizeCountryName(place.country);
  if (normCountry && CITY_PHOTO_MAP[normCountry]) return CITY_PHOTO_MAP[normCountry];
  if (place.country && CITY_PHOTO_MAP[place.country]) return CITY_PHOTO_MAP[place.country];

  return undefined; 
}


/* ---------------------------------- helpers --------------------------------- */

export function moonPhase(date = new Date()) {
  const synodic = 29.530588853;
  const known = Date.UTC(2000, 0, 6, 18, 14) / 86400000;
  const days = date.getTime() / 86400000 - known;
  const phase = ((days % synodic) + synodic) % synodic;
  const frac = phase / synodic;
  const illumination = Math.round((1 - Math.cos(2 * Math.PI * frac)) / 2 * 100);
  const names = [
    "New Moon",
    "Waxing Crescent",
    "First Quarter",
    "Waxing Gibbous",
    "Full Moon",
    "Waning Gibbous",
    "Last Quarter",
    "Waning Crescent",
  ];
  const name = names[Math.floor((frac * 8 + 0.5) % 8)];
  return { name, illumination, frac };
}

function safeTz(tz?: string): string {
  if (!tz || typeof tz !== "string") return Intl.DateTimeFormat().resolvedOptions().timeZone;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return tz;
  } catch {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
}

export function tzTime(timezone: string, date = new Date()) {
  const targetTz = safeTz(timezone);
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { timeZone: targetTz, ...opts }).format(date);
  return {
    time: fmt({ hour: "2-digit", minute: "2-digit", hour12: true }),
    timeWithSeconds: fmt({ hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }),
    date: fmt({ weekday: "long", month: "short", day: "numeric", year: "numeric" }),
    short: fmt({ weekday: "short", month: "short", day: "numeric" }),
  };
}

export function offsetHours(timezone: string, date = new Date()) {
  const targetTz = safeTz(timezone);
  try {
    const s = new Intl.DateTimeFormat("en-US", { timeZone: targetTz, timeZoneName: "longOffset" })
      .formatToParts(date)
      .find((p) => p.type === "timeZoneName")?.value;
    const m = s?.match(/GMT([+-])(\d{2}):(\d{2})/);
    if (!m) return 0;
    return (m[1] === "-" ? -1 : 1) * (Number(m[2]) + Number(m[3]) / 60);
  } catch {
    return 0;
  }
}

export function tzName(timezone: string, date = new Date()) {
  const targetTz = safeTz(timezone);
  try {
    return (
      new Intl.DateTimeFormat("en-US", { timeZone: targetTz, timeZoneName: "long" })
        .formatToParts(date)
        .find((p) => p.type === "timeZoneName")?.value ?? targetTz
    );
  } catch {
    return targetTz;
  }
}

export function formatOffset(h: number) {
  const sign = h < 0 ? "-" : "+";
  const abs = Math.abs(h);
  const hh = Math.floor(abs);
  const mm = Math.round((abs - hh) * 60);
  return `UTC ${sign}${hh}${mm ? `:${String(mm).padStart(2, "0")}` : ""}`;
}

export function timeDiffFromLocal(targetTz: string, date = new Date()) {
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const diff = offsetHours(targetTz, date) - offsetHours(localTz, date);
  if (Math.abs(diff) < 0.01) return "Same time as you";
  const abs = Math.abs(diff);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  const timeStr = h > 0 ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`;
  return diff > 0 ? `${timeStr} ahead of you` : `${timeStr} behind you`;
}
