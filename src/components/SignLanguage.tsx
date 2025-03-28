import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { FileQuestion, Hand } from 'lucide-react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

// Define the sign language gestures with their corresponding hand positions
const signLanguageGestures = {
  'A': { fingers: [0, 1, 1, 1, 1], thumb: 'across' },
  'B': { fingers: [1, 0, 0, 0, 0], thumb: 'up' },
  'C': { fingers: [1, 1, 1, 1, 1], thumb: 'curved' },
  // Add more gestures with their specific hand positions
};

export const SignLanguage: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState('');
  const [handLandmarks, setHandLandmarks] = useState<any[]>([]);
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasPermission(true);
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        setHasPermission(false);
      }
    };

    checkPermission();
  }, []);

  const initializeMediaPipe = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    const handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numHands: 2
    });

    return handLandmarker;
  };

  const analyzeHandPosition = (landmarks: any[]) => {
    if (!landmarks.length) return null;

    // Extract key points for finger positions
    const fingerTips = [4, 8, 12, 16, 20].map(i => landmarks[i]);
    const fingerBases = [2, 5, 9, 13, 17].map(i => landmarks[i]);
    
    // Calculate finger states (extended or flexed)
    const fingerStates = fingerTips.map((tip, i) => {
      const base = fingerBases[i];
      const distance = Math.sqrt(
        Math.pow(tip.x - base.x, 2) + 
        Math.pow(tip.y - base.y, 2)
      );
      return distance > 0.1; // Threshold for considering a finger extended
    });

    // Compare with known gestures
    for (const [gesture, position] of Object.entries(signLanguageGestures)) {
      const match = fingerStates.every((state, i) => state === position.fingers[i]);
      if (match) {
        return {
          gesture,
          confidence: calculateConfidence(landmarks, position)
        };
      }
    }

    return null;
  };

  const calculateConfidence = (landmarks: any[], position: any) => {
    // Implement confidence calculation based on how well the landmarks match the expected position
    return 0.85 + Math.random() * 0.1; // Placeholder for demonstration
  };

  useEffect(() => {
    if (!hasPermission || !webcamRef.current || !canvasRef.current) return;

    let animationFrame: number;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let handLandmarker: any = null;
    initializeMediaPipe().then(hl => handLandmarker = hl);

    const processFrame = async () => {
      if (webcamRef.current?.video?.readyState === 4) {
        const video = webcamRef.current.video;
        canvasRef.current!.width = video.videoWidth;
        canvasRef.current!.height = video.videoHeight;

        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        if (handLandmarker && !isProcessing) {
          setIsProcessing(true);
          
          try {
            const results = await handLandmarker.detectForVideo(video, performance.now());
            if (results.landmarks) {
              setHandLandmarks(results.landmarks[0] || []);
              const analysis = analyzeHandPosition(results.landmarks[0] || []);
              
              if (analysis) {
                setDetectedGesture(analysis.gesture);
                setConfidence(analysis.confidence);
              } else {
                setDetectedGesture('');
                setConfidence(0);
              }
            }
          } catch (error) {
            console.error('Error processing frame:', error);
          }

          setIsProcessing(false);
        }
      }
      animationFrame = requestAnimationFrame(processFrame);
    };

    processFrame();
    return () => {
      cancelAnimationFrame(animationFrame);
      if (handLandmarker) handLandmarker.close();
    };
  }, [hasPermission, isProcessing]);

  const drawHandLandmarks = (ctx: CanvasRenderingContext2D) => {
    if (!handLandmarks.length) return;

    ctx.fillStyle = '#00ff00';
    handLandmarks.forEach((landmark) => {
      ctx.beginPath();
      ctx.arc(
        landmark.x * ctx.canvas.width,
        landmark.y * ctx.canvas.height,
        3,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });

    // Draw connections between landmarks
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // index finger
      [0, 9], [9, 10], [10, 11], [11, 12], // middle finger
      [0, 13], [13, 14], [14, 15], [15, 16], // ring finger
      [0, 17], [17, 18], [18, 19], [19, 20], // pinky
    ];

    connections.forEach(([start, end]) => {
      ctx.beginPath();
      ctx.moveTo(
        handLandmarks[start].x * ctx.canvas.width,
        handLandmarks[start].y * ctx.canvas.height
      );
      ctx.lineTo(
        handLandmarks[end].x * ctx.canvas.width,
        handLandmarks[end].y * ctx.canvas.height
      );
      ctx.stroke();
    });
  };

  if (!hasPermission) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Sign Language Detection</h2>
        <div className="text-center text-gray-600">
          <FileQuestion className="w-12 h-12 mx-auto mb-2" />
          <p>Camera permission is required for sign language detection</p>
          <button
            onClick={() => navigator.mediaDevices.getUserMedia({ video: true })}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Grant Permission
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Sign Language Detection</h2>
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <Webcam
          ref={webcamRef}
          className="absolute inset-0 w-full h-full object-cover"
          mirrored
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        {detectedGesture && (
          <div className="absolute bottom-4 left-4 right-4 bg-black/75 text-white p-3 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <Hand className="w-6 h-6" />
              <span className="text-lg font-semibold">
                {detectedGesture} ({(confidence * 100).toFixed(1)}% confidence)
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p className="font-semibold">Detected Hand Positions:</p>
        <ul className="mt-2 space-y-1">
          {handLandmarks.length > 0 && (
            <li>
              Thumb: {handLandmarks[4].y < handLandmarks[3].y ? 'Extended' : 'Flexed'}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};