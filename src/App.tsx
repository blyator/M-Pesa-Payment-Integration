import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MpesaCheckout from './components/Mpesa';
import SuccessPage from './components/SuccessPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MpesaCheckout />} />
        <Route path="/success" element={<SuccessPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
