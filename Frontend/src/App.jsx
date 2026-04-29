import { Routes, Route } from 'react-router-dom'
import { useState } from 'react';
import CreateMatchForm from './components/CreateMatchForm.jsx';
import MatchDetail from './components/MatchDetail.jsx';
import MatchList from './components/MatchList.jsx';

function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleMatchCreated = () => {
    setRefreshKey(r => r + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
            Live Sports Dashboard
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
            Real-time match updates and live commentary feed
          </p>
        </div>
        
        <CreateMatchForm onCreated={handleMatchCreated} />
        
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Live & Upcoming Matches</h2>
          <p className="text-lg text-gray-600">Latest matches from your backend API</p>
        </div>

        <MatchList key={refreshKey} />
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/match/:id" element={<MatchDetail />} />
      </Routes>
    </div>
  )
}

export default App
