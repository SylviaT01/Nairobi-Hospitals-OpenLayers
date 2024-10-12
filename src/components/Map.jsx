import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import GeoJSON from 'ol/format/GeoJSON';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import { Style, Circle as CircleStyle, Icon, Stroke, Fill } from 'ol/style';
import { transform } from 'ol/proj';
import { Overlay } from 'ol';

const NairobiMap = ({ setMapRef }) => {
    // Reference to track the map instance
    const mapRef = useRef(null);  
    const [legendItems, setLegendItems] = useState([]);

    useEffect(() => {
        // Prevent map from being created again if already initialized
        if (mapRef.current) return;  

        // Create the OpenLayers map
        const map = new Map({
            // The div ID where the map will be rendered
            target: 'map',  
            layers: [
                new TileLayer({
                    // OpenStreetMap as the basemap
                    source: new OSM(),  
                }),
            ],
            view: new View({
                // Transform from WGS84 to Web Mercator
                center: transform([36.817223, -1.286389], 'EPSG:4326', 'EPSG:3857'), 
                zoom: 12,
            }),
        });

        // Store map instance in the ref
        mapRef.current = map;  
        setMapRef(mapRef.current);

        // Create an overlay (popup) to display the hospital name
        const popup = new Overlay({
            element: document.getElementById('popup'), 
            // Automatically pan the map to show the popup
            autoPan: true,  
        });
        // Add the popup overlay to the map
        map.addOverlay(popup);  

        // Load GeoJSON data for hospitals
        fetch('assets/nairobi-hospitals.geojson')
            .then((response) => response.json())
            .then((data) => {
                const vectorSource = new VectorSource({
                    features: new GeoJSON().readFeatures(data, {
                        // Reproject the features to Web Mercator
                        featureProjection: 'EPSG:3857',  
                    }),
                });

                // Define a custom style for the hospitals using Icon
                const hospitalStyle = new Style({
                    image: new Icon({
                        src: '/assets/hospital.png', 
                        scale: 0.017,  
                        anchor: [0.5, 1],  
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
                        iconSrc: '/assets/hospital.png',
                    },
                    {
                        label: 'Nairobi County',
                        color: 'black',
                        symbol: '■',
                    },
                ]);
            });

        // Load GeoJSON data for the Nairobi boundary
        fetch('/assets/nrb-boundary.geojson')
            .then((response) => response.json())
            .then((data) => {
                const boundarySource = new VectorSource({
                    features: new GeoJSON().readFeatures(data, {
                        featureProjection: 'EPSG:3857', 
                    }),
                });

                const boundaryStyle = new Style({
                    stroke: new Stroke({
                        color: 'black',
                        width: 2,
                    }),
                    fill: new Fill({
                        color: 'rgba(0, 0, 0, 0)',  
                    }),
                });

                const boundaryLayer = new VectorLayer({
                    source: boundarySource,
                    // Apply style to the vector layer
                    style: boundaryStyle,  
                });
                // Add the boundary layer to the map
                map.addLayer(boundaryLayer);
            });
    }, [setMapRef]);

    return (
        <div className="flex bg-slate-200">
            <div className="flex-grow">
                <div id="map" className="w-full h-[600px] rounded-lg shadow-lg"></div>
            </div>

            
            <div className="w-48 p-4 bg-white shadow-md">
                <h2 className="text-xl font-bold mb-2 underline">Legend</h2>
                <ul>
                    {legendItems.map((item, index) => (
                        <li key={index} className="flex items-center mb-2">
                            {item.iconSrc ? (
                                <img
                                    src={item.iconSrc} 
                                    alt={item.label}
                                    className="w-5 h-5 mr-2"  
                                />
                            ) : (
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
                            )}
                            {item.label}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default NairobiMap;
