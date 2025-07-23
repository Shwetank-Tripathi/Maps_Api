import {useState} from 'react';
import MapComponent from './MapComponent';
import PatientSearch from './PatientSearch';
import axios from 'axios';

const initialDoctorForm = {
  name: '',
  email: '',
  speciality: '',
  address: '',
  location: null,
}


const MainContent = () => {
  const [role, setRole] = useState('patient');
  const [doctorForm, setDoctorForm] = useState(initialDoctorForm);
  const [registerMsg, setRegisterMsg] = useState('');
  const [patientLocation, setPatientLocation] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  const handleDoctorInput = (e) => {
    const {name, value} = e.target;
    setDoctorForm(f => ({...f, [name]: value}));
  }

  const handleMapSelect = (locationData) => {
    const { coordinates, address } = locationData;
    const { lat, lng } = coordinates;
    
    setDoctorForm(f => ({
      ...f, 
      location: {type: 'Point', coordinates: [lng, lat]},
      address: f.address === '' && address ? address : f.address
    }));
  }

  const handlePatientLocationSelect = (locationData) => {
    const { coordinates } = locationData;
    setPatientLocation(coordinates);
  }

  const handleDoctorSearch = async (e) => {
    e.preventDefault();
    if(!patientLocation) {
      alert('Please select a location first!');
      return;
    }
    try {
      const res = await axios.get('http://localhost:3000/api/patients/doc-search', {
        params: {
          latitude: patientLocation.lat,
          longitude: patientLocation.lng
      }
    })
    setSearchResults(res.data.doctors || []);
    } catch (error) {
      alert(error.response?.message || 'Error searching for doctors');
    }
  };

    const handleDoctorSubmit = async (e) => {
      e.preventDefault();
      setRegisterMsg('');

      if(!doctorForm.name || !doctorForm.email || !doctorForm.speciality || !doctorForm.address || !doctorForm.location) {
        setRegisterMsg('All fields are required');
        return;
      }
      if(!doctorForm.email.includes('@') || !doctorForm.email.includes('.')) {
        setRegisterMsg('Invalid email address');
        return;
      }
      if(!doctorForm.address) {
        setRegisterMsg('Address is required');
        return;
      }
      if(typeof doctorForm.location !== 'object' || !doctorForm.location.coordinates || doctorForm.location.coordinates.length !== 2) {
        setRegisterMsg('Invalid location');
        return;
      }

      try {
        const res = await axios.post('http://localhost:3000/api/doctors/register', doctorForm);
        if(res.status === 201) {
          setRegisterMsg('Doctor registered successfully');
          setDoctorForm(initialDoctorForm);
        } else {
          setRegisterMsg(res.data.message || 'Failed to register doctor');
        }
      } catch (error) {
      setRegisterMsg(error.response?.data?.message || 'Error connecting to server');
    }
  };

  return (
    <div className="flex flex-col items-center h-170 w-170 rounded-lg shadow-lg p-4 m-4 border-2 border-gray-300 ">
      <div className="flex flex-row items-center justify-center h-7 w-40 border-2 border-gray-300 rounded-lg top-0 left-40 gap-2">
        <div className={`flex items-center justify-center h-4 w-15 rounded-full hover:bg-gray-700 cursor-pointer ${role === 'patient' ? 'bg-gray-500 text-white hover:bg-gray-700' : ''}`} onClick={() => setRole('patient')}>Patient</div>
        <div className={`flex items-center justify-center h-4 w-15 rounded-full hover:bg-gray-700 cursor-pointer ${role === 'doctor' ? 'bg-gray-500 text-white hover:bg-gray-700' : ''}`} onClick={() => setRole('doctor')}>Doctor</div>
      </div>
      {role === 'patient' && (
        <div className="flex flex-col items-center justify-center gap-2 mt-7">
          <div className="flex flex-row items-center justify-center gap-2">
            <PatientSearch onLocationSelect={handlePatientLocationSelect} />
            <button 
            type="submit" 
            className="bg-blue-500 text-white rounded-lg p-2 hover:bg-blue-700" 
            onClick={handleDoctorSearch}
            >
              Search
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-4 w-full">
              <h3 className="font-bold mb-2">Nearby Doctors:</h3>
              <ul>
                {searchResults.map((doctor, index) => (
                  <li key={doctor._id || index} className="border-b py-2">
                    <h4>{doctor.name}</h4>
                    <p>{doctor.email}</p>
                    <p>{doctor.speciality}</p>
                    <p>{doctor.address}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {role === 'doctor' && (
        <div className="doctor-form">
          <form className="flex flex-col items-center justify-center gap-2 mt-7" onSubmit={handleDoctorSubmit}>
            <input 
              type="text"
              name="name"
              placeholder="Name" 
              required
              value={doctorForm.name}
              onChange={handleDoctorInput}
              className="border-2 border-gray-500 rounded-lg p-2"
            />
            <input 
              type="email" 
              name="email"
              placeholder="Email"
              required
              value={doctorForm.email}
              onChange={handleDoctorInput}
              className="border-2 border-gray-500 rounded-lg p-2"
            />
            <input 
              type="text" 
              name="speciality"
              placeholder="Speciality" 
              required
              value={doctorForm.speciality}
              onChange={handleDoctorInput}
              className="border-2 border-gray-500 rounded-lg p-2"
            />
            <div className="flex flex-col items-center justify-center w-full">
              <MapComponent onLocationSelect={handleMapSelect} />
              {doctorForm.location && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>Selected: Lat {doctorForm.location.coordinates[1]}, Lng {doctorForm.location.coordinates[0]}</p>
                </div>
              )}
            </div>
            <button type="submit" className="bg-blue-500 text-white rounded-lg p-2 hover:bg-blue-700">Register</button>
            {registerMsg && <div className="text-red-500 text-sm mt-2">{registerMsg}</div>}
          </form>
        </div>
      )}
    </div>
  )
}

export default MainContent;