0.14.1
- `@use-gpu/app`: Add shaded lines and point cloud examples
- `@use-gpu/gltf`: Support extracting textures from .bin blobs
- `@use-gpu/gltf`: Improved model reloading + `partial` option
- `@use-gpu/live`: Match React behavior to zero out `key` in received props
- `@use-gpu/live`: Narrow type of `provide(…)`
- `@use-gpu/plot`: Add `sides` / `shaded` / `shadow` props to `<Point>`, `<Line>` and `<Arrow>`
- `@use-gpu/shader`: Improved type inference through auto-chained functions
- `@use-gpu/workbench`: Allow overriding pixel format to uint for `<ImageLoader>`
- `@use-gpu/workbench`: Support shaded and shadowed versions of points, lines and arrows
- `@use-gpu/workbench`: Add `shaded` / `shadow` prop to `<LineLayer>` and `<ArrowLayer>`
- `@use-gpu/workbench`: Narrow `<EaseToTarget>` value types
- `@use-gpu/workbench`: Improved `<Loop>` nesting with animation outside
- `@use-gpu/workbench`: Add `<LoadingSpinner>` helper

0.14.0
- `@use-gpu/core`: Full support for `uniform` storage
- `@use-gpu/core`: Improved minimum binding size calc for WGSL structs
- `@use-gpu/layout`: Improved pixel hinting for SDF text
- `@use-gpu/inspect`: Add per-type filtering to tree view
- `@use-gpu/inspect`: Value formatting improvements
- `@use-gpu/inspect-gpu`: Inspect uniforms and bindings on sub-passes
- `@use-gpu/inspect-gpu`: Improved texture display and info
- `@use-gpu/shader`: Improved support for static bindings and `uniform` storage
- `@use-gpu/shader`: Allow inferring primitive types via `@infer` (not just structs)
- `@use-gpu/shader`: Default to last `@export` as implied `main()` in inline WGSL snippets
- `@use-gpu/workbench`: Refactor `<Pass>` internals with modular global bindings and buffers
- `@use-gpu/workbench`: Add screen-space ambient occlusion pass (GTAO w/ overscan)
- `@use-gpu/workbench`: Add normals and motion buffer pre-passes w/ associated render modes
- `@use-gpu/workbench`: Improved WebGPU resource labels (for error messages and inspector)
- `@use-gpu/workbench`: Optional `depthHistory` for `<RenderTarget>`
- `@use-gpu/workbench`: Add `decimate` and `converge` options to `<Loop>` to skip or converge frames.
- `@use-gpu/workbench`: Fix `<Environment>` `gain` not working in some cases
- `@use-gpu/workbench`: Add `<EaseToTarget>` animation helper

0.13.1
- `@use-gpu/app`: Add path tracing + debug picking example.
- `@use-gpu/workbench`: Add `<AccumulateRender>` wrapper.
- `@use-gpu/workbench`: Add `<On>` helper for quick dispatch/render callbacks.

0.13.0
- `@use-gpu/app`: Add solar system example
- `@use-gpu/plot`: Support aggregation of label texts with spread
- `@use-gpu/layout`: Rename `<Transform>` to `<TransformUI>`
- `@use-gpu/scene`: Support pickable `<Instances>` with per instance `lookup`
- `@use-gpu/wgsl-loader`: Pass `minify` option to rollup plug-in
- `@use-gpu/workbench`: Add `<RenderCubeTarget>`, `<ColorCubePass>` and `<CubeCamera>` with example
- `@use-gpu/workbench`: Fix JSX type of <Dispatch> and <DrawCall> for React 18
- `@use-gpu/workbench`: Allow `format`-less <RenderTarget>
- `@use-gpu/workbench`: Add zBias to `<LabelLayer>`
- `@use-gpu/workbench`: Allow adjusting `speed` of `<Animate>` without resetting.
- `@use-gpu/workbench`: Add `<ValueShader>` which acts like a lazy `map(…)`

0.12.0
- `@use-gpu/*`: Add `ts-vite` example
- `@use-gpu/*`: Use `swc` to build .js
- `@use-gpu/*`: Emit .cjs / .mjs split module build to avoid node issues
- `@use-gpu/app`: Add quaternion hypersphere example
- `@use-gpu/app`: Add droste shader example
- `@use-gpu/live`: Match React 18 style use of `PropsWithChildren` vs `LC`
- `@use-gpu/plot`: Add 4D cartesian/stereographic transform
- `@use-gpu/shader`: Refactor transpiler so it emits `.wgsl.ts` or `.wgsl.js` modules + defs
- `@use-gpu/shader`: Add shader2ts bin
- `@use-gpu/wgsl`: Ship pre-transpiled JS to avoid bundling issues

0.11.3
- `@use-gpu/shader`: Pin `@lezer/lr` to 1.3.4 to avoid issue with 1.4.1

0.11.1
- `@use-gpu/core`: Fix edge case around copying zero-length data
- `@use-gpu/plot`: Fix signature of segmented shapes' positions attribute
- `@use-gpu/plot`: Fix `<Surface>` losing its size when multiple per-vertex attributes are bound

