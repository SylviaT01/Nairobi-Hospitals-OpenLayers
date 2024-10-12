import React, {useState} from 'react';
import HospitalSearch from './HospitalSearch';



const NavBar = ({ map }) => {
  return (
    <div>
      <header className="bg-blue-900 flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">Hospitals</h1>
        <HospitalSearch map={map} />
        
        <p className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">Join our team</p>
      </header>
      <nav className="bg-slate-200 shadow-md">
        <ul className="flex space-x-6 p-4">
          <li>
            <a href="/" className="text-blue-900 hover:text-blue-600">Home</a>
          </li>
          <li>
            <a href="/about" className="text-blue-900 hover:text-blue-600">About</a>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default NavBar;