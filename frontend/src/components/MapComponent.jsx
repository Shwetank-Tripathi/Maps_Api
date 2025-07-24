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
  const [address, setAddress] = useState(''); 

  const geocodeLatLng = useCallback((lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setAddress(results[0].formatted_address);
        if (onLocationSelect) {
          onLocationSelect({
            coordinates: latlng,
            address: results[0].formatted_address,
          });
        }
      } else {
        setAddress('');
        if (onLocationSelect) {
          onLocationSelect({
            coordinates: latlng,
            address: '',
          });
        }
      }
    });
  }, [onLocationSelect]);

  const onPlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (place && place.geometry) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const coords = { lat, lng };
      const address = place.formatted_address || place.name || '';
      
      setCenter(coords);
      setMarker(coords);
      setAddress(address);
      
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
      setCenter(coords);
      geocodeLatLng(lat, lng);
    },
    [geocodeLatLng]
  );

  const handleMarkerDragEnd = useCallback(
    (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const coords = { lat, lng };
      setMarker(coords);
      setCenter(coords);
      geocodeLatLng(lat, lng);
    },
    [geocodeLatLng]
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
          geocodeLatLng(latitude, longitude);
          mapRef.current?.panTo(coords);
        },
        () => {}
      );
    }
  }, [geocodeLatLng]);

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
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
      </Autocomplete>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        onClick={handleMapClick}
        onLoad={map => (mapRef.current = map)}
      >
        {marker && (
          <Marker
            position={marker}
            draggable={true}
            onDragEnd={handleMarkerDragEnd}
          />
        )}
      </GoogleMap>
    </div>
  );
}