0.11.0
- `@use-gpu/*`: Support `render` prop as `children`
- `@use-gpu/core`: Refactor data ingestion pipe
- `@use-gpu/core`: Add spread-aware struct data aggregator
- `@use-gpu/inspect`: Improved tree view and value formatting
- `@use-gpu/layout`: Allow JSX text children on `<Text>`
- `@use-gpu/live`: Change `reconcile` and `quote` to be targeted to a context
- `@use-gpu/live`: `useYolo` is now `useHooks`
- `@use-gpu/map`: Offload tile loading/tesselation to web workers
- `@use-gpu/plot`: New declarative drawing API with point/line/etc
- `@use-gpu/plot`: Aggregated matrix transforms
- `@use-gpu/plot`: Make `DataContext` a CPU-side concept with `TensorArray`
- `@use-gpu/traits`: Split off value parsers into `@use-gpu/parse`
- `@use-gpu/traits`: Make hooks React/Live-polymorphic
- `@use-gpu/shader`: Add struct types and instancing operators
- `@use-gpu/shader`: Add automatic vec# casts between lambdas
- `@use-gpu/workbench`: Add explicit `LayerReconciler`, `PassReconciler`, `QueueReconciler`
- `@use-gpu/workbench`: Refactor `<VirtualLayers>`
- `@use-gpu/workbench`: Refactor attribute instancing
- `@use-gpu/workbench`: Add instancing to Line/Arrow/Point/Label layers
- `@use-gpu/workbench`: Use new aggregator schema in data components
- `@use-gpu/workbench`: Move `expr` based samplers to plot package
- `@use-gpu/workbench`: Merge `<CompositeData>` into `<Data>`

0.10.2
- `@use-gpu/live`: allow `detach()` to work on fragments, allow immediate render
- `@use-gpu/live`: ensure steady render clock in `<Loop>` without double renders
- `@use-gpu/workbench`: allow pan controls to function as scroll controller

0.10.1
- `@use-gpu/core`: extend `Geometry` struct to `GeometryArray` as generic mesh representation
- `@use-gpu/gltf`: `.glb` binary GLTF support
- `@use-gpu/gltf`: allow CPU-only load with `<GLTFData unbound>`
- `@use-gpu/scene`: add CPU-only `<Geometry>` for geometry gathering
- `@use-gpu/state`: new state `useCursor` hook with transparent `object.foo.bar` traversal
- `@use-gpu/workbench`: `<Geometry>` props can take `{...GeometryArray}`
- `@use-gpu/workbench`: Group `unwelded` options on `<FaceLayer>`
- `@use-gpu/workbench`: Add point/vector/AABB helpers for quick debug viz
- `@use-gpu/workbench`: Add `debug` flag to lights to visualize light and shadow frustums
- `@use-gpu/workbench`: Add support for image-based lighting to `<PBRMaterial>`
- `@use-gpu/workbench`: Add support for .HDR and RGBM16 to `<ImageTexture>` and `<ImageCubeTexture>`
- `@use-gpu/workbench`: Add `<Environment>` to apply environment maps to scenes, or use built-in presets
- `@use-gpu/workbench`: Add `<PrefilteredEnvMap>` to generate a PMREM environment map from a cube map
- `@use-gpu/workbench`: Add `<PanoramaMap>` to read equirectangular environment maps

0.9.3
- `@use-gpu/glyph`: Support loading emoji PNGs on-demand
- `@use-gpu/layout`: Add `aspect` to elements for sizing w/h relative to each other
- `@use-gpu/shader`: Add `minify` option to WGSL/GLSL transpiler
- `@use-gpu/shader`: Reduce size of shader/AST metadata in builds
- `@use-gpu/workbench`: Add UVs and STs to `<LineLayer>`, `<PointLayer>`, `<SurfaceLayer>`
- `@use-gpu/workbench`: Use input position as default STs
- `@use-gpu/workbench`: Allow using basic materials with `<LineLayer>` and `<PointLayer>`

0.9.2
- `@use-gpu/inspect`: Fix inspecting of large typed arrays
- `@use-gpu/present`: Add `<Overlay>` for independent overlays
- `@use-gpu/state`: Fix `revise` edge case with nulls
- `@use-gpu/workbench`: Fix `base` handling in router
- `@use-gpu/workbench`: Add MIP maps and handle non-2D layout in `<RawTexture>`

0.9.1
- `@use-gpu/*`: Set `sideEffects` to enable tree shaking, fix ES/MJS build
- `@use-gpu/inspect`: Improved tree and panel layout
- `@use-gpu/layout`: Expand render phase into component tree for memoization
- `@use-gpu/live`: Ensure render order even when rekeying
- `@use-gpu/live`: Add back a more sensible `useYolo`
- `@use-gpu/live`: Track `fiber.by` rendered IDs correctly for React-flavored JSX
- `@use-gpu/live`: Captures are now pre-reduced

