const randomNumber = (min, max) => (Math.random() * (max - min) + min);

export default function particlesAnimation(canvas) {
  const ctx = canvas.getContext("2d");
  const state = { maxLineSize: 250, requestAnimationId: 0, numParticles: 0, spaceSize: { w: 0, h: 0 }, particles: [], wasStarted: false }

  const moveParticles = (() => {
    const drawParticle = particle => {
      ctx.lineWidth = particle.size;
      ctx.strokeStyle = "white";
      ctx.beginPath();
      ctx.lineTo(particle.pos.x, particle.pos.y);
      ctx.stroke();
    }
    const drawLine = (pos1, pos2, distance) => {
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "rgba(255, 255, 255," + (state.maxLineSize - distance) / state.maxLineSize + ")";
      ctx.beginPath();
      ctx.moveTo(pos1.x, pos1.y);
      ctx.lineTo(pos2.x, pos2.y);
      ctx.stroke();
    }
    const collision = (particle1, particle2) => {
      const diffX = particle1.pos.x - particle2.pos.x, diffY = particle1.pos.y - particle2.pos.y;
      const dist = (diffX ** 2 + diffY ** 2) ** 0.5;
      const normalX = diffX / dist, normalY = diffY / dist;
      const tangentX = -normalY, tangentY = normalX;
      const sumRadius = particle1.radius + particle2.radius;
      const p1n = particle1.speed.x * normalX + particle1.speed.y * normalY;
      const p1t = particle1.speed.x * tangentX + particle1.speed.y * tangentY;
      const p2n = particle2.speed.x * normalX + particle2.speed.y * normalY;
      const p2t = particle2.speed.x * tangentX + particle2.speed.y * tangentY;
      const p1nFinal = (p1n * (particle1.radius - particle2.radius) + 2 * particle2.radius * p2n) / (particle1.radius + particle2.radius);
      const p2nFinal = (p2n * (particle2.radius - particle1.radius) + 2 * particle1.radius * p1n) / (particle1.radius + particle2.radius);
      const p1nAfterX = normalX * p1nFinal, p1nAfterY = normalY * p1nFinal;
      const p1tAfterX = tangentX * p1t, p1tAfterY = tangentY * p1t;
      const p2nAfterX = normalX * p2nFinal, p2nAfterY = normalY * p2nFinal;
      const p2tAfterX = tangentX * p2t, p2tAfterY = tangentY * p2t;
      const correctionX = normalX * sumRadius, correctionY = normalY * sumRadius;
      particle1.pos.x = particle2.pos.x + correctionX;
      particle1.pos.y = particle2.pos.y + correctionY;
      particle1.speed.x = p1nAfterX + p1tAfterX;
      particle1.speed.y = p1nAfterY + p1tAfterY;
      particle2.speed.x = p2nAfterX + p2tAfterX;
      particle2.speed.y = p2nAfterY + p2tAfterY;
    }
    return () => {
      let particle = null;
      for (let i = 0; i < state.numParticles; i++) {
        particle = state.particles[i];
        if (particle.pos.x + particle.radius >= state.spaceSize.w) {
          particle.pos.x = state.spaceSize.w - particle.radius;
          particle.speed.x = -particle.speed.x;
        } else if (particle.pos.x - particle.radius <= 0) {
          particle.pos.x = particle.radius;
          particle.speed.x = -particle.speed.x;
        } else if (particle.pos.y + particle.radius >= state.spaceSize.h) {
          particle.pos.y = state.spaceSize.h - particle.radius;
          particle.speed.y = -particle.speed.y;
        }
        else if (particle.pos.y - particle.radius <= 0) {
          particle.pos.y = particle.radius;
          particle.speed.y = -particle.speed.y;
        }
        particle.pos.x += particle.speed.x;
        particle.pos.y += particle.speed.y;
        drawParticle(particle);

        for (let e = 0; e < state.numParticles; e++) {
          if (e === i) { continue; }
          const particle2 = state.particles[e];
          const distance = ((particle2.pos.x - particle.pos.x) ** 2 + (particle2.pos.y - particle.pos.y) ** 2) ** 0.5;
          if (distance <= state.maxLineSize) {
            if (!particle.linkeds.has(e)) {
              particle2.linkeds.add(i);
              drawLine(particle.pos, particle2.pos, distance);
            }
            if (distance <= (particle2.radius + particle.radius)) { collision(particle, particle2); }
          }
          else { particle2.linkeds.delete(i); }
        }

      }
    }
  })();

  const createParticles = () => {
    state.particles = [];
    ctx.canvas.width = state.spaceSize.w = window.innerWidth;
    ctx.canvas.height = state.spaceSize.h = window.innerHeight;
    state.numParticles = ~~(state.spaceSize.w * state.spaceSize.h / 26000);
    ctx.lineJoin = ctx.lineCap = "round";
    for (let i = 0; i < state.numParticles; i++) {
      const radius = (~~(randomNumber(1.3, 12) * 100)) / 100;
      state.particles.push({
        radius, size: (radius * 2), pos: {
          x: randomNumber(radius, state.spaceSize.w - radius), y: randomNumber(radius, state.spaceSize.h - radius)
        }, speed: { x: randomNumber(-0.7, 0.7), y: randomNumber(-0.7, 0.7), }, linkeds: new Set()
      });
    }
  }

  const animation = (() => {
    let now = 0, before = 0, frameTime = 1000 / 18;
    return () => {
      now = performance.now();
      const deltaTime = now - before;
      if (deltaTime >= frameTime) {
        before = now - (deltaTime % frameTime);
        ctx.clearRect(0, 0, state.spaceSize.w, state.spaceSize.h);
        moveParticles();
      }
      state.requestAnimationId = requestAnimationFrame(animation);
    }
  })();

  const start = () => {
    if (state.wasStarted) { return; }
    window.addEventListener("resize", restart);
    if (!state.particles.length) { createParticles(); }
    animation();
    state.wasStarted = true;
  }

  const stop = () => {
    if (!state.wasStarted) { return; }
    window.removeEventListener("resize", restart);
    cancelAnimationFrame(state.requestAnimationId);
    state.wasStarted = false;
  }

  function restart() {
    stop();
    state.particles = [];
    start();
  }
  return { start, stop }
}