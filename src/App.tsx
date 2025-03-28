import React from 'react';
import { TodoList } from './components/TodoList';
import { WheelchairSimulator } from './components/WheelchairSimulator';
import { TextToSpeech } from './components/TextToSpeech';
import { SpeechToText } from './components/SpeechToText';
import { SignLanguage } from './components/SignLanguage';
import { VoiceControls } from './components/VoiceControls';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Accessibility Assistant
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TodoList />
          <WheelchairSimulator />
          <TextToSpeech />
          <SpeechToText />
          <SignLanguage />
        </div>
      </main>
      <VoiceControls />
    </div>
  );
}

export default App;