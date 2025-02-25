<script lang="ts">
  import Search from "./Search.svelte";

  import "leaflet/dist/leaflet.css";
  import * as leaflet from "leaflet";

  import { boundaries, type Place } from "./nominatim";
  import type { GeoJsonObject } from "geojson";

  const addBoundary = (place: Place) => {
    if (map && place.geojson) {
      map.fitBounds(
        leaflet.geoJSON(place.geojson as GeoJsonObject).getBounds(),
      );
    }
    boundaries.set(place);
  };

  const markerSize = 25;

  let error: string | null = $state(null);
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
    name;
    const randomHue = Math.floor(Math.random() * 360);
    const saturation = 70;
    const value = 50;

    const backgroundColor = `hsl(${randomHue}, ${saturation}%, ${value}%)`;
    const borderColor = `hsl(${randomHue}, ${saturation}%, ${value - 10}%)`;

    const geo = leaflet
      .geoJson(place.geojson as GeoJsonObject, {
        style: {
          color: borderColor,
          fillColor: backgroundColor,
          fillOpacity: 0.5,
        },
      })
      .addTo(map);

    const marker = leaflet
      .marker(
        { lat: Number(place.lat), lng: Number(place.lon) },
        {
          draggable: true,
          icon: leaflet.divIcon({
            html: `<div class="p-1 rounded-full shadow-lg w-full h-full" style="background-color: ${backgroundColor};"></div>`,
            className: "",
            iconSize: [markerSize, markerSize],
            shadowSize: [markerSize, markerSize],
          }),
        },
      )
      .addTo(map);

    const popupContent = document.createElement("div");
    popupContent.innerHTML = `
        <div>
        <strong>${place.display_name}</strong>
        <br>
        <button id="remove-btn" class="link">Remove</button>
        </div>
    `;

    marker.bindPopup(leaflet.popup().setContent(popupContent));

    popupContent.querySelector("#remove-btn")?.addEventListener("click", () => {
      map?.removeLayer(marker);
      map?.removeLayer(geo);
    });

    const updateGeoJson = () => {
      if (!map) return;

      const markerLatLng = marker.getLatLng();
      const newCoordinates = place.geojson.coordinates.map((polygon: any) =>
        polygon.map((coord: any) => [
          coord[0] + (markerLatLng.lng - Number(place.lon)),
          coord[1] + (markerLatLng.lat - Number(place.lat)),
        ]),
      );

      geo.clearLayers();
      geo.addData({
        ...(place.geojson as any),
        coordinates: newCoordinates,
      });
    };

    marker.on("move", updateGeoJson);
    updateGeoJson();
  };

  boundaries.subscribe((place) => {
    if (place != null) addPlace(place);
    return null;
  });
</script>

<svelte:window on:resize={() => map?.invalidateSize()} />

{#if error}
  <div role="alert" class="alert alert-error">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6 shrink-0 stroke-current"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <span>Error: {error}</span>
  </div>
{/if}

<div class="flex grow flex-col gap-4 md:grid md:grid-cols-3">
  <Search onResult={addBoundary} bind:error />
  <div use:mapAction class="h-full w-full cursor-pointer md:col-span-2"></div>
</div>
