import React, { useState, useEffect } from "react";
import "./game.css";

const Game = () => {
  const [position, setPosition] = useState(50);
  const [velocity, setVelocity] = useState(0);
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const speed = 0.5;
  const bulletSpeed = 2;

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
      setPosition((prev) => Math.max(0, Math.min(100, prev + velocity)));
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animationFrameId);
  }, [velocity]);

  useEffect(() => {
    let animationFrameId;

    const updateBullets = () => {
      setBullets((prevBullets) =>
        prevBullets
          .map((bullet) => ({ ...bullet, top: bullet.top + bulletSpeed }))
          .filter((bullet) => bullet.top < 100)
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
      { left: position, top: 5 }
    ]);
  };

  const generateEnemies = () => {
  const words = ["Hello", "World", "this", "is", "an", "enemy", "ok?"];
  const newEnemies = [];
  let currentLeft = 30; // Start positioning

  words.forEach((word, index) => {
    newEnemies.push({
      id: index,
      left: currentLeft,
      width: 100, // Fixed width for each enemy
      text: word // Add text for each enemy
    });
    currentLeft += 110; // 100px width + 10px margin
  });

  setEnemies(newEnemies);
};
  
  // Convert pixel positions to percentages for positioning
  const pixelToPercent = (pixels) => {
    return (pixels / window.innerWidth) * 100;
  };

  const checkCollisions = () => {
    setBullets((prevBullets) => {
      return prevBullets.filter((bullet) => {
        const bulletLeftPixels = (bullet.left / 100) * window.innerWidth;
        
        const hitEnemy = enemies.find(
          (enemy) =>
            bullet.top >= 90 && // Bullet reaches enemy row
            bulletLeftPixels >= enemy.left &&
            bulletLeftPixels <= enemy.left + 100 // Fixed width
        );
  
        if (hitEnemy) {
          setEnemies((prevEnemies) =>
            prevEnemies.filter((enemy) => enemy.id !== hitEnemy.id)
          );
          return false; // Remove bullet on hit
        }
  
        return true;
      });
    });
  };
  return (
    <div className="game-container">
  <div className="player" style={{ left: `${position}%` }}></div>
  {bullets.map((bullet, index) => (
    <div
      key={index}
      className="bullet"
      style={{ left: `${bullet.left}%`, top: `${bullet.top}%` }}
    ></div>
  ))}
  <div className="blockRow">
    <span className="row-number">1</span>
    {enemies.map((enemy) => (
      <div
        key={enemy.id}
        className="enemy"
        style={{
          left: `${pixelToPercent(enemy.left)}%`,
          
        }}
      >
        {enemy.text} {/* Display the text for each enemy */}
      </div>
    ))}
  </div>
</div>
  );
};

export default Game;