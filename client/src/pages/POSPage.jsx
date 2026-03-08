import { useState } from 'react';
import axios from 'axios';
import { Package, MapPin, User, Leaf, ShieldAlert } from 'lucide-react';
import VerificationPanel from '../components/VerificationPanel';

export default function POSPage() {
  const userStr = localStorage.getItem('subsidy_user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  const [formData, setFormData] = useState({
    aadhaar_id: '',
    name: '',
    crop_type: 'wheat',
    fertilizer_type: 'Urea',
    quantity: '',
    retailer_id: user?.shopId || 'RET001'
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [farmerData, setFarmerData] = useState(null);
  const [fetchingFarmer, setFetchingFarmer] = useState(false);

  const handleAadhaarChange = async (aadhaar) => {
    setFormData({...formData, aadhaar_id: aadhaar});
    
    if (aadhaar.length === 12) {
      setFetchingFarmer(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/farmers/${aadhaar}`);
        setFarmerData(response.data);
        setFormData(prev => ({
          ...prev,
          name: response.data.farmer.name,
          crop_type: response.data.farmer.crop.toLowerCase()
        }));
      } catch (error) {
        setFarmerData(null);
        setFormData(prev => ({...prev, name: ''}));
        if (error.response?.status === 404) {
          alert('Farmer not found in database');
        }
      } finally {
        setFetchingFarmer(false);
      }
    } else {
      setFarmerData(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!farmerData) {
      alert('Please enter a valid Aadhaar ID to fetch farmer details');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post('http://localhost:5000/api/transactions/verify', formData);
      setResult(response.data);
    } catch (error) {
      console.error("Error verifying transaction", error);
      alert('Error connecting to Subsidy Guard API');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFormData({ ...formData, quantity: '', aadhaar_id: '', name: '' });
    setFarmerData(null);
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">New Fertilizer Sale</h1>
        <p className="text-gray-600 mt-2">Enter farmer details and purchase quantities for verification.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Card */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Farmer Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                <User className="w-5 h-5 text-blue-600" />
                Farmer Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar ID</label>
                  <input
                    type="text"
                    required
                    maxLength="12"
                    pattern="\d{12}"
                    placeholder="12 digit number"
                    className="input-field"
                    value={formData.aadhaar_id}
                    onChange={e => handleAadhaarChange(e.target.value)}
                  />
                  {fetchingFarmer && <p className="text-xs text-blue-600 mt-1">Fetching farmer data...</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farmer Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.name}
                    readOnly
                    placeholder="Auto-filled"
                  />
                </div>
              </div>
              {farmerData && (
                <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                  <p className="text-green-800 font-medium">✓ Farmer verified</p>
                  <p className="text-green-700 mt-1">Land: {farmerData.farmer.land_size} acres | District: {farmerData.farmer.district}</p>
                </div>
              )}
            </div>

            {/* Farm Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                Land & Crop Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Land Size (Acres)</label>
                  <input
                    type="text"
                    className="input-field bg-gray-100"
                    value={farmerData ? farmerData.farmer.land_size : ''}
                    readOnly
                    placeholder="Auto-filled"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Crop</label>
                  <input
                    type="text"
                    className="input-field bg-gray-100"
                    value={farmerData ? farmerData.farmer.crop : ''}
                    readOnly
                    placeholder="Auto-filled"
                  />
                </div>
              </div>
            </div>

            {/* Purchase Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                <Package className="w-5 h-5 text-green-600" />
                Purchase Summary
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fertilizer Type</label>
                  <select
                    className="input-field"
                    value={formData.fertilizer_type}
                    onChange={e => setFormData({...formData, fertilizer_type: e.target.value})}
                  >
                    <option value="Urea">Urea (Subsidized)</option>
                    <option value="DAP">DAP (Subsidized)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (number of bags)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="input-field"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || result || !farmerData} 
              className="btn btn-primary w-full py-3 text-lg mt-4 shadow-md flex items-center justify-center gap-2 font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShieldAlert className="w-6 h-6" />
                  Verify Transaction
                </>
              )}
            </button>
            <p className="text-xs text-center text-gray-500 mt-2">
              Subsidy Guard will analyze records before approval.
            </p>
          </form>
        </div>

        {/* Verification Area */}
        <div>
          {result ? (
            <VerificationPanel result={result} onReset={handleReset} />
          ) : (
            <div className="h-full border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50 bg-opacity-50">
              <Leaf className="w-16 h-16 mb-4 opacity-50 text-green-600" />
              <p className="text-lg font-medium text-gray-600">Awaiting Verification</p>
              <p className="text-sm mt-2 max-w-xs">
                Fill the transaction details and click Verify to run AI checks on the subsidy purchase.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
