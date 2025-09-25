use wasm_bindgen::prelude::*;
use serde::{Serialize};
use serde_wasm_bindgen;

use ab_glyph::{Font, FontArc, ScaleFont};
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
pub struct TextMetrics {
    advance: f32,
    trim: f32,
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

        let mut breaks = Vec::<u32>::new();        
        iter.for_each(|(offset, hard)| {
            breaks.push(offset as u32);
            breaks.push(hard as u32);
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

    pub fn measure_text(&mut self, text: String, size: f32) -> Result<JsValue, JsValue> {
        let mut iter = text.char_indices();
        let font = self.fonts[0].as_scaled(size);

        let mut advance = 0.0;
        let mut trim = 0.0;

        while let Some((_, c)) = iter.next() {
            let glyph_id = font.glyph_id(c);
            let h_advance = font.h_advance(glyph_id);
            advance += h_advance;

            if c.is_whitespace() { trim += h_advance; }
            else { trim = 0.0; }
        }
        
        let layout = TextMetrics {
            advance,
            trim,
        };
    	let js_value = serde_wasm_bindgen::to_value(&layout)?;
        Ok(js_value)
    }
}

#[wasm_bindgen]
pub fn init_panic_hook() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}
