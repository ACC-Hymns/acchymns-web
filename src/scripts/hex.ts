type RGB = {
    r: number;
    g: number;
    b: number;
};

function hexToRgb(hex: string): RGB | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}

function componentToHex(c: number) {
    const hex = Math.round(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(rgb: RGB) {
    return "#" + componentToHex(rgb.r) + componentToHex(rgb.g) + componentToHex(rgb.b);
}

function darken(input: string) {
    const color = hexToRgb(input);
    if (!color) return input;
    color.r *= 0.5;
    color.g *= 0.5;
    color.b *= 0.5;
    return rgbToHex(color);
}

export { hexToRgb, componentToHex, rgbToHex, darken };
export type { RGB };
