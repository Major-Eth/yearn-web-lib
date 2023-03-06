import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Contract} from 'ethcall';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import ERC20_ABI from '@yearn-finance/web-lib/utils/abi/erc20.abi';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS, VLYCRV_TOKEN_ADDRESS, WETH_TOKEN_ADDRESS, WFTM_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import * as format from '@yearn-finance/web-lib/utils/format';
import {Zero} from '@yearn-finance/web-lib/utils/format';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import * as providers from '@yearn-finance/web-lib/utils/web3/providers';

import type {DependencyList} from 'react';
import type {TWeb3Provider} from '@yearn-finance/web-lib/contexts/types';
import type {TBalanceData, TDefaultStatus} from '@yearn-finance/web-lib/hooks/types';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';

/* 🔵 - Yearn Finance **********************************************************
** Request, Response and helpers for the useBalances hook.
******************************************************************************/
type	TDefaultReqArgs = {
	chainID?: number,
	provider?: TWeb3Provider,
}
export type	TUseBalancesTokens = {
	token: string,
	for?: string,
}
export type	TUseBalancesReq = {
	key?: string | number,
	tokens: TUseBalancesTokens[]
	prices?: {
		[token: string]: string,
	}
	refreshEvery?: 'block' | 'second' | 'minute' | 'hour' | number,
	effectDependencies?: DependencyList
} & TDefaultReqArgs

export type	TUseBalancesRes = {
	data: TDict<TBalanceData>,
	update: () => Promise<TDict<TBalanceData>>,
	updateSome: (token: TUseBalancesTokens[]) => Promise<TDict<TBalanceData>>,
	error?: Error,
	status: 'error' | 'loading' | 'success' | 'unknown',
	nonce: number
} & TDefaultStatus

type TDataRef = {
	nonce: number,
	address: TAddress,
	balances: TDict<TBalanceData>,
}

/* 🔵 - Yearn Finance **********************************************************
** Default status for the loading state.
******************************************************************************/
const		defaultStatus = {
	isLoading: false,
	isFetching: false,
	isSuccess: false,
	isError: false,
	isFetched: false,
	isRefetching: false
};

