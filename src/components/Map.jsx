import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import GeoJSON from 'ol/format/GeoJSON';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import { transform } from 'ol/proj';

const NairobiMap = () => {
  const mapRef = useRef(null);  // Reference to track the map instance

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

    // Load GeoJSON data
    fetch('assets/nairobi-hospitals.geojson')  
      .then((response) => response.json())
      .then((data) => {
        console.log('GeoJSON Data:', data);  

        const vectorSource = new VectorSource({
          features: new GeoJSON().readFeatures(data, {
            featureProjection: 'EPSG:3857',  // Reproject the features to Web Mercator
          }),
        });

        // Define a custom style for the hospitals
        const hospitalStyle = new Style({
          image: new CircleStyle({
            radius: 5, 
            fill: new Fill({ color: '#FF5733' }),  // Orange color for hospitals
            stroke: new Stroke({
              color: '#FFFFFF',
              width: 2,
            }),
          }),
        });

        const hospitalLayer = new VectorLayer({
          source: vectorSource,
          style: hospitalStyle,  // Apply the custom style here
        });

        // Add the hospital layer to the map
        map.addLayer(hospitalLayer);
      })
      .catch((error) => console.error('Error fetching GeoJSON:', error));

    mapRef.current = map;  // Store map instance in ref
  }, []);

  return <div id="map" style={{ width: '100%', height: '600px' }} />;
};

export default NairobiMap;
