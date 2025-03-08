function createParticles (options) {



    // ----------------------
    // Options
    // ----------------------

    const defaults = {
        grid: 12,
        pointMaxRadius: 3.5,
        pointMaxTranslation: 6,
        initialScale: 2,
        initialDelay: 1,
        initialDuration: 2
    }



    // ----------------------
    // Data
    // ----------------------

    const { canvas, ...config } =  Object.assign(defaults, options);
    const parent = canvas.parentNode;

    const WIDTH = config.image.naturalWidth;
    const HEIGHT = config.image.naturalHeight;

    const ctx = canvas.getContext('2d');
    const points = createPoints();
    const animations = {};

    const globals = {
        initiated: false,
        scale: 1
    };






    // ----------------------
    // Helpers
    // ----------------------

    function getRandom (min, max) {
        return min + (max - min) * Math.random()
    }

    function getScale () {
        const sx = Math.min(canvas.width / WIDTH, 1);
        const sy = Math.min(canvas.height / HEIGHT, 1);
        return Math.min(sx, sy);
    }

    function getInitialScale () {
        const sx = canvas.width / WIDTH;
        const sy = canvas.height / HEIGHT;
        return Math.max(sx, sy) * config.initialScale;
    }

    function shuffleArray (array) {
        for (let i = array.length - 1; i >= 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }



    // ----------------------
    // Actions
    // ----------------------

    function onResize () {
        canvas.width = parent.offsetWidth
        canvas.height = parent.offsetHeight;
        animations.scale?.kill();
        globals.scale = globals.initiated ? getScale() : getInitialScale();
    }



    // ----------------------
    // Draw
    // ----------------------

    function draw () {

        const s = globals.scale;

        console.log('draw')



        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.scale(s, s);
        ctx.translate(-WIDTH / 2, -HEIGHT / 2)

        // ctx.fillStyle = '#000'
        // ctx.fillRect(0, 0, WIDTH, HEIGHT)

        ctx.fillStyle = '#48A0DB'


        const maxPoints = Math.round(points.length * (s * s));
        const p = points.slice(0, maxPoints)


        // console.log(maxPoints)


        for (const point of p) {

            const a = point.a;
            const x = point.tx + point.x + Math.cos(a) * 2;
            const y = point.ty + point.y + Math.sin(a) * 2;

            ctx.beginPath();
            ctx.arc(x, y, point.r / s, 0, Math.PI * 2)
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore()


        requestAnimationFrame(draw);
    }



    // ----------------------
    // Run
    // ----------------------

    onResize();
    draw();
    window.addEventListener('resize', onResize);

    gsap.delayedCall(config.initialDelay, () => {

        globals.initiated = true;

        animations.scale = gsap.to(globals, {
            scale: getScale(),
            delay: config.initialDelay,
            duration: config.initialDuration,
            ease: 'power3.out'
        })

        points.forEach(point => gsap.to(point, {
            x: point.x0,
            y: point.y0,
            delay: config.initialDelay,
            duration: config.initialDuration
        }))

    });




    // ----------------------
    // Create points
    // ----------------------

    function createPoints () {

        const points = [];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        ctx.drawImage(image, 0, 0);

        const startX = WIDTH % config.grid / 2;
        const startY = HEIGHT % config.grid / 2;

        for (let gx = startX; gx <= WIDTH; gx += config.grid) {
            for (let gy = startY; gy <= HEIGHT; gy += config.grid) {

                const { data } = ctx.getImageData(gx, gy, config.grid, config.grid);
                let opaque = 0;

                for (let i = 3; i < data.length; i += 4) {
                    if (data[i] > 0) opaque++;
                }

                if (opaque > data.length / 4 / 2) {

                    const point = {
                        x0: gx + config.grid / 2,
                        y0: gy + config.grid / 2,
                        a: 0,
                        x: Math.random() * WIDTH,
                        y: Math.random() * HEIGHT,
                        tx: 0,
                        ty: 0,
                        r: getRandom(1, config.pointMaxRadius)
                    }

                    gsap.to(point, {
                        a: Math.PI * 2,
                        repeat: -1,
                        duration: 1,
                        delay: -Math.random() * 1
                    })

                    function move (delay = 0) {
                        gsap.to(point, {
                            tx: getRandom(-config.pointMaxTranslation, config.pointMaxTranslation),
                            ty: getRandom(-config.pointMaxTranslation, config.pointMaxTranslation),
                            duration: 0.5 + Math.random(),
                            delay,
                            onComplete: move
                        })
                    }

                    move(Math.random())

                    // const x0 = gx + config.grid / 2;
                    // const y0 = gy + config.grid / 2;
                    // const x = Math.random() * WIDTH;
                    // const y = Math.random() * HEIGHT;
                    // const r = getRandom(1, config.pointMaxRadius);
                    points.push(point);
                }

            }
        }

        shuffleArray(points)

        return points;

    }

}