/* 🔵 - Yearn Finance ******************************************************
** This hook can be used to fetch balance information for any ERC20 tokens.
**************************************************************************/
export function	useBalances(props?: TUseBalancesReq): TUseBalancesRes {
	const	{address: web3Address, isActive, provider} = useWeb3();
	const	{chainID: web3ChainID} = useChainID();
	const	[nonce, set_nonce] = useState(0);
	const	[status, set_status] = useState<TDefaultStatus>(defaultStatus);
	const	[error, set_error] = useState<Error | undefined>(undefined);
	const	[balances, set_balances] = useState<TDict<TBalanceData>>({});
	const	data = useRef<TDataRef>({nonce: 0, address: toAddress(), balances: {}});
	const	interval = useRef<NodeJS.Timer>();
	const	effectDependencies = props?.effectDependencies || [];

	/* 🔵 - Yearn Finance ******************************************************
	** When this hook is called, it will fetch the informations for the
	** specified list of tokens. If no props are specified, the default values
	** will be used.
	**************************************************************************/
	const stringifiedTokens = useMemo((): string => JSON.stringify(props?.tokens || []), [props?.tokens]);

	const getBalances = useCallback(async (tokenList: string): Promise<[TDict<TBalanceData>, Error | undefined]> => {
		const	tokens = JSON.parse(tokenList) || [];
		if (!isActive || !web3Address || tokens.length === 0) {
			return [{}, undefined];
		}

		let		currentProvider = provider || providers.getProvider(props?.chainID || web3ChainID || 1);
		if (props?.chainID && props.chainID !== web3ChainID) {
			currentProvider = providers.getProvider(props?.chainID);
		}

		const	calls = [];
		const	ethcallProvider = await providers.newEthCallProvider(currentProvider);
		for (const element of tokens) {
			const	{token} = element;
			const	ownerAddress = (element?.for || web3Address) as string;
			const	isEth = toAddress(token) === ETH_TOKEN_ADDRESS;
			if (isEth) {
				const	tokenContract = web3ChainID === 250
					? new Contract(WFTM_TOKEN_ADDRESS, ERC20_ABI)
					: new Contract(WETH_TOKEN_ADDRESS, ERC20_ABI);
				calls.push(
					ethcallProvider.getEthBalance(ownerAddress),
					tokenContract.decimals(),
					tokenContract.symbol()
				);
			} else {
				const	tokenContract = new Contract(token, ERC20_ABI);
				calls.push(
					tokenContract.balanceOf(ownerAddress),
					tokenContract.decimals(),
					tokenContract.symbol()
				);
			}
		}

		const	_data: TDict<TBalanceData> = {};
		try {
			const	results = await ethcallProvider.tryAll(calls);
			let		rIndex = 0;
			for (const element of tokens) {
				const	{token} = element;
				const	balanceOf = results[rIndex++] as bigint;
				let		decimals = results[rIndex++] as number;
				const	rawPrice = format.BN(props?.prices?.[toAddress(token)] || Zero);
				let symbol = results[rIndex++] as string;

				if (toAddress(token) === ETH_TOKEN_ADDRESS) {
					symbol = 'ETH';
				}
				if (toAddress(token) === VLYCRV_TOKEN_ADDRESS) {
					decimals = 18;
				}
				_data[toAddress(token)] = {
					decimals: Number(decimals),
					symbol: symbol,
					raw: balanceOf,
					rawPrice,
					normalized: format.toNormalizedValue(balanceOf, Number(decimals)),
					normalizedPrice: format.toNormalizedValue(rawPrice, 6),
					normalizedValue: (format.toNormalizedValue(balanceOf, Number(decimals)) * format.toNormalizedValue(rawPrice, 6))
				};
			}
			return [_data, undefined];
		} catch (_error) {
			return [{}, _error as Error];
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isActive, web3Address, props?.chainID, props?.prices, web3ChainID, provider, ...effectDependencies]);

	/* 🔵 - Yearn Finance ******************************************************
	** Add an interval to update the balance every X time, based on the
	** refreshEvery prop. This specific effect is not used if the refresh is
	** not set or if it is set to 'block'.
	**************************************************************************/
	useEffect((): () => void => {
		if (props?.refreshEvery && props?.refreshEvery !== 'block') {
			let	delay = props.refreshEvery;
			if (delay === 'second') {
				delay = 1 * 1000;
			} else if (delay === 'minute') {
				delay = 60 * 1000;
			} else if (delay === 'hour') {
				delay = 60 * 60 * 1000;
			}
			interval.current = setInterval((): void => {
				getBalances(stringifiedTokens);
			}, delay as number);
			return (): void => clearInterval(interval.current);
		}
		return (): void => undefined;
	}, [getBalances, props?.refreshEvery, stringifiedTokens]);

	/* 🔵 - Yearn Finance ******************************************************
	** Add an interval to update the balance every X block, based on the
	** refreshEvery prop. This specific effect is not used if the refresh is
	** not set or if it is NOT set to 'block'.
	**************************************************************************/
	useEffect((): () => void => {
		if (!props?.refreshEvery || props?.refreshEvery !== 'block') {
			return (): void => undefined;
		}

		let	currentProvider = props?.provider || providers.getProvider(props?.chainID || web3ChainID || 1);
		if (!props?.provider && props?.chainID === web3ChainID && provider) {
			currentProvider = provider as TWeb3Provider;
		}
		currentProvider.on('block', async (): Promise<unknown> => getBalances(stringifiedTokens));

		return (): void => {
			currentProvider.off('block', async (): Promise<unknown> => getBalances(stringifiedTokens));
		};
	}, [provider, props?.chainID, props?.provider, props?.refreshEvery, web3ChainID, getBalances, stringifiedTokens]);

	const	onUpdate = useCallback(async (): Promise<TDict<TBalanceData>> => {
		set_status({...defaultStatus, isLoading: true, isFetching: true, isRefetching: defaultStatus.isFetched});

		const	[newRawData, err] = await getBalances(stringifiedTokens);
		if (toAddress(web3Address as string) !== data.current.address) {
			data.current.balances = {};
		}
		data.current.address = toAddress(web3Address as string);

		for (const [address, element] of Object.entries(newRawData)) {
			data.current.balances[address] = {
				...data.current.balances[address],
				...element
			};
		}
		data.current.nonce += 1;

		performBatchedUpdates((): void => {
			set_nonce((n): number => n + 1);
			set_balances(data.current.balances);
			set_error(err as Error);
			set_status({...defaultStatus, isSuccess: true, isFetched: true});
		});
		return data.current.balances;
	}, [getBalances, stringifiedTokens, web3Address]);

	const	onUpdateSome = useCallback(async (tokenList: TUseBalancesTokens[]): Promise<TDict<TBalanceData>> => {
		set_status({...defaultStatus, isLoading: true, isFetching: true, isRefetching: defaultStatus.isFetched});

		const	stringifiedSomeTokens = JSON.stringify(tokenList);
		const	[newRawData, err] = await getBalances(stringifiedSomeTokens);
		if (toAddress(web3Address as string) !== data.current.address) {
			data.current.balances = {};
		}
		data.current.address = toAddress(web3Address as string);

		for (const [address, element] of Object.entries(newRawData)) {
			data.current.balances[address] = {
				...data.current.balances[address],
				...element
			};
		}
		data.current.nonce += 1;

		performBatchedUpdates((): void => {
			set_nonce((n): number => n + 1);
			set_balances(data.current.balances);
			set_error(err as Error);
			set_status({...defaultStatus, isSuccess: true, isFetched: true});
		});
		return data.current.balances;
	}, [getBalances, web3Address]);

	const assignPrices = useCallback((_rawData: TDict<TBalanceData>): TDict<TBalanceData> => {
		for (const key of Object.keys(_rawData)) {
			const	tokenAddress = toAddress(key);
			const	rawPrice = format.BN(props?.prices?.[tokenAddress] || Zero);
			_rawData[tokenAddress] = {
				..._rawData[tokenAddress],
				rawPrice,
				normalizedPrice: format.toNormalizedValue(rawPrice, 6),
				normalizedValue: ((_rawData?.[tokenAddress] || 0).normalized * format.toNormalizedValue(rawPrice, 6))
			};
		}
		return _rawData;
	}, [props?.prices]);

	useEffect((): void => {
		onUpdate();
	}, [onUpdate]);

	const	contextValue = useMemo((): TUseBalancesRes => ({
		data: assignPrices(balances),
		nonce,
		update: onUpdate,
		updateSome: onUpdateSome,
		error,
		isLoading: status.isLoading,
		isFetching: status.isFetching,
		isSuccess: status.isSuccess,
		isError: status.isError,
		isFetched: status.isFetched,
		isRefetching: status.isRefetching,
		status: (
			status.isError ? 'error' :
				(status.isLoading || status.isFetching) ? 'loading' :
					(status.isSuccess) ? 'success' : 'unknown'
		)
	}), [assignPrices, balances, error, nonce, onUpdate, onUpdateSome, status.isError, status.isFetched, status.isFetching, status.isLoading, status.isRefetching, status.isSuccess]);

	return (contextValue);
}
