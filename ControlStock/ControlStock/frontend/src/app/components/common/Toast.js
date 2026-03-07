import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
export function Toast({
  type,
  message,
  onClose,
  duration = 3000
}) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);
  const config = {
    success: {
      icon: CheckCircle,
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      iconColor: 'text-green-600'
    },
    error: {
      icon: XCircle,
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      iconColor: 'text-red-600'
    },
    warning: {
      icon: AlertCircle,
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      iconColor: 'text-orange-600'
    },
    info: {
      icon: AlertCircle,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      iconColor: 'text-blue-600'
    }
  };
  const {
    icon: Icon,
    bg,
    border,
    text,
    iconColor
  } = config[type];
  return <div className={`${bg} ${border} ${text} border rounded-lg p-4 shadow-lg flex items-center gap-3 min-w-[300px] animate-slideIn`}>
      <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={onClose} className="flex-shrink-0 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>;
}

// Container para múltiples toasts

export function ToastContainer({
  toasts,
  onRemove
}) {
  return <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => <Toast key={toast.id} type={toast.type} message={toast.message} onClose={() => onRemove(toast.id)} />)}
    </div>;
}