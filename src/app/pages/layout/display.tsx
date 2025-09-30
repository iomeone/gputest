import type { LC } from '@use-gpu/live';

import React from '@use-gpu/live';
import { TextureSource } from '@use-gpu/core';

import {
  LinearRGB, Pass, FlatCamera, PanControls, ImageTexture,
  DebugProvider,
} from '@use-gpu/workbench';
import {
  UI, Layout, Absolute, Block, Flex, Inline, Overflow, Text, Element,
} from '@use-gpu/layout';

import { LayoutControls } from '../../ui/layout-controls';
import { InfoBox } from '../../ui/info-box';

const BLACK_SHADE = [0, 0, 0, .9];
const GRAY_TRANSPARENT = [0.5, 0.5, 0.5, 0.5];
const WHITE_TRANSPARENT = [1, 1, 1, .5];
const WHITE = [1, 1, 1, 1];

const MARGIN_LEFT = [24, 0, 0, 0];
const MARGIN_TOP = [0, 24, 0, 0];

const FIT_SCALE = {fit: 'scale'};

export const LayoutDisplayPage: LC = () => {

  const view = (<>
    <InfoBox>Create flex, block and inline layouts using the layout package. Fully scalable, rendered using distance fields.</InfoBox>
    <LinearRGB>
      <Pass>
        <UI>
          <Layout>

            <Absolute fill={WHITE_TRANSPARENT} left={0} right={0} top={0} bottom={0} />
            <Flex width="100%" height="100%">

              <Block width="40%" contain>
                <Block margin={10} padding={48} radius={5} fill={BLACK_SHADE}>

                  <Flex anchor="center">
                    <Element width={48} height={48} fill={WHITE_TRANSPARENT} />
                    <Inline margin={MARGIN_LEFT}>
                      <Text size={48} weight="bold" lineHeight={56} color={WHITE}>Use.GPU</Text>
                    </Inline>
                  </Flex>

                  <Inline margin={MARGIN_TOP}>
                    <Text size={16} color={WHITE} weight="bold" lineHeight={24}>{"Lorem ipsum dolor sit amet,"}</Text>
                    <Text size={16} color={WHITE} lineHeight={24}>{" consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."}</Text>
                  </Inline>

                  <Block margin={MARGIN_TOP} height={2} fill={WHITE} snap={false} />

                  <Block margin={MARGIN_TOP} snap={false}>
                    <Flex align="justify-center" gap={[10, 10]} wrap>
                      <Element width={50}  height={50} fill={GRAY_TRANSPARENT} />
                      <Element width={100} height={50} fill={GRAY_TRANSPARENT}
                        radius={[20, 0, 20, 0]} border={3} stroke={[0.5, 0.5, 0.5, 1]} />
                      <Element width={110} border={[10, 3, 10, 3]} height={50} fill={GRAY_TRANSPARENT} stroke={[0.75, 0.75, 0.75, 1]} />
                      <Element width={40} height={50} fill={GRAY_TRANSPARENT}
                        radius={[1, 10, 1, 1]} border={5} stroke={[0, 0, 0, 0.75]} />
                      <Element width={120} height={50} fill={GRAY_TRANSPARENT} />
                      <Element width={130} height={50} fill={GRAY_TRANSPARENT}
                        radius={[15, 10, 20, 55]} border={[5, 5, 5, 10]} stroke={[1.0, 1.0, 1.0, 0.5]} />
                      <Element width={120} height={50} fill={GRAY_TRANSPARENT}
                        radius={[10, 10, 10, 10]} border={20} stroke={[0.5, 0.5, 0.5, 1]} />
                      <Element width={70} height={50} fill={GRAY_TRANSPARENT}
                        radius={[10, 10, 10, 10]} border={5} stroke={[0.7, 0.7, 0.7, 0.5]} />
                      <Element width={50}  height={50} fill={GRAY_TRANSPARENT} />
                      <Element width={140} height={50} fill={GRAY_TRANSPARENT}
                        radius={[10, 10, 10, 10]} border={5} stroke={[0, 0, 0, 0.75]} />
                      <Element width={100} height={50} fill={GRAY_TRANSPARENT} />
                      <Element width={100} height={50} fill={GRAY_TRANSPARENT} />
                      <Element width={50} height={50} fill={GRAY_TRANSPARENT}
                        radius={[10, 10, 10, 10]} border={5} stroke={[1.0, 1.0, 1.0, 0.5]} />
                      <Element width={70}  height={50} fill={GRAY_TRANSPARENT} />
                    </Flex>
                  </Block>

                </Block>
              </Block>

              <Block width="60%" height="100%" fill={BLACK_SHADE}>
                <Overflow y="scroll">
                  <Block padding={[48, 58]}>

                    <Inline>
                      <Text size={48} weight="bold" lineHeight={56} color={WHITE} family="Lato, Noto Emoji">Lorem ipsum ⭐️✨🍕</Text>
                    </Inline>

                    <Inline margin={MARGIN_TOP} align="justify-start">
                      <Text size={16} color={WHITE} weight="bold" lineHeight={24}>{"Dolor sit amet,"}</Text>
                      <Text size={16} color={WHITE_TRANSPARENT} lineHeight={24}>{" consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\n"}</Text>

                      <Text size={30} color={WHITE} lineHeight={24}>{"Fugiat nulla pariatur"}</Text>
                      <Element margin={[5, 0]} radius={100} width={24} height={24} fill={[0.5, 0.5, 0.5, 0.75]} />
                      <Text size={16} color={WHITE} lineHeight={24}>{"Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud "}</Text>
                      <Block radius={100} fill={[0.2, 0.5, 0.8, 1.0]} padding={[6, 2]} margin={[0, 1, 0, 0]}>
                        <Inline><Text size={14} color={WHITE}>Aute Cupiditat Aliquip</Text></Inline>
                      </Block>
                      <Text size={16} color={WHITE} lineHeight={24}>{" exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."}</Text>
                    </Inline>

                    <ImageTexture
                      url="/textures/test.png"
                      colorSpace="srgb"
                    >{
                      (texture: TextureSource | null) =>
                        <Flex align="center" width="100%" height={300}>
                          <Block
                            fill="#3090ff" 
                            width={300}
                            height={300}
                            margin={20}
                            texture={texture}
                            image={FIT_SCALE}
                          />
                        </Flex>
                    }</ImageTexture>

                    <Block margin={[0, 40, 0, 0]} height={2} fill={WHITE} />

                    <Inline margin={MARGIN_TOP}>
                      <Text size={16} color={WHITE} weight="bold" lineHeight={24}>{"Lorem ipsum dolor sit amet,"}</Text>
                      <Text size={16} color={WHITE} lineHeight={24}>{" consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\n"}</Text>

                      <Text size={16} color={WHITE} lineHeight={24}>{"Lorem x ipsum dolor sit amet, x consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\n"}</Text>

                      <Text size={16} color={WHITE} lineHeight={24}>{"Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\n"}</Text>
                    </Inline>

                    <Block margin={[0, 20, 0, 0]} height={2} fill={WHITE} />

                    <Inline margin={MARGIN_TOP}>
                      <Text size={16} color={WHITE} weight="bold" lineHeight={24}>{"Lorem ipsum dolor sit amet,"}</Text>
                      <Text size={16} color={WHITE} lineHeight={24}>{" consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\n"}</Text>

                      <Text size={16} color={WHITE} lineHeight={24}>{"Lorem x ipsum dolor sit amet, x consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\n"}</Text>

                      <Text size={16} color={WHITE} lineHeight={24}>{"Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\n"}</Text>
                    </Inline>

                    <Block margin={[0, 20, 0, 0]} height={2} fill={WHITE} />

                  </Block>
                </Overflow>
              </Block>
            </Flex>

            <Absolute bottom={10} height={40} left={0} right={0}>
              <Flex width="100%" height="100%" align="center">
                <Flex align="center">
                  <Block fill={BLACK_SHADE} padding={[20, 10]} radius={4}>
                    <Inline>
                      <Text color="rgba(192, 192, 192, 0.8)">Sit amet nostrum labore</Text>
                    </Inline>
                  </Block>
                </Flex>
              </Flex>
            </Absolute>

          </Layout>
        </UI>
      </Pass>
    </LinearRGB>
  </>);

  const root = document.querySelector('#use-gpu .canvas');

  return (
    <LayoutControls
      container={root}
      render={(mode) =>
        <DebugProvider
          debug={{
            sdf2d: { contours: mode === 'sdf' },
          }}
        >
          <PanControls
            active={mode !== 'inspect'}
            render={(x, y, zoom) =>
              <FlatCamera x={x} y={y} zoom={zoom}>
                {view}
              </FlatCamera>
            }
        />
      </DebugProvider>
    }/>
  );
};
