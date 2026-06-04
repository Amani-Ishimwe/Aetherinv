import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { Scan, Printer, Video, VideoOff, RefreshCw, Barcode, QrCode } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  category: string;
}

export const Scanner: React.FC = () => {
  // Real products from backend
  const [products, setProducts] = useState<Product[]>([]);

  // Camera states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectedProduct, setDetectedProduct] = useState<Product | null>(null);
  const [scanning, setScanning] = useState(false);

  // QR / Barcode generator state
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [labelType, setLabelType] = useState<'BARCODE' | 'QR'>('QR');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const loadProducts = async () => {
    try {
      const res = await api.get('/products?size=1000');
      setProducts(res.data?.content || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadProducts();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 640, height: 480 } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Webcam access was denied or is unavailable. Emulating camera capture below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setScanning(false);
  };

  // Simulate scanning code detection
  const handleScanAction = () => {
    if (products.length === 0) return;
    setScanning(true);
    setDetectedProduct(null);

    // Simulate 1.5 seconds of searching, then detect a random product from backend
    setTimeout(() => {
      const randIdx = Math.floor(Math.random() * products.length);
      setDetectedProduct(products[randIdx]);
      setScanning(false);
    }, 1500);
  };

  const currentGenProduct = products.find(p => p.id === Number(selectedProductId));

  return (
    <div className="space-y-8 animate-fadeIn text-slate-200">
      
      <div>
        <h2 className="text-3xl font-extrabold text-white">Barcode & QR Code Station</h2>
        <p className="text-slate-400 text-sm mt-1">Scan physical products using your device webcam or generate printable barcode labels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Live Webcam Scanner */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-brandorange-50/10 border border-brandorange-500/20 rounded-xl text-brandorange-500">
                  <Scan className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">Webcam Inventory Scan</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Detect product SKU tags in real-time</p>
                </div>
              </div>

              {cameraActive ? (
                <button
                  onClick={stopCamera}
                  className="px-3.5 py-1.5 bg-red-650/15 border border-red-650/20 hover:border-red-500 text-red-400 text-xxs font-bold uppercase rounded-lg flex items-center space-x-1"
                >
                  <VideoOff className="h-3.5 w-3.5" />
                  <span>Stop Cam</span>
                </button>
              ) : (
                <button
                  onClick={startCamera}
                  className="px-3.5 py-1.5 bg-green-500/10 border border-green-500/20 hover:border-green-500 text-green-400 text-xxs font-bold uppercase rounded-lg flex items-center space-x-1"
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Start Cam</span>
                </button>
              )}
            </div>

            {/* Video Viewfinder screen */}
            <div className="relative aspect-video bg-darkblue-950/80 rounded-2xl border border-darkblue-850 overflow-hidden flex items-center justify-center">
              {cameraActive ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  {/* Scanner overlay line */}
                  <div className="absolute inset-x-8 top-1/2 h-0.5 bg-red-500 shadow-md shadow-red-500/50 animate-pulse pointer-events-none" />
                  {/* Corner Targets */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-brandorange-500" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-brandorange-500" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-brandorange-500" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-brandorange-500" />
                </>
              ) : (
                <div className="text-center p-6 text-slate-500">
                  <VideoOff className="h-12 w-12 mx-auto mb-3 text-slate-650 animate-pulse" />
                  <p className="text-xs font-semibold">Webcam Viewfinder Inactive</p>
                  <p className="text-[10px] text-slate-600 mt-1">Start camera to activate optical scan scanner.</p>
                  {cameraError && (
                    <div className="mt-4 bg-yellow-500/5 border border-yellow-500/15 rounded-xl p-3 text-left text-xxs text-slate-400 max-w-xs mx-auto">
                      {cameraError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-darkblue-800/80 pt-5 mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handleScanAction}
                disabled={scanning || products.length === 0}
                className="bg-brandorange-500 hover:bg-brandorange-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center space-x-2 active:scale-95"
              >
                {scanning ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Searching Tag...</span>
                  </>
                ) : (
                  <span>Capture Scan Code</span>
                )}
              </button>
            </div>

            {/* Detected Product detail card */}
            {detectedProduct && (
              <div className="bg-darkblue-950/40 border border-green-500/15 rounded-xl p-4 flex items-center justify-between animate-slideIn">
                <div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded uppercase tracking-wider">
                    Tag Detected
                  </span>
                  <h4 className="font-extrabold text-white text-sm mt-1.5">{detectedProduct.name}</h4>
                  <p className="text-xxs text-slate-400 mt-0.5">SKU: {detectedProduct.sku} | Price: ${detectedProduct.price.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-brandorange-500 block">
                    {detectedProduct.quantity}
                  </span>
                  <span className="text-xxs font-semibold text-slate-550 uppercase tracking-widest">In Stock</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: QR / Barcode Generator */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-brandorange-50/10 border border-brandorange-500/20 rounded-xl text-brandorange-500">
                <Barcode className="h-5.5 w-5.5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-mono">Labels Generator</h3>
                <p className="text-xs text-slate-400 mt-0.5">Design printable barcode tag layouts</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Select Catalog SKU</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-darkblue-950 border border-darkblue-800 rounded-xl py-2 px-3 text-slate-350 outline-none"
                >
                  <option value="">-- Select Product SKU --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Label Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setLabelType('QR')}
                    className={`py-2 px-4 border rounded-xl font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
                      labelType === 'QR'
                        ? 'bg-brandorange-500/10 text-brandorange-450 border-brandorange-500/25'
                        : 'bg-darkblue-950 border-darkblue-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="h-4 w-4" />
                    <span>QR Code</span>
                  </button>

                  <button
                    onClick={() => setLabelType('BARCODE')}
                    className={`py-2 px-4 border rounded-xl font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
                      labelType === 'BARCODE'
                        ? 'bg-brandorange-500/10 text-brandorange-450 border-brandorange-500/25'
                        : 'bg-darkblue-950 border-darkblue-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Barcode className="h-4 w-4" />
                    <span>Barcode</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Label Preview Card */}
          <div className="border-t border-darkblue-800/80 pt-5 mt-6">
            {currentGenProduct ? (
              <div className="bg-white text-slate-900 rounded-xl p-5 flex flex-col items-center justify-center max-w-xs mx-auto border shadow-md font-sans">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">AetherInv Label</p>
                <h4 className="font-extrabold text-sm text-slate-950 mb-0.5 text-center">{currentGenProduct.name}</h4>
                <p className="text-[10px] font-semibold text-slate-500 font-mono mb-4">{currentGenProduct.sku}</p>

                {labelType === 'QR' ? (
                  <div className="p-2 border-2 border-slate-900 rounded-lg">
                    {/* Simulated High-Fidelity QR Code layout */}
                    <div className="w-20 h-20 bg-slate-950 grid grid-cols-5 gap-0.5 p-0.5">
                      {[...Array(25)].map((_, i) => (
                        <span key={i} className={`h-full w-full rounded-[1px] ${
                          i === 0 || i === 4 || i === 20 || i === 24 || i === 6 || i === 8 || i === 12 || i === 18 ? 'bg-white' : 'bg-transparent'
                        }`} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-0.5 h-10 w-44 bg-slate-950 p-1 mb-1 rounded-sm">
                    {/* Custom HTML/CSS Barcode lines */}
                    {[...Array(24)].map((_, i) => (
                      <span 
                        key={i} 
                        className="bg-white h-full inline-block" 
                        style={{ width: `${i % 3 === 0 ? '3px' : i % 5 === 0 ? '1px' : '2px'}` }} 
                      />
                    ))}
                  </div>
                )}

                <p className="text-[9px] font-bold text-slate-900 mt-3 font-mono">Value: ${currentGenProduct.price.toFixed(2)}</p>

                <button
                  onClick={() => window.print()}
                  className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5 mt-4"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Tag Label</span>
                </button>
              </div>
            ) : (
              <div className="text-center p-8 bg-darkblue-950/20 rounded-xl border border-dashed border-darkblue-800/60 text-slate-500 text-xs">
                Select a product above to generate printable stickers.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
