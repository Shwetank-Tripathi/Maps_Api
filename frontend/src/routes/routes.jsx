import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import MainContent from '../components/MainContent';
import MapComponent from '../components/MapComponent';
import PatientSearch from '../components/PatientSearch';

export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainContent />} />
                <Route path="/map" element={<MapComponent />} />
                <Route path="/patient-search" element={<PatientSearch />} />
            </Routes>
        </Router>
    )
};