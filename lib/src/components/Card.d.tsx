import {ReactElement} from 'react';

export type TCard = {
	className?: string;
	variant?: 'surface' | 'background';
	padding?: 'none' | 'narrow' | 'regular';
	onClick?: React.MouseEventHandler;
	children?: React.ReactNode;
} & React.ComponentPropsWithoutRef<'section'>;

export type TCardDetailSummary = {
	startChildren?: React.ReactNode;
	endChildren?: React.ReactNode;
	open?: boolean;
} & React.ComponentPropsWithoutRef<'div'>;

export type TCardWithTabsOption = {
	label: string;
	children: ReactElement;
}
  
export type TCardWithTabs = {
	tabs: TCardWithTabsOption[];
}

export type TCardDetail = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	summary?: TCardDetailSummary | ReactElement | ((p: unknown) => ReactElement | TCardDetailSummary) | any;
	variant?: 'surface' | 'background';
	isSticky?: boolean;
	children?: React.ReactNode;
} & React.ComponentPropsWithoutRef<'div'>;
