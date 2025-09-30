// Based on:
// https://stackoverflow.com/questions/21977786/star-b-v-color-index-to-apparent-rgb-color

// Star B-V color to RGB
@export fn bv2rgb(color: vec4<f32>) -> vec4<f32> {

    var t: f32;
    var r: f32 = 0.0;
    var g: f32 = 0.0;
    var b: f32 = 0.0;

    let bv = clamp(color.x, -0.4, 2.0);
    let vmag = color.y;

         if ((bv >= -0.40) && (bv < 0.00)) { t = (bv + 0.40) / (0.00 + 0.40); r = 0.61 + (0.11 * t) + (0.1 * t * t); }
    else if ((bv >=  0.00) && (bv < 0.40)) { t = (bv - 0.00) / (0.40 - 0.00); r = 0.83 + (0.17 * t);                 }
    else if ((bv >=  0.40) && (bv < 2.10)) { t = (bv - 0.40) / (2.10 - 0.40); r = 1.00;                              }
         if ((bv >= -0.40) && (bv < 0.00)) { t = (bv + 0.40) / (0.00 + 0.40); g = 0.70 + (0.07 * t) + (0.1 * t * t); }
    else if ((bv >=  0.00) && (bv < 0.40)) { t = (bv - 0.00) / (0.40 - 0.00); g = 0.87 + (0.11 * t);                 }
    else if ((bv >=  0.40) && (bv < 1.60)) { t = (bv - 0.40) / (1.60 - 0.40); g = 0.98 - (0.16 * t);                 }
    else if ((bv >=  1.60) && (bv < 2.00)) { t = (bv - 1.60) / (2.00 - 1.60); g = 0.82              - (0.5 * t * t); }
         if ((bv >= -0.40) && (bv < 0.40)) { t = (bv + 0.40) / (0.40 + 0.40); b = 1.00;                              }
    else if ((bv >=  0.40) && (bv < 1.50)) { t = (bv - 0.40) / (1.50 - 0.40); b = 1.00 - (0.47 * t) + (0.1 * t * t); }
    else if ((bv >=  1.50) && (bv < 1.94)) { t = (bv - 1.50) / (1.94 - 1.50); b = 0.63              - (0.6 * t * t); }

    // https://en.wikipedia.org/wiki/Apparent_magnitude
    let v = pow(2.512, -vmag) * 100.0;

    return min(vec4<f32>(1.414), vec4<f32>(r * v, g * v, b * v, 1));
};
