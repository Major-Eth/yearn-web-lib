import type	{ReactNode}	from 'react';
import type {Connector} from 'wagmi';
import type {TPartnersInfo} from '@yearn-finance/web-lib/utils/partners';
import type {TAddress} from '.';

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
	lensOracleAddress: TAddress,
	partnerContractAddress: TAddress
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
	baseOptions?: Partial<TSettingsBase>,
}

export type TUIOptions = {
	shouldUseDefaultToaster?: boolean,
	shouldUseThemes?: boolean
}

export type TPossibleThemes = 'dark' | 'light';

export type	TUIContext = {
	toast: unknown,
	onLoadStart: () => void,
	onLoadDone: () => void,
}

export type TWeb3Options = {
	shouldUseWallets?: boolean,
	defaultChainID?: number
}

export type TWeb3Context = {
	address: TAddress | undefined,
	ens: string | undefined,
	lensProtocolHandle: string | undefined,
	chainID: number,
	isDisconnected: boolean,
	isActive: boolean
	isConnecting: boolean,
	hasProvider: boolean,
	provider?: Connector,
	currentPartner?: TPartnersInfo,
	onConnect: (p: string, e?: ((error: Error) => void) | undefined, s?: (() => void) | undefined) => Promise<void>,
	onSwitchChain: (newChainID: number) => void,
	openLoginModal: () => void,
	onDesactivate: () => void,
	options?: TWeb3Options,
	walletType: string,
}
