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
      
      if (onLocationSelect) {
        onLocationSelect({ 
          coordinates: coords, 
          address: '' 
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
              address: ''
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


