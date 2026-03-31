// src/components/Common/ErrorDisplay.jsx
const ErrorDisplay = ({ error, onRetry }:any) => (

    
  <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-6">
    <div className="bg-gradient-to-br from-gray-900 to-black border border-red-900 rounded-2xl p-10 max-w-lg shadow-2xl">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-red-400 font-bold text-2xl mb-3">خطأ في التحميل</h3>
        <p className="text-gray-300 mb-6">{error}</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onRetry}
            className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            إعادة المحاولة
          </button>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300"
          >
            العودة
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default ErrorDisplay;