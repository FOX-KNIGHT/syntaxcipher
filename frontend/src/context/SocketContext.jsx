import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [roundState, setRoundState] = useState({ currentRound: 0, timerEndsAt: null, announcement: null });
  const [leaderboard, setLeaderboard] = useState([]);
  const [walletEvents, setWalletEvents] = useState([]);

  useEffect(() => {
    const URL = import.meta.env.VITE_SOCKET_URL || '';
    const socket = io(URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect',    () => { setConnected(true); socket.emit('request_leaderboard'); socket.emit('request_round_state'); });
    socket.on('disconnect', () => setConnected(false));

    socket.on('init_state', ({ config, leaderboard: lb }) => {
      if (config) setRoundState({ currentRound: config.current_round, timerEndsAt: config.timer_ends_at, announcement: config.announcement });
      if (lb) setLeaderboard(lb);
    });

    socket.on('round_changed', ({ round, timerEndsAt }) => {
      setRoundState(s => ({ ...s, currentRound: round, timerEndsAt }));
    });

    socket.on('timer_updated', ({ timerEndsAt }) => {
      setRoundState(s => ({ ...s, timerEndsAt }));
    });

    socket.on('announcement', ({ message }) => {
      setRoundState(s => ({ ...s, announcement: message }));
    });

    socket.on('leaderboard_updated', () => {
      socket.emit('request_leaderboard');
    });

    socket.on('leaderboard_data', (data) => {
      setLeaderboard(data);
    });

    socket.on('round_state', (data) => {
      if (data) setRoundState({ currentRound: data.current_round, timerEndsAt: data.timer_ends_at, announcement: data.announcement });
    });

    socket.on('wallet_updated', (evt) => {
      setWalletEvents(e => [...e.slice(-9), evt]);
    });

    return () => socket.disconnect();
  }, []);

  const emit = (event, data) => socketRef.current?.emit(event, data);

  return (
    <SocketContext.Provider value={{ connected, roundState, leaderboard, walletEvents, emit }}>
      {children}
    </SocketContext.Provider>
  );
}
