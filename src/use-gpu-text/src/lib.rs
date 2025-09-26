use wasm_bindgen::prelude::*;
use serde::{Serialize};
use serde_wasm_bindgen;

use ab_glyph::{Font, FontArc, Glyph, GlyphId, Point, PxScale, PxScaleFont, ScaleFont};
use xi_unicode::LineBreakIterator;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log(s: &str);

    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u32(a: u32);
}

#[wasm_bindgen]
pub struct UseGPUText {
    fonts: Vec<FontArc>,
}

#[derive(Serialize)]
pub struct FontMetrics {
    ascent: f32,
    descent: f32,
    #[serde(rename = "lineHeight")]
    line_height: f32,
}

#[derive(Serialize)]
pub struct SpanMetrics {
    breaks: Vec::<u32>,
    metrics: Vec::<f32>,
    glyphs: Vec::<u32>,
}

#[derive(Serialize)]
pub struct GlyphMetrics {
    #[serde(rename = "id")]
    id: u32,

    #[serde(rename = "layoutBounds")]
    layout_bounds: Vec::<f32>,
    #[serde(rename = "outlineBounds")]
    outline_bounds: Option<Vec::<f32>>,

    #[serde(with = "serde_bytes")]
    image: Option<Vec<u8>>,
    width: u32,
    height: u32,
}

#[wasm_bindgen]
impl UseGPUText {
    pub fn new() -> UseGPUText {
        let ttf = include_bytes!("../../../public/Lato-Regular.ttf") as &[u8];
        let font = FontArc::try_from_slice(ttf).unwrap();
        let fonts = vec!(font);

        UseGPUText {
            fonts,
        }
    }

    pub fn get_line_breaks(&mut self, text: String) -> Result<JsValue, JsValue> {
        let iter = LineBreakIterator::new(&text);

        let mut breaks = Vec::<usize>::new();        
        iter.for_each(|(offset, hard)| {
            breaks.push(offset);
            breaks.push(hard as usize);
        });

    	let js_value = serde_wasm_bindgen::to_value(&breaks)?;
        Ok(js_value)
    }

    pub fn measure_font(&mut self, size: f32) -> Result<JsValue, JsValue> {
        let font = self.fonts[0].as_scaled(size);
        
        let ascent = font.ascent();
        let descent = font.descent();
        let line_height = ascent - descent + font.line_gap();
        
        let layout = FontMetrics {
            ascent,
            descent,
            line_height,
        };
    	let js_value = serde_wasm_bindgen::to_value(&layout)?;
        Ok(js_value)
    }
    
    pub fn measure_spans(&mut self, text: String, size: f32) -> Result<JsValue, JsValue> {
        let font = self.fonts[0].as_scaled(size);

        let break_iter = LineBreakIterator::new(&text);
        let mut char_iter = text.char_indices();

        let mut breaks = Vec::<(u32, u32)>::new();
        let mut metrics = Vec::<(f32, f32)>::new();
        let mut glyphs = Vec::<(u32, u32)>::new();

        let mut i = 0;
        break_iter.for_each(|(offset, hard)| {
            let mut advance = 0.0;
            let mut trim = 0.0;

            while let Some((byte_index, c)) = char_iter.next() {
                let glyph_id = font.glyph_id(c);
                let h_advance = font.h_advance(glyph_id);
                advance += h_advance;

                if c.is_whitespace() {
                    trim += h_advance;
                }
                else {
                    trim = 0.0;
                }

                match glyph_id {
                    GlyphId(id) => { glyphs.push((id as u32, c.is_whitespace() as u32)); }
                } 

                i += 1;
                if byte_index + c.len_utf8() == offset { break; }
            }

            breaks.push((i as u32, hard as u32));
            metrics.push((advance, trim));
        });
        
        let mut breaks_u32 = Vec::<u32>::with_capacity(breaks.len() * 2);
        let mut metrics_f32 = Vec::<f32>::with_capacity(metrics.len() * 2);
        let mut glyphs_u32 = Vec::<u32>::with_capacity(glyphs.len() * 2);

        breaks.iter().for_each(|(offset, hard)| {
            breaks_u32.push(*offset);
            breaks_u32.push(*hard);
        });

        metrics.iter().for_each(|(advance, trim)| {
            metrics_f32.push(*advance);
            metrics_f32.push(*trim);
        });

        glyphs.iter().for_each(|(id, ws)| {
            glyphs_u32.push(*id);
            glyphs_u32.push(*ws);
        });

        let value = SpanMetrics { breaks: breaks_u32, metrics: metrics_f32, glyphs: glyphs_u32 };
    	let js_value = serde_wasm_bindgen::to_value(&value)?;
        Ok(js_value)
    }
    
    pub fn measure_glyph(&mut self, id: u32, size: f32) -> Result<JsValue, JsValue> {
        let font = self.fonts[0].as_scaled(size);
        let glyph = Glyph {
            id: GlyphId(id as u16),
            scale: PxScale { x: size, y: size },
            position: Point { x: 0.0, y: 0.0 },
        };
        
        let lb = font.glyph_bounds(&glyph);

        let outline = font.outline_glyph(glyph);
        let (ob, width, height, image) = match outline {
            Some(o) => {
                let ob = o.px_bounds();
                let width: u32 = (ob.max.x - ob.min.x) as u32 + 1;
                let height: u32 = (ob.max.y - ob.min.y) as u32 + 1;

                let size: usize = (width * height) as usize;
                let mut image = Vec::<u8>::with_capacity(size);
                for n in 0..size { image.push(0) }

                o.draw(|x, y, a| {
                    let i = (x + y * width) as usize;
                    image[i] = (a * 255.0) as u8;
                });
                (Some(ob), width, height, Some(image))
            }
            None => {
                (None, 0, 0, None)
            }
        };

        let value = GlyphMetrics {
            id,
            
            layout_bounds: vec!(lb.min.x, lb.min.y, lb.max.x, lb.max.y),
            outline_bounds: ob.map(|ob| { vec!(ob.min.x, ob.min.y, ob.max.x + 1.0, ob.max.y + 1.0) }),
            
            image,
            width,
            height,
         };
    	let js_value = serde_wasm_bindgen::to_value(&value)?;
        Ok(js_value)
    }
}

#[wasm_bindgen]
pub fn init_panic_hook() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}
