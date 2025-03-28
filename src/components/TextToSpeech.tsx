import React, { useState } from 'react';
import { Volume2, VolumeX, Settings2 } from 'lucide-react';
import { useStore } from '../store';

export const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { isSpeaking, setIsSpeaking } = useStore();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  React.useEffect(() => {
    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (!voice && availableVoices.length > 0) {
        setVoice(availableVoices[0]);
      }
    };

    window.speechSynthesis.onvoiceschanged = updateVoices;
    updateVoices();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = () => {
    if (!text.trim()) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Text to Speech</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-gray-600 hover:text-blue-500"
        >
          <Settings2 className="w-6 h-6" />
        </button>
      </div>

      {showSettings && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Voice
          </label>
          <select
            value={voice?.name || ''}
            onChange={(e) => {
              const selectedVoice = voices.find(v => v.name === e.target.value);
              if (selectedVoice) setVoice(selectedVoice);
            }}
            className="w-full p-2 border rounded-lg"
          >
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to speak..."
        className="w-full h-32 p-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex justify-end space-x-2">
        {isSpeaking ? (
          <button
            onClick={stopSpeaking}
            className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
          >
            <VolumeX className="w-6 h-6" />
          </button>
        ) : (
          <button
            onClick={speak}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};