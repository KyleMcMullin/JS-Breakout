MyGame.graphics = (function () {
    'use strict';

    let canvas = document.getElementById('id-canvas');
    let context = canvas.getContext('2d');

    function clear() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    // --------------------------------------------------------------
    //
    // Draws a texture to the canvas with the following specification:
    //    image: Image
    //    center: {x: , y: }
    //    size: { width: , height: }
    //
    // --------------------------------------------------------------
    function drawTexture(image, center, rotation, size) {
        context.save();

        context.translate(center.x, center.y);
        context.rotate(rotation);
        context.translate(-center.x, -center.y);

        context.drawImage(
            image,
            center.x - size.width / 2,
            center.y - size.height / 2,
            size.width, size.height);

        context.restore();
    }

    function drawCircle(spec) {
        context.beginPath();
        context.arc(spec.center.x, spec.center.y, spec.radius, 0, 2 * Math.PI);
        context.closePath();

        context.strokeStyle = spec.outlineColor;
        context.fillStyle = spec.fillColor;

        context.fill();
        context.stroke();
    }

    function drawRectangle(spec) {
        context.save();

        context.translate(spec.center.x, spec.center.y);
        context.rotate(spec.rotation);
        context.translate(-spec.center.x, -spec.center.y);

        context.strokeStyle = spec.outlineColor;
        context.fillStyle = spec.fillColor;

        context.fillRect(
            spec.position.x, spec.position.y,
            spec.width, spec.height);

        context.strokeRect(
            spec.position.x, spec.position.y,
            spec.width, spec.height);

        context.restore();
    }

    function drawText(spec) {
        context.save();

        context.font = spec.font;
        context.fillStyle = spec.fillStyle;
        context.strokeStyle = spec.strokeStyle;
        context.textBaseline = 'top';

        context.translate(spec.position.x, spec.position.y);
        context.rotate(spec.rotation);
        context.translate(-spec.position.x, -spec.position.y);


        context.fillText(spec.text, spec.position.x, spec.position.y);
        context.strokeText(spec.text, spec.position.x, spec.position.y);

        context.restore();
    }

    let api = {
        get canvas() { return canvas; },
        clear: clear,
        drawTexture: drawTexture,
        drawText: drawText,
        drawRectangle: drawRectangle,
        drawCircle: drawCircle
    };

    return api;
}());
