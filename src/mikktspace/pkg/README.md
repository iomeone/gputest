# Wasm Wrapper around ab_glyph.

# 进入你的 Rust crate 目录
D:\temp\use.gpu\src\mikktspace

# 发行版构建（推荐用于实际运行）
wasm-pack build --release --target web --out-dir pkg --out-name index

# 开发版可用（带更友好的 panic hook；可选）
# wasm-pack build --dev --target web --out-dir pkg --out-name index