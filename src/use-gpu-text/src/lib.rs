use wasm_bindgen::prelude::*;
use serde::{Serialize};
use serde_wasm_bindgen;
use std::string::String;
use std::collections::HashMap;

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
pub struct UseRustText {
    font_map: HashMap<u64, FontArc>,
}

#[derive(Serialize)]
pub struct FontMetrics {
    ascent: f32,
    descent: f32,
    baseline: f32,
    #[serde(rename = "lineHeight")]
    line_height: f32,
}

#[derive(Serialize)]
pub struct SpanMetrics {
    #[serde(with = "serde_bytes")]
    breaks: Vec::<u8>,
    #[serde(with = "serde_bytes")]
    metrics: Vec::<u8>,
    #[serde(with = "serde_bytes")]
    glyphs: Vec::<u8>,
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
impl UseRustText {
    pub fn new() -> UseRustText {
        let ttf = include_bytes!("../../../public/Lato-Regular.ttf") as &[u8];
        let font = FontArc::try_from_slice(ttf).unwrap();

        let mut font_map = HashMap::new();
        font_map.insert(0, font);

        UseRustText {
            font_map,
        }
    }

    pub fn load_font(&mut self, key: f64, ttf: Vec<u8>) -> Result<JsValue, JsValue> {
        let k = key as u64;
        let font = FontArc::try_from_vec(ttf).unwrap();
        self.font_map.insert(k, font);

    	let js_value = serde_wasm_bindgen::to_value(&key)?;
        Ok(js_value)
    }

    pub fn unload_font(&mut self, key: f64) -> Result<JsValue, JsValue> {
        let k = key as u64;
        self.font_map.remove(&k);

    	let js_value = serde_wasm_bindgen::to_value(&key)?;
        Ok(js_value)
    }

    pub fn measure_font(&mut self, key: f64, size: f32) -> Result<JsValue, JsValue> {
        let k = key as u64;
        let font = self.font_map.get(&k).unwrap().as_scaled(size);
        
        let ascent = font.ascent();
        let descent = font.descent();
        let line_height = ascent - descent + font.line_gap();
        
        let layout = FontMetrics {
            ascent,
            descent,
            baseline: ascent,
            line_height,
        };
    	let js_value = serde_wasm_bindgen::to_value(&layout)?;
        Ok(js_value)
    }

    pub fn measure_spans(&mut self, stack: Vec<f64>, utf16: Vec<u16>, size: f32) -> Result<JsValue, JsValue> {
        let text = String::from_utf16_lossy(&utf16);

        let fonts: Vec<PxScaleFont<&FontArc>> = stack.iter().map(|k| {
            let key = *k as u64;
            self.font_map.get(&key).unwrap().as_scaled(size)
        }).collect();

        let break_iter = LineBreakIterator::new(&text);
        let mut char_iter = text.char_indices();

        let mut breaks = Vec::<u8>::new();
        let mut metrics = Vec::<u8>::new();
        let mut glyphs = Vec::<u8>::new();

        let mut i = 0;
        break_iter.for_each(|(offset, hard)| {
            let mut advance = 0.0;
            let mut trim = 0.0;

            while let Some((byte_index, c)) = char_iter.next() {
                if c == 0 as char {
                    breaks.extend_from_slice(&mut u32::to_ne_bytes(i as u32));
                    metrics.extend_from_slice(&mut f32::to_ne_bytes(advance));
                    metrics.extend_from_slice(&mut f32::to_ne_bytes(trim));
                    metrics.extend_from_slice(&mut f32::to_ne_bytes(2.0));
                    advance = 0.0;
                    trim = 0.0;
                    continue;
                }
                
                let found = fonts.iter().enumerate().filter_map(|(i, font)| {
                    let glyph_id = font.glyph_id(c);
                    match glyph_id { GlyphId(g) => if g > 0 { Some((font, glyph_id, i)) } else { None } }
                }).next();

                match found {
                    Some((font, glyph_id, index)) => {
                        let h_advance = font.h_advance(glyph_id);
                        advance += h_advance;

                        if c.is_whitespace() {
                            trim += h_advance;
                        }
                        else {
                            trim = 0.0;
                        }

                        match glyph_id {
                            GlyphId(id) => {
                                glyphs.extend_from_slice(&mut u32::to_ne_bytes(index as u32));
                                glyphs.extend_from_slice(&mut u32::to_ne_bytes(id as u32));
                                glyphs.extend_from_slice(&mut u32::to_ne_bytes(c.is_whitespace() as u32));
                            }
                        }

                        i += 1;
                    }
                    None => {}
                }

                if byte_index + c.len_utf8() == offset { break; }                        
            }

            breaks.extend_from_slice(&mut u32::to_ne_bytes(i as u32));
            metrics.extend_from_slice(&mut f32::to_ne_bytes(advance));
            metrics.extend_from_slice(&mut f32::to_ne_bytes(trim));
            metrics.extend_from_slice(&mut f32::to_ne_bytes(if hard { 1.0 } else { 0.0 }));
        });
        
        let value = SpanMetrics { breaks, metrics, glyphs };
    	let js_value = serde_wasm_bindgen::to_value(&value)?;
        Ok(js_value)
    }

    pub fn measure_glyph(&mut self, key: f64, id: u32, size: f32) -> Result<JsValue, JsValue> {
        let k = key as u64;
        let font = self.font_map.get(&k).unwrap().as_scaled(size);

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
                for _ in 0..size { image.push(0) }

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
