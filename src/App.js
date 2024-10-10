import React, { useState } from 'react';
import NairobiMap from './components/Map.jsx';
import NavBar from './components/NavBar.jsx';

function App() {
  const [map, setMap] = useState(null);  // State to hold the map instance

  return (
    <div className="App">
      <NavBar map={map}  />  
      <NairobiMap setMapRef={setMap} /> 
    </div>
  );
}

export default App;
