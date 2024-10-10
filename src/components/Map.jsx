import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import GeoJSON from 'ol/format/GeoJSON';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import { transform } from 'ol/proj';

const NairobiMap = ({ setMapRef }) => {
  const mapRef = useRef(null);  // Reference to track the map instance
  const [legendItems, setLegendItems] = useState([]);

  useEffect(() => {
    if (mapRef.current) return;  // Prevent map from being created again if already initialized

    // Create the OpenLayers map
    const map = new Map({
      target: 'map',  // The div ID where the map will be rendered
      layers: [
        new TileLayer({
          source: new OSM(),  // OpenStreetMap as the basemap
        }),
      ],
      view: new View({
        center: transform([36.817223, -1.286389], 'EPSG:4326', 'EPSG:3857'), // Transform from WGS84 to Web Mercator
        zoom: 12,
      }),
    });

    mapRef.current = map;  // Store map instance in the ref

    // Pass the mapRef to the parent component (App.js) via setMapRef
    setMapRef(mapRef.current);

    // Load GeoJSON data for hospitals
    fetch('assets/nairobi-hospitals.geojson')
      .then((response) => response.json())
      .then((data) => {
        const vectorSource = new VectorSource({
          features: new GeoJSON().readFeatures(data, {
            featureProjection: 'EPSG:3857',  // Reproject the features to Web Mercator
          }),
        });

        // Define a custom style for the hospitals
        const hospitalStyle = new Style({
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({ color: '#FF5733' }),
            stroke: new Stroke({
              color: '#FFFFFF',
              width: 2,
            }),
          }),
        });

        const hospitalLayer = new VectorLayer({
          source: vectorSource,
          style: hospitalStyle, 
        });

        map.addLayer(hospitalLayer);

        // Update legend items dynamically
        setLegendItems([
          {
            label: 'Hospitals',
            color: '#FF5733',
            symbol: '●',
          },
          {
            label: 'Nairobi County',
            color: 'black',
            symbol: '■',
          },
        ]);
      })
      fetch('/assets/nrb-boundary.geojson')
            .then((response) => response.json())
            .then((data) => {
                // Create a vector source for the boundary data
                const boundarySource = new VectorSource({
                    features: new GeoJSON().readFeatures(data, {
                        // Reproject to Web Mercator
                        featureProjection: 'EPSG:3857',
                    }),
                });

                const boundaryStyle = new Style({
                    stroke: new Stroke({
                        color: 'black',
                        width: 2,
                    }),
                    fill: new Fill({
                        color: 'transparent', 
                      }),
                });

                const boundaryLayer = new VectorLayer({
                    source: boundarySource,
                    style: boundaryStyle,
                });
                // Add the layer to map
                map.addLayer(boundaryLayer);
            })

  }, [setMapRef]);

  return (
    <div className="flex bg-slate-200">
      <div className="flex-grow">
        <div id="map" className="w-full h-[600px] rounded-lg shadow-lg"></div>
      </div>

      {/* Legend Section */}
      <div className="w-48 p-4 bg-white shadow-md ">
        <h2 className="text-xl font-bold mb-2 underline">Legend</h2>
        <ul>
          {legendItems.map((item, index) => (
            <li key={index} className="flex items-center mb-2">
              <span
                style={{
                  display: 'inline-block',
                  width: item.symbol === '■' ? '20px' : '10px',
                  height: item.symbol === '■' ? '10px' : '10px',
                  border: item.symbol === '■' ? `2px solid ${item.color}` : 'none',
                  borderRadius: item.symbol === '●' ? '50%' : '0',
                  backgroundColor: item.symbol === '●' ? `${item.color}` : 'none',
                  marginRight: item.symbol === '●' ? '8px' : '8px',
                }}
              ></span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NairobiMap;
