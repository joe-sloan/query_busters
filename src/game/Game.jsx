import { useState, useEffect, useRef } from "react";
import "./game.css";

const Game = () => {
  const [position, setPosition] = useState(50); // Player's horizontal position
  const [bullets, setBullets] = useState([]); // Bullet array
  const [words, setWords] = useState([]); // Array of rising SQL lines
  const keysPressed = useRef({}); // Track key states
  const playerPosition = useRef(50); // Player's position stored in ref
  const speed = 2; // Player movement speed
  const bulletSpeed = 1; // Bullet speed
  const wordSpeed = -0.1; // Word rise speed
  const [lineNumbersState, setLineNumbersState] = useState([]);

  // Multi-line SQL query as an array of strings
  const sqlQuery = [
    "SELECT u.id, u.name, u.age, u.country, COUNT(o.id) AS order_count",
    "  FROM users u",
    "  JOIN orders o ON u.id = o.user_id",
    "  WHERE u.age > 21 AND u.country = 'USA'",
    "  GROUP BY u.id",
    "  HAVING COUNT(o.id) > 5",
    "  ORDER BY order_count DESC",
    "  LIMIT 10;"
  ];


  // Fixed line numbers (won't disappear)
  const totalLines = sqlQuery.length;
  const lineNumbers = Array.from({ length: sqlQuery.length }, (_, i) => i + 1);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        keysPressed.current[event.key] = true;
      }
      if (event.key === " ") {
        fireBullet();
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        keysPressed.current[event.key] = false;
      }
    };

    const movePlayer = () => {
      let newLeft = playerPosition.current;

      if (keysPressed.current["ArrowLeft"]) {
        newLeft = Math.max(newLeft - speed, 0);
      }
      if (keysPressed.current["ArrowRight"]) {
        newLeft = Math.min(newLeft + speed, 100);
      }

      playerPosition.current = newLeft;
      setPosition(newLeft);
      requestAnimationFrame(movePlayer);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    requestAnimationFrame(movePlayer);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const fireBullet = () => {
    setBullets((prevBullets) => [
      ...prevBullets,
      { left: playerPosition.current, top: 2.5 }
    ]);
  };

  // Move bullets and check for collision with words
  useEffect(() => {
    let animationFrameId;

    const moveBullets = () => {
      setBullets((prevBullets) =>
        prevBullets
          .map((bullet) => ({ ...bullet, top: bullet.top + bulletSpeed }))
          .filter((bullet) => bullet.top < 100)
      );
    };

    const moveWords = () => {
      setWords((prevWords) =>
        prevWords
          .map((word) => ({ ...word, top: word.top + wordSpeed }))
          .filter((word) => word.top < 100)
      );
    
      setLineNumbersState((prevLineNumbers) =>
        prevLineNumbers
          .map((line) => ({ ...line, top: line.top + wordSpeed }))
          .filter((line) => line.top < 100) // Keep within bounds
      );
    };

    // Collision detection between bullets and words
    const checkCollisions = () => {
      setBullets((prevBullets) =>
        prevBullets.filter((bullet) => {
          let bulletHit = false;
          const updatedWords = words.filter((word, wordIndex) => {
            if (!bulletHit &&
              bullet.left >= word.left &&
              bullet.left <= word.left + 10 &&
              bullet.top <= word.top + 10 &&
              bullet.top >= word.top) {
              bulletHit = true;
              return false; // Remove this specific word
            }
            return true; // Keep other words
          });

          if (bulletHit) {
            setWords(updatedWords);
            return false; // Remove the bullet
          }
          return true; // Keep the bullet
        })
      );
    };

    animationFrameId = requestAnimationFrame(() => {
      moveBullets();
      moveWords();
      checkCollisions();
    });

    return () => cancelAnimationFrame(animationFrameId);
  }, [bullets, words]);

  // Initialize words (SQL lines) at the bottom

  useEffect(() => {
    const initialWords = sqlQuery.map((word, index) => ({
      word,
      left: 4, // Align SQL text to the right of numbers
      top: 95 - index * 2.5, // Maintain spacing
    }));
  
    const initialLineNumbers = sqlQuery.map((_, index) => ({
      number: sqlQuery.length - index, // Reverse the numbering
      top: 95 - index * 2.5, // Keeps spacing in sync with SQL lines
    }));
  
    setWords(initialWords);
    setLineNumbersState(initialLineNumbers);
  }, []);

  return (
    <div className="game-container">
      {/* Player */}
      <div className="player" style={{ left: `${position}%` }}></div>

      {/* Bullets */}
      {bullets.map((bullet, index) => (
        <div
          key={index}
          className="bullet"
          style={{ left: `${bullet.left}%`, top: `${bullet.top}%` }}
        ></div>
      ))}

      {/* Scrolling Line Numbers */}
      {lineNumbersState.map((line, index) => (
        <div
          key={`line-${index}`}
          className="line-number"
          style={{ top: `${line.top}%` }}
        >
          {line.number}
        </div>
      ))}

      {/* SQL Lines */}
      {words.map((word, index) => (
        <div
          key={`sql-${index}`}
          className="sql-line"
          style={{ left: `${word.left}%`, top: `${word.top}%` }}
        >
          {word.word}
        </div>
      ))}
    </div>
  );
};

export default Game;