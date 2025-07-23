import {useLoadScript, Autocomplete} from '@react-google-maps/api';
import {useState, useRef} from 'react';

const libraries = ['places'];

const PatientSearch = ({onLocationSelect}) => {
    const {isLoaded} = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const autocompleteRef = useRef(null);
    const [inputValue, setInputValue] = useState('');
    const [selected, setSelected] = useState(null);

    if (!isLoaded) return <div>Loading...</div>;

    const onPlaceChanged = () => {
        const place = autocompleteRef.current?.getPlace();
        if (place && place.geometry) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const address = place.formatted_address || place.name || '';
            
            const locationData = {
                coordinates: { lat, lng },
                address: address
            };
            
            setSelected(locationData);
            if (onLocationSelect) onLocationSelect(locationData);
        }
    };

  return (
    <div>
        <Autocomplete
        onLoad={(ref) => (autocompleteRef.current = ref)}
        onPlaceChanged={onPlaceChanged}
        >
            <input
            type="text"
            placeholder="Enter a location"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="border-2 border-gray-500 rounded-lg p-2"
            />
        </Autocomplete>
        {selected && (
            <div className="flex flex-col items-center justify-center w-full gap-2">
                {selected.address && <div>Selected: {selected.address}</div>}
            </div>
        )}
    </div>
  )
}

export default PatientSearch