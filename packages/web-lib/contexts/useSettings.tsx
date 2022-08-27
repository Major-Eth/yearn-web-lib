import	React, {createContext} from 'react';
import	{ethers} from 'ethers';
import	{getRPC, replaceEnvRPCURI} from '../utils/providers';
import	{deepMerge} from './utils';
import	{useLocalStorage} from '../hooks/useLocalStorage';
import	performBatchedUpdates from '../utils/performBatchedUpdates';

import type * as useSettingsTypes from './useSettings.d';

const	defaultSettings = {
	yDaemonBaseURI: 'https://ydaemon.yearn.finance',
	metaBaseURI: 'https://meta.yearn.finance',
	apiBaseURI: 'https://api.yearn.finance'
};
const	defaultNetworks = {
	1: {
		rpcURI: getRPC(1),
		graphURI: 'https://api.thegraph.com/subgraphs/name/0xkofee/yearn-vaults-v2',
		yDaemonURI: `${defaultSettings.yDaemonBaseURI}/1`,
		metaURI: `${defaultSettings.metaBaseURI}/api/1`,
		apiURI: `${defaultSettings.apiBaseURI}/v1/chains/1`,
		explorerBaseURI: 'https://etherscan.io',
		lensAddress: '0x83d95e0D5f402511dB06817Aff3f9eA88224B030',
		partnerContractAddress: '0x8ee392a4787397126C163Cb9844d7c447da419D8'
	},
	10: {
		rpcURI: getRPC(10),
		graphURI: 'https://api.thegraph.com/subgraphs/name/yearn/yearn-vaults-v2-optimism',
		yDaemonURI: `${defaultSettings.yDaemonBaseURI}/10`,
		metaURI: `${defaultSettings.metaBaseURI}/api/10`,
		apiURI: `${defaultSettings.apiBaseURI}/v1/chains/10`,
		explorerBaseURI: 'https://optimistic.etherscan.io',
		lensAddress: '0xB082d9f4734c535D9d80536F7E87a6f4F471bF65',
		partnerContractAddress: ethers.constants.AddressZero
	},
	250: {
		rpcURI: getRPC(250),
		graphURI: 'https://api.thegraph.com/subgraphs/name/bsamuels453/yearn-fantom-validation-grafted',
		yDaemonURI: `${defaultSettings.yDaemonBaseURI}/250`,
		metaURI: `${defaultSettings.metaBaseURI}/api/250`,
		apiURI: `${defaultSettings.apiBaseURI}/v1/chains/250`,
		explorerBaseURI: 'https://ftmscan.com',
		lensAddress: '0x57AA88A0810dfe3f9b71a9b179Dd8bF5F956C46A',
		partnerContractAddress: '0x086865B2983320b36C42E48086DaDc786c9Ac73B'
	},
	42161: {
		rpcURI: getRPC(42161),
		graphURI: 'https://api.thegraph.com/subgraphs/name/yearn/yearn-vaults-v2-arbitrum',
		yDaemonURI: `${defaultSettings.yDaemonBaseURI}/42161`,
		metaURI: `${defaultSettings.metaBaseURI}/api/42161`,
		apiURI: `${defaultSettings.apiBaseURI}/v1/chains/42161`,
		explorerBaseURI: 'https://arbiscan.io',
		lensAddress: '0x043518AB266485dC085a1DB095B8d9C2Fc78E9b9',
		partnerContractAddress: ethers.constants.AddressZero
	},
	1337: {
		rpcURI: getRPC(1337),
		graphURI: 'https://api.thegraph.com/subgraphs/name/0xkofee/yearn-vaults-v2',
		yDaemonURI: `${defaultSettings.yDaemonBaseURI}/1`,
		metaURI: `${defaultSettings.metaBaseURI}/api/1`,
		apiURI: `${defaultSettings.apiBaseURI}/v1/chains/1`,
		explorerBaseURI: 'https://etherscan.io',
		lensAddress: '0x83d95e0D5f402511dB06817Aff3f9eA88224B030',
		partnerContractAddress: '0x8ee392a4787397126C163Cb9844d7c447da419D8'
	}
};

