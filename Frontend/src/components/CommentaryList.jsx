import { useState, useEffect } from 'react';
import CommentaryCard from './CommentaryCard.jsx';
import { getCommentary } from '../api.js';
import { Loader2 } from 'lucide-react';

export default function CommentaryList({ matchId }) {
  const [commentaries, setCommentaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommentary = async () => {
      try {
        setLoading(true);
        const data = await getCommentary(matchId, { limit: 50 });
        setCommentaries(data);
      } catch (err) {
        setError(err.message);
        setCommentaries([]); // fallback empty
      } finally {
        setLoading(false);
      }
    };

    if (matchId) {
      fetchCommentary();
      const interval = setInterval(fetchCommentary, 10000); // poll 10s
      return () => clearInterval(interval);
    }
  }, [matchId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-2" />
        Loading commentary...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {commentaries.map((commentary) => (
        <CommentaryCard key={commentary.id} commentary={commentary} />
      ))}
      {error && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
          {error} - Using live WS updates
        </div>
      )}
      {commentaries.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          No commentary yet. Add some via form below!
        </div>
      )}
    </div>
  );
}
