import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  myId: string;
  peerId: string | null;
  peerName: string | null;
  onSendMessage: (text: string) => void;
}

export default function ChatPanel({
  messages,
  myId,
  peerId,
  peerName,
  onSendMessage,
}: ChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickTemplates = [
    "Klavye ve fare yetkisi istiyorum.",
    "Bağlantıyı şimdi kontrol edebilirsiniz.",
    "Dosya transferini başlattım, kabul edin.",
    "Oturumu kapatıyorum, teşekkürler!",
    "Her şey harika çalışıyor."
  ];

  const handleSend = () => {
    if (!inputText.trim() || !peerId) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Scroll to bottom when messages list modifies
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div id="chat-panel-container" className="flex flex-col h-full bg-neutral-900/40 backdrop-blur-md rounded-2xl border border-neutral-800/80 p-5 shadow-xl transition-all duration-300 hover:border-neutral-700/40 font-sans">
      <div className="flex items-center gap-2 mb-3 border-b border-neutral-800/80 pb-2.5">
        <div className={`w-2 h-2 rounded-full ${peerId ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-neutral-600'}`} />
        <h3 className="text-sm font-semibold text-white/95 truncate font-heading tracking-tight">
          {peerId ? `${peerName} ile Canlı Sohbet` : 'Oturum Sohbeti (Pasif)'}
        </h3>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto mb-3 space-y-3 pr-1 min-h-[160px] scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4 opacity-50">
            <span className="text-xs text-neutral-400">Bu oturumdaki mesajlaşmalar burada görünür. Uçtan uca şifrelenmiştir.</span>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-1.5">
                  <span className="text-[10px] text-amber-300 bg-amber-950/20 border border-amber-900/30 px-2.5 py-1 rounded-full font-mono">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isMine = msg.senderId === myId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1.5 font-mono">
                  <span className="text-[10px] text-neutral-400 font-medium">
                    {isMine ? 'Siz' : msg.senderName}
                  </span>
                  <span className="text-[9px] text-neutral-500">
                    {msg.timestamp}
                  </span>
                </div>
                <div
                  className={`px-3 py-2 rounded-2xl max-w-[85%] text-xs font-normal leading-relaxed break-words shadow-sm ${
                    isMine
                      ? 'bg-red-600 text-slate-50 rounded-tr-none'
                      : 'bg-neutral-800/80 text-neutral-100 rounded-tl-none border border-neutral-750'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick message shortcuts */}
      {peerId && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {quickTemplates.map((tmpl, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(tmpl)}
              className="text-[10px] text-neutral-450 bg-neutral-950/55 hover:bg-neutral-800 hover:text-red-400 border border-neutral-800/80 hover:border-neutral-700 px-2.5 py-1 rounded-lg transition-all truncate max-w-[200px] cursor-pointer"
              title={tmpl}
            >
              {tmpl}
            </button>
          ))}
        </div>
      )}

      {/* Input controls */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={!peerId}
          placeholder={peerId ? "Buraya mesajınızı yazın..." : "Sohbet için bağlantı kurun"}
          className="flex-1 bg-neutral-950/60 border border-neutral-800 text-neutral-200 placeholder-neutral-500 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-red-500/50 hover:border-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim() || !peerId}
          className="flex items-center justify-center p-2.5 bg-red-650 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-md group cursor-pointer"
        >
          <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
