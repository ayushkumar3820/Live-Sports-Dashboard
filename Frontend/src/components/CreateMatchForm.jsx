import { useState } from 'react';
import { createMatch } from '../api.js';
import { Plus, Calendar, Send } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function CreateMatchForm({ onCreated }) {
  const [formData, setFormData] = useState({
    sport: 'Football',
    homeTeam: '',
    awayTeam: '',
    startTime: '',
    endTime: '',
    homeScore: 0,
    awayScore: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      };
      const newMatch = await createMatch(data);
      onCreated?.(newMatch);
      setFormData({
        sport: 'Football',
        homeTeam: '',
        awayTeam: '',
        startTime: '',
        endTime: '',
        homeScore: 0,
        awayScore: 0
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 shadow-2xl mb-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl">
          <Plus className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Create New Match</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sport</label>
          <select
            value={formData.sport}
            onChange={(e) => setFormData({...formData, sport: e.target.value})}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option>Football</option>
            <option>Basketball</option>
            <option>Tennis</option>
            <option>Cricket</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
          <input
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Home Team</label>
          <input
            type="text"
            value={formData.homeTeam}
            onChange={(e) => setFormData({...formData, homeTeam: e.target.value})}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Real Madrid"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Away Team</label>
          <input
            type="text"
            value={formData.awayTeam}
            onChange={(e) => setFormData({...formData, awayTeam: e.target.value})}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Barcelona"
            required
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-emerald-700 hover:to-green-700 focus:ring-4 focus:ring-emerald-500 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Calendar className="h-5 w-5" />
            Create Match
          </>
        )}
      </button>
    </form>
  );
}
