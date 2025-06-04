import { useEffect, useRef, useState } from "react";

interface GameState {
  bird: { x: number; y: number; velocity: number };
  pipes: Array<{ x: number; topHeight: number; bottomHeight: number; passed: boolean }>;
  score: number;
  gameOver: boolean;
  gameStarted: boolean;
}

export function FlappyBirdGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>({
    bird: { x: 100, y: 200, velocity: 0 },
    pipes: [],
    score: 0,
    gameOver: false,
    gameStarted: false,
  });
  const animationRef = useRef<number>();
  const [displayScore, setDisplayScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;
  const BIRD_SIZE = 20;
  const PIPE_WIDTH = 60;
  const PIPE_GAP = 120;
  const GRAVITY = 0.6;
  const JUMP_STRENGTH = -12;
  const PIPE_SPEED = 3;

  const resetGame = () => {
    gameStateRef.current = {
      bird: { x: 100, y: 200, velocity: 0 },
      pipes: [],
      score: 0,
      gameOver: false,
      gameStarted: true,
    };
    setDisplayScore(0);
    setGameOver(false);
    setGameStarted(true);
  };

  const jump = () => {
    if (!gameStateRef.current.gameStarted) {
      resetGame();
      return;
    }
    if (gameStateRef.current.gameOver) {
      resetGame();
      return;
    }
    gameStateRef.current.bird.velocity = JUMP_STRENGTH;
  };

  const checkCollision = (bird: { x: number; y: number }, pipes: Array<{ x: number; topHeight: number; bottomHeight: number }>) => {
    // Check ground and ceiling collision
    if (bird.y + BIRD_SIZE >= CANVAS_HEIGHT || bird.y <= 0) {
      return true;
    }

    // Check pipe collision
    for (const pipe of pipes) {
      if (
        bird.x + BIRD_SIZE > pipe.x &&
        bird.x < pipe.x + PIPE_WIDTH &&
        (bird.y < pipe.topHeight || bird.y + BIRD_SIZE > CANVAS_HEIGHT - pipe.bottomHeight)
      ) {
        return true;
      }
    }

    return false;
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gameState = gameStateRef.current;

    if (!gameState.gameStarted || gameState.gameOver) {
      // Draw static scene
      ctx.fillStyle = "#87CEEB";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw bird
      ctx.fillStyle = "#FFD700";
      ctx.fillRect(gameState.bird.x, gameState.bird.y, BIRD_SIZE, BIRD_SIZE);

      // Draw pipes
      ctx.fillStyle = "#32CD32";
      for (const pipe of gameState.pipes) {
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.fillRect(pipe.x, CANVAS_HEIGHT - pipe.bottomHeight, PIPE_WIDTH, pipe.bottomHeight);
      }

      if (!gameState.gameStarted) {
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Click to Start", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      }

      if (gameState.gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
        ctx.fillText(`Score: ${gameState.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.fillText("Click to Restart", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
      }

      animationRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    // Update bird physics
    gameState.bird.velocity += GRAVITY;
    gameState.bird.y += gameState.bird.velocity;

    // Update pipes
    for (let i = gameState.pipes.length - 1; i >= 0; i--) {
      const pipe = gameState.pipes[i];
      pipe.x -= PIPE_SPEED;

      // Check if bird passed the pipe
      if (!pipe.passed && pipe.x + PIPE_WIDTH < gameState.bird.x) {
        pipe.passed = true;
        gameState.score++;
        setDisplayScore(gameState.score);
      }

      // Remove pipes that are off screen
      if (pipe.x + PIPE_WIDTH < 0) {
        gameState.pipes.splice(i, 1);
      }
    }

    // Add new pipes
    if (gameState.pipes.length === 0 || gameState.pipes[gameState.pipes.length - 1].x < CANVAS_WIDTH - 200) {
      const topHeight = Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50;
      const bottomHeight = CANVAS_HEIGHT - topHeight - PIPE_GAP;
      gameState.pipes.push({
        x: CANVAS_WIDTH,
        topHeight,
        bottomHeight,
        passed: false,
      });
    }

    // Check collision
    if (checkCollision(gameState.bird, gameState.pipes)) {
      gameState.gameOver = true;
      setGameOver(true);
    }

    // Clear canvas
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw pipes
    ctx.fillStyle = "#32CD32";
    for (const pipe of gameState.pipes) {
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      ctx.fillRect(pipe.x, CANVAS_HEIGHT - pipe.bottomHeight, PIPE_WIDTH, pipe.bottomHeight);
    }

    // Draw bird
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(gameState.bird.x, gameState.bird.y, BIRD_SIZE, BIRD_SIZE);

    animationRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        jump();
      }
    };

    const handleClick = () => {
      jump();
    };

    window.addEventListener("keydown", handleKeyPress);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("click", handleClick);
    }

    // Start game loop
    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      if (canvas) {
        canvas.removeEventListener("click", handleClick);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="text-center">
      <div className="mb-4">
        <span className="text-2xl font-bold text-white">Score: {displayScore}</span>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-4 border-white rounded-lg shadow-2xl cursor-pointer"
        style={{ imageRendering: "pixelated" }}
      />
      <div className="mt-4">
        {!gameStarted && (
          <p className="text-white text-lg">Click the game area or press spacebar to start!</p>
        )}
        {gameOver && (
          <button
            onClick={jump}
            className="btn btn-primary btn-lg mt-2"
          >
            Play Again
          </button>
        )}
      </div>
    </div>
  );
}