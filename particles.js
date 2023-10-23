const randomNumber = (min, max) => (Math.random() * (max - min) + min);

/**
 * @param {HTMLCanvasElement} canvas 
 * @param {{r: number, g: number, b: number}} color
 */
export default function createCollisionParticlesAnimation(canvas, color) {
  const ctx = canvas.getContext("2d");
  const state = {
    maxLineSize: 250, requestAnimationId: 0, numParticles: 0, spaceSize: { w: 0, h: 0 }, particles: [], wasStarted: false,
    strokeStyleParticle: "white", strokeStyleLine: "rgba(255, 255, 255,"
  }
  const moveParticles = (() => {
    const drawParticle = particle => {
      ctx.lineWidth = particle.size;
      ctx.strokeStyle = state.strokeStyleParticle;
      ctx.beginPath();
      ctx.lineTo(particle.pos.x, particle.pos.y);
      ctx.stroke();
    }
    const drawLine = (pos1, pos2, distance) => {
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = state.strokeStyleLine + ((state.maxLineSize - distance) / state.maxLineSize) + ")";
      ctx.beginPath();
      ctx.moveTo(pos1.x, pos1.y);
      ctx.lineTo(pos2.x, pos2.y);
      ctx.stroke();
    }
    function collision(particle1, particle2) {
      const collisionNormal = { x: particle2.pos.x - particle1.pos.x, y: particle2.pos.y - particle1.pos.y, };
      const collisionNormalMagnitude = (collisionNormal.x ** 2 + collisionNormal.y ** 2) ** 0.5;
      if (collisionNormalMagnitude === 0) { return; }
      collisionNormal.x /= collisionNormalMagnitude;
      collisionNormal.y /= collisionNormalMagnitude;
      const relativeSpeed = { x: particle2.speed.x - particle1.speed.x, y: particle2.speed.y - particle1.speed.y, };
      const speedAlongNormal = relativeSpeed.x * collisionNormal.x + relativeSpeed.y * collisionNormal.y;
      if (speedAlongNormal > 0) { return; }
      const impulseMagnitude = (-2 * speedAlongNormal) / ((1 / particle1.radius) + (1 / particle2.radius));
      const impulse1 = impulseMagnitude / particle1.radius, impulse2 = impulseMagnitude / particle2.radius;
      particle1.speed.x -= impulse1 * collisionNormal.x;
      particle1.speed.y -= impulse1 * collisionNormal.y;
      particle2.speed.x += impulse2 * collisionNormal.x;
      particle2.speed.y += impulse2 * collisionNormal.y;
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
    const { width, height } = ctx.canvas.getBoundingClientRect();
    ctx.canvas.width = state.spaceSize.w = width;
    ctx.canvas.height = state.spaceSize.h = height;
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
  const onResize = () => {
    if (!state.wasStarted) { return; }
    const { width, height } = ctx.canvas.getBoundingClientRect();
    if (state.spaceSize.h === height && state.spaceSize.w === width) { return; }
    createParticles();
  }
  const start = () => {
    if (state.wasStarted) { return; }
    const { width, height } = ctx.canvas.getBoundingClientRect();
    state.particles = state.spaceSize.h !== height || state.spaceSize.w !== width ? [] : state.particles;
    window.addEventListener("resize", onResize);
    if (!state.particles.length) { createParticles(); }
    animation();
    state.wasStarted = true;
  }
  const stop = () => {
    if (!state.wasStarted) { return; }
    window.removeEventListener("resize", onResize);
    cancelAnimationFrame(state.requestAnimationId);
    state.wasStarted = false;
  }
  const setColor = color => {
    state.strokeStyleParticle = color ? "rgb(" + color.r + ", " + color.g + ", " + color.b + ")" : "white";
    state.strokeStyleLine = color ? "rgba(" + color.r + ", " + color.g + ", " + color.b + "," : "rgba(255, 255, 255,";
  }
  /**
   * @param {{r: number, g: number, b: number}} color
   */
  const changeColor = async color => {
    if (!color) { return; }
    setColor(color);
  }
  color && setColor(color);
  return { start, stop, changeColor }
}