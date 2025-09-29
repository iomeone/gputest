import type { LC } from '@use-gpu/live';
import type { Point4 } from '@use-gpu/core';

import React from '@use-gpu/live';
import { LayoutControls } from '../../ui/layout-controls';

import {
  LinearRGB, Pass, Flat,
  PanControls,
  DebugProvider,
} from '@use-gpu/workbench';
import {
  UI, Layout, Absolute, Block, Flex, Inline, Overflow, Text, Element,
} from '@use-gpu/layout';

const TRANSPARENT = [1, 1, 1, 0.1] as Point4;
const BACKGROUND = [0.0, 0.0, 0.09, 1.0] as Point4;
const FILL = [0.4, 0.7, 1, 0.5] as Point4;

export const LayoutAlignPage: LC = () => {

  const BOXES = (<>
    <Element width={180} height={50} fill={FILL} />
    <Element width={140} height={60} fill={FILL} />
    <Element width={160} height={30} fill={FILL} />
    <Element width={180} height={100} fill={FILL} />
    <Element width={180} height={50} fill={FILL} />
    <Element width={140} height={60} fill={FILL} />
  </>)

  const view = (
    <LinearRGB backgroundColor={BACKGROUND}>
      <Pass>
        <UI>
          <Layout>

            <Absolute left={0} right={0} top={0} bottom={0}>
              <Overflow y="scroll">

                <Block margin={[10, 0, 10, 50]}>

                  <Label>Flex Start</Label>
                  <Flex margin={10} gap={[10, 5]} align="start"   anchor="center" height={200} fill={[1, 1, 1, 0.1]}>{BOXES}</Flex>
                  <Block fill={[1, 1, 1, 0.5]} height={2} />

                  <Label>Flex Center</Label>
                  <Flex margin={10} gap={[10, 5]} align="center"  anchor="center" height={200} fill={[1, 1, 1, 0.1]}>{BOXES}</Flex>
                  <Block fill={[1, 1, 1, 0.5]} height={2} />

                  <Label>Flex End</Label>
                  <Flex margin={10} gap={[10, 5]} align="end"     anchor="center" height={200} fill={[1, 1, 1, 0.1]}>{BOXES}</Flex>
                  <Block fill={[1, 1, 1, 0.5]} height={2} />

                  <Label>Flex Justify</Label>
                  <Flex wrap margin={10} gap={[10, 5]} align="justify" anchor="center" height={250} fill={[1, 1, 1, 0.1]}>{BOXES}{BOXES}</Flex>
                  <Block fill={[1, 1, 1, 0.5]} height={2} />

                  <Label>Flex Between</Label>
                  <Flex wrap margin={10} gap={[10, 5]} align="between" anchor="center" height={250} fill={[1, 1, 1, 0.1]}>{BOXES}{BOXES}</Flex>
                  <Block fill={[1, 1, 1, 0.5]} height={2} />

                  <Label>Flex Evenly</Label>
                  <Flex wrap margin={10} gap={[10, 5]} align="evenly"  anchor="center" height={250} fill={[1, 1, 1, 0.1]}>{BOXES}{BOXES}</Flex>
                  <Block fill={[1, 1, 1, 0.5]} height={2} />

                  <Label>Flex Justify Start</Label>
                  <Flex wrap margin={10} gap={[10, 5]} align="justify-start" anchor="center" height={250} fill={[1, 1, 1, 0.1]}>{BOXES}{BOXES}</Flex>
                  <Block fill={[1, 1, 1, 0.5]} height={2} />

                  <Label>Flex Self</Label>
                  <Flex wrap margin={10} gap={[10, 5]} align="justify-start" anchor="center" height={250} fill={[1, 1, 1, 0.1]}>

                    <Element width={180} height={50} fill={FILL} flex="start" />
                    <Element width={140} height={60} fill={FILL} flex="center" />
                    <Element width={160} height={30} fill={FILL} flex="end" />
                    <Element width={180} height={100} fill={FILL} flex="center" />
                    <Element width={120} height={50} fill={FILL} flex="start" />
                  
                  </Flex>
                  <Block fill={[1, 1, 1, 0.5]} height={2} />

                  <Label>Flex Grow</Label>
                  <Flex wrap margin={10} gap={[10, 5]} align="evenly"  anchor="center" height={250} fill={[1, 1, 1, 0.1]}>
                    <Element width={200} height={50} grow={0} fill={FILL} />
                    <Element width={200} height={50} grow={1} fill={FILL} />
                    <Element width={200} height={50} grow={0} fill={FILL} />
                    <Element width={200} height={50} grow={0} fill={FILL} />
                    <Element width={200} height={50} grow={0} fill={FILL} />
                    <Element width={200} height={50} grow={1} fill={FILL} />
                    <Element width={200} height={50} grow={0} fill={FILL} />
                    <Element width={200} height={50} grow={1} fill={FILL} />
                    <Element width={200} height={50} grow={1} fill={FILL} />
                  </Flex>
                  <Block fill={[1, 1, 1, 0.5]} height={2} />

                  <Label>Block Direction X</Label>
                  <Block margin={10} direction='x'>{BOXES}</Block>
                  <Block fill={[1, 1, 1, 0.5]} height={2} />

                  <Label>Block Direction X + Y</Label>
                  <Block margin={10} direction='x'>
                    <Block direction='y'>
                      <Element width={200} height={50} grow={0} fill={FILL} />
                      <Block padding={10} fill={[0, 0, 0, .5]}>
                        <Inline align="center"><Text color={[1, 1, 1, 1]}>Minim veniam</Text></Inline>
                      </Block>
                    </Block>
                    
                    <Block width={10} />

                    <Block direction='y'>
                      <Block padding={10} fill={[0, 0, 0, .5]}>
                        <Inline align="center"><Text color={[1, 1, 1, 1]}>Sint occaecat</Text></Inline>
                      </Block>
                      <Element height={50} grow={0} fill={FILL} />
                      <Block padding={10} fill={[0, 0, 0, .5]}>
                        <Inline align="center"><Text color={[1, 1, 1, 1]}>Laboris nisi ut aliquip consequat</Text></Inline>
                      </Block>
                      <Block padding={10} fill={[0, 0, 0, .5]}>
                        <Inline align="center"><Text color={[1, 1, 1, 1]}>Commodo ut</Text></Inline>
                      </Block>
                    </Block>
                  </Block>
                  <Block fill={[1, 1, 1, 0.5]} height={2} />


                  <Label>Absolute / Block / Inline</Label>
                  <Block height={48} margin={10}>
                    <Absolute direction='y'>
                      <Block padding={10} fill={[0, 0, 0, .5]}>
                        <Inline><Text color={[1, 1, 1, 1]}>Lorem ipsum</Text></Inline>
                      </Block>
                    </Absolute>
                  </Block>

                  <Block fill={[1, 1, 1, 0.5]} height={2} />
                
                  <Label>Flex / Block X / Inline</Label>
                  <Flex margin={10}>
                    <Element width={200} height={50} grow={0} fill={FILL} />
                    <Block padding={10} fill={[0, 0, 0, .5]}>
                      <Inline><Text color={[1, 1, 1, 1]}>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Text></Inline>
                    </Block>
                    <Element width={200} height={50} grow={0} fill={FILL} />
                  </Flex>
                  <Block fill={[1, 1, 1, 0.5]} height={2} />

                  <Label>Flex / Block Y / Inline</Label>
                  <Flex margin={10} direction='y'>
                    <Element width={200} height={50} grow={0} fill={FILL} />
                    <Block padding={10} fill={[0, 0, 0, .5]}>
                      <Inline><Text color={[1, 1, 1, 1]}>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Text></Inline>
                    </Block>
                    <Element width={200} height={50} grow={0} fill={FILL} />
                    <Block padding={10} fill={[0, 0, 0, .5]}>
                      <Inline align="center"><Text color={[1, 1, 1, 1]}>Ullamco commodo proident</Text></Inline>
                    </Block>
                    <Element width={200} height={50} grow={0} fill={FILL} />
                  </Flex>
                  <Block fill={[1, 1, 1, 0.5]} height={2} />
                </Block>

              </Overflow>
            </Absolute>

          </Layout>
        </UI>
      </Pass>
    </LinearRGB>
  );

  const root = document.querySelector('#use-gpu .canvas');

  return (
    <LayoutControls
      container={root}
      render={(mode) => 
        <PanControls
          active={mode !== 'inspect'}
          render={(x, y, zoom) =>
            <DebugProvider
              debug={{
                sdf2d: { contours: mode === 'sdf' },
              }}
            >
              <Flat x={x} y={y} zoom={zoom}>
                {view}
              </Flat>
            </DebugProvider>
          }
      />}
    />
  );
};

const Label = ({children}: {children: string}) => <Inline margin={[0, 10, 0, 0]}><Text size={32} color={[1, 1, 1, 1]}>{children}</Text></Inline>