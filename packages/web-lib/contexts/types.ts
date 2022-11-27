import	{ReactNode}	from 'react';
import	{ethers}	from 'ethers';

import {TPartnersInfo} from '../utils';

export type TSettingsBase = {
	yDaemonBaseURI: string,
	metaBaseURI: string,
	apiBaseURI: string,
}
export type	TSettingsForNetwork = {
	rpcURI: string,
	yDaemonURI: string,
	graphURI: string,
	metaURI: string,
	apiURI: string,
	explorerBaseURI: string,
	lensAddress: string,
	partnerContractAddress: string
}

export type	TSettingsContext = {
	settings: TSettingsBase,
	networks: TSettingsBaseOptions & TSettingsOptions,
	onUpdateNetworks: (newNetworkSettings: TSettingsOptions) => void,
	onUpdateBaseSettings: (newBaseSettings: TSettingsBase) => void,
}

export type TSettingsBaseOptions = {
	1: TSettingsForNetwork,
	10: TSettingsForNetwork,
	250: TSettingsForNetwork,
	1337: TSettingsForNetwork,
	42161: TSettingsForNetwork,
}

export type TSettingsOptions = {
	[key: number]: Partial<TSettingsForNetwork>,
}

export type	TSettingsContextApp = {
	children: ReactNode,
	networksOptions?: TSettingsOptions,
	baseOptions?: TSettingsBase,
}

export type TUIOptions = {
	shouldUseDefaultToaster?: boolean,
	shouldUseThemes?: boolean
}

export type TPossibleThemes = 'dark' | 'light';

export type	TUIContext = {
	theme: string,
	switchTheme: () => void,
	toast: unknown
}

export type TWeb3Options = {
	shouldUseWallets?: boolean,
	defaultChainID?: number,
	supportedChainID?: number[]
}

export type TWeb3Context = {
	address: string | null | undefined,
	ens: string | undefined,
	chainID: number,
	safeChainID: number,
	isDisconnected: boolean,
	isActive: boolean,
	isConnecting: boolean,
	hasProvider: boolean,
	provider: ethers.providers.Provider,
	currentPartner?: TPartnersInfo,
	detectedWalletProvider: string,
	onConnect: (p: number, e?: ((error: Error) => void) | undefined, s?: (() => void) | undefined) => Promise<void>,
	onSwitchChain: (newChainID: number, force?: boolean) => void,
	openLoginModal: () => void,
	onDesactivate: () => void,
	options?: TWeb3Options
}

export type TWalletProvider = {
	isFrame?: boolean,
	isCoinbaseBrowser?: boolean,
	isMetaMask?: boolean,
}