import styled from "styled-components";

export const InspectContainer = styled.div`
	pointer-events: auto;
	background: rgba(255, 255, 255, 0.9);
	color: #000;
	cursor: default;
`;

export const InspectToggle = styled.div`
	position: absolute;
	right: 0;
	top: 0;
	pointer-events: auto;
`;

export const ExpandRow = styled.div`
	display: flex;
	height: 20px;
`;

export const NotExpandRow = styled(ExpandRow)`
	padding-left: 20px;
`;

export const IndentMini = styled.div`
	padding-left: 2px;
`;

export const IndentTree = styled.div`
	padding-left: 20px;
`;

export const UnindentTree = styled.div`
	margin-left: -18px;
`;

export const SplitRow = styled.div`
	display: flex;
	min-height: 100%;
`;

export const SplitColumn = styled.div`
	display: flex;
	flex-direction: column;
	min-height: 100%;
`;

export const RowPanel = styled.div`
	&:not(:last-child) {
		border-right: 1px solid #ccc;
	}
`;

export const ColumnPanel = styled.div`
	&:not(:last-child) {
		border-bottom: 1px solid #ccc;
	}
`;

export const Scrollable = styled.div`
	overflow: auto;
`;

export const Inset = styled.div`
	padding: 20px;
`;

export const Label = styled.div`
	font-weight: bold;
	padding-right: 10px;
`;
