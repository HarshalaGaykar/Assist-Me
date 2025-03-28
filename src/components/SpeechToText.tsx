import React, { useState, useCallback } from 'react';
import { Mic, MicOff, Copy, Check } from 'lucide-react';
import { useStore } from '../store';

export const SpeechToText: React.FC = () => {
  const [transcript, setTranscript] = useState('');
  const [copied, setCopied] = useState(false);
  const { isListening, setIsListening } = useStore();
  const [recognition, setRecognition] = useState<any>(null);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognition.stop();
    };

    recognition.onresult = (event: any) => {
      const currentTranscript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(' ');
      setTranscript(currentTranscript);
    };

    recognition.start();
    setRecognition(recognition);
  }, []);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setRecognition(null);
    }
  }, [recognition]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Speech to Text</h2>
      
      <div className="relative mb-4">
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Your speech will appear here..."
          className="w-full h-32 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {transcript && (
          <button
            onClick={copyToClipboard}
            className="absolute bottom-2 right-2 text-gray-600 hover:text-blue-500"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`p-4 rounded-full ${
            isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          {isListening ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );
};