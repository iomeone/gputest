import React from 'react';

type ReactNodeProps = {
  reactNode: any,
  root?: boolean,
};

export const ReactNode: React.FC<ReactNodeProps> = ({
  reactNode,
  root,
}) => {
  const {type, elementType} = reactNode;

  let name: string | null = null;
  if (typeof elementType === 'string') name = elementType;
  else if (elementType) name = elementType.name ?? elementType.displayName;

  if (name == null) name = root ? 'ReactRoot' : 'Node';

  return (
    <div className={"fiber-tree-node"}>
      <div className={"fiber-tree-label builtin depth-0"}>{name}</div>
    </div>
  );
}
