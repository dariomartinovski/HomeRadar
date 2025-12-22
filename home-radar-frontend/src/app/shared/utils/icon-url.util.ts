import L from 'leaflet';

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

export function getIcon(iconUrl: string): L.Icon {
  if (!iconUrl) {
    return createIcon('/assets/icons/default_marker.png');
  }
  return createIcon(iconUrl);
}
