import { useParams } from 'react-router-dom';
import CommentaryList from './CommentaryList.jsx';
import CommentaryForm from './CommentaryForm.jsx';
import { useWebSocket } from '../hooks/useWebSocket.js';
import { formatDistanceToNow, format } from 'date-fns';
import { Loader2, Wifi, WifiOff, Clock, Play, BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function MatchDetail() {
  const { id } = useParams();
  const { isConnected, subscribe, events } = useWebSocket();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (id) {
      subscribe(parseInt(id));
    }
    return () => {
      if (id) {
        // unsubscribe(parseInt(id));
      }
    };
  }, [id, subscribe]);

  const handleCommentaryAdded = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 mb-8 sticky top-4 z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-100 rounded-2xl">
                <BarChart3 className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                  Match #{id}
                </h1>
                <p className="text-xl text-gray-600">Real-time updates</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-xl">
                {isConnected ? (
                  <>
                    <Wifi className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800 text-sm">Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-600 text-sm">Disconnected</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Live score placeholder */}
          <div className="text-center py-12 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border-2 border-dashed border-indigo-200">
            <Clock className="mx-auto h-16 w-16 text-indigo-400 mb-4" />
            <h2 className="text-4xl font-mono font-bold text-gray-700 mb-2">LIVE SCORE</h2>
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 mb-2">
              0 - 0
            </div>
            <p className="text-lg text-gray-500">Score updates via WebSocket</p>
          </div>
        </div>

        {/* Commentary Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Play className="h-8 w-8 text-indigo-600" />
                Live Commentary
              </h2>
              <CommentaryList key={`${id}-${refreshKey}`} matchId={id} />
            </div>
          </div>
          
          <div>
            <CommentaryForm matchId={id} onAdded={handleCommentaryAdded} />
          </div>
        </div>

        {/* WS Events Debug */}
        {events.length > 0 && (
          <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
            <h3 className="font-semibold text-indigo-900 mb-3">Recent WS Events</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {events.map((event, i) => (
                <div key={i} className="text-sm p-2 bg-white rounded-lg text-indigo-900">
                  {event.type}: {JSON.stringify(event.data || event.matchId)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