0.9.0
- `@use-gpu/inspect`: Allow use without Use.GPU, move GPU panels to `@use-gpu/inspect-gpu`
- `@use-gpu/live`: Quotes/unquotes in keyed sub-trees will now correctly reorder
- `@use-gpu/plot`: Add pipeline options as full ROP trait to plot layers
- `@use-gpu/present`: New presentation system on top of `@use-gpu/layout`: `<Present>` / `<Slide>` / `<Step>`
- `@use-gpu/shader`: Allow `chainTo` to chain `(A, ...)->B` with `(B, ...)->C` if the rest signatures match
- `@use-gpu/shader`: Allow run-time @linking of struct types
- `@use-gpu/voxel`: Teardown-style raytracer for .vox voxel models
- `@use-gpu/workbench`: `useBoundShader` / `getBoundShader` no longer need BINDINGS passed

0.8.4
- `@use-gpu/shader`: Use abstract grammar w/o comments internally, concrete grammar externally, to avoid lezer bugs.

0.8.3
- `@use-gpu/app`: Add binary file histogram example
- `@use-gpu/inspect`: Syntax highlighting in shader view
- `@use-gpu/shader`: Make WGSL grammar suitable for syntax highlighting
- `@use-gpu/shader`: `vec#<u8>` and `vec#<u16>` storage polyfill
- `@use-gpu/workbench`: Consistent pipeline options (depth, side, blend) for layers

0.8.2
- `@use-gpu/live`: Improved interoperability with React-flavored JSX.

0.8.1
- `@use-gpu/core`: Avoid evaluating GPUShaderStage before WebGPU support is confirmed.
- `@use-gpu/wgsl`: NaNs were removed from the WGSL spec. 🤦‍♂️

0.8.0
- `@use-gpu/app`: Added examples: scene, instancing, shadow, image textures, multiscale RTT
- `@use-gpu/live`: Allow `<Capture>`/`<Reconcile>` continuation to participate in yeets
- `@use-gpu/live`: Rename `useAsync` to `useAwait`
- `@use-gpu/live`: Components that yeet identical values repeatedly no longer trigger a re-gather
- `@use-gpu/live`: JSX children do not have to be arrays
- `@use-gpu/plot`: Add `<Grid auto>` to snap grids to far side of range
- `@use-gpu/scene`: Add basic `<Scene>`/`<Node>`/`<Primitive>` components for a classic matrix tree
- `@use-gpu/scene`: Add `<Instances>` component for instanced mesh rendering
- `@use-gpu/workbench`: Refactor `<Pass>`/`<Virtual>` to allow for swappable render passes
- `@use-gpu/workbench`: Remove `<Draw>` as it was no longer doing anything.
- `@use-gpu/workbench`: Add visibility culling with draw call ordering to `<Pass>` via view and transform context
- `@use-gpu/workbench`: Add shadow maps for directional and point lights
- `@use-gpu/workbench`: Add shared global bindings to `<DrawCall>` and `<Pass>` via view context
- `@use-gpu/workbench`: Split `<Pass>` into `<ForwardRenderer>` and add a `<DeferredRenderer>`
- `@use-gpu/workbench`: Replace explicit `<Lights>` with implicit `<LightData>`, which is now owned by the renderer
- `@use-gpu/workbench`: Allow `<FaceLayer>` to be used with indexed positions and segments
- `@use-gpu/workbench`: Add `<InstanceData>` component for gathering instance data
- `@use-gpu/workbench`: Add `<InterleavedData>` to read packed vertex attributes
- `@use-gpu/workbench`: Add `<GeometryData>` to read prefab geometry, with helpers like `makeSphereGeometry`
- `@use-gpu/workbench`: Add `<DomeLight>` with adjustable zenith, horizon and bleed/overextension
- `@use-gpu/workbench`: Add `unwelded` indexing mode to `<CompositeData>` and more unwelded options to `<FaceLayer>`
- `@use-gpu/workbench`: Add `stroke` to `<PointLayer>` to allow for thin outlined shapes
- `@use-gpu/workbench`: Rename `<ComputeData>`/`<TextureData>` to `<ComputeBuffer>`/`<TextureBuffer>`
- `@use-gpu/workbench`: Replace `<Feedback>` with a more generic `<FullScreen>` similar to `<Kernel>`
- `@use-gpu/workbench`: Add `<ShaderFlatMaterial>` and `<ShaderLitMaterial>` for custom materials
- `@use-gpu/workbench`: Add `<ImageCubeTexture>` for loading cube maps

0.7.0
- `@use-gpu/live`: Reconciling + quote/unquote as native ops.
- `@use-gpu/live`: Hot module reload (beta).
- `@use-gpu/app`: Added examples: fluid dynamics, web mercator, implicit surface.
- `@use-gpu/core`: Add compute pipelines, indirect buffers, read/write storage.
- `@use-gpu/workbench`: Add dual contour layer for implicit surfaces.
- `@use-gpu/workbench`: Add compute hooks, scratch sources.
- `@use-gpu/workbench`: Reconcile central dispatch queue.
- `@use-gpu/shader`: Track upstream WGSL grammar changes.
- `@use-gpu/shader`: Direct `@link`ing of storage/texture bindings without getter.
- `@use-gpu/shader`: Storage/uniform getters without `index: u32`.
- `@use-gpu/map`: Initial alpha for maps: mercator projection, vector tile rendering.
