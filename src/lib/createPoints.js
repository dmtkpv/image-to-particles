import { getRandom } from './utils.js'

export default function createPoints (image, options) {

    const points = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const startX = image.width % options.grid / 2;
    const startY = image.height % options.grid / 2;

    for (let gx = startX; gx <= image.width; gx += options.grid) {
        for (let gy = startY; gy <= image.height; gy += options.grid) {

            const { data } = ctx.getImageData(gx, gy, options.grid, options.grid);
            let opaque = 0;

            for (let i = 3; i < data.length; i += 4) {
                if (data[i] > 0) opaque++;
            }

            if (opaque > data.length / 4 / 2) {
                points.push({
                    x0: gx + options.grid / 2,
                    y0: gy + options.grid / 2,
                    x: Math.random() * image.width,
                    y: Math.random() * image.height,
                    radius: getRandom(options.pointRadius),
                    spinRadius: getRandom(options.pointSpinRadius),
                    spinAngle: 0,
                    tx: 0,
                    ty: 0
                })
            }

        }
    }

    return points;

}