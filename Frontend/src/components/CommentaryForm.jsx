import { useState } from 'react';
import { addCommentary } from '../api.js';
import { Loader2, MessageSquarePlus, Send } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket.js';

export default function CommentaryForm({ matchId, onAdded }) {
  const [formData, setFormData] = useState({
    minute: '',
    sequence: '',
    period: '1st Half',
    eventType: 'goal',
    actor: '',
    team: 'home',
    message: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { ws } = useWebSocket();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        ...formData,
        minute: parseInt(formData.minute),
        sequence: parseInt(formData.sequence),
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      };
      await addCommentary(matchId, data);
      onAdded?.();
      setFormData({
        minute: '',
        sequence: '',
        period: '1st Half',
        eventType: 'goal',
        actor: '',
        team: 'home',
        message: '',
        tags: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquarePlus className="h-6 w-6 text-indigo-600" />
        <h3 className="text-xl font-semibold text-gray-900">Add Live Commentary</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Minute</label>
          <input
            type="number"
            value={formData.minute}
            onChange={(e) => setFormData({...formData, minute: e.target.value})}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            min="0"
            max="120"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
          <select
            value={formData.eventType}
            onChange={(e) => setFormData({...formData, eventType: e.target.value})}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="goal">Goal</option>
            <option value="yellow">Yellow Card</option>
            <option value="red">Red Card</option>
            <option value="sub">Substitution</option>
            <option value="foul">Foul</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Player</label>
          <input
            type="text"
            value={formData.actor}
            onChange={(e) => setFormData({...formData, actor: e.target.value})}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Mbappé"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
          <select
            value={formData.period}
            onChange={(e) => setFormData({...formData, period: e.target.value})}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option>1st Half</option>
            <option>2nd Half</option>
            <option>Extra Time</option>
            <option>Penalties</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Commentary</label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-vertical min-h-[80px]"
          placeholder="Mbappé scores with a brilliant left-footed strike!"
          required
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 focus:ring-4 focus:ring-indigo-500 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Add Commentary
          </>
        )}
      </button>
    </form>
  );
}
