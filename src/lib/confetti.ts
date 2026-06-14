/* A tiny dependency-free confetti / firework engine.
   It draws onto a provided <canvas>, runs only while particles are alive, and
   stops its requestAnimationFrame loop the moment everything has settled — so
   nothing burns CPU between celebrations. */

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  life: number;
  decay: number;
  shape: "rect" | "circle";
};

const PALETTE = ["#FF2B91", "#FFC400", "#B9A8FF", "#FFF8E8", "#342FD4"];

export class Confetti {
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private raf = 0;
  private running = false;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.canvas.clientWidth * dpr;
    this.canvas.height = this.canvas.clientHeight * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** A burst from a point (fractions 0..1 of the canvas), e.g. a gift opening. */
  burst(originX = 0.5, originY = 0.5, count = 140) {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      this.particles.push({
        x: originX * w,
        y: originY * h,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        size: 5 + Math.random() * 7,
        color: PALETTE[(Math.random() * PALETTE.length) | 0],
        life: 1,
        decay: 0.006 + Math.random() * 0.01,
        shape: Math.random() > 0.5 ? "rect" : "circle",
      });
    }
    this.start();
  }

  /** A gentle elegant rain — used to keep the finale alive briefly. */
  rain(count = 60) {
    const w = this.canvas.clientWidth;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: -20,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 1.5 + Math.random() * 2.5,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.2,
        size: 5 + Math.random() * 6,
        color: PALETTE[(Math.random() * PALETTE.length) | 0],
        life: 1,
        decay: 0.004,
        shape: Math.random() > 0.5 ? "rect" : "circle",
      });
    }
    this.start();
  }

  private start() {
    if (this.running) return;
    this.running = true;
    const tick = () => {
      const { ctx } = this;
      ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
      for (const p of this.particles) {
        p.vy += 0.16; // gravity
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= p.decay;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      this.particles = this.particles.filter(
        (p) => p.life > 0 && p.y < this.canvas.clientHeight + 40
      );
      if (this.particles.length > 0) {
        this.raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        this.running = false;
      }
    };
    this.raf = requestAnimationFrame(tick);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.particles = [];
    this.running = false;
  }
}
