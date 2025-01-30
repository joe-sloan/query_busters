import React, { useState, useEffect } from "react";
import "./game.css";

const Game = () => {
  const [position, setPosition] = useState(500); // Start at 500px from left
  const [velocity, setVelocity] = useState(0);
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [gameWidth, setGameWidth] = useState(window.innerWidth);
  const speed = 5; // Pixels per frame
  const bulletSpeed = 7; // Pixels per frame

  // Update game width on window resize
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
  }, [velocity, bullets]);

  useEffect(() => {
    let animationFrameId;

    const updatePosition = () => {
      setPosition((prev) => {
        const newPos = prev + velocity;
        return Math.max(0, Math.min(gameWidth, newPos));
      });
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animationFrameId);
  }, [velocity, gameWidth]);

  useEffect(() => {
    let animationFrameId;

    const updateBullets = () => {
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
  }, [bullets]);

  const fireBullet = () => {
    setBullets((prevBullets) => [
      ...prevBullets,
      { left: position, top: 20 } // Start at player position
    ]);
  };

  const generateEnemies = () => {
    const words = ["Hello", "World", "this", "is", "an", "enemy", "ok?"];
    const newEnemies = [];
    let currentLeft = 50; // Starting position after the number

    // Create a hidden element for measuring text width
    const measuringDiv = document.createElement("div");
    measuringDiv.style.position = "absolute";
    measuringDiv.style.visibility = "hidden";
    measuringDiv.style.whiteSpace = "nowrap";
    measuringDiv.className = "enemy"; // Apply the same styling
    document.body.appendChild(measuringDiv);

    words.forEach((word, index) => {
      measuringDiv.textContent = word;
      const wordWidth = measuringDiv.getBoundingClientRect().width; // Get the actual width

      newEnemies.push({
        id: index,
        left: currentLeft,
        width: wordWidth - 20, // Set actual width
        text: word,
        isHit: false
      });

      currentLeft += wordWidth + 1; // Add gap after each word
    });

    document.body.removeChild(measuringDiv); // Clean up the measuring element
    setEnemies(newEnemies);
  };

  const checkCollisions = () => {
    setBullets((prevBullets) => {
      return prevBullets.filter((bullet) => {
        const hitEnemy = enemies.find(
          (enemy) =>
            !enemy.isHit &&
            bullet.top >= window.innerHeight - 40 && // Adjusted for new enemy position
            bullet.left >= enemy.left &&
            bullet.left <= enemy.left + enemy.width
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

  return (
    <div className="game-container">
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
          bottom: '20px',  // Changed from 10px to 20px
          left: '0',
          width: '100%'
        }}
      >
        <span className="row-number">1</span>
        {enemies.map((enemy) => (
          <div
            key={enemy.id}
            className="enemy"
            style={{
              position: 'absolute',
              left: `${enemy.left}px`,
              width: `${enemy.width}px`,
              visibility: enemy.isHit ? 'hidden' : 'visible'
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