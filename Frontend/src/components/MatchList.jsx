import { useState, useEffect } from 'react';
import MatchCard from './MatchCard.jsx';
import { getMatches } from '../api.js';
import { Loader2 } from 'lucide-react';

export default function MatchList({ key }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const data = await getMatches({ limit: 12 });
        setMatches(data);
      } catch (err) {
        setError(err.message);
        // Fallback demo data if backend not available
        setMatches([
          {
            id: 1,
            sport: 'Football',
            homeTeam: 'Real Madrid',
            awayTeam: 'Barcelona',
            status: 'live',
            startTime: new Date(Date.now() - 30*60*1000).toISOString(),
            homeScore: 2,
            awayScore: 1
          },
          {
            id: 2,
            sport: 'Basketball',
            homeTeam: 'Lakers',
            awayTeam: 'Warriors',
            status: 'scheduled',
            startTime: new Date(Date.now() + 2*60*60*1000).toISOString(),
            homeScore: 0,
            awayScore: 0
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();

    // Poll every 30s
    const interval = setInterval(fetchMatches, 30000);
    return () => clearInterval(interval);
  }, [key]);

  if (loading) {
    return (
      <div className="flex flex-col items-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-gray-500">Loading matches...</p>
        {error && <p className="text-red-500 mt-2">Error: {error}</p>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
      {matches.length === 0 && (
        <div className="col-span-full text-center py-12 text-gray-500">
          No matches found. Backend at localhost:3000?
        </div>
      )}
    </div>
  );
}
