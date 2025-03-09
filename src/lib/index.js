import { gsap } from 'gsap'
import { getRandom } from './utils.js'
import createPoints from './createPoints.js'
import drawPoints from './drawPoints.js'

export default function (_options) {



    // ----------------------
    // Options
    // ----------------------

    const defaults = {

        grid: 12,

        pointRadius: {
            min: 1,
            max: 3.5
        },

        pointOffset: {
            min: 4,
            max: 8
        },

        pointOffsetDuration: {
            min: 0.3,
            max: 1
        },

        pointSpinRadius: {
            min: 4,
            max: 10
        },

        pointSpinDuration: {
            min: 2,
            max: 2
        },

        initialScale: 2,
        initialDelay: 1,
        initialDuration: 2,

        shuffleDelay: 5,
        shuffleDuration: 1,

        // system properties
        initiated: false,
        scale: 1

    }



    // ----------------------
    // Data
    // ----------------------

    const options =  Object.assign(defaults, _options);
    const { canvas, image } = options;
    const ctx = canvas.getContext('2d');
    const points = createPoints(image, options);
    const animations = {};



    // ----------------------
    // Animations
    // ----------------------

    function spin (point, delay) {
        const duration = getRandom(options.pointSpinDuration)
        return gsap.fromTo(point, { spinAngle: 0 }, {
            spinAngle: Math.PI * 2,
            duration: duration,
            delay: delay ?? -Math.random() * duration,
            onComplete: () => spin(point, 0)
        })
    }

    function translate (point) {
        return gsap.to(point, {
            tx: getRandom(options.pointOffset) * (Math.random() > 0.5 ? 1 : -1),
            ty: getRandom(options.pointOffset) * (Math.random() > 0.5 ? 1 : -1),
            duration: getRandom(options.pointSpinDuration),
            onComplete: () => translate(point)
        })
    }



    // ----------------------
    // Shuffle
    // ----------------------

    function shuffle () {

        const shuffled = points
            .map(point => ({ ...point, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)

        points.forEach((point, index) => gsap.to(point, {
            x: shuffled[index].x0,
            y: shuffled[index].y0,
            duration: options.shuffleDuration
        }))

        gsap.delayedCall(options.shuffleDuration + options.shuffleDelay, shuffle);

    }



    // ----------------------
    // Init
    // ----------------------

    function init () {

        options.initiated = true;

        animations.scale = gsap.to(options, {
            scale: getScale(),
            duration: options.initialDuration,
            ease: 'power3.out'
        })

        points.forEach(point => gsap.to(point, {
            x: point.x0,
            y: point.y0,
            duration: options.initialDuration
        }))

        gsap.delayedCall(options.initialDuration + options.shuffleDelay, shuffle);

    }



    // ----------------------
    // Helpers
    // ----------------------

    function getScale () {
        const sx = Math.min(canvas.width / image.width, 1);
        const sy = Math.min(canvas.height / image.height, 1);
        return Math.min(sx, sy);
    }

    function getInitialScale () {
        const sx = canvas.width / image.width;
        const sy = canvas.height / image.height;
        return Math.max(sx, sy) * options.initialScale;
    }



    // ----------------------
    // Actions
    // ----------------------

    function onResize () {
        canvas.width = canvas.parentNode.offsetWidth
        canvas.height = canvas.parentNode.offsetHeight;
        animations.scale?.kill();
        options.scale = options.initiated ? getScale() : getInitialScale();
    }

    function onUpdate () {
        drawPoints(ctx, options, points);
        requestAnimationFrame(onUpdate)
    }



    // ----------------------
    // Run
    // ----------------------

    points.forEach(point => {
        spin(point);
        translate(point);
    })

    onResize();
    onUpdate();
    window.addEventListener('resize', onResize);
    gsap.delayedCall(options.initialDelay, init);



}