import { GoogleMap, Marker, useLoadScript, Autocomplete } from '@react-google-maps/api';
import { useState, useRef, useEffect, useCallback } from 'react';

const containerStyle = { width: '200px', height: '200px' };
const defaultCenter = { lat: 0, lng: 0 };

export default function MapComponent({ onLocationSelect }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const [center, setCenter] = useState(defaultCenter);
  const [marker, setMarker] = useState(null);
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);
  const geolocationInitialized = useRef(false);

  const onPlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (place && place.geometry) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const coords = { lat, lng };
      const address = place.formatted_address || place.name || '';
      
      setCenter(coords);
      setMarker(coords);
      
      // Pass both coordinates and address
      if (onLocationSelect) {
        onLocationSelect({ 
          coordinates: coords, 
          address: address 
        });
      }
      
      mapRef.current?.panTo(coords);
    }
  }, [onLocationSelect]);

  const handleMapClick = useCallback(
    (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const coords = { lat, lng };
      setMarker(coords);
      
      // For map clicks, we only have coordinates, no address
      if (onLocationSelect) {
        onLocationSelect({ 
          coordinates: coords, 
          address: '' // Empty address for direct map clicks
        });
      }
    },
    [onLocationSelect]
  );

  useEffect(() => {
    if (!geolocationInitialized.current && navigator.geolocation) {
      geolocationInitialized.current = true;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const coords = { lat: latitude, lng: longitude };
          setCenter(coords);
          setMarker(coords);
            
          if (onLocationSelect) {
            onLocationSelect({ 
              coordinates: coords, 
              address: '' // Empty address for geolocation
            });
          }
          
          mapRef.current?.panTo(coords);
        },
        () => {}
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className="flex flex-col items-center justify-center w-full gap-2">
      <Autocomplete
        onLoad={(ref) => (autocompleteRef.current = ref)}
        onPlaceChanged={onPlaceChanged}
      >
        <input
          type="text"
          placeholder="Search address"
          className="border-2 border-gray-500 rounded-lg p-2 "
        />
      </Autocomplete>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        onLoad={(map) => (mapRef.current = map)}
        onClick={handleMapClick}
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>
    </div>
  );
}

// import React, { useState } from "react";
// import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

// const MapComponent = () => {
//   const [markerLocation] = useState({
//     lat: 51.509865,
//     lng: -0.118092, // London
//   });

//   return (
//     <div className="flex justify-evenly p-20 font-sans">
//       <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
//         <div className="h-[500px] w-1/2 border-2 border-black rounded-2xl overflow-hidden shadow-md">
//           <Map
//             style={{ width: "100%", height: "100%" }}
//             defaultZoom={13}
//             defaultCenter={markerLocation}
//             gestureHandling="greedy"
//             disableDefaultUI
//           >
//             <Marker position={markerLocation} />
//           </Map>
//         </div>
//       </APIProvider>
//     </div>
//   );
// };

// export default MapComponent;


