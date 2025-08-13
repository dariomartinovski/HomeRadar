import L from 'leaflet';

const perkIconUrls: Record<string, string> = {
  GYM: '/assets/icons/gym_pin.png',
  MIDDLE_SCHOOL: '/assets/icons/middle_school_pin.png',
  PRE_SCHOOL: '/assets/icons/middle_school_pin.png',
  HIGH_SCHOOL: '/assets/icons/middle_school_pin.png',
  KINDERGARDEN: '/assets/icons/kindergarden_pin.png',
  FACULTY: '/assets/icons/fax_pin.png',
  GROCERY_STORE: '/assets/icons/grocery_store_pin.png',
  RESTAURANT: '/assets/icons/restaurant_pin.png',
  COFFEE_SHOP: '/assets/icons/cafe_pin.png',
  PARK: '/assets/icons/park_pin.png',
  BAR: '/assets/icons/bar_pin.png',
};

export function createIcon(iconUrl: string): L.Icon {
  return new L.Icon({
    iconUrl,
    shadowUrl: '/assets/icons/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

export function getPerkIcon(perkType: string): L.Icon {
  const iconUrl = perkIconUrls[perkType];
  if (!iconUrl) {
    return createIcon('/assets/icons/default_marker.png');
  }
  return createIcon(iconUrl);
}

export function getPerkIconUrl(perkType: string): string {
  const iconUrl = perkIconUrls[perkType];
  return iconUrl ?? './assets/icons/detault_marker.png  '
}