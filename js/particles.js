/* 
 * Pierre Bouteman - Particle System 
 * Constellation Effect on Canvas
 */

export class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.resize();

        // Configuration
        this.config = {
            particleCount: 80,
            connectionDistance: 150,
            mouseDistance: 200,
            color: 'rgba(189, 0, 255, 0.4)', // Purple
            mouseColor: 'rgba(255, 255, 255, 0.8)' // White connection for contrast
        };

        this.mouse = { x: null, y: null };

        // Bindings
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));

        this.init();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    onMouseMove(e) {
        this.mouse.x = e.x;
        this.mouse.y = e.y;
    }

    init() {
        this.particles = [];
        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push(new Particle(this.canvas));
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw particles
        this.particles.forEach(p => {
            p.update();
            p.draw(this.ctx);
        });

        // Draw Connections
        this.drawConnections();

        requestAnimationFrame(() => this.animate());
    }

    drawConnections() {
        for (let a = 0; a < this.particles.length; a++) {
            for (let b = a; b < this.particles.length; b++) {
                let dx = this.particles[a].x - this.particles[b].x;
                let dy = this.particles[a].y - this.particles[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.config.connectionDistance) {
                    let opacity = 1 - (distance / this.config.connectionDistance);
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.15})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[a].x, this.particles[a].y);
                    this.ctx.lineTo(this.particles[b].x, this.particles[b].y);
                    this.ctx.stroke();
                }
            }

            // Mouse connections
            if (this.mouse.x != null) {
                let dx = this.particles[a].x - this.mouse.x;
                let dy = this.particles[a].y - this.mouse.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.config.mouseDistance) {
                    let opacity = 1 - (distance / this.config.mouseDistance);
                    this.ctx.strokeStyle = `rgba(0, 242, 255, ${opacity * 0.3})`; // Cyan connection
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[a].x, this.particles[a].y);
                    this.ctx.lineTo(this.mouse.x, this.mouse.y);
                    this.ctx.stroke();

                    // Push particles slightly away from mouse
                    if (distance < 100) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (100 - distance) / 100;
                        const directionX = forceDirectionX * force * 2;
                        const directionY = forceDirectionY * force * 2;

                        this.particles[a].x += directionX;
                        this.particles[a].y += directionY;
                    }
                }
            }
        }
    }
}

class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.size = Math.random() * 2 + 1;

        // Velocity
        this.speedX = (Math.random() * 1 - 0.5);
        this.speedY = (Math.random() * 1 - 0.5);
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off edges
        if (this.x > this.canvas.width || this.x < 0) this.speedX = -this.speedX;
        if (this.y > this.canvas.height || this.y < 0) this.speedY = -this.speedY;
    }

    draw(ctx) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
