
import React, { useState, useEffect } from 'react';
import { generateColoringPage, promptForApiKey, checkApiKeyStatus } from '../services/geminiService';
import { generateBookPdf } from '../utils/pdfGenerator';
import { ImageSize, GeneratedImage } from '../types';
import { Spinner } from './Spinner';

const Generator: React.FC = () => {
  const [theme, setTheme] = useState('');
  const [childName, setChildName] = useState('');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [progress, setProgress] = useState(0);
  const [hasKey, setHasKey] = useState(true);

  // Sync key status when image size changes to warn user if needed
  useEffect(() => {
    const syncStatus = async () => {
      const status = await checkApiKeyStatus();
      setHasKey(status);
    };
    syncStatus();
  }, [imageSize]);

  const handleSelectKey = async () => {
    await promptForApiKey();
    setHasKey(true); // Assume success per guidelines
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme || !childName) return;

    // Check if Pro model is requested but no key is selected
    const isPro = imageSize === '2K' || imageSize === '4K';
    if (isPro && !hasKey) {
      const confirmed = window.confirm("High-quality 2K/4K generation requires a paid API key. Would you like to select one now?");
      if (confirmed) {
        await handleSelectKey();
      } else {
        return;
      }
    }

    setIsGenerating(true);
    setGeneratedImages([]);
    setProgress(0);

    const images: GeneratedImage[] = [];
    const totalPages = 5;

    try {
      for (let i = 0; i < totalPages; i++) {
        try {
          // Append slightly different scene descriptions to get unique pages
          const variants = ["wide shot", "close up", "playful scene", "magical background", "action pose"];
          const specificTheme = `${theme}, ${variants[i]}`;
          
          const imageUrl = await generateColoringPage(specificTheme, imageSize);
          images.push({
            id: Date.now().toString() + i,
            url: imageUrl,
            prompt: specificTheme
          });
          setGeneratedImages([...images]);
          setProgress(((i + 1) / totalPages) * 100);
        } catch (pageError: any) {
          const errorMsg = pageError?.message || String(pageError);
          
          // Handle specific permission or "not found" errors which indicate key issues
          if (errorMsg.includes("Requested entity was not found") || errorMsg.includes("403") || errorMsg.includes("PERMISSION_DENIED")) {
            alert("This request failed. If you're using a Pro model, please ensure you've selected a paid API key with billing enabled.");
            await promptForApiKey();
            setHasKey(true); // Assume success
            setIsGenerating(false);
            return;
          }
          throw pageError;
        }
      }
    } catch (error) {
      console.error("Generation error:", error);
      alert("Generation failed. Try a simpler theme or lower resolution if the problem persists.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImages.length === 0) return;
    generateBookPdf(childName, theme, generatedImages);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* API Key Banner for Pro Models */}
      {(imageSize === '2K' || imageSize === '4K') && !hasKey && (
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-indigo-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm font-medium">To use {imageSize} resolution, please select a API key from a paid GCP project.</p>
          </div>
          <div className="flex gap-4 items-center">
             <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 underline hover:text-indigo-800">Billing Docs</a>
             <button 
               onClick={handleSelectKey}
               className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
             >
               Select Key
             </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8 md:p-12">
          
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-indigo-900 brand-font mb-4">Create Your Coloring Book</h2>
            <p className="text-lg text-slate-600">Enter a theme and we'll use AI to generate a unique 5-page coloring book!</p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-8 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Child's Name</label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="e.g. Leo"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Theme</label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g. Space Dinosaurs"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Image Quality</label>
              <div className="flex gap-4">
                {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                  <label key={size} className={`
                    flex-1 cursor-pointer rounded-xl border-2 p-3 text-center transition-all
                    ${imageSize === size 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                      : 'border-slate-100 hover:border-indigo-200 text-slate-500'}
                  `}>
                    <input 
                      type="radio" 
                      name="imageSize" 
                      value={size} 
                      checked={imageSize === size}
                      onChange={(e) => setImageSize(e.target.value as ImageSize)}
                      className="hidden" 
                    />
                    <span className="font-bold">{size}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {imageSize === '1K' 
                  ? "* Uses Standard model (faster)." 
                  : "* Uses Pro model (requires paid API key)."}
              </p>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !theme || !childName}
              className={`
                w-full py-4 px-6 rounded-xl font-bold text-lg text-white shadow-lg
                transform transition-all duration-200
                ${isGenerating 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.02] hover:shadow-indigo-500/30 active:scale-[0.98]'}
              `}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <Spinner />
                  <span>Creating Magic... {Math.round(progress)}%</span>
                </div>
              ) : (
                'Generate Coloring Book'
              )}
            </button>
          </form>

        </div>

        {/* Results Section */}
        {generatedImages.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-200 p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <h3 className="text-2xl font-bold text-slate-800">Preview Pages</h3>
              {!isGenerating && generatedImages.length === 5 && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download PDF
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {generatedImages.map((img, idx) => (
                <div key={img.id} className="aspect-[3/4] bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden relative group">
                  <img src={img.url} alt={`Page ${idx + 1}`} className="w-full h-full object-contain p-2" />
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                    #{idx + 1}
                  </div>
                </div>
              ))}
              {isGenerating && generatedImages.length < 5 && (
                 <div className="aspect-[3/4] bg-white rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                    <div className="text-slate-400 text-sm animate-pulse">Generating next...</div>
                 </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Generator;
