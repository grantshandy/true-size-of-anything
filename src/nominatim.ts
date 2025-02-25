import { writable, type Writable } from "svelte/store";

const base = "https://nominatim.openstreetmap.org";

export const boundaries: Writable<Place | null> = writable(null);

export type Place = {
  name: string;
  display_name: string;
  category: string;
  osm_id: number;
  osm_type: string;
  type: string;
  geojson: {
    type: string;
    coordinates: number[][][];
  };
};

export const search = (terms: string): Promise<Place[]> =>
  fetch(
    `${base}/search?format=jsonv2&polygon_geojson=1&q=${encodeURIComponent(terms)}`,
  )
    .then((r) => r.json())
    .then((places: Place[]) =>
      places.filter((p) => p.geojson.type == "Polygon"),
    );
