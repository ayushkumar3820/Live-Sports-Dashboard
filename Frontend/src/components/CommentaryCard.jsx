import { format } from 'date-fns';
import { MessageCircle, Clock } from 'lucide-react';

export default function CommentaryCard({ commentary }) {
  const time = new Date(commentary.createdAt);
  const isRecent = Date.now() - time.getTime() < 5 * 60 * 1000; // 5min

  return (
    <div className="group flex gap-4 p-4 border border-gray-100 rounded-xl hover:bg-indigo-50 transition-all hover:border-indigo-200">
      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-mono text-xs">
          {commentary.minute || '?'}
        </div>
      </div>
      
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900 text-sm">{commentary.actor || 'Player'}</span>
          <span className="px-2 py-1 bg-gray-100 text-xs rounded-full">{commentary.eventType}</span>
          {commentary.period && (
            <span className="text-xs text-gray-500">({commentary.period})</span>
          )}
        </div>
        <p className="font-medium text-gray-900 mb-2 leading-relaxed">{commentary.message}</p>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {format(time, 'mm:ss')}
          </div>
          {commentary.tags?.length > 0 && (
            <div className="flex gap-1">
              {commentary.tags.slice(0,2).map(tag => (
                <span key={tag} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
