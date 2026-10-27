(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stage = document.getElementById('cierre');
    const canvas = document.getElementById('sail');
    const ctx = canvas.getContext('2d');
    const nav = document.querySelector('.nav');

    let cw, ch, n, cur, fill;
    let px = null, py = 0;      
    let visible = false;

    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const profile = (u) => {
        const v = Math.min(1, Math.max(0, (Math.pow(u, 1.2) - 0.03) / 0.94));
        return 0.12 + 0.88 * Math.pow(Math.sin(Math.PI * v), 0.9);
    };

    function render(t, snap) {
        const step = cw / n;
        const amp = 0.35 + 0.65 * Math.min(1, Math.max(0, py));
        const pts = [];
        for (let i = 0; i < n; i++) {
            const x = (i + 0.5) * step;
            let g = profile((i + 0.5) / n) + (reduce ? 0 : 0.035 * Math.sin(t / 700 + i * 0.35));
            if (px !== null) {
                const d = (x - px) / (cw * 0.12);
                g += Math.exp(-d * d) * 0.24 * amp;
            }
            const target = Math.min(1, g * 0.82) * ch * 0.92;
            cur[i] = snap ? target : cur[i] + (target - cur[i]) * 0.1;
            pts.push([x, ch - cur[i]]);
        }

        ctx.clearRect(0, 0, cw, ch);

        ctx.beginPath();
        ctx.moveTo(pts[0][0], ch);
        pts.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.lineTo(pts[n - 1][0], ch);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();

        ctx.beginPath();
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.strokeStyle = 'rgba(0,242,254,0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.lineWidth = 1.5;
        pts.forEach(([x, y]) => {
            ctx.strokeStyle = 'rgba(0,242,254,' + (0.2 + 0.6 * (ch - y) / ch).toFixed(2) + ')';
            ctx.beginPath();
            ctx.moveTo(x, ch);
            ctx.lineTo(x, y);
            ctx.stroke();
        });

        ctx.save();
        ctx.fillStyle = '#00f2fe';
        ctx.shadowColor = 'rgba(0,242,254,0.7)';
        ctx.shadowBlur = 8;
        pts.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill(); });
        ctx.restore();
    }

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const r = canvas.getBoundingClientRect();
        cw = r.width; ch = r.height;
        canvas.width = Math.round(cw * dpr);
        canvas.height = Math.round(ch * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        n = Math.max(18, Math.round(cw / (cw < 720 ? 16 : 20)));
        cur = new Float32Array(n); 
        fill = ctx.createLinearGradient(0, 0, 0, ch);
        fill.addColorStop(0, 'rgba(0,242,254,0.10)');
        fill.addColorStop(1, 'rgba(0,242,254,0)');
        if (reduce) render(0, true);
    }

    window.addEventListener('resize', resize);
    resize();

    if (!reduce) {
        stage.addEventListener('pointermove', (e) => {
            if (e.pointerType === 'touch') return;
            const r = stage.getBoundingClientRect();
            px = e.clientX - r.left;
            py = (e.clientY - r.top) / r.height;
        });
        stage.addEventListener('pointerleave', () => { px = null; });
        new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(stage);
        const loop = (t) => { if (visible) render(t, false); requestAnimationFrame(loop); };
        requestAnimationFrame(loop);
    }

    const form = document.getElementById('form');
    const note = document.getElementById('form-note');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const d = new FormData(form);
        const lines = ['Hola Gerardo, te escribo desde tu portafolio.', '', 'Nombre: ' + d.get('nombre')];
        if (d.get('correo')) lines.push('Correo: ' + d.get('correo'));
        lines.push('Tipo de proyecto: ' + d.get('tipo'), '', 'Mensaje: ' + d.get('mensaje'));
        window.open('https://wa.me/525549318319?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
        note.textContent = 'Se abrió WhatsApp con tu mensaje listo para enviar.';
    });
})();