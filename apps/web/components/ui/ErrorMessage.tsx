// 1. تحديد القيم المسموح بها لـ type
type MessageType = 'error' | 'warning';

// 2. تحديد نوع الـ Props للمكون
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  type?: MessageType; // اجعلناه اختيارياً مع قيم محددة
}

const ErrorMessage = ({ message, onRetry, type = 'error' }: ErrorMessageProps)=> {
  const config = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    }
  };

  const { bg, border, text, icon } = config[type];

  return (
    <div className={`${bg} border ${border} ${text} px-6 py-4 rounded-xl`}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="flex-1">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-semibold"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;