const	SettingsContext = createContext<useSettingsTypes.TSettingsContext>({
	settings: defaultSettings,
	networks: defaultNetworks,
	onUpdateNetworks: (): null => null,
	onUpdateBaseSettings: (): null => null
});

/* 💙 - Yearn Finance *************************************************************************
**	Handle some global parameters for the app. This should be used to store specific elements
**	we want dApps to be able to customize, without being specific to the dApp.
**	One of theses parameters is the list of networks with the specific Yearn's endpoints.
**********************************************************************************************/
export const SettingsContextApp = ({
	children,
	baseOptions = defaultSettings,
	networksOptions = {}
}: useSettingsTypes.TSettingsContextApp): React.ReactElement => {
	const	[baseSettings, set_baseSettings] = useLocalStorage('yearnSettingsBase', deepMerge(defaultSettings, baseOptions) as useSettingsTypes.TSettingsBase);
	const	[networks, set_networks] = useLocalStorage('yearnSettingsNetworks', deepMerge(defaultNetworks, networksOptions) as useSettingsTypes.TSettingsOptions);

	React.useEffect((): void => {
		const	_networks = networks as useSettingsTypes.TSettingsOptions;
		Object.keys(_networks).forEach((key): void => {
			replaceEnvRPCURI(Number(key), _networks[Number(key)]?.rpcURI || '');
		});
	}, [networks]);

	/* 💙 - Yearn Finance *********************************************************************
	**	The app can provide a new list of networks with their own data. They will be deep
	**	merged with the existing ones, aka the existing declarations will be overwritten but
	**	the new ones will be added.
	******************************************************************************************/
	function	onUpdateNetworks(newNetworkSettings: useSettingsTypes.TSettingsOptions): void {
		const	_networks = deepMerge(networks, newNetworkSettings) as useSettingsTypes.TSettingsOptions;
		Object.keys(_networks).forEach((key): void => {
			replaceEnvRPCURI(Number(key), _networks[Number(key)]?.rpcURI || '');
		});
		set_networks(_networks);
	}

	/* 💙 - Yearn Finance *********************************************************************
	**	The app can provide a new list of base options. They will be deep merged with the
	**	existing ones, aka the existing declarations will be overwritten but the new ones will
	**	be added. Networks settings are updated accordingly.
	******************************************************************************************/
	function	onUpdateBaseSettings(newSettings: useSettingsTypes.TSettingsBase): void {
		performBatchedUpdates((): void => {
			set_baseSettings(newSettings);
			set_networks((_networks: {[key: string]: useSettingsTypes.TSettingsForNetwork}): any => {
				Object.keys(_networks).forEach((key): void => {
					_networks[key].yDaemonURI = `${newSettings.yDaemonBaseURI}/${key}`;
					_networks[key].metaURI = `${newSettings.metaBaseURI}/api/${key}`;
					_networks[key].apiURI = `${newSettings.apiBaseURI}/v1/chains/${key}`;
				});
				return _networks;
			});
		});
	}

	/* 💙 - Yearn Finance *********************************************************************
	**	Render the SettingContext with it's parameters.
	**	The parameters will be accessible to the children via the useSettings hook.
	******************************************************************************************/
	return (
		<SettingsContext.Provider
			value={{
				settings: baseSettings as useSettingsTypes.TSettingsBase,
				networks: networks as useSettingsTypes.TSettingsOptions,
				onUpdateNetworks: onUpdateNetworks,
				onUpdateBaseSettings: onUpdateBaseSettings
			}}>
			{children}
		</SettingsContext.Provider>
	);
};

export const useSettings = (): useSettingsTypes.TSettingsContext => React.useContext(SettingsContext);
export default useSettings;
