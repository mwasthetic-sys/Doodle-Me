import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploadArea } from './components/ImageUploadArea';
import { WebcamCapture } from './components/WebcamCapture';
import { GeminiService } from './services/geminiService';
import { ImageItem } from './types';
import { COLOR_PALETTES, MODEL_OPTIONS } from './constants';

export default function App() {
  const [view, setView] = useState<'home' | 'result'>('home');
  const [sourceImage, setSourceImage] = useState<ImageItem | null>(null);
  const [resultImage, setResultImage] = useState<ImageItem | null>(null);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        setHasApiKey(true);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectApiKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleUpload = useCallback((newItems: ImageItem[]) => {
    if (newItems.length > 0) {
      setSourceImage(newItems[0]);
    }
  }, []);

  const handleWebcamCapture = useCallback((base64: string) => {
    const newItem: ImageItem = {
      id: `cam-${Date.now()}`,
      base64,
      mimeType: 'image/png',
      name: `Capture ${new Date().toLocaleTimeString()}`,
      status: 'pending',
      selected: true
    };
    setSourceImage(newItem);
    setIsWebcamOpen(false);
  }, []);

  const startGeneration = async (colorId: string) => {
    if (!sourceImage) return;
    
    setIsGenerating(true);
    setView('result');
    
    const palette = COLOR_PALETTES.find(c => c.id === colorId) || COLOR_PALETTES[0];
    const gemini = GeminiService.getInstance();
    
    // Create a placeholder result
    const pendingResult: ImageItem = {
      ...sourceImage,
      id: `res-${Date.now()}`,
      status: 'processing',
      isResult: true,
      assignedColorId: colorId,
    };
    setResultImage(pendingResult);

    try {
      const generatedUrl = await gemini.transformToDoodle(
        sourceImage.base64,
        sourceImage.mimeType,
        palette,
        MODEL_OPTIONS[0].modelName, // Default to Flash for speed
        '1K'
      );
      
      setResultImage(prev => prev ? { ...prev, status: 'success', resultUrl: generatedUrl } : null);
    } catch (err: any) {
      const errorMessage = String(err);
      setResultImage(prev => prev ? { ...prev, status: 'error', error: errorMessage } : null);
      
      if (errorMessage.includes("API key not valid") || errorMessage.includes("Requested entity was not found")) {
        setHasApiKey(false);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSourceImage(null);
    setResultImage(null);
    setView('home');
    setIsGenerating(false);
  };

  const downloadImage = () => {
    if (resultImage?.resultUrl) {
      const link = document.createElement('a');
      link.href = resultImage.resultUrl;
      link.download = `doodle-me-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-amber-50 bg-doodle flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl doodle-border doodle-shadow max-w-md w-full text-center space-y-6">
          <h2 className="text-2xl font-doodle font-bold">API Key Required</h2>
          <p className="text-slate-600">
            This app uses Gemini 3.1 Flash Image Preview. You need to select your own Google Cloud API key to continue.
          </p>
          <button
            onClick={handleSelectApiKey}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl doodle-border doodle-shadow-sm hover:bg-slate-800 transition-colors"
          >
            Select API Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 bg-doodle flex flex-col items-center p-4 sm:p-8 overflow-x-hidden">
      <Header />
      
      <main className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center space-y-8 py-4 sm:py-8">
        {view === 'home' ? (
          <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!sourceImage ? (
              <ImageUploadArea 
                onUpload={handleUpload} 
                onWebcamClick={() => setIsWebcamOpen(true)} 
                itemCount={0} 
              />
            ) : (
              <div className="relative group">
                <div className="absolute -inset-2 bg-black rounded-[40px] opacity-5 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative bg-white doodle-border doodle-shadow p-6 sm:p-10 flex flex-col items-center text-center space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-doodle font-bold text-slate-800">
                      1. Looking Good!
                    </h2>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                      Ready for the doodle magic
                    </p>
                  </div>
                  <div className="w-full flex flex-col items-center space-y-6 animate-in zoom-in-50 duration-300">
                    <div className="relative group/img w-full max-w-sm">
                      <div className="absolute -inset-2 bg-yellow-400 opacity-20 blur-xl"></div>
                      <img 
                        src={`data:${sourceImage.mimeType};base64,${sourceImage.base64}`} 
                        alt="Preview" 
                        className="w-full h-auto max-h-[300px] object-cover doodle-border doodle-shadow-sm rotate-1 group-hover/img:rotate-0 transition-transform relative z-10 bg-white"
                      />
                    </div>
                    <button 
                      onClick={() => setSourceImage(null)}
                      className="bg-white hover:bg-slate-50 text-black font-black py-3 px-6 doodle-border doodle-shadow doodle-button text-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>📸</span> RETAKE PHOTO
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className={`space-y-6 transition-all duration-500 ${sourceImage ? 'opacity-100 translate-y-0' : 'opacity-30 pointer-events-none translate-y-8'}`}>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-doodle font-bold text-slate-800">2. Pick Your Ink!</h2>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Click a color to start the magic</p>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-4">
                {COLOR_PALETTES.map((palette) => (
                  <button
                    key={palette.id}
                    onClick={() => startGeneration(palette.id)}
                    className="group relative flex flex-col items-center space-y-2"
                  >
                    <div 
                      className="w-14 h-14 rounded-full doodle-border doodle-shadow-sm transition-all group-hover:scale-110 group-active:scale-90 group-hover:-rotate-6"
                      style={{ backgroundColor: palette.hex }}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400 group-hover:text-slate-900 transition-colors">{palette.id}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-8 animate-in zoom-in-95 fade-in duration-500">
            <div className="bg-white doodle-border doodle-shadow p-6 sm:p-10 flex flex-col items-center text-center space-y-8 min-h-[500px] justify-center relative overflow-hidden">
              {/* Decorative Background Doodles */}
              <div className="absolute top-4 left-4 text-4xl opacity-10 rotate-12">✨</div>
              <div className="absolute bottom-4 right-4 text-4xl opacity-10 -rotate-12">🎨</div>
              
              {resultImage?.status === 'processing' ? (
                <div className="flex flex-col items-center space-y-8 relative z-10">
                  <div className="relative">
                    <div className="w-32 h-32 border-8 border-slate-100 rounded-full"></div>
                    <div 
                      className="absolute inset-0 border-8 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: COLOR_PALETTES.find(c => c.id === resultImage.assignedColorId)?.hex || '#000', borderTopColor: 'transparent' }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center text-4xl animate-bounce">✏️</div>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-4xl font-doodle font-bold text-slate-800">Doodling...</h2>
                    <p className="text-xl font-doodle text-slate-500">Mixing some <span className="font-bold" style={{ color: COLOR_PALETTES.find(c => c.id === resultImage.assignedColorId)?.hex }}>{COLOR_PALETTES.find(c => c.id === resultImage.assignedColorId)?.label}</span> magic!</p>
                  </div>
                </div>
              ) : resultImage?.status === 'success' ? (
                <>
                  <div className="relative group/result">
                    <div className="absolute -inset-8 bg-yellow-400 opacity-10 blur-3xl animate-pulse"></div>
                    <img 
                      src={resultImage.resultUrl} 
                      alt="Doodle Result" 
                      className="max-w-full max-h-[65vh] doodle-border doodle-shadow object-contain relative z-10 transition-transform group-hover/result:scale-[1.02]"
                    />
                    <div className="absolute -top-6 -right-6 bg-white doodle-border doodle-shadow-sm p-3 rotate-12 z-20 font-doodle text-xl font-bold">
                      TA-DA! 🎉
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6 w-full pt-4 relative z-10">
                    <button
                      onClick={downloadImage}
                      className="flex-1 bg-emerald-400 hover:bg-emerald-500 text-black font-black py-5 px-8 doodle-border doodle-shadow doodle-button text-2xl flex items-center justify-center gap-3 transition-colors"
                    >
                      <span>💾</span> SAVE IT!
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 bg-white hover:bg-slate-50 text-black font-black py-5 px-8 doodle-border doodle-shadow doodle-button text-2xl flex items-center justify-center gap-3 transition-colors"
                    >
                      <span>✨</span> AGAIN!
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center space-y-8 relative z-10">
                  <div className="text-8xl animate-bounce">😵‍💫</div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-doodle font-bold text-red-500">Oh No! A Doodle Disaster!</h2>
                    <p className="text-slate-500 font-bold">{resultImage?.error || 'The ink ran out...'}</p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="bg-white hover:bg-slate-50 text-black font-black py-4 px-10 doodle-border doodle-shadow doodle-button text-xl"
                  >
                    TRY AGAIN!
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer Doodles */}
      <div className="fixed bottom-0 left-0 w-full h-16 pointer-events-none opacity-20 flex justify-around items-end overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="text-4xl animate-wiggle" style={{ animationDelay: `${i * 0.2}s` }}>
            {['✏️', '🎨', '✨', '🌈', '🖍️'][i % 5]}
          </div>
        ))}
      </div>

      {isWebcamOpen && <WebcamCapture onCapture={handleWebcamCapture} onClose={() => setIsWebcamOpen(false)} />}
    </div>
  );
}