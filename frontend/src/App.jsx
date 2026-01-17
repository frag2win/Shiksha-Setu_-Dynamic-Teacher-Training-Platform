/**
 * Shiksha-Setu Main Application
 * A book-like experience for teacher training management
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import BookLayout from './components/layout/BookLayout';
import { LoadingSpinner } from './components/ui/SharedComponents';

// Lazy load pages for performance
const CoverPage = lazy(() => import('./components/pages/CoverPage'));
const ClustersPage = lazy(() => import('./components/pages/ClustersPage'));
const ManualsPage = lazy(() => import('./components/pages/ManualsPage'));
const GeneratorPage = lazy(() => import('./components/pages/GeneratorPage'));
const LibraryPage = lazy(() => import('./components/pages/LibraryPage'));
const TranslationPage = lazy(() => import('./components/pages/TranslationPage'));

// Page loading fallback
function PageLoader() {
  return (
    <div className="page min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner className="mx-auto mb-4 text-setu-500" size="lg" />
        <p className="text-ink-400">Loading page...</p>
      </div>
    </div>
  );
}

// Animated routes wrapper
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<CoverPage />} />
          <Route path="/clusters" element={<ClustersPage />} />
          <Route path="/manuals" element={<ManualsPage />} />
          <Route path="/generate" element={<GeneratorPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/translate" element={<TranslationPage />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <BookLayout>
        <AnimatedRoutes />
      </BookLayout>
    </BrowserRouter>
  );
}

export default App;
