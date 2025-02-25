<script lang="ts">
  import "leaflet/dist/leaflet.css";
  import * as leaflet from "leaflet";
  import { boundaries, type Place } from "./nominatim";
  import { type GeoJsonObject } from "geojson";

  let map: leaflet.Map | null = $state(null);

  const mapAction = (cont: HTMLDivElement) => {
    map = leaflet.map(cont, {
      preferCanvas: false,
      zoomControl: false,
    });
    map.setView([27, 4], 2);
    map.setMaxBounds(new leaflet.LatLngBounds([-150, -300], [150, 400]));
    leaflet
      .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        noWrap: true,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      })
      .addTo(map);

    return {
      destroy: () => map?.remove(),
    };
  };

  const addPlace = (place: Place) => {
    if (!map) return;

    leaflet.geoJson(place.geojson as GeoJsonObject).addTo(map);
  };

  boundaries.subscribe((place) => {
    if (place != null) addPlace(place);
    return null;
  });
</script>

<svelte:window on:resize={() => map?.invalidateSize()} />

<div
  use:mapAction
  style="cursor: pointer !important; width: 500px; height: 500px;"
></div>
