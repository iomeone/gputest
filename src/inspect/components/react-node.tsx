import React, { useMemo, useState } from 'react';

type ReactNodeProps = {
  reactNode: any,
  root?: boolean,
};

const INSPECT_STYLE = '5px solid rgba(76, 229, 255, 1)';

export const ReactNode: React.FC<ReactNodeProps> = ({
  reactNode,
  root,
}) => {
  const {type, elementType} = reactNode;

  let name: string | null = null;
  if (typeof elementType === 'string') name = '<' + elementType + '>';
  else if (elementType) name = elementType.name ?? elementType.displayName;

  if (name == null) name = root ? 'ReactRoot' : 'Node';

  const [hovered, setHovered] = useState(false);

  const handlers = useMemo(() => {
    let style: string | null = null;

    const onMouseEnter = () => {
      const {stateNode} = reactNode;
      const element = (stateNode?.containerInfo ?? stateNode) as any;
      if (!element) return;
      
      style = element.style?.outline;
      element.style?.setProperty('outline', INSPECT_STYLE);
      setHovered(true);
    };

    const onMouseLeave = () => {
      const {stateNode} = reactNode;
      const element = (stateNode?.containerInfo ?? stateNode) as any;
      if (!element) return;

      element.style?.setProperty('outline', style);
      setHovered(false);
    };
    
    return {onMouseEnter, onMouseLeave};
  }, []);
  
  const className = hovered ? 'hovered' : null;

  return (
    <div className={"fiber-tree-node " + className} {...handlers}>
      <div className={"fiber-tree-highlight cover-parent " + className} />
      <div className={"fiber-tree-label depth-0"}>{name}</div>
    </div>
  );
}
