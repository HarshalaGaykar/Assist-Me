import React, { useEffect, useCallback } from 'react';
import { Mic, Volume2 } from 'lucide-react';
import { useStore } from '../store';

const COMMANDS = {
  // Todo commands
  'add task': (store: any, text: string) => {
    store.addTodo(text.replace('add task', '').trim());
  },
  'complete task': (store: any, text: string) => {
    const taskText = text.replace('complete task', '').trim();
    const task = store.todos.find((t: any) => t.text.toLowerCase().includes(taskText.toLowerCase()));
    if (task) store.toggleTodo(task.id);
  },
  'delete task': (store: any, text: string) => {
    const taskText = text.replace('delete task', '').trim();
    const task = store.todos.find((t: any) => t.text.toLowerCase().includes(taskText.toLowerCase()));
    if (task) store.removeTodo(task.id);
  },

  // Wheelchair commands
  'move forward': (store: any) => {
    store.updateWheelchair({ direction: 'forward' });
  },
  'move backward': (store: any) => {
    store.updateWheelchair({ direction: 'backward' });
  },
  'turn left': (store: any) => {
    store.updateWheelchair({ direction: 'left' });
  },
  'turn right': (store: any) => {
    store.updateWheelchair({ direction: 'right' });
  },
  'stop wheelchair': (store: any) => {
    store.updateWheelchair({ direction: 'stop' });
  },
  'set speed': (store: any, text: string) => {
    const speed = parseInt(text.replace('set speed', '').trim());
    if (!isNaN(speed) && speed >= 0 && speed <= 10) {
      store.updateWheelchair({ speed });
    }
  },

  // Text to speech commands
  'speak text': (store: any, text: string) => {
    const textToSpeak = text.replace('speak text', '').trim();
    if (textToSpeak) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      window.speechSynthesis.speak(utterance);
    }
  },
  'stop speaking': () => {
    window.speechSynthesis.cancel();
  },
};

export const VoiceControls: React.FC = () => {
  const store = useStore();
  const { isSpeaking, isListening, setIsSpeaking, setIsListening } = store;

  const processCommand = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    
    for (const [command, handler] of Object.entries(COMMANDS)) {
      if (lowerTranscript.includes(command)) {
        handler(store, transcript);
        // Provide audio feedback
        const utterance = new SpeechSynthesisUtterance(`Executing command: ${command}`);
        utterance.volume = 0.5;
        window.speechSynthesis.speak(utterance);
        break;
      }
    }
  }, [store]);

  const startListening = useCallback(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join(' ');

        processCommand(transcript);
      };

      recognition.start();
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  }, [processCommand]);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  useEffect(() => {
    // Start listening for commands when component mounts
    startListening();
    speak('Voice control activated. You can now use voice commands.');

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 flex space-x-2">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h3 className="font-semibold mb-2">Available Commands:</h3>
        <ul className="text-sm space-y-1">
          <li>"Add task [task name]"</li>
          <li>"Complete task [task name]"</li>
          <li>"Delete task [task name]"</li>
          <li>"Move forward/backward"</li>
          <li>"Turn left/right"</li>
          <li>"Stop wheelchair"</li>
          <li>"Set speed [0-10]"</li>
          <li>"Speak text [text]"</li>
          <li>"Stop speaking"</li>
        </ul>
      </div>
      <button
        onClick={startListening}
        className={`p-3 rounded-full ${
          isListening ? 'bg-red-500' : 'bg-blue-500'
        } text-white`}
      >
        <Mic className="w-6 h-6" />
      </button>
    </div>
  );
};