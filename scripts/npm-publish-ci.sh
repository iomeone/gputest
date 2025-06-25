#!/bin/bash

echo '▶︎▶︎ @use-gpu/core';
yarn publish --ignore-scripts --access public build/packages/core &
echo '▶︎▶︎ @use-gpu/glsl-loader';
yarn publish --ignore-scripts --access public build/packages/glsl-loader &
echo '▶︎▶︎ @use-gpu/gltf';
yarn publish --ignore-scripts --access public build/packages/gltf &
echo '▶︎▶︎ @use-gpu/glyph';
yarn publish --ignore-scripts --access public build/packages/glyph &
echo '▶︎▶︎ @use-gpu/inspect';
yarn publish --ignore-scripts --access public build/packages/inspect &
echo '▶︎▶︎ @use-gpu/inspect-gpu';
yarn publish --ignore-scripts --access public build/packages/inspect-gpu &
echo '▶︎▶︎ @use-gpu/interact';
yarn publish --ignore-scripts --access public build/packages/interact &
echo '▶︎▶︎ @use-gpu/layout';
yarn publish --ignore-scripts --access public build/packages/layout &
echo '▶︎▶︎ @use-gpu/live';
yarn publish --ignore-scripts --access public build/packages/live &
echo '▶︎▶︎ @use-gpu/map';
yarn publish --ignore-scripts --access public build/packages/map &
echo '▶︎▶︎ @use-gpu/parse';
yarn publish --ignore-scripts --access public build/packages/parse &
echo '▶︎▶︎ @use-gpu/plot';
yarn publish --ignore-scripts --access public build/packages/plot &
echo '▶︎▶︎ @use-gpu/present';
yarn publish --ignore-scripts --access public build/packages/present &
echo '▶︎▶︎ @use-gpu/react';
yarn publish --ignore-scripts --access public build/packages/react &
echo '▶︎▶︎ @use-gpu/scene';
yarn publish --ignore-scripts --access public build/packages/scene &
echo '▶︎▶︎ @use-gpu/shader';
yarn publish --ignore-scripts --access public build/packages/shader &
echo '▶︎▶︎ @use-gpu/state';
yarn publish --ignore-scripts --access public build/packages/state &
echo '▶︎▶︎ @use-gpu/traits';
yarn publish --ignore-scripts --access public build/packages/traits &
echo '▶︎▶︎ @use-gpu/voxel';
yarn publish --ignore-scripts --access public build/packages/voxel &
echo '▶︎▶︎ @use-gpu/webgpu';
yarn publish --ignore-scripts --access public build/packages/webgpu &
echo '▶︎▶︎ @use-gpu/wgsl';
yarn publish --ignore-scripts --access public build/packages/wgsl &
echo '▶︎▶︎ @use-gpu/wgsl-loader';
yarn publish --ignore-scripts --access public build/packages/wgsl-loader &
echo '▶︎▶︎ @use-gpu/workbench';
yarn publish --ignore-scripts --access public build/packages/workbench &

wait

