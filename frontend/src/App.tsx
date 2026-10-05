import { useEffect, useRef } from "react";
import {
  Map,
  NavigationControl,
  Popup,
  setWorkerUrl,
} from "maplibre-gl";

import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

import "maplibre-gl/dist/maplibre-gl.css";

setWorkerUrl(workerUrl);

function App() {
  const mapContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [-120.7, 47.4],
      zoom: 6,
    });

    map.addControl(
      new NavigationControl(),
      "top-right"
    );

    map.on("error", (event) => {
      console.error("MAP ERROR:", event);
    });

    map.on("load", async () => {
      try {
        // Get wildfire data from our FastAPI backend
        const response = await fetch(
          "http://127.0.0.1:8000/wildfires"
        );

        if (!response.ok) {
          throw new Error(
            `Wildfire API returned ${response.status}`
          );
        }

        const wildfireData = await response.json();

        console.log(
          "Wildfire data loaded:",
          wildfireData
        );

        // Add wildfire GeoJSON data to the map
        map.addSource("wildfires", {
          type: "geojson",
          data: wildfireData,
        });

        // Display each wildfire as a red circle
        map.addLayer({
          id: "wildfire-markers",
          type: "circle",
          source: "wildfires",
          paint: {
            "circle-radius": 8,
            "circle-color": "#ff3b30",
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 2,
          },
        });

        // Change cursor when hovering over a wildfire
        map.on("mouseenter", "wildfire-markers", () => {
          map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", "wildfire-markers", () => {
          map.getCanvas().style.cursor = "";
        });

        // Show wildfire information when clicked
        map.on("click", "wildfire-markers", (event) => {
          const feature = event.features?.[0];

          if (!feature) return;

          const properties = feature.properties || {};

          if (feature.geometry.type !== "Point") {
            return;
          }

          const coordinates = feature.geometry.coordinates as [
            number,
            number
          ];

          // Basic fire information
          const fireName =
            properties.INCIDENT_NM || "Unknown Fire";

          const acres =
            properties.ACRES_BURNED ?? "Unknown";

          const county =
            properties.COUNTY_LABEL_NM || "Unknown";

          // Additional DNR information
          const cause =
            properties.FIREGCAUSE_LABEL_NM || "Unknown";

          const agency =
            properties.START_OWNER_AGENCY_NM || "Unknown";

          const jurisdiction =
            properties.START_JURISDICTION_AGENCY_NM ||
            "Unknown";

          const protectionType =
            properties.PROTECTION_TYPE || "Unknown";

          const region =
            properties.REGION_NAME || "Unknown";

          const discoveryDate =
            properties.DSCVR_DT
              ? new Date(
                  properties.DSCVR_DT
                ).toLocaleDateString()
              : "Unknown";

          // Create popup
          new Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div style="min-width: 220px;">
                <h3 style="margin-top: 0;">
                  🔥 ${fireName}
                </h3>

                <p>
                  <strong>County:</strong> ${county}
                </p>

                <p>
                  <strong>Acres burned:</strong> ${acres}
                </p>

                <p>
                  <strong>Discovered:</strong> ${discoveryDate}
                </p>

                <p>
                  <strong>Cause:</strong> ${cause}
                </p>

                <p>
                  <strong>Agency:</strong> ${agency}
                </p>

                <p>
                  <strong>Jurisdiction:</strong> ${jurisdiction}
                </p>

                <p>
                  <strong>Protection:</strong> ${protectionType}
                </p>

                <p>
                  <strong>Region:</strong> ${region}
                </p>
              </div>
            `)
            .addTo(map);
        });

        console.log(
          "Wildfire markers added to map!"
        );
      } catch (error) {
        console.error(
          "Failed to load wildfire data:",
          error
        );
      }
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        width: "100%",
      }}
    />
  );
}

export default App;