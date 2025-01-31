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
    let currentLeft = 10; // Start more to the left

    words.forEach((word, index) => {
      newEnemies.push({
        id: index,
        left: currentLeft,
        width: 10, // Width in percentage
        text: word,
        isHit: false
      });
      currentLeft += 12; // Space between enemies in percentage
    });

    setEnemies(newEnemies);
  };

  const checkCollisions = () => {
    setBullets((prevBullets) => {
      return prevBullets.filter((bullet) => {
        const hitEnemy = enemies.find(
          (enemy) =>
            !enemy.isHit &&
            bullet.top >= 90 &&
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
              left: `${enemy.left}%`,
              width: `${enemy.width}%`,
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