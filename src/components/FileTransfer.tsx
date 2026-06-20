import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, File, FileText, Image, Archive, Download, Server, RefreshCw, Folder } from 'lucide-react';
import { SharedFile } from '../types';
import JSZip from 'jszip';

interface FileTransferProps {
  sharedFiles: SharedFile[];
  myId: string;
  myName: string;
  peerId: string | null;
  onUploadSuccess: (f: SharedFile) => void;
}

export default function FileTransfer({
  sharedFiles,
  myId,
  myName,
  peerId,
  onUploadSuccess,
}: FileTransferProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const folderInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mime: string) => {
    if (mime.startsWith('image/')) return <Image className="text-emerald-500 w-5 h-5 flex-shrink-0" />;
    if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar')) {
      return <Archive className="text-amber-500 w-5 h-5 flex-shrink-0" />;
    }
    if (mime.startsWith('text/') || mime.includes('pdf') || mime.includes('word')) {
      return <FileText className="text-sky-500 w-5 h-5 flex-shrink-0" />;
    }
    if (mime === 'application/zip') return <Folder className="text-amber-400 w-5 h-5 flex-shrink-0" />;
    return <File className="text-gray-400 w-5 h-5 flex-shrink-0" />;
  };

  // Dosya veya klasörü base64'e çevirip sunucuya gönder
  const uploadToServer = async (blob: Blob, fileName: string, mimeType: string) => {
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable)
          setUploadProgress(Math.round((e.loaded / e.total) * 50) + 10);
      };
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    setUploadProgress(65);
    const fileId = 'file_' + Math.random().toString(36).substr(2, 9);
    const serverBase = 'https://any-desk-1.onrender.com';

    const response = await fetch(`${serverBase}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId, name: fileName, size: blob.size,
        mimeType, senderId: myId, senderName: myName, base64Data,
      }),
    });

    setUploadProgress(90);
    if (!response.ok) throw new Error(`Sunucu hatası: ${response.statusText}`);
    const result = await response.json();
    setUploadProgress(100);

    const newFile: SharedFile = {
      id: fileId, name: fileName, size: blob.size, mimeType,
      senderId: myId, senderName: myName,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      downloadUrl: `${serverBase}${result.downloadUrl}`,
    };
    onUploadSuccess(newFile);
    setTimeout(() => { setIsUploading(false); setUploadProgress(0); }, 600);
  };

  // Tek dosya gönder
  const processFileUpload = async (file: File) => {
    if (!peerId) { setErrorMessage("Önce bağlantı kurun!"); return; }
    setErrorMessage(null);
    setIsUploading(true);
    setUploadProgress(10);
    try {
      await uploadToServer(file, file.name, file.type || 'application/octet-stream');
    } catch (e: any) {
      setErrorMessage("Hata: " + e.message);
      setIsUploading(false);
    }
  };

  // Klasör seçilince ZIP'e paketleyip gönder
  const processFolderUpload = async (files: FileList) => {
    if (!peerId) { setErrorMessage("Önce bağlantı kurun!"); return; }
    if (files.length === 0) return;
    setErrorMessage(null);
    setIsUploading(true);
    setUploadProgress(5);
    try {
      const zip = new JSZip();
      // webkitRelativePath ile klasör yapısını koru
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const relativePath = (file as any).webkitRelativePath || file.name;
        zip.file(relativePath, file);
        setUploadProgress(Math.round((i / files.length) * 40) + 5);
      }
      // Klasör adını zip adı olarak kullan
      const firstPath = (files[0] as any).webkitRelativePath || files[0].name;
      const folderName = firstPath.split('/')[0] || 'klasor';
      const zipName = `${folderName}.zip`;

      setUploadProgress(50);
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      await uploadToServer(zipBlob, zipName, 'application/zip');
    } catch (e: any) {
      setErrorMessage("Klasör ZIP hatası: " + e.message);
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    // Birden fazla dosya varsa ZIP'e paketle
    if (e.dataTransfer.files.length > 1) {
      await processFolderUpload(e.dataTransfer.files);
    } else {
      processFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0)
      processFileUpload(e.target.files[0]);
  };

  const handleFolderChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0)
      processFolderUpload(e.target.files);
  };

  return (
    <div id="file-transfer-view" className="flex flex-col h-full bg-neutral-900/40 backdrop-blur-md rounded-2xl border border-neutral-800/80 p-5 shadow-xl font-sans">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 font-heading tracking-tight">
            <Server className="w-4 h-4 text-red-500 animate-pulse" />
            Eşler Arası Dosya Transfer Paneli
          </h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">Uzak masaüstü bağlantısı üzerinden hızlı dosya transferi</p>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => peerId && fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-default transition-all duration-300 ${
          !peerId
            ? 'opacity-40 border-neutral-800 bg-neutral-950/20 cursor-not-allowed'
            : isDragging
            ? 'border-red-500 bg-red-950/10 scale-[0.99] shadow-inner'
            : 'border-neutral-800 hover:border-neutral-500 bg-neutral-950/40 cursor-pointer'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={!peerId}
          className="hidden"
        />
        <input
          type="file"
          ref={folderInputRef}
          onChange={handleFolderChange}
          disabled={!peerId}
          className="hidden"
          {...{ webkitdirectory: '', mozdirectory: '' } as any}
          multiple
        />
        
        <Upload className={`w-9 h-9 mb-2 transition-transform duration-300 ${isDragging ? 'translate-y-[-4px] text-red-500 animate-bounce' : 'text-neutral-450'}`} />
        
        {peerId ? (
          <div className="text-center font-sans">
            <p className="text-xs font-medium text-neutral-200">
              Göndermek istediğiniz dosyayı buraya sürükleyin
            </p>
            <p className="text-[10px] text-neutral-450 mt-1">
              ya da doğrudan <span onClick={() => fileInputRef.current?.click()} className="text-red-500 font-medium underline underline-offset-2 cursor-pointer">dosya seç</span>
              {' '}veya{' '}
              <span onClick={(e) => { e.stopPropagation(); folderInputRef.current?.click(); }} className="text-amber-500 font-medium underline underline-offset-2 cursor-pointer">klasör seç</span>
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xs font-semibold text-red-400/90 font-mono tracking-wide uppercase">
              Dosya Transferi İçin Bağlantı Gerekli
            </p>
            <p className="text-[10px] text-neutral-450 mt-1 leading-relaxed">
              Öncelikle bağlantı kodu girerek uzak bilgisayarla oturum başlatın.
            </p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <div className="mt-4 bg-neutral-950/60 p-3 rounded-lg border border-neutral-850/80">
          <div className="flex items-center justify-between mb-1.5 text-[10px] text-neutral-300">
            <span className="flex items-center gap-2 font-mono">
              <RefreshCw className="w-3.5 h-3.5 text-red-500 animate-spin" />
              Sıkıştırılıyor ve Gönderiliyor...
            </span>
            <span className="font-mono font-bold text-red-400">{uploadProgress}%</span>
          </div>
          <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 text-[10.5px] font-medium text-red-400 bg-red-950/20 border border-red-900/40 p-2.5 rounded-lg font-mono">
          {errorMessage}
        </div>
      )}

      {/* Shared Files Grid / List */}
      <div className="flex-1 mt-5 overflow-y-auto max-h-[280px] pr-1 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
        <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2.5 font-mono">PAYLAŞILAN DOSYALAR ({sharedFiles.length})</h4>
        
        {sharedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-neutral-950/20 rounded-xl border border-neutral-800/40">
            <File className="w-8 h-8 text-neutral-700 mb-1" />
            <p className="text-[10px] text-neutral-500">Bu oturumda henüz dosya gönderilmedi.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...sharedFiles].reverse().map((file) => {
              const isMine = file.senderId === myId;
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-neutral-950/40 border border-neutral-850 hover:border-neutral-700/60 hover:bg-neutral-800/20 transition-all font-sans"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {getFileIcon(file.mimeType)}
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-neutral-200 truncate pr-2" title={file.name}>
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[9px] text-neutral-450 font-mono">
                        <span>{formatBytes(file.size)}</span>
                        <span className="w-1 h-1 bg-neutral-800 rounded-full" />
                        <span className={isMine ? 'text-red-450 font-semibold' : 'text-neutral-300'}>
                          {isMine ? 'Siz' : file.senderName}
                        </span>
                        <span className="w-1 h-1 bg-neutral-800 rounded-full" />
                        <span>{file.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Download button */}
                  <a
                    href={file.downloadUrl}
                    download={file.name}
                    className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-900/60 hover:bg-red-600 text-neutral-350 hover:text-white transition-all border border-neutral-800 hover:border-red-500 group cursor-pointer"
                    title={isMine ? "Kendi dosyanızı indirin" : "Dosyayı yerel bilgisayarınıza indirin"}
                  >
                    <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
