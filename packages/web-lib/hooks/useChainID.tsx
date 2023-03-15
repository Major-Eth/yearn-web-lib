import {useMemo} from 'react';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';

export type TUseChainIDRes = {
	chainID: number;
	updateChainID: (n: number) => void;
	safeChainID: number;
}

/* 🔵 - Yearn Finance ******************************************************
** This hook can be used to grab the current injected wallet provider.
** It will return the name and icon of the wallet provider.
**************************************************************************/
export function useChainID(defaultChainID?: number): TUseChainIDRes {
	const {chainID, onSwitchChain} = useWeb3();
	const	safeChainID = useMemo((): number => [1337, 31337].includes(chainID) ? 1 : chainID || 1, [chainID]);

	return {
		chainID: Number(chainID || defaultChainID || 1),
		updateChainID: onSwitchChain,
		safeChainID
	};
}
