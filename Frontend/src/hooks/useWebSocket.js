import { useState, useEffect, useCallback, useRef } from 'react';

export function useWebSocket() {
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState([]);
  const wsRef = useRef(null);

  const connect = useCallback(() => {
    const wsUrl = window.location.protocol === 'https:' 
      ? `wss:${window.location.host}/ws` 
      : `ws://localhost:3000/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setIsConnected(true);
      console.log('WS connected');
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setEvents((prev) => [message, ...prev].slice(0, 50)); // last 50
        console.log('WS message:', message);
      } catch (e) {
        console.error('WS parse error:', e);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      setWs(null);
      console.log('WS disconnected');
    };

    socket.onerror = (error) => {
      console.error('WS error:', error);
    };

    wsRef.current = socket;
    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (!ws && !wsRef.current) {
      connect();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [ws, connect]);

  const subscribe = useCallback((matchId) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', matchId }));
    }
  }, []);

  const unsubscribe = useCallback((matchId) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe', matchId }));
    }
  }, []);

  return { ws: wsRef.current, isConnected, events, subscribe, unsubscribe };
}
