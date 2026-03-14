import { AnimatePresence } from 'motion/react';
import { motion } from 'motion/react';
import { SessionProvider, useSession } from './context/SessionContext.js';
import { usePersistence } from './hooks/usePersistence.js';
import Header from './components/Header.js';
import ErrorBanner from './components/shared/ErrorBanner.js';
import BrandSeedInput from './components/phase1/BrandSeedInput.js';
import ParameterConfigurator from './components/phase1/ParameterConfigurator.js';
import Sidebar from './components/phase2/Sidebar.js';
import ConceptInput from './components/phase2/ConceptInput.js';
import OutputPane from './components/phase2/OutputPane.js';
import VersionHistory from './components/phase2/VersionHistory.js';
import FeedbackBar from './components/phase2/FeedbackBar.js';
import VersionCompare from './components/phase2/VersionCompare.js';

function AppContent() {
  const { phase } = useSession();
  usePersistence();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      <Header />
      <ErrorBanner />

      <main className="flex-1 flex overflow-hidden relative">
        <AnimatePresence mode="wait">
          {(phase === 'seed' || phase === 'analyzing') && <BrandSeedInput />}
          {phase === 'configuring' && <ParameterConfigurator />}
          {phase === 'workspace' && (
            <motion.div
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex w-full h-full overflow-hidden"
            >
              <Sidebar />
              <div className="flex-1 flex flex-col bg-white relative">
                <ConceptInput />
                <div className="flex-1 flex overflow-hidden">
                  <OutputPane />
                  <VersionHistory />
                </div>
                <FeedbackBar />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <VersionCompare />
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}
