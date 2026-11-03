export const CINEMA_TAB_KEYS = Object.freeze({
  schedule: "schedule",
  location: "location",
  directions: "directions",
  amenities: "amenities",
});

const CINEMA_TAB_CONFIG = [
  { key: CINEMA_TAB_KEYS.schedule, labelKey: "cinema.showtimes" },
  { key: CINEMA_TAB_KEYS.location, labelKey: "cinema.location" },
  { key: CINEMA_TAB_KEYS.directions, labelKey: "cinema.directions" },
  { key: CINEMA_TAB_KEYS.amenities, labelKey: "cinema.amenities" },
];

export const createCinemaTabItems = (translate, childrenByKey) =>
  CINEMA_TAB_CONFIG.map(({ key, labelKey }) => ({
    key,
    label: translate(labelKey),
    children: childrenByKey[key],
  }));
