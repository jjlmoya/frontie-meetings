import { Suspense } from 'react';
import FantasiaApp from './FantasiaApp';

export default function Page() {
  return (
    <Suspense
      fallback={(
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-white text-xl">Loading FANTASIA...</div>
        </div>
      )}
    >
      <FantasiaApp />
    </Suspense>
  );
}
