import React, { useState, useRef, useEffect } from 'react';
import { ImageItem } from '../types';

interface Props { 
  onUpload: (items: ImageItem[]) => void; 
  onWebcamClick: () => void; 
  itemCount: number; 
}

export const ImageUploadArea: React.FC<Props> = ({ onUpload, onWebcamClick, itemCount }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = async (files: File[]) => {
    const newItems = await Promise.all(
      files.map(file => new Promise<ImageItem>(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve({
            id: `img-${Math.random().toString(36).substring(2, 11)}`,
            base64,
            mimeType: file.type,
            name: file.name,
            status: 'pending',
            selected: true
          });
        };
        reader.readAsDataURL(file);
      }))
    );
    onUpload(newItems);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) processFiles(files);
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onUpload]);

  return (
    <div className="w-full space-y-6">
      {/* Large Selfie Box */}
      <button 
        onClick={(e) => { e.stopPropagation(); onWebcamClick(); }} 
        className="w-full h-48 bg-white doodle-border doodle-shadow doodle-button flex flex-col items-center justify-center space-y-3 group transition-all"
      >
        <div className="text-6xl group-hover:scale-125 transition-transform duration-300">📸</div>
        <div className="space-y-1">
          <p className="font-doodle text-3xl font-bold text-slate-800">Take a Selfie!</p>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Use your camera</p>
        </div>
      </button>
      
      <div className="flex items-center gap-4">
        <div className="h-[2px] flex-1 bg-black/10"></div>
        <span className="font-doodle text-slate-400">OR</span>
        <div className="h-[2px] flex-1 bg-black/10"></div>
      </div>

      {/* Smaller Drag & Drop Box */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e: React.DragEvent<HTMLDivElement>) => { 
          e.preventDefault(); 
          setIsDragging(false); 
          const files = (Array.from(e.dataTransfer.files) as File[]).filter(f => f.type.startsWith('image/'));
          if (files.length > 0) processFiles(files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`py-4 doodle-border doodle-shadow transition-all cursor-pointer group flex items-center justify-center gap-4 px-6 ${
          isDragging ? 'bg-yellow-100 scale-[0.98]' : 'bg-white hover:bg-slate-50'
        }`}
      >
        <div className="text-3xl group-hover:rotate-12 transition-transform">🖼️</div>
        <div className="text-left">
          <p className="font-doodle text-xl font-bold">
            {isDragging ? 'Drop it!' : 'Upload Pic'}
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">JPG, PNG, WEBP</p>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={(e) => processFiles(Array.from(e.target.files || []) as File[])} 
          className="hidden" 
          accept="image/*" 
        />
      </div>
    </div>
  );
};