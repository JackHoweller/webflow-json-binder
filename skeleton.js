$(document).ready(() => {
    startSkeleton();
});

window.startSkeleton = function () {
    $('[skeleton-load]').each((index, element) => {
        $(element).css('position', 'relative').append('<div class="skeleton-loader"></div>');
    });
}

window.removeSkeleton = function () {
    setTimeout(() => {
        $('.skeleton-loader').css("opacity", 0)
        setTimeout(() => {
            $('.skeleton-loader').remove();
        }, 400);
    }, 300);
}

function generateGradientArray(startColor, endColor, length) {
    const startRGB = hexToRgb(startColor);
    const endRGB = hexToRgb(endColor);

    const stepSize = {
        r: (endRGB.r - startRGB.r) / (length - 1),
        g: (endRGB.g - startRGB.g) / (length - 1),
        b: (endRGB.b - startRGB.b) / (length - 1)
    };

    const gradientArray = [];
    for (let i = 0; i < length; i++) {
        const r = Math.round(startRGB.r + stepSize.r * i);
        const g = Math.round(startRGB.g + stepSize.g * i);
        const b = Math.round(startRGB.b + stepSize.b * i);
        const hex = rgbToHex(r, g, b);
        gradientArray.push(hex);
    }

    return gradientArray;
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
}

function rgbToHex(r, g, b) {
    const componentToHex = (c) => {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}