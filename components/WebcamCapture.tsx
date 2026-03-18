
import React, { useRef, useState, useEffect } from 'react';

export const WebcamCapture: React.FC<{ onCapture: (b64: string) => void; onClose: () => void; }> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(s => {
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(err => {
        console.error("Webcam access error:", err);
        onClose();
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && videoRef.current) {
      canvasRef.current!.width = videoRef.current.videoWidth;
      canvasRef.current!.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);
      const b64 = canvasRef.current!.toDataURL('image/png').split(',')[1];
      onCapture(b64);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="bg-white doodle-border doodle-shadow overflow-hidden max-w-lg w-full animate-in zoom-in duration-300">
        <div className="relative aspect-[4/3] bg-slate-100">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
          <div className="absolute top-4 left-4 font-doodle bg-yellow-300 px-3 py-1 doodle-border doodle-shadow-sm -rotate-2">
            YOU LOOK GREAT! ✨
          </div>
        </div>
        <div className="p-6 flex justify-between items-center bg-white border-t-4 border-black">
          <button 
            onClick={onClose} 
            className="font-doodle text-xl font-bold text-slate-400 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          
          <button 
            onClick={handleCapture}
            className="w-20 h-20 bg-white rounded-full doodle-border doodle-shadow flex items-center justify-center hover:scale-110 active:scale-95 transition-transform group"
          >
            <div className="w-14 h-14 bg-red-500 rounded-full group-hover:bg-red-400 transition-colors doodle-border"></div>
          </button>
          
          <div className="w-12"></div>
        </div>
      </div>
      <p className="text-white font-doodle text-2xl mt-8 animate-bounce">Smile for the doodle! 📸</p>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
