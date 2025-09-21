import styled from "styled-components";

export const InspectContainer = styled.div`
	pointer-events: auto;
	background: #fff;
	color: #000;
	cursor: default;
`;

export const ExpandRow = styled.div`
	display: flex;
	height: 20px;
`;

export const NotExpandRow = styled(ExpandRow)`
	padding-left: 24px;
`;

export const IndentTree = styled.div`
	padding-left: 24px;
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
