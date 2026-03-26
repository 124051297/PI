import { Loader2 } from 'lucide-react';
export function LoadingSpinner({
  size = 'md',
  text,
  fullScreen = false
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  const content = <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>;
  if (fullScreen) {
    return <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {content}
      </div>;
  }
  return content;
}