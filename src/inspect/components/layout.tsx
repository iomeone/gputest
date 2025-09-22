import styled from "styled-components";

type TreeIndentProps = { indent?: number }

export const InspectContainer = styled.div`
  pointer-events: none;
  color: var(--colorText);
  cursor: default;
  position: relative;
  height: 100%;
  user-select: none;
`;

export const Selectable = styled.div`
  user-select: text;
`;

export const InspectContainerCollapsed = styled(InspectContainer)`
  width: 34%;
  position: relative;
`;

export const InspectToggle = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  pointer-events: auto;
`;

export const Muted = styled.span`
  color: var(--colorTextMuted);
`;

export const Spacer = styled.div`
  width: 20px;
  height: 20px;
`;

export const SplitRow = styled.div`
  display: flex;
  height: 100%;
`;

export const SplitColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const SplitRowFull = styled(SplitRow)`
  width: 100%;
`;

export const SplitColumnFull = styled(SplitColumn)`
  height: 100%;
  flex-grow: 1;
`;

export const RowPanel = styled.div`
  position: relative;
  &:not(:last-child) {
    border-right: 1px solid var(--borderThin);
  }
`;

export const ColumnPanel = styled.div`
  &:not(:last-child) {
    border-bottom: 1px solid var(--borderThin);
  }
`;

export const Panel = styled.div`
  pointer-events: auto;
  background: var(--shim);
	max-height: 100%;
`;

export const PanelScrollable = styled.div`
  pointer-events: auto;
  background: var(--shim);
	max-height: 100%;
	overflow: auto;
`;

export const PanelFull = styled(Panel)`
  height: 100%;
	overflow: auto;
`;

export const Inset = styled.div`
  padding: 20px;
`;

export const InsetColumnFull = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 100%;
`;

export const Label = styled.div`
  font-weight: bold;
  padding-right: 10px;
  flex-shrink: 0;
  display: flex;
`;

export const TreeWrapper = styled.div`
  flex-grow: 1;
`;

export const TreeToggle = styled.div`
  position: relative;
  z-index: 1;
`;

export const TreeRow = styled.div<TreeIndentProps>`
  display: flex;
  height: 20px;
  padding-left: ${props => props.indent ? `${props.indent * 20}px` : 0};
`;

export const TreeLegend = styled.div`
  color: var(--colorTextSemi);
  padding-top: 30px;
  display: flex;
  flex-wrap: wrap;
  font-size: 0.9em;
`;

export const TreeLegendItem = styled.div`
  margin: 2px 0;
  padding: 0 10px;
  display: flex;
  > div {
    width: 16px;
    height: 16px;
    margin: 2px 0 0;
  }
  > span {
    margin-left: 5px;
  }
`;

export const TreeIndent = styled.div<TreeIndentProps>`
  margin-left: ${props => props.indent ? `${props.indent * 20}px` : 0};
`;

export const TreeLine = styled.div`
  margin-left: -1px;
  border-left: 2px dotted var(--borderThin);
`;
