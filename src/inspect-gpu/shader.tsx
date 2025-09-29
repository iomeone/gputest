import type { LiveFiber } from '@use-gpu/live';

import { formatNode, formatValue } from '@use-gpu/live';
import { InspectObject } from '@use-gpu/inspect';
import { styled as _styled } from '@stitches/react';

import React, { useCallback, useState } from 'react';

import { WGSL } from './wgsl';

const styled: any = _styled;

export const Selectable = styled('div', {
  userSelect: 'text',
});

export const Spacer = styled('div', {
  width: '20px',
  height: '20px',
});

const StyledShader = styled('div', {
  background: 'rgba(255, 255, 255, 0.1)',
  fontFamily: '"Fira Code", "Bitstream Vera Mono", monospace',
  fontSize: '12px',
  lineHeight: '13px',
});

const StyledHeader = styled('div', {
  display: 'flex',
});

const StyledHint = styled('div', {
  display: 'flex',
  alignItems: 'center',
  opacity: 0.5,
  '& > span': {
    marginRight: 10,
  },
});

const StyledKey = styled('div', {
  display: 'inline-block',
  verticalAlign: 'middle',
  background: 'rgba(255, 255, 255, 0.2)',
  borderRadius: 2,
  padding: '3px 6px',
});

const Grow = styled('div', {
  flexGrow: 1,
});

const StyledEditor = styled('div', {
  display: 'flex',
  padding: '10px 0',
  width: '100%',
});

const StyledGutter = styled('div', {
  padding: '0 5px',
  borderRight: '1px solid var(--LiveInspect-borderThin)',
  textAlign: 'right',
  color: 'var(--LiveInspect-colorTextMuted)',
  fontSize: '0.9em',
});

const StyledCode = styled('div', {
  flexGrow: '1',
  whiteSpace: 'pre',
  padding: '0 10px',
  overflow: 'auto',
});

type ShaderProps = {
  type: string,
  fiber: LiveFiber<any>,
};

export const renderShader = (props: any) => <Shader {...props} />;

export const Shader: React.FC<ShaderProps> = ({type, fiber}) => {

  const shader = fiber.__inspect?.[type];
  const uniforms = fiber.__inspect?.uniforms;
  const bindings = fiber.__inspect?.bindings;
  const volatiles = fiber.__inspect?.volatiles;

  const [state, setState] = useState<Record<string, boolean>>({});
  const toggleState = (id: string) => setState((state) => ({
    ...state,
    [id]: !state[id],
  }));
  
  const toObject = (us: any[]) => {
    const out: Record<string, any> = {};
    for (let u of us) {
      u = {...u};
      let n = u.uniform.name;
      if (n in out) {
        let i = 2;
        for (; i < 100; ++i) if (!(n + i in out)) break;
        n = n + i;
      }
      out[n] = u;
      if (u.constant) {
        if (typeof u.constant === 'function') {
          u.resolved = u.constant();
        }
      }
    }
    return out;
  }

  const {hash} = shader;
  const handleCommit = useCallback((code: string) => {
    fiber.__inspect?.updateShader?.(hash, code);
  }, [fiber, hash]);

  const isMac = navigator.platform.match(/^Mac/);
  const cmd = isMac ? '⌘' : 'Ctrl';

  return (<>
    {uniforms || bindings ? (<>
      {uniforms?.length ? <>
        <div><b>Constants</b></div>
        <InspectObject object={toObject(uniforms)} state={state} toggleState={toggleState} path={'u'} />
      </> : null}
      {bindings?.length ? <>
        <div><b>Bindings</b></div>
        <InspectObject object={toObject(bindings)} state={state} toggleState={toggleState} path={'b'} />
      </> : null}
      {volatiles?.length ? <>
        <div><b>Volatiles</b></div>
        <InspectObject object={toObject(volatiles)} state={state} toggleState={toggleState} path={'v'} />
      </> : null}
      <Spacer />
    </>) : null}
    <StyledHeader>
      <Grow><b>Shader</b> (<code>{shader.hash}</code>)</Grow>
      <StyledHint><span>Hot Reload</span><StyledKey>{cmd}</StyledKey>+<StyledKey>S</StyledKey></StyledHint>
    </StyledHeader>
    <StyledShader><Selectable>
      <WGSL code={shader.code} onCommit={handleCommit} />
    </Selectable></StyledShader>
  </>);
}
