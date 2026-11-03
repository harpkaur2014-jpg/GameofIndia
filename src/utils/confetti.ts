import confetti from 'canvas-confetti';

/**
 * Fires a joyful shower of confetti raining down the screen for correct answers.
 */
export function fireCorrectConfetti() {
  // Rain from top across the width of the screen
  confetti({
    particleCount: 50,
    angle: 90,
    spread: 120,
    origin: { x: 0.5, y: -0.05 },
    colors: ['#FF9933', '#FFFFFF', '#128807', '#3B82F6', '#F59E0B', '#10B981'],
    startVelocity: 25,
    gravity: 0.8,
    ticks: 200,
    scalar: 1.1,
    shapes: ['square', 'circle'],
  });

  // Secondary side bursts for extra celebratory delight
  setTimeout(() => {
    confetti({
      particleCount: 25,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.3 },
      colors: ['#FF9933', '#10B981', '#38BDF8'],
      startVelocity: 30,
      gravity: 0.9,
    });
    confetti({
      particleCount: 25,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.3 },
      colors: ['#FF9933', '#10B981', '#F59E0B'],
      startVelocity: 30,
      gravity: 0.9,
    });
  }, 100);
}

/**
 * Epic multi-stage confetti shower for completing all territories!
 */
export function fireVictoryCelebration() {
  const duration = 3.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Left cannon
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#FF9933', '#FFFFFF', '#128807', '#FBBF24', '#38BDF8'],
    });

    // Right cannon
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#FF9933', '#FFFFFF', '#128807', '#A855F7', '#EC4899'],
    });
  }, 250);
}
