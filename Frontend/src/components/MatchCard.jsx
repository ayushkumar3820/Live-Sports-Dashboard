import { format } from 'date-fns';
import { Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

function StatusBadge({ status }) {
  const colors = {
    scheduled: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    live: 'bg-green-100 text-green-800 border-green-200 animate-pulse',
    finished: 'bg-gray-100 text-gray-800 border-gray-200',
    upcoming: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {label}
    </span>
  );
}

export default function MatchCard({ match }) {
  const startTime = new Date(match.startTime);
  const isLive = match.status === 'live';

  return (
    <Link to={`/match/${match.id}`} className="group block p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
            {match.sport?.toUpperCase()}
          </span>
          <StatusBadge status={match.status} />
        </div>
        {isLive && (
          <div className="flex items-center gap-1 text-green-600 font-mono text-sm animate-pulse">
            <Clock className="w-4 h-4" />
            LIVE
          </div>
        )}
      </div>
      
      <div className="space-y-3 mb-6">
        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
          {match.homeTeam} vs {match.awayTeam}
        </h3>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Clock className="w-4 h-4" />
          {format(startTime, 'MMM dd, yyyy HH:mm')}
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-100">
        <div className="text-3xl font-bold text-gray-900">
          <span className="text-2xl">{match.homeScore}</span> - <span className="text-2xl">{match.awayScore}</span>
        </div>
        <div className="text-sm text-gray-500">
          Score
        </div>
      </div>
    </Link>
  );
}
