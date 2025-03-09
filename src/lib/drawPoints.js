export default function drawPoints (ctx, options, points) {

    const { canvas, image, scale } = options;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.scale(scale, scale);
    ctx.translate(-image.width / 2, -image.height / 2)

    for (const point of points) {

        const x = point.tx + point.x + Math.cos(point.spinAngle) * point.spinRadius;
        const y = point.ty + point.y + Math.sin(point.spinAngle) * point.spinRadius;

        ctx.beginPath();
        ctx.arc(x, y, point.radius / scale, 0, Math.PI * 2)
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore()

}