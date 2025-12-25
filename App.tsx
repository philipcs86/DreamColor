
import React, { useState, useEffect } from 'react';
import Generator from './components/Generator';
import ChatBot from './components/ChatBot';
import { checkApiKeyStatus, promptForApiKey } from './services/geminiService';

const App: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isApiKeyReady, setIsApiKeyReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if an API key has already been selected
  useEffect(() => {
    const init = async () => {
      const hasKey = await checkApiKeyStatus();
      if (hasKey) {
        setIsApiKeyReady(true);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const handleSelectKey = async () => {
    await promptForApiKey();
    setIsApiKeyReady(true); // Assume key selection was successful per guidelines
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-indigo-600 font-bold">Loading...</div>
      </div>
    );
  }

  // If no key is selected, show a welcome screen prompting for key selection (mandatory for Pro models)
  if (!isApiKeyReady) {
    return (
      <div className="min-h-screen bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-lg w-full text-center border border-slate-100">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white w-16 h-16 rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
          </div>
          <h1 className="text-4xl font-bold text-indigo-900 mb-4 brand-font">DreamColor</h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Welcome! To generate high-quality coloring books, you must first select a paid API key from your Google Cloud project.
          </p>
          <div className="space-y-4">
            <button
              onClick={handleSelectKey}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
            >
              Select API Key to Begin
            </button>
            <p className="text-xs text-slate-400">
              Users must select a key from a paid GCP project. <br/>
              See the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-500 underline hover:text-indigo-600">billing documentation</a> for details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white p-2 rounded-lg shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 brand-font">
                DreamColor
              </span>
            </div>
            
            <div className="flex items-center gap-4">
               <span className="text-sm text-slate-500 hidden sm:inline-block">Turn imagination into reality</span>
               <button 
                 onClick={handleSelectKey}
                 className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-full transition-colors"
               >
                 Change Key
               </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-6 pb-24">
        <Generator />
      </main>

      {/* Chat Button (Floating) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`${
            isChatOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
          } transition-all duration-300 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-indigo-500/40 flex items-center justify-center`}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        </button>
      </div>

      <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      
    </div>
  );
};

export default App;
