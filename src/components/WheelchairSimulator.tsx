import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '../store';
import { Battery, Navigation, Gauge, Target } from 'lucide-react';

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

export const WheelchairSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { wheelchair, updateWheelchair } = useStore();
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [destination, setDestination] = useState<Point | null>(null);
  const [position, setPosition] = useState<Point>({ x: 50, y: 50 });
  const [path, setPath] = useState<Point[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate random obstacles
    const generateObstacles = () => {
      const newObstacles: Obstacle[] = [];
      for (let i = 0; i < 5; i++) {
        newObstacles.push({
          x: Math.random() * (canvas.width - 50),
          y: Math.random() * (canvas.height - 50),
          width: 30 + Math.random() * 20,
          height: 30 + Math.random() * 20
        });
      }
      setObstacles(newObstacles);
    };

    generateObstacles();
  }, []);

  const findPath = useCallback((start: Point, end: Point) => {
    // Simple A* pathfinding implementation
    const grid: boolean[][] = Array(100).fill(false).map(() => Array(100).fill(false));
    
    // Mark obstacles in grid
    obstacles.forEach(obs => {
      const gridX = Math.floor(obs.x / 5);
      const gridY = Math.floor(obs.y / 5);
      for (let x = gridX - 1; x <= gridX + 1; x++) {
        for (let y = gridY - 1; y <= gridY + 1; y++) {
          if (x >= 0 && x < 100 && y >= 0 && y < 100) {
            grid[x][y] = true;
          }
        }
      }
    });

    // A* implementation
    const openSet: Point[] = [start];
    const cameFrom = new Map<string, Point>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();
    
    gScore.set(`${start.x},${start.y}`, 0);
    fScore.set(`${start.x},${start.y}`, heuristic(start, end));

    while (openSet.length > 0) {
      let current = openSet[0];
      let lowestF = fScore.get(`${current.x},${current.y}`) || Infinity;
      
      openSet.forEach(point => {
        const f = fScore.get(`${point.x},${point.y}`) || Infinity;
        if (f < lowestF) {
          lowestF = f;
          current = point;
        }
      });

      if (current.x === end.x && current.y === end.y) {
        const path: Point[] = [current];
        let temp = current;
        while (cameFrom.has(`${temp.x},${temp.y}`)) {
          temp = cameFrom.get(`${temp.x},${temp.y}`)!;
          path.unshift(temp);
        }
        return path;
      }

      openSet.splice(openSet.indexOf(current), 1);
      
      // Get neighbors
      const neighbors: Point[] = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];

      neighbors.forEach(neighbor => {
        if (neighbor.x < 0 || neighbor.x >= 100 || neighbor.y < 0 || neighbor.y >= 100) return;
        if (grid[neighbor.x][neighbor.y]) return;

        const tentativeG = (gScore.get(`${current.x},${current.y}`) || 0) + 1;
        
        if (tentativeG < (gScore.get(`${neighbor.x},${neighbor.y}`) || Infinity)) {
          cameFrom.set(`${neighbor.x},${neighbor.y}`, current);
          gScore.set(`${neighbor.x},${neighbor.y}`, tentativeG);
          fScore.set(`${neighbor.x},${neighbor.y}`, tentativeG + heuristic(neighbor, end));
          
          if (!openSet.find(p => p.x === neighbor.x && p.y === neighbor.y)) {
            openSet.push(neighbor);
          }
        }
      });
    }

    return [];
  }, [obstacles]);

  const heuristic = (a: Point, b: Point) => {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  };

  useEffect(() => {
    if (!canvasRef.current || !destination) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newPath = findPath(position, destination);
    setPath(newPath);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw obstacles
      ctx.fillStyle = '#ef4444';
      obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      });

      // Draw path
      if (path.length > 0) {
        ctx.beginPath();
        ctx.moveTo(path[0].x * 5, path[0].y * 5);
        path.forEach(point => {
          ctx.lineTo(point.x * 5, point.y * 5);
        });
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw wheelchair position
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(position.x * 5, position.y * 5, 10, 0, Math.PI * 2);
      ctx.fill();

      // Draw destination
      if (destination) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(destination.x * 5, destination.y * 5, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [position, destination, obstacles, path]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / 5);
    const y = Math.floor((e.clientY - rect.top) / 5);
    setDestination({ x, y });
  };

  useEffect(() => {
    if (!path.length) return;
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < path.length) {
        setPosition(path[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [path]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Smart Wheelchair Navigation</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center text-lg font-semibold">
            <Battery className="w-6 h-6 mr-2" />
            <span className={wheelchair.battery < 20 ? 'text-red-500' : ''}>
              {Math.round(wheelchair.battery)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full mt-2">
            <div
              className={`h-full rounded-full ${
                wheelchair.battery < 20 ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${wheelchair.battery}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center text-lg font-semibold">
            <Gauge className="w-6 h-6 mr-2" />
            <span>{wheelchair.speed} km/h</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={wheelchair.speed}
            onChange={(e) => updateWheelchair({ speed: Number(e.target.value) })}
            className="w-full mt-2"
          />
        </div>
      </div>

      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={500}
          height={300}
          onClick={handleCanvasClick}
          className="w-full cursor-pointer"
        />
        <div className="absolute top-2 right-2 bg-white/90 p-2 rounded-lg text-sm">
          Click anywhere to set destination
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-gray-600">
        The wheelchair will automatically navigate around obstacles
      </div>
    </div>
  );
};