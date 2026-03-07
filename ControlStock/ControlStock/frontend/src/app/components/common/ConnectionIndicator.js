import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud } from 'lucide-react';
export function ConnectionIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());
  const [syncing, setSyncing] = useState(false);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simular sincronización cada 30 segundos
    const syncInterval = setInterval(() => {
      setSyncing(true);
      setTimeout(() => {
        setLastSync(new Date());
        setSyncing(false);
      }, 1000);
    }, 30000);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, []);
  const formatLastSync = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSync.getTime()) / 1000);
    if (diff < 60) return 'Hace unos segundos';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    return `Hace ${Math.floor(diff / 3600)} h`;
  };
  return <div className="flex items-center gap-2 text-xs">
      {isOnline ? <>
          {syncing ? <Cloud className="w-4 h-4 text-blue-600 animate-pulse" /> : <Wifi className="w-4 h-4 text-green-600" />}
          <span className="text-gray-600">
            {syncing ? 'Sincronizando...' : formatLastSync()}
          </span>
        </> : <>
          <WifiOff className="w-4 h-4 text-red-600" />
          <span className="text-red-600">Sin conexión</span>
        </>}
    </div>;
}