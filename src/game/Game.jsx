import React, { useState, useEffect } from "react";
import "./game.css";

const Game = () => {

  //Game Parameters
  const [gameWidth, setGameWidth] = useState(window.innerWidth);
  
  //Object States
  const [isMoving, setIsMoving] = useState(false);
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [position, setPosition] = useState(500);

  //Numbering
  const lineNumbers = [];
  for (let i = 1; i <= 10; i++) {
    lineNumbers.push(i); // Add each number to the array
  }


  //Game States
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const restartGame = () => {
    setGameOver(false);
    setBullets([]);
    setEnemies([]);
    setTextPosition(window.innerHeight - 40);
    setPosition(500);
    setVelocity(0);
    setIsMoving(true);
    generateEnemies();
    setScore(0);
  };
  
  const [score, setScore] = useState(0);

  //Motion Constants
  const [textPosition, setTextPosition] = useState(window.innerHeight - 1); // Start from bottom
  const speed = 3;
  const bulletSpeed = 5;
  const textSpeed = 2; // Speed at which text moves upward
  const [velocity, setVelocity] = useState(0);
  
  //Syntax highlighting
  const SQL_SYNTAX = {
    keywords: ['SELECT', 'FROM', 'WHERE', 'GROUP', 'BY', 'HAVING', 'ORDER', 'LIMIT', 'AS', 'JOIN'],
    functions: ['CURRENT_TIMESTAMP', 'COUNT'],
    operators: ['AND', '=', '>', 'TRUE', 'TRUE,', 'FALSE,', 'FALSE'],
    strings: ["'"],
    punctuation: [',', ';']
  };

  const SQL_COLORS = {
    keywords: '#ECA2FB',    // pink
    functions: '#DCDCAA',   // yellow
    operators: '#FFFFFF',   // white
    strings: '#CE9178',     // orange/salmon
    punctuation: '#FFFFFF', // white
    default: '#4CB7F2'      // light blue
  };

  const getSqlTokenType = (word) => {
    const upperWord = word.toUpperCase();
  
    // Check if it contains a quote (either at start or end)
    if (word.includes("'")) {
      return 'strings';
    }
  
    // Check if it's a keyword
    if (SQL_SYNTAX.keywords.includes(upperWord)) {
      return 'keywords';
    }
  
    // Check if it's a function
    if (SQL_SYNTAX.functions.includes(upperWord)) {
      return 'functions';
    }
  
    // Check if it's an operator
    if (SQL_SYNTAX.operators.includes(upperWord)) {
      return 'operators';
    }
  
    // Check if it's punctuation
    if (SQL_SYNTAX.punctuation.includes(word)) {
      return 'punctuation';
    }
  
    return 'default';
  };

  useEffect(() => {
    const handleStart = (event) => {
      if (event.key === " ") {
        setGameStarted(true);
      }
    };
  
    window.addEventListener("keydown", handleStart);
    return () => window.removeEventListener("keydown", handleStart);
  }, []);

  useEffect(() => {
    const handleResize = () => setGameWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    generateEnemies();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      
      if (event.key === "Enter" && gameOver) {
        restartGame(); // Restart game when space is pressed
        return;
      }
      if (gameOver) return; // Prevent movement if game is over

      if (event.key === "ArrowLeft") {
        setVelocity(-speed);
      } else if (event.key === "ArrowRight") {
        setVelocity(speed);
      } else if (event.key === " " || event.key === "ArrowDown") {
        fireBullet();
      }
    };

    const handleKeyUp = (event) => {
      if (
        (event.key === "ArrowLeft" && velocity < 0) ||
        (event.key === "ArrowRight" && velocity > 0)
      ) {
        setVelocity(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [velocity, bullets, gameOver]);

  useEffect(() => {
    let animationFrameId;

    const updatePosition = () => {
      setPosition((prev) => {
        const newPos = prev + velocity;
        const minPosition = 60; // This creates the left padding
        return Math.max(minPosition, Math.min(gameWidth, newPos));
      });
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animationFrameId);
  }, [velocity, gameWidth]);

  useEffect(() => {
    let animationFrameId;

    const updateBullets = () => {
      if (gameOver) return;

      setBullets((prevBullets) =>
        prevBullets
          .map((bullet) => ({ ...bullet, top: bullet.top + bulletSpeed }))
          .filter((bullet) => bullet.top < window.innerHeight)
      );
      checkCollisions();
      animationFrameId = requestAnimationFrame(updateBullets);
    };

    animationFrameId = requestAnimationFrame(updateBullets);
    return () => cancelAnimationFrame(animationFrameId);
  }, [bullets, gameOver]);

  // New effect for upward text movement
  useEffect(() => {
    let animationFrameId;
  
    const updateTextPosition = () => {
      if (!isMoving || gameOver) return;
  
      setTextPosition((prev) => {
        const newPos = prev - textSpeed;
  
        const enemyReachedTop = enemies.some(
          enemy => enemy.isWord && !enemy.isHit && newPos + (enemy.lineIndex * 30) <= 0
        );
  
        if (enemyReachedTop) {
          // Calculate score based on lowest line with remaining enemies
          const remainingLines = enemies
            .filter(enemy => !enemy.isHit)
            .map(enemy => enemy.lineIndex + 1);
          setScore(Math.min(...remainingLines) - 1);
          setGameOver(true);
          return prev;
        }
        return newPos;
      });
  
      animationFrameId = requestAnimationFrame(updateTextPosition);
    };
  
    animationFrameId = requestAnimationFrame(updateTextPosition);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isMoving, gameOver, enemies]);

  const fireBullet = () => {
    if (gameOver) return;

    setBullets((prevBullets) => [
      ...prevBullets,
      { left: position, top: 20 }
    ]);

    // Start text movement after first shot
    if (!isMoving) {
      setIsMoving(true);
    }
  };

  const generateEnemies = () => {
    const sqlLines = [
      "SELECT 'We are sorry for the inconvenience!' AS apology_message,",
      "'Please try again later. If the problem persists,",
      "please contact our support team for assistance.' AS suggestion,",
      "CURRENT_TIMESTAMP AS timestamp,",
      "FROM error_logs e,",
      "WHERE e.error_code = 404,",
      "AND e.page_not_found = TRUE,",
      "GROUP BY e.page_url,",
      "HAVING COUNT(e.id) > 0,",
      "ORDER BY timestamp DESC,",
      "LIMIT 1;",
    //   "",
    //   "",
    //   "",
    //   "",
    //   "SELECT m.member_name",
    //     "m.join_date, ",
    //     "c.cult_name, ",
    //     "c.cult_beliefs,",
    //     "r.ritual_name,",
    //     "r.ritual_date,",
    //     "b.benefit_name,",
    //     "b.benefit_description,",
    //     "d.dedication_level,",
    //     "t.trust_factor",
    //   "FROM cult_members m",
    //   "JOIN cults c ON m.cult_id = c.cult_id",
    //   "JOIN rituals r ON c.cult_id = r.cult_id",
    //   "JOIN benefits b ON c.cult_id = b.cult_id",
    //   "JOIN dedication d ON m.member_id = d.member_id",
    //   "JOIN trust t ON m.member_id = t.member_id",
    //   "WHERE m.join_date >= '2023-01-01'",
    //     "AND r.ritual_type = 'Initiation'",
    //     "AND d.dedication_level = 'High'",
    //     "AND t.trust_factor > 7",
    //   "ORDER BY m.join_date DESC;",
        ");",
    "",
    "",
    "",
    "",
      "CREATE TABLE masterpiece (",
        "id SERIAL PRIMARY KEY,",
        "title VARCHAR(255) NOT NULL DEFAULT 'Untitled Masterpiece',",
        "artist_name VARCHAR(255) NOT NULL,",
        "inspiration TEXT CHECK (LENGTH(inspiration) > 10),",
        "medium VARCHAR(100) CHECK (medium IN ('oil paint', 'marble', 'bronze', 'digital', 'music')),",
        "complexity INT CHECK (complexity BETWEEN 1 AND 10),",
        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,",
        "is_timeless BOOLEAN DEFAULT TRUE",
    "INSERT INTO masterpiece (artist_name, inspiration, medium, complexity)",  
    "VALUES",
        "('Leonardo da Vinci', 'A dream of flight and human ingenuity', 'oil paint', 10),",  
        "('Michelangelo', 'The struggle of man reaching for the divine', 'marble', 9),",  
        "('Beethoven', 'The sound of triumph over adversity', 'music', 10),",  
        "('Van Gogh', 'The stars whisper stories in the night sky', 'oil paint', 8);",  
    
    "SELECT * FROM masterpiece",  
    "WHERE is_timeless = TRUE",  
    "ORDER BY complexity DESC",  
    "LIMIT 1;",


    ];
    const newEnemies = [];
    const lineSpacing = 30;

    sqlLines.forEach((line, lineIndex) => {
      let currentLeft = 50;
      const words = line.split(" ");

      words.forEach((word, wordIndex) => {
        const measuringDiv = document.createElement("div");
        measuringDiv.style.position = "absolute";
        measuringDiv.style.visibility = "hidden";
        measuringDiv.style.whiteSpace = "nowrap";
        measuringDiv.className = "enemy";
        measuringDiv.textContent = word;
        document.body.appendChild(measuringDiv);

        const wordWidth = measuringDiv.getBoundingClientRect().width;
        document.body.removeChild(measuringDiv);

        const tokenType = getSqlTokenType(word);
        const color = SQL_COLORS[tokenType];

        newEnemies.push({
          id: `${lineIndex}-${wordIndex}`,
          left: currentLeft,
          lineIndex: lineIndex,
          width: wordWidth - 20,
          text: word,
          color: color,
          isHit: false,
          isWord: true  // New flag to distinguish from row numbers
          
        });

        currentLeft += wordWidth;
      });
    });

    setEnemies(newEnemies);
  };

  const checkCollisions = () => {
    setBullets((prevBullets) => {
      return prevBullets.filter((bullet) => {
        const hitEnemy = enemies.find(
          (enemy) =>
            enemy.isWord &&  // Only check actual words
            !enemy.isHit &&
            bullet.top >= textPosition + (enemy.lineIndex * 30) - 10 &&
            bullet.top <= textPosition + (enemy.lineIndex * 30) + 30 &&
            bullet.left >= enemy.left - 10 &&
            bullet.left <= enemy.left + enemy.width + 10
        );

        if (hitEnemy) {
          setEnemies((prevEnemies) =>
            prevEnemies.map(enemy =>
              enemy.id === hitEnemy.id
                ? { ...enemy, isHit: true }
                : enemy
            )
          );
          return false;
        }
        return true;
      });
    });
  };

  if (!gameStarted) {
    return (
      <div className="start-screen">
        <pre className="ascii-art">
          {`
                    40404040404            
                4040404       4040        
              40       404       4040     
           40            40       40 40    
         40 404040        40      40  40   
        404      4040     40     40     40  
       404           40  40    40       40  
       40        4040  4040  40        4040 
       40     404    40404040        40  40
       40  40        40404040      40    40
       4040       404  4040  40404       40 
        404     40   40   40             40 
         40     40   40     4040        40   
          40   40     40       40404   40   
            40  40     40            404    
              40404      404       40      
                  4040      404040        
                      404040404                      
          `}
        </pre>
        <h1>Page Not Found</h1>
        <p>
            If the issue persists, please visit our{" "}
            <a href="https://help.coalesce.io/hc/en-us" target="_blank" rel="noopener noreferrer">
              support page.
            </a>
          </p>
        <p className="press-space">[Press Space]</p>
      </div>
    );
  }

  return (
    <div className="game-container">
      {gameOver && (
        <div className="game-over-screen">
          <h1>GAME OVER</h1>
          <h2>ERROR: Query terminated at line {score}</h2>
          <h2>[Press Enter to Restart]</h2>
        </div>
      )}
      <div
        className="player"
        style={{
          left: `${position}px`,
          position: 'absolute',
          top: '20px'
        }}
      />
      {bullets.map((bullet, index) => (
        <div
          key={index}
          className="bullet"
          style={{
            left: `${bullet.left}px`,
            top: `${bullet.top}px`,
            position: 'absolute'
          }}
        />
      ))}
      <div
        className="blockRow"
        style={{
          position: 'absolute',
          top: `${textPosition}px`,
          left: '0',
          width: '100%'
        }}
      >
        {enemies.reduce((acc, enemy) => {
 if (!acc.some(item => item.key === `row-${enemy.lineIndex}`)) {
   return [
     ...acc,
     <div
       key={`row-${enemy.lineIndex}`}
       className="row-number"
       style={{
         position: 'absolute',
         left: '10px',
         top: `${enemy.lineIndex * 30}px`
       }}
     >
       {(enemy.lineIndex + 1).toString().padStart(2, '0')}
     </div>
   ];
 }
 return acc;
}, [])}
        {enemies.map((enemy) => (
          <div
            key={enemy.id}
            className="enemy"
            style={{
              position: 'absolute',
              left: `${enemy.left}px`,
              top: `${enemy.lineIndex * 30}px`, // Space each line vertically
              width: `${enemy.width}px`,
              visibility: enemy.isHit ? 'hidden' : 'visible',
              color: enemy.color
            }}
          >
            {enemy.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Game;