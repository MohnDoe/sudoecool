"use client"
import { LoadingScreen } from '@/components/LoadingScreen';
import { useDiscordSDK } from '@/hooks/useDiscordSDK';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loading, error } = useDiscordSDK();

  if (loading) {
    return <LoadingScreen />;
  }

  // Show error if auth failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-3">⚠️ Auth Error</h2>
            <p className="text-gray-700 mb-6 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>
    {children}
  </>;
}
