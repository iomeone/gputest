import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { Keyframe } from '@use-gpu/workbench';

import React, { use } from '@use-gpu/live';

import {
  Pass, PanControls, FlatCamera,
  Cursor, Animate,
} from '@use-gpu/workbench';
import {
  Plot, Cartesian, Axis, Grid, Point, Line, Arrow, Face, Transform, Polygon,
} from '@use-gpu/plot';
import { vec3 } from 'gl-matrix';

import { InfoBox } from '../../ui/info-box';

let t = 0;

const BACKGROUND = [0, 0, 0.09, 1];

const KEYFRAMES = [
  [ 0, 0],
  [10, 360],
] as Keyframe[];

export const Plot2DPage: LC = () => {

  return (<>
    <InfoBox>Draw 2D shapes using the declarative plot API and animate transforms like CSS/SVG. Renders batched virtual layers.</InfoBox>
    <Cursor cursor="move" />
    <Camera>
      <Pass>
        <Plot>
          {/* Transforms */}
          <Transform position={[100, 100]}>

            {/* Single point */}
            <Point
              position={[50, 50]}
              size={20}
              color={'#ffffff'}
            />

            {/* Multiple points */}
            <Point
              positions={[[50, 100], [50, 130], [50, 160], [50, 190], [50, 220]]}
              size={10}
              color={'#3090ff'}
            />

            {/* Single line / polyline */}
            <Point
              positions={[[50, 250], [50, 280]]}
              size={10}
              color={'#30ff90'}
            />

            <Line
              positions={[[100, 50], [150, 150]]}
              width={5}
              color={'#c00040'}
            />

            <Line
              positions={[[150, 50], [200, 150], [250, 50]]}
              width={5}
              color={'#c04000'}
            />

            {/* Multiple polylines */}
            <Line
              positions={[
                [[300, 50], [350, 150], [400, 50], [450, 150]],
                [[300, 150], [350, 250], [400, 150], [450, 250]],
              ]}
              width={10}
              color={'#40c000'}
            />

            {/* Per line color */}
            <Line
              positions={[
                [[300, 250], [350, 350], [400, 250], [450, 350]],
                [[300, 350], [350, 450], [400, 350], [450, 450]],
              ]}
              width={10}
              color={['#ffa040', '#7f40a0']}
              join="miter"
            />

            {/* Per vertex color/width */}
            <Transform position={[0, 400]}>
              <Line
                positions={[
                  [[300, 50], [350, 150], [400, 50], [450, 150]],
                  [[300, 150], [350, 250], [400, 150], [450, 250]],
                ]}
                widths={[[0, 12, 12, 0], [0, 12, 12, 0]]}
                colors={[['#ffa040', '#fff0f0', '#ffa040', '#fff0f0'], ['#7f20a0', '#af60ff', '#7f20a0', '#af60ff']]}
                join="round"

                /* Scale line width with view */
                depth={1}
              />
            </Transform>

            {/* Looped polylines */}
            <Transform position={[10, 0]}>
              <Line
                positions={[
                  [[550, 50], [500, 150], [600, 150]],
                  [[550, 250], [500, 350], [600, 350]],
                ]}
                width={10}
                color={'#40a0ff'}
                join="round"
                loop
              />
            </Transform>

            <Transform position={[10, 400]}>
              <Line
                positions={[
                  [[550, 50], [500, 150], [600, 150]],
                  [[550, 250], [500, 350], [600, 350]],
                ]}
                width={10}
                color={'#a0407f'}
                join="round"
                depth={1}
                loop
              />
            </Transform>

            {/* Animated transform */}
            <Transform position={[150, 650]} scale={1.2}>
              <Animate keyframes={KEYFRAMES} prop="rotation" ease="linear">
                <Transform>
                  <Line
                    positions={[
                      [[-50, -50], [50, -50], [50, 50], [-50, 50]],
                    ]}
                    width={10}
                    color={['#40a0ff']}
                    join="round"
                    depth={1}
                    loop
                  />
                </Transform>
              </Animate>
            </Transform>

            <Transform position={[150, 600]} scale={0.75}>
              <Animate keyframes={KEYFRAMES} speed={0.5} prop="rotation" ease="linear">
                <Transform rotation={30}>
                  <Line
                    positions={[
                      [[-50, -50], [50, -50], [50, 50], [-50, 50]],
                    ]}
                    width={10}
                    color={['#9f40a0']}
                    join="round"
                    depth={1}
                    loop
                  />
                </Transform>
              </Animate>
            </Transform>

            {/* Arrows */}
            <Transform>
              <Arrow
                positions={[[100, 200], [250, 300]]}
                width={10}
                color={"#3090ff"}
                end
                flat
              />
            </Transform>

            <Transform position={[100, 350]} rotation={-20}>
              <Arrow
                positions={[
                  [[-50, -50], [0, 0], [-50, 50], [0, 100]],
                  [[50, 50], [100, 100], [50, 150], [100, 200]],
                ]}
                width={10}
                color={"#40a030"}
                start={true}
                ends={[false, true]}
                depth={1}
              />
            </Transform>

            {/* Convex faces */}
            <Transform position={[620, 50]} scale={[0.8, 0.8]}>
              <Face
                positions={[[0, 0], [50, 0], [100, 100], [50, 100]]}
                color={"#823456"}
              />

              <Face
                positions={[[100, 0], [150, 0], [200, 100], [150, 100]]}
                color={"#823456"}
              />
            </Transform>

            {/* Polygons / concave faces */}
            <Transform position={[650, 200]} scale={[0.8, 0.8]}>
              <Face
                positions={[[0, 0], [150, 0], [100, 50], [150, 100], [0, 100], [50, 50]]}
                color={"#823456"}
                concave
              />
              <Line
                positions={[[0, 0], [150, 0], [100, 50], [150, 100], [0, 100], [50, 50]]}
                color={"#c27496"}
                width={5}
                zIndex={2}
                loop
              />

              <Transform position={[0, 120]}>
                <Polygon
                  positions={[[0, 0], [150, 0], [100, 50], [150, 100], [0, 100], [50, 50]]}
                  fill={"#348256"}
                  stroke={"#74c296"}
                  width={5}
                />
              </Transform>

              {/* Polygons with holes [[boundary, hole, hole, ...]] */}
              <Transform position={[-25, 240]}>
                <Polygon
                  positions={[[
                    [[0, 0], [150, 0], [150, 150], [0, 150]],
                    [[75, 45], [105, 75], [75, 105], [45, 75]],
                  ]]}
                  fill={"#345682"}
                  stroke={"#7496c2"}
                  width={2}
                />
              </Transform>

              <Transform position={[50, 315]}>
                <Polygon
                  positions={[[
                    [[0, 0], [150, 0], [150, 150], [0, 150]],
                    [[75, 45], [105, 75], [75, 105], [45, 75]],
                  ]]}
                  fill={"#345682"}
                  stroke={"#7496c2"}
                  width={2}
                  zIndex={2}
                />
              </Transform>
            </Transform>

            {/* Multiple polygons with holes */}
            <Transform position={[650, 600]}>
              <Polygon
                positions={[
                  [
                    [[0, 0], [50, 0], [50, 50], [0, 50]],
                    [[10, 10], [40, 10], [40, 40], [10, 40]],
                  ],
                  [
                    [[60, 0], [110, 0], [110, 50], [60, 50]],
                    [[70, 10], [100, 10], [100, 40], [70, 40]],
                  ],
                  [
                    [[0, 60], [50, 60], [50, 110], [0, 110]],
                    [[10, 70], [40, 70], [40, 100], [10, 100]],
                  ],
                ]}
                fill={["#345682", "#a47622", "#7496c2"]}
                stroke={["#5476a2", "#c49642", "#94b6e2"]}
                width={2}
                zIndex={2}
                depth={0.75}
              />
            </Transform>

            {/* Integrates with rest of plot API */}
            <Cartesian
              range={[[0, 100], [0, 100]]}
              position={[400, 400, 0]}
              scale={[400, 400, 1]}
            >
              <Axis
                axis='x'
                width={5}
                color="#a0a0a0"
                end
              />

              <Axis
                axis='y'
                width={5}
                color="#a0a0a0"
                end
              />
            </Cartesian>

          </Transform>
        </Plot>
      </Pass>
    </Camera>
  </>);
}

const Camera = ({children}: PropsWithChildren<object>) => (
  <PanControls
    active={true}
    render={(x, y, zoom) =>
      <FlatCamera x={x} y={y} zoom={zoom}>
        {children}
      </FlatCamera>
    }
  />
);
