import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, Sparkles, Volume2, ArrowRight, RotateCcw, AlertCircle, Languages, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CameraTranslatorProps {
  targetLang: string;
  isDarkMode: boolean;
}

interface TranslationResult {
  detectedLanguage: string;
  originalText: string;
  translatedText: string;
  explanation: string;
  isDemo?: boolean;
}

export default function CameraTranslator({ targetLang, isDarkMode }: CameraTranslatorProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isPlayingOrig, setIsPlayingOrig] = useState(false);
  const [isPlayingTrans, setIsPlayingTrans] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stream]);

  const startCamera = async () => {
    setCameraError(null);
    setResult(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        "Kameraya erişilemedi. Lütfen kamera izinlerini kontrol edin veya bir fotoğraf dosyası yüklemeyi deneyin."
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  // Capture photo from the active video stream
  const capturePhoto = () => {
    if (!videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw the current frame of the video stream onto the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to base64 jpeg
      const imageDataUrl = canvas.toDataURL("image/jpeg");
      stopCamera();
      uploadAndTranslate(imageDataUrl);
    } catch (err) {
      console.error("Capture error:", err);
      setCameraError("Fotoğraf çekilirken bir hata oluştu.");
    }
  };

  // Handle uploaded/dropped files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setCameraError("Lütfen geçerli bir görsel dosyası yükleyin.");
      return;
    }

    setLoading(true);
    setCameraError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target?.result as string;
      uploadAndTranslate(base64Image);
    };
    reader.onerror = () => {
      setCameraError("Dosya okunurken hata oluştu.");
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const uploadAndTranslate = async (base64Image: string) => {
    setLoading(true);
    setCameraError(null);
    try {
      const response = await fetch("/api/translate-camera", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          image: base64Image,
          targetLanguage: targetLang
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Çeviri başarısız oldu.");
      }

      const data: TranslationResult = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error("Translation api error:", err);
      setCameraError(err.message || "Tercüme servisine bağlanırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Text-To-Speech capability
  const handleSpeak = (text: string, isOriginal: boolean) => {
    if (!window.speechSynthesis) {
      alert("Bu tarayıcı seslendirmeyi desteklemiyor.");
      return;
    }

    // Cancel existing speeches
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to set matching voice culture
    if (isOriginal) {
      setIsPlayingOrig(true);
      // Guess source lang or default to EN
      if (result?.detectedLanguage.toLowerCase().includes("ing") || result?.detectedLanguage.toLowerCase().includes("eng")) {
        utterance.lang = "en-US";
      } else if (result?.detectedLanguage.toLowerCase().includes("gür") || result?.detectedLanguage.toLowerCase().includes("geo")) {
        utterance.lang = "ka-GE";
      } else {
        utterance.lang = "tr-TR";
      }
      utterance.onend = () => setIsPlayingOrig(false);
      utterance.onerror = () => setIsPlayingOrig(false);
    } else {
      setIsPlayingTrans(true);
      if (targetLang === "en") utterance.lang = "en-US";
      else if (targetLang === "ka") utterance.lang = "ka-GE";
      else utterance.lang = "tr-TR";
      
      utterance.onend = () => setIsPlayingTrans(false);
      utterance.onerror = () => setIsPlayingTrans(false);
    }

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      {/* Introduction Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse-slow" />
            Yapay Zeka Foto-Tercüman
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Kameradan veya dosyadan yazılı bir metnin fotoğrafını çekin, Gemini anında okuyup tercüme etsin ve açıklasın!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Input Area (Camera preview or File Upload Box) */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {cameraActive ? (
              // Active Camera Stream Screen
              <motion.div
                key="camera-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-gray-200 dark:border-gray-800 shadow-md"
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Camera Overlay Guide */}
                <div className="absolute inset-0 border-2 border-dashed border-white/40 pointer-events-none m-8 rounded-lg flex items-center justify-center">
                  <span className="text-[10px] text-white/80 bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs font-mono">
                    Yazılı Metni Bu Alana Hizalayın
                  </span>
                </div>

                {/* Camera Action Buttons */}
                <div className="absolute bottom-4 inset-x-0 flex justify-center items-center gap-4 px-4">
                  <button
                    onClick={stopCamera}
                    className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-transform active:scale-95 shadow-lg"
                    title="İptal Et"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="p-5 bg-white text-gray-900 hover:bg-gray-100 rounded-full transition-transform active:scale-90 shadow-2xl border-4 border-indigo-500/30"
                    title="Fotoğraf Çek"
                  >
                    <div className="w-4 h-4 bg-indigo-600 rounded-full animate-ping absolute" />
                    <Camera className="w-6 h-6 text-indigo-600 relative z-10" />
                  </button>
                </div>
              </motion.div>
            ) : (
              // Standby File Upload & Launch Camera Screen
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all relative ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[1.01]"
                    : "border-gray-300 dark:border-gray-700 hover:border-indigo-500 hover:bg-gray-50/50 dark:hover:bg-gray-800/25"
                } ${isDarkMode ? "bg-gray-900/50" : "bg-white"}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="camera-file-input"
                />

                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-full text-indigo-600 mb-3 animate-float">
                  <Upload className="w-8 h-8" />
                </div>

                <h3 className="text-sm font-semibold mb-1">Metin Fotoğrafı Yükle</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mb-4">
                  Cihazınızdan bir fotoğraf sürükleyip bırakın veya{" "}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-indigo-600 font-medium hover:underline"
                  >
                    dosya seçin
                  </button>
                </p>

                <div className="flex items-center gap-2 w-full max-w-xs">
                  <div className="h-px bg-gray-300 dark:bg-gray-700 flex-1" />
                  <span className="text-[10px] text-gray-400 font-mono uppercase">veya</span>
                  <div className="h-px bg-gray-300 dark:bg-gray-700 flex-1" />
                </div>

                <button
                  onClick={startCamera}
                  className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md hover:shadow-indigo-500/20 active:scale-95 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Kamerayı Başlat
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loader Overlay */}
          {loading && (
            <div className="aspect-[4/3] rounded-2xl bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white text-center">
              <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-3" />
              <p className="text-sm font-semibold animate-pulse">Yapay Zeka Metni Okuyor...</p>
              <p className="text-[11px] text-gray-400 mt-1 max-w-xs">
                Gemini görüntüyü tarıyor, dili tespit ediyor ve öğrenim kartınızı hazırlıyor.
              </p>
            </div>
          )}

          {/* Error Message */}
          {cameraError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-2 text-xs text-red-600 dark:text-red-400 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Hata oluştu</p>
                <p>{cameraError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Translation & OCR Results */}
        <div className="flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className={`rounded-2xl p-5 border flex-1 flex flex-col justify-between shadow-xs ${
                  isDarkMode ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-100"
                }`}
              >
                <div className="space-y-4">
                  {/* Language Detected Slat */}
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                    <span className="text-[11px] font-mono uppercase text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                      <Languages className="w-3.5 h-3.5" />
                      Yapay Zeka Analizi
                    </span>
                    <span className="text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 px-2.5 py-1 rounded-full">
                      Tespit Edilen Dil: {result.detectedLanguage}
                    </span>
                  </div>

                  {/* Transcribed original block */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                        Görüntüdeki Orijinal Metin
                      </label>
                      <button
                        onClick={() => handleSpeak(result.originalText, true)}
                        className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                          isPlayingOrig ? "text-indigo-600 dark:text-indigo-400 animate-pulse" : "text-gray-400"
                        }`}
                        title="Sesli Dinle"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm font-medium italic p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl leading-relaxed">
                      "{result.originalText}"
                    </p>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="flex justify-center my-1">
                    <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-full">
                      <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 rotate-90 md:rotate-0" />
                    </div>
                  </div>

                  {/* Translation block */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                        Tercüme Edilen Metin
                      </label>
                      <button
                        onClick={() => handleSpeak(result.translatedText, false)}
                        className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                          isPlayingTrans ? "text-indigo-600 dark:text-indigo-400 animate-pulse" : "text-gray-400"
                        }`}
                        title="Sesli Dinle"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 p-3 bg-indigo-50/50 dark:bg-indigo-950/15 rounded-xl leading-relaxed">
                      {result.translatedText}
                    </p>
                  </div>

                  {/* Educational Breakdown explanation */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                      Dilbilgisi ve Kelime Notları
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-300 bg-amber-50/40 dark:bg-amber-950/10 p-3 rounded-xl border border-amber-100/50 dark:border-amber-900/20 leading-relaxed">
                      {result.explanation}
                    </p>
                  </div>
                </div>

                {/* Reset button inside results card */}
                <button
                  onClick={() => setResult(null)}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Yeni Metin Fotoğrafı Tara
                </button>
              </motion.div>
            ) : (
              // Empty State guidance
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`rounded-2xl p-6 border text-center flex flex-col items-center justify-center flex-1 py-12 ${
                  isDarkMode ? "bg-gray-900/30 border-gray-800/80" : "bg-white border-gray-100"
                }`}
              >
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 animate-pulse">
                  <Languages className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold mb-2">Tercüme Sonuçları Hazır Değil</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                  Sol taraftaki paneli kullanarak kameranızla bir kitap sayfası, tabela veya el yazısı çekin ya da cihazınızdan bir metin görseli yükleyin. Yapay zeka içeriği anında tahlil edecektir.
                </p>
                <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800/80 w-full max-w-xs text-left">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                    Öğrenme Tüyoları:
                  </span>
                  <ul className="text-[10px] text-gray-400 list-disc list-inside space-y-1">
                    <li>İngilizce ambalaj yazılarını çevirin</li>
                    <li>Gürcüce tabelaları fotoğraflayın</li>
                    <li>Sözlük anlamlarını sesli telaffuzla dinleyin</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
