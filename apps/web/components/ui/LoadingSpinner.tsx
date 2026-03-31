// 1. تحديد الأنواع المسموح بها للحجم
type SpinnerSize = 'small' | 'medium' | 'large';

// 2. تعريف واجهة (Interface) للـ Props
interface LoadingSpinnerProps {
  size?: SpinnerSize;
  text?: string;
}

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }: LoadingSpinnerProps) => {
  const sizeClasses: Record<SpinnerSize, string> = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
      {text && <p className="mt-4 text-slate-600">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;


