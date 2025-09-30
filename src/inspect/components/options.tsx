import React from 'react';
import { useCursor } from '@use-gpu/state/react';
import { Cursor } from '@use-gpu/state';
import { SmallButton, OptionsContainer, Spacer } from './layout';
import { OptionState } from './types';

import { DetailSlider } from './detail';

import { IconItem, SVGHighlightElement, SVGLayoutSide, SVGLayoutFull, SVGBuiltinElement, SVGPickElement, SVGRunCount } from './svg';

export type OptionsProps = {
  cursor: Cursor<OptionState>,
  toggleInspect?: () => void,
};

export const Options: React.FC<OptionsProps> = (props: OptionsProps) => {

  const {cursor, toggleInspect} = props;

  const [depthLimit, setDepthLimit] = cursor.depth();
  const [runCounts, setRunCounts] = cursor.counts();
  const [fullSize, setFullSize] = cursor.fullSize();
  const [builtins, setBuiltins] = cursor.builtins();
  const [highlight, setHighlight] = cursor.highlight();
  const [inspect] = cursor.inspect();

  return (
    <OptionsContainer>
      <SmallButton
        className={fullSize ? 'active' : ''}
        onClick={() => setFullSize(!fullSize)}
        title={fullSize ? "Collapse to sidebar" : "Expand to full size"}
      >
        <IconItem height={24} top={1}>{
          fullSize
          ? <SVGLayoutFull size={24} />
          : <SVGLayoutSide size={24} />
        }</IconItem>
      </SmallButton>
      <SmallButton
        className={runCounts ? 'active' : ''}
        onClick={() => setRunCounts(!runCounts)}
        title="Show run counts"
      >
        <IconItem height={24} top={1}><SVGRunCount size={24} /></IconItem>
      </SmallButton>
      <SmallButton
        className={builtins ? 'active' : ''}
        onClick={() => setBuiltins(!builtins)}
        title="Show built-in &lt;components&gt;"
      >
        <IconItem height={24} top={1}><SVGBuiltinElement size={24} /></IconItem>
      </SmallButton>
      <SmallButton
        className={highlight ? 'active' : ''}
        onClick={() => setHighlight(!highlight)}
        title="Highlight objects in view"
      >
        <IconItem height={24} top={1}><SVGHighlightElement size={24} /></IconItem>
      </SmallButton>
      { toggleInspect ? (
        <SmallButton
          className={inspect ? 'active' : ''}
          onClick={toggleInspect}
          title="Inspect layout"
        >
          <IconItem height={24} top={1}><SVGPickElement size={24} /></IconItem>
        </SmallButton>
      ) : null}

      <Spacer />
      <div style={{flexGrow: 1, minWidth: 50, maxWidth: 150}}>
        <DetailSlider value={depthLimit} onChange={setDepthLimit} />
      </div>
      <Spacer />
    </OptionsContainer>
  );
};
