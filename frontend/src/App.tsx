import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import AppShell from './components/AppShell';
import { useSettingsStore } from './stores/settingsStore';

// Lazy load all pages for optimal PWA performance / code splitting
const Home          = lazy(() => import('./pages/Home'));
const Roles         = lazy(() => import('./pages/Roles'));
const Builder       = lazy(() => import('./pages/Builder'));
const Generator     = lazy(() => import('./pages/Generator'));
const Optimizer     = lazy(() => import('./pages/Optimizer'));
const TextOptimizer = lazy(() => import('./pages/TextOptimizer'));
const ImageToPrompt = lazy(() => import('./pages/ImageToPrompt'));
const ImageLibrary  = lazy(() => import('./pages/ImageLibrary'));
const TextLibrary   = lazy(() => import('./pages/TextLibrary'));
const History       = lazy(() => import('./pages/History'));
const Settings      = lazy(() => import('./pages/Settings'));

// Full-screen skeleton loader shown while a lazy chunk is loading
function PageSkeleton() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 h-full min-h-[60vh]">
      <div className="relative w-12 h-12">
        <span className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
        <span className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">Laden…</p>
    </div>
  );
}

function App() {
  const theme = useSettingsStore(state => state.theme);

  // Apply theme class to document body
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.setProperty('--background', '222 47% 6%');
      root.style.setProperty('--foreground', '210 40% 96%');
      root.style.setProperty('--card', '222 47% 9%');
      root.style.setProperty('--card-foreground', '210 40% 96%');
      root.style.setProperty('--muted', '222 47% 14%');
      root.style.setProperty('--muted-foreground', '215 20% 55%');
      root.style.setProperty('--border', '222 30% 18%');
      root.style.setProperty('--input', '222 30% 18%');
      root.style.setProperty('--accent', '222 47% 14%');
      root.style.setProperty('--accent-foreground', '210 40% 96%');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--background', '220 20% 97%');
      root.style.setProperty('--foreground', '222 47% 11%');
      root.style.setProperty('--card', '0 0% 100%');
      root.style.setProperty('--card-foreground', '222 47% 11%');
      root.style.setProperty('--muted', '220 15% 92%');
      root.style.setProperty('--muted-foreground', '215 16% 40%');
      root.style.setProperty('--border', '220 13% 85%');
      root.style.setProperty('--input', '220 13% 85%');
      root.style.setProperty('--accent', '220 15% 92%');
      root.style.setProperty('--accent-foreground', '222 47% 11%');
    }
  }, [theme]);

  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={
          <Suspense fallback={<PageSkeleton />}><Home /></Suspense>
        } />
        <Route path="roles" element={
          <Suspense fallback={<PageSkeleton />}><Roles /></Suspense>
        } />
        <Route path="builder" element={
          <Suspense fallback={<PageSkeleton />}><Builder /></Suspense>
        } />
        <Route path="generator" element={
          <Suspense fallback={<PageSkeleton />}><Generator /></Suspense>
        } />
        <Route path="optimizer" element={
          <Suspense fallback={<PageSkeleton />}><Optimizer /></Suspense>
        } />
        <Route path="text-optimizer" element={
          <Suspense fallback={<PageSkeleton />}><TextOptimizer /></Suspense>
        } />
        <Route path="image-to-prompt" element={
          <Suspense fallback={<PageSkeleton />}><ImageToPrompt /></Suspense>
        } />
        <Route path="library" element={
          <Suspense fallback={<PageSkeleton />}><ImageLibrary /></Suspense>
        } />
        <Route path="text-library" element={
          <Suspense fallback={<PageSkeleton />}><TextLibrary /></Suspense>
        } />
        <Route path="history" element={
          <Suspense fallback={<PageSkeleton />}><History /></Suspense>
        } />
        <Route path="settings" element={
          <Suspense fallback={<PageSkeleton />}><Settings /></Suspense>
        } />
      </Route>
    </Routes>
  );
}

export default App;
