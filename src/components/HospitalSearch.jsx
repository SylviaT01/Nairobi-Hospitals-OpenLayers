import React, { useState, useEffect } from 'react';
import { transform } from 'ol/proj';  // Import the transform function to reproject coordinates

const HospitalSearch = ({ map }) => {
  const [hospitals, setHospitals] = useState([]);
  const [query, setQuery] = useState('');
  const [filteredHospitals, setFilteredHospitals] = useState([]);

  // Fetch the GeoJSON data for hospitals when the component mounts
  useEffect(() => {
    fetch('assets/nairobi-hospitals.geojson')
      .then((response) => response.json())
      .then((data) => {
        const features = data.features.map((feature) => ({
          name: feature.properties.name,
          coordinates: feature.geometry.coordinates,  // Get the coordinates
        }));
        setHospitals(features);
      })
      .catch((error) => console.error('Error fetching hospitals:', error));
  }, []);

  // Handle search input change
  const handleSearchChange = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setQuery(searchTerm);

    // Filter hospitals by name based on search query
    const filtered = hospitals.filter((hospital) =>
      hospital.name.toLowerCase().includes(searchTerm)
    );
    setFilteredHospitals(filtered);
  };

  // Handle hospital selection from the search results
  const handleHospitalSelect = (hospital) => {
    // Ensure the map object is defined
    if (!map) {
      console.error('Map object is undefined');
      return;
    }

    // Reproject the coordinates from EPSG:4326 (WGS84) to EPSG:3857 (Web Mercator)
    const [lon, lat] = hospital.coordinates;
    const projectedCoordinates = transform([lon, lat], 'EPSG:4326', 'EPSG:3857');  // Reproject coordinates

    const view = map.getView();
    view.setCenter(projectedCoordinates);  // Set the map center to the reprojected coordinates
    view.setZoom(20);  // Zoom in to the hospital

    // Optionally clear the search after selecting
    setQuery('');
    setFilteredHospitals([]);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={handleSearchChange}
        placeholder="Search for a hospital..."
        className="border p-2 w-full rounded text-black"
      />
      
      {/* Display the filtered results */}
      {filteredHospitals.length > 0 && (
        <ul className="absolute bg-white border w-full mt-1 rounded shadow-lg max-h-48 overflow-y-auto z-10">
          {filteredHospitals.map((hospital, index) => (
            <li
              key={index}
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleHospitalSelect(hospital)}
            >
              {hospital.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HospitalSearch;
