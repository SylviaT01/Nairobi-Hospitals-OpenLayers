import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import GeoJSON from 'ol/format/GeoJSON';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import { Style, Icon, Stroke, Fill } from 'ol/style';
import { transform } from 'ol/proj';
import { Overlay } from 'ol';

const NairobiMap = ({ setMapRef }) => {
    const mapRef = useRef(null);
    const [legendItems, setLegendItems] = useState([]);
    const [hospitalCounts, setHospitalCounts] = useState({});
    const [hospitalsInSubCounty, setHospitalsInSubCounty] = useState([]);
    const [selectedSubCounty, setSelectedSubCounty] = useState('Dagoretti');
    const [subCounties, setSubCounties] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);  // Track current page
    const hospitalsPerPage = 8;  // Number of hospitals per page

    useEffect(() => {
        if (mapRef.current) return;

        const map = new Map({
            target: 'map',
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
            ],
            view: new View({
                center: transform([36.817223, -1.286389], 'EPSG:4326', 'EPSG:3857'),
                zoom: 12,
            }),
        });

        mapRef.current = map;
        setMapRef(mapRef.current);

        const popup = new Overlay({
            element: document.getElementById('popup'),
            autoPan: true,
        });
        map.addOverlay(popup);

        // Load GeoJSON data for hospitals
        fetch('/assets/hospitals-sub-county.geojson')
            .then((response) => response.json())
            .then((data) => {
                const vectorSource = new VectorSource({
                    features: new GeoJSON().readFeatures(data, {
                        featureProjection: 'EPSG:3857',
                    }),
                });

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

                // Extract hospitals and store them
                const hospitalsData = vectorSource.getFeatures().map((feature) => ({
                    name: feature.get('name'),
                    coordinates: feature.getGeometry().getCoordinates(),
                    subCounty: feature.get('ADM2_EN_6'),
                }));
                setHospitals(hospitalsData);

                // Filter hospitals by sub-county
                const hospitalsInSubCounty = filterHospitalsBySubCounty(hospitalsData, selectedSubCounty);
                setHospitalsInSubCounty(hospitalsInSubCounty);
                
            });

        // Load GeoJSON data for Nairobi boundary
        fetch('/assets/nrb-boundary.geojson')
            .then((response) => response.json())
            .then((data) => {
                const boundarySource = new VectorSource({
                    features: new GeoJSON().readFeatures(data, {
                        featureProjection: 'EPSG:3857',
                    }),
                });

                const boundaryStyle = new Style({
                    stroke: new Stroke({ color: 'black', width: 3 }),
                    fill: new Fill({ color: 'rgba(0, 0, 0, 0)' }),
                });

                const boundaryLayer = new VectorLayer({
                    source: boundarySource,
                    style: boundaryStyle,
                });
                map.addLayer(boundaryLayer);
            });

        // Load sub-county GeoJSON
        fetch('/assets/nrb-sub-county.geojson')
            .then((response) => response.json())
            .then((data) => {
                const subCountySource = new VectorSource({
                    features: new GeoJSON().readFeatures(data, {
                        featureProjection: 'EPSG:3857',
                    }),
                });

                const subCountyStyle = new Style({
                    stroke: new Stroke({ color: 'gray', width: 2 }),
                    fill: new Fill({ color: 'rgba(0, 0, 0, 0)' }),
                });

                const subcountyLayer = new VectorLayer({
                    source: subCountySource,
                    style: subCountyStyle,
                });
                map.addLayer(subcountyLayer);

                // Extract sub-county names
                const subCountyNames = data.features.map((feature) => feature.properties['ADM2_EN']);
                setSubCounties(subCountyNames);
            });
            setLegendItems([
                { label: 'Hospitals', iconSrc: '/assets/hospital.png' },
                { label: 'Nairobi County', color: 'black', symbol: '■' },
                { label: 'Sub-County Boundary', color: 'gray', symbol: '■' },
            ]);

    }, [setMapRef, selectedSubCounty]);

    const filterHospitalsBySubCounty = (hospitals, subCountyName) => {
        return hospitals.filter((hospital) => hospital.subCounty === subCountyName);
    };

    const handleSubCountyChange = (event) => {
        const selectedSubCounty = event.target.value;
        setSelectedSubCounty(selectedSubCounty);

        // Filter hospitals based on the selected sub-county
        const hospitalsInSubCounty = filterHospitalsBySubCounty(hospitals, selectedSubCounty);
        setHospitalsInSubCounty(hospitalsInSubCounty);
        setCurrentPage(1);
    };

    const handleViewMore = () => {
        setCurrentPage(currentPage + 1);
    };

    // Paginate hospitals
    const indexOfLastHospital = currentPage * hospitalsPerPage;
    const indexOfFirstHospital = indexOfLastHospital - hospitalsPerPage;
    const currentHospitals = hospitalsInSubCounty.slice(indexOfFirstHospital, indexOfLastHospital);

    return (
        <div className="flex bg-slate-200">
            <div className="flex-grow">
                <div id="map" className="w-full h-[700px] rounded-lg shadow-lg"></div>
            </div>

            <div className="w-52 p-4 bg-white shadow-md">
                <h2 className="text-lg font-semibold mb-2 underline">Legend</h2>
                <ul>
                    {legendItems.map((item, index) => (
                        <li key={index} className="flex items-center mb-2">
                            {item.iconSrc ? (
                                <img src={item.iconSrc} alt={item.label} className="w-5 h-5 mr-2" />
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
                <div className="w-54 p-2 bg-white shadow-md">
                    <h2 className="text-md font-bold mb-2 underline">Select a Sub-County</h2>
                    <select
                        value={selectedSubCounty}
                        onChange={handleSubCountyChange}
                        className="w-full p-2 mb-4 text-xs"
                    >
                        {subCounties.map((subCounty, index) => (
                            <option key={index} value={subCounty}>
                                {subCounty}
                            </option>
                        ))}
                    </select>

                    <h2 className="text-md font-semibold mb-2 underline">Hospitals in {selectedSubCounty}({hospitalsInSubCounty.length} total)</h2>
                    <ul className="gap-2">
                        {currentHospitals.length > 0 ? (
                            currentHospitals.map((hospital, index) => (
                                <li key={index} className="mb-2 text-sm">
                                    - {hospital.name}
                                </li>
                            ))
                        ) : (
                            <li>No hospitals found in {selectedSubCounty}</li>
                        )}
                    </ul>

                    {hospitalsInSubCounty.length > currentPage * hospitalsPerPage && (
                        <button
                            onClick={handleViewMore}
                            className="mt-2 p-2 w-full bg-blue-700 text-white rounded hover:bg-blue-900"
                        >
                            View More
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NairobiMap;
