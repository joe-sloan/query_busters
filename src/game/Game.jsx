import { useState, useEffect, useRef } from "react";
import "./game.css";

const Game = () => {
  const [position, setPosition] = useState(50); // Player's horizontal position
  const [bullets, setBullets] = useState([]); // Bullet array
  const [words, setWords] = useState([]); // Array of rising SQL lines
  const keysPressed = useRef({}); // Track key states
  const playerPosition = useRef(50); // Player's position stored in ref
  const speed = 0.2; // Player movement speed
  const bulletSpeed = 1; // Bullet speed
  const wordSpeed = -0.1; // Word rise speed
  const [lineNumbersState, setLineNumbersState] = useState([]);

  // Multi-line SQL query as an array of strings
  const sqlQuery = [
    "SELECT 'We are sorry for the inconvenience!' AS apology_message,",  
    "   'If the problem persists, please contact our support team for assistance.' AS suggestion,",  
    "   CURRENT_TIMESTAMP AS timestamp,",  
    "FROM error_logs e,",  
    "WHERE e.error_code = 404,",
    " ",
    " ",
    " ",
    " ",
    "SELECT lm.mission_name, ",
       "lm.launch_date, ",
       "lm.landing_site, ",
       "a.astronaut_name, ",
       "a.role, ",
       "AVG(d.distance_traveled) AS avg_distance_traveled, ",
       "SUM(d.fuel_consumed) AS total_fuel_consumed, ",
       "COUNT(e.equipment_id) AS total_equipment_used,",
       "MAX(t.time_in_orbit) AS max_time_in_orbit,",
       "lm.mission_outcome",
"FROM lunar_missions lm",
"JOIN astronauts a ON lm.mission_id = a.mission_id",
"JOIN mission_data d ON lm.mission_id = d.mission_id",
"JOIN equipment e ON lm.mission_id = e.mission_id",
"JOIN time_log t ON lm.mission_id = t.mission_id",
"WHERE lm.landing_site = 'Sea of Tranquility'",
  "AND lm.launch_date BETWEEN '1969-07-01' AND '1969-07-30'",
"GROUP BY lm.mission_name, ",
         "lm.launch_date, ",
         "lm.landing_site, ",
         "a.astronaut_name, ",
         "a.role, ",
         "lm.mission_outcome",
"ORDER BY lm.launch_date ASC;",
    
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
        newLeft = Math.max(newLeft - speed, 0); // Reduce step size
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
          // For each bullet, check all words for a collision
          let bulletHit = false;
    
          const updatedWords = words.filter((word) => {
            const wordLeft = word.left; // Left position of the word
            const wordTop = word.top; // Top position of the word
            const wordWidth = word.word.length * 10; // Estimate the word width (adjust based on font size)
            const wordHeight = 16; // Fixed height for word (adjust based on font size)
    
            // Check if bullet is within the word's bounding box
            if (
              bullet.left >= wordLeft &&
              bullet.left <= wordLeft + wordWidth &&
              bullet.top >= wordTop &&
              bullet.top <= wordTop + wordHeight
            ) {
              bulletHit = true;
              return false; // Remove this word if hit
            }
            return true; // Keep this word if not hit
          });
    
          if (bulletHit) {
            setWords(updatedWords); // Remove the hit word
            return false; // Remove the bullet after it hits a word
          }
          return true; // Keep the bullet if no collision
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
  // Reverse the sqlQuery to make the lines rise in reverse order
  const reversedSQLQuery = [...sqlQuery].reverse(); // Create a copy and reverse it

  const initialWords = reversedSQLQuery.map((word, index) => ({
    word,
    left: 4, // Align SQL text to the right of numbers
    top: 120 - index * 3, // Maintain spacing
  }));

  const initialLineNumbers = reversedSQLQuery.map((_, index) => ({
    number: index + 1, // Line numbers should remain in the correct order
    top: 120 - index * 3, // Keeps spacing in sync with SQL lines
  }));

  setWords(initialWords);
  setLineNumbersState(initialLineNumbers);
}, []);

  return (
    <div className="game-container">
      {/* Player */}
      <div className="player" style={{ left: `${position}%` }}>▿</div>

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
          style={{
            left: '56px', // Fixed value for left offset (2.5rem = 40px)
            top: `${word.top}%`
          }}
        >
          {word.word}
        </div>
      ))}
    </div>
  );
};

export default Game;