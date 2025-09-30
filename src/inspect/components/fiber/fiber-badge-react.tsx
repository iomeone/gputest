import React, { useMemo, useState } from 'react';

type FiberBadgeReactProps = {
  reactNode: any,
  root?: boolean,
};

const OUTLINE_COLOR = 'rgba(76, 229, 255, 1)';

const OUTLINE_STYLE = `2px solid ${OUTLINE_COLOR}`;
const BOX_SHADOW_STYLE = `inset 0 0 0 2px ${OUTLINE_COLOR}`;

export const FiberBadgeReact: React.FC<FiberBadgeReactProps> = ({
  reactNode,
  root,
}) => {
  const {elementType} = reactNode;

  let name: string | null = null;
  if (typeof elementType === 'string') name = '<' + elementType + '>';
  else if (elementType) name = elementType.name ?? elementType.displayName;

  if (name == null) name = root ? 'ReactRoot' : 'Node';

  const [hovered, setHovered] = useState(false);

  const handlers = useMemo(() => {
    let outlineStyle: string | null = null;
    let boxShadowStyle: string | null = null;

    const onMouseEnter = () => {
      const {stateNode} = reactNode;
      const element = (stateNode?.containerInfo ?? stateNode) as any;
      if (!element) return;

      outlineStyle = element.style?.outline;
      boxShadowStyle = element.style?.boxShadow;
      element.style?.setProperty('outline', OUTLINE_STYLE);
      element.style?.setProperty('box-shadow', BOX_SHADOW_STYLE);
      setHovered(true);
    };

    const onMouseLeave = () => {
      const {stateNode} = reactNode;
      const element = (stateNode?.containerInfo ?? stateNode) as any;
      if (!element) return;

      element.style?.setProperty('outline', outlineStyle);
      element.style?.setProperty('box-shadow', boxShadowStyle);
      setHovered(false);
    };

    return {onMouseEnter, onMouseLeave};
  }, [reactNode]);

  const className = hovered ? 'hovered' : null;

  return (
    <div className={"fiber-tree-node " + className} {...handlers}>
      <div className={"fiber-tree-highlight cover-parent " + className} />
      <div className={"fiber-tree-label depth-0"}>{name}</div>
    </div>
  );
}
