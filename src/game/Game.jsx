import { useState, useEffect, useRef } from "react";
import "./game.css";

const Game = () => {
  const [position, setPosition] = useState(50);
  const [bullets, setBullets] = useState([]);
  const [words, setWords] = useState([]);
  const keysPressed = useRef({});
  const playerPosition = useRef(50);
  const speed = 0.2;
  const bulletSpeed = 1;
  const wordSpeed = -0.1;
  const [lineNumbersState, setLineNumbersState] = useState([]);

  const sqlQuery = [
    "SELECT 'We are sorry for the inconvenience!' AS apology_message,",  
    "'If the problem persists, please contact our support team for assistance.' AS suggestion,",  
    "CURRENT_TIMESTAMP AS timestamp,",  
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
    "ORDER BY lm.launch_date ASC;"
  ];

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
          .filter((line) => line.top < 100)
      );
    };

    const checkCollisions = () => {
      setBullets((prevBullets) =>
        prevBullets.filter((bullet) => {
          let bulletHit = false;
    
          // Split lines into individual words
          const updatedWords = words.map((wordObj) => {
            // Split the line into individual words
            const wordParts = wordObj.word.split(/\s+/);
    
            // Track which words are hit
            const remainingParts = wordParts.filter((part) => {
              const partLeft = wordObj.left + wordParts.indexOf(part) * (part.length * 10);
              const partTop = wordObj.top;
              const partWidth = part.length * 10;
              const partHeight = 16;
    
              // Check collision for this specific word
              const isHit = (
                bullet.left >= partLeft &&
                bullet.left <= partLeft + partWidth &&
                bullet.top >= partTop &&
                bullet.top <= partTop + partHeight
              );
    
              if (isHit) {
                bulletHit = true;
              }
    
              return !isHit;
            });
    
            // Reconstruct the line with remaining words
            return {
              ...wordObj,
              word: remainingParts.join(' ')
            };
          });
    
          if (bulletHit) {
            // Remove lines with no words left
            setWords(updatedWords.filter(wordObj => wordObj.word.trim() !== ''));
            return false; // Remove the bullet
          }
          return true;
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

  useEffect(() => {
    const reversedSQLQuery = [...sqlQuery].reverse();

    const initialWords = reversedSQLQuery.map((word, index) => ({
      word,
      left: 4,
      top: 120 - index * 3,
    }));

    const initialLineNumbers = reversedSQLQuery.map((_, index) => ({
      number: sqlQuery.length - index,
      top: 120 - index * 3,
    }));

    setWords(initialWords);
    setLineNumbersState(initialLineNumbers);
  }, []);

  return (
    <div className="game-container">
      <div className="player" style={{ left: `${position}%` }}>▿</div>

      {bullets.map((bullet, index) => (
        <div
          key={index}
          className="bullet"
          style={{ left: `${bullet.left}%`, top: `${bullet.top}%` }}
        ></div>
      ))}

      {lineNumbersState.map((line, index) => (
        <div
          key={`line-${index}`}
          className="line-number"
          style={{ top: `${line.top}%` }}
        >
          {line.number}
        </div>
      ))}

      {words.map((wordObj, index) => (
        <div
          key={`sql-${index}`}
          className="sql-line"
          style={{
            left: '56px',
            top: `${wordObj.top}%`
          }}
        >
          {wordObj.word}
        </div>
      ))}
    </div>
  );
};

export default Game;