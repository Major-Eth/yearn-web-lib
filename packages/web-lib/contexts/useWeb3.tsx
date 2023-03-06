import	React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {BrowserProvider} from 'ethers';
import {useUpdateEffect} from '@react-hookz/web';
import {useWeb3React} from '@web3-react/core';
import {ModalLogin} from '@yearn-finance/web-lib/components/ModalLogin';
import {deepMerge} from '@yearn-finance/web-lib/contexts/utils';
import {useChain} from '@yearn-finance/web-lib/hooks/useChain';
import {useClientEffect} from '@yearn-finance/web-lib/hooks/useClientEffect';
import {useDebounce} from '@yearn-finance/web-lib/hooks/useDebounce';
import {useInjectedWallet} from '@yearn-finance/web-lib/hooks/useInjectedWallet';
import {useLocalStorage} from '@yearn-finance/web-lib/hooks/useLocalStorage';
import {useWindowInFocus} from '@yearn-finance/web-lib/hooks/useWindowInFocus';
import {addressZero, toAddress} from '@yearn-finance/web-lib/utils/address';
import {lensProtocolFetcher} from '@yearn-finance/web-lib/utils/fetchers';
import {isIframe} from '@yearn-finance/web-lib/utils/helpers';
import {getPartner} from '@yearn-finance/web-lib/utils/partners';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import {connectors} from '@yearn-finance/web-lib/utils/web3/connectors';
import {IFrameEthereumProvider} from '@yearn-finance/web-lib/utils/web3/connectors.eip1193.ledger';
import {getProvider} from '@yearn-finance/web-lib/utils/web3/providers';

import type {ErrorInfo, ReactElement} from 'react';
import type {TWeb3Context, TWeb3Options, TWeb3Provider} from '@yearn-finance/web-lib/contexts/types';
import type {TWalletProvider} from '@yearn-finance/web-lib/hooks/useInjectedWallet';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TPartnersInfo} from '@yearn-finance/web-lib/utils/partners';
import type {Provider} from '@web3-react/types';

const defaultState = {
	address: undefined,
	ens: undefined,
	lensProtocolHandle: undefined,
	chainID: 1,
	isDisconnected: false,
	isActive: false,
	isConnecting: false,
	hasProvider: false,
	provider: getProvider(),
	currentPartner: undefined,
	walletType: 'NONE',
	onConnect: async (): Promise<void> => undefined,
	onSwitchChain: (): void => undefined,
	openLoginModal: (): void => undefined,
	onDesactivate: (): void => undefined
};
const	defaultOptions: TWeb3Options = {
	shouldUseWallets: true,
	defaultChainID: 1,
	supportedChainID: [1, 4, 5, 10, 56, 100, 137, 250, 420, 1337, 31337, 42161]
};

const Web3Context = createContext<TWeb3Context>(defaultState);
export const Web3ContextApp = ({
	children,
	options = defaultOptions
}: {
	children: ReactElement,
	options?: TWeb3Options
}): ReactElement => {
	const web3Options = deepMerge(defaultOptions, options) as TWeb3Options;
	const {connector, isActive, provider, account, chainId} = useWeb3React();
	const [chainID, set_chainID] = useLocalStorage('chainId', chainId) as [number, (n: number) => void];
	const debouncedChainID = useDebounce(chainId, 500);
	const hasWindowInFocus = useWindowInFocus();
	const detectedWalletProvider = useInjectedWallet();
	const chains = useChain();

	const [ens, set_ens] = useState('');
	const [lensProtocolHandle, set_lensProtocolHandle] = useState('');
	const [lastWallet, set_lastWallet] = useLocalStorage('lastWallet', 'NONE') as [string, (n: string) => void];
	const [isConnecting, set_isConnecting] = useState(false);
	const [isDisconnected, set_isDisconnected] = useState(false);
	const [hasDisableAutoChainChange, set_hasDisableAutoChainChange] = useState(false);
	const [isModalLoginOpen, set_isModalLoginOpen] = useState(false);
	const [currentPartner, set_currentPartner] = useState<TPartnersInfo>();

	const	onSwitchChain = useCallback((newChainID: number, force?: boolean): void => {
		if (newChainID === debouncedChainID) {
			return;
		}
		if (!force && (!isActive || hasDisableAutoChainChange)) {
			return;
		}
		const	supportedChains = web3Options?.supportedChainID || defaultOptions.supportedChainID;
		if (!supportedChains) {
			return;
		}
		const	isCompatibleChain = supportedChains.includes(Number(newChainID || 0));
		if (!force && isCompatibleChain) {
			return;
		}
		if (!provider || !isActive) {
			set_chainID(newChainID);
			return;
		}
		if (web3Options.shouldUseWallets) {
			if (Number(newChainID) === 1) {
				provider
					.send('wallet_switchEthereumChain', [{chainId: '0x1'}])
					.then((): void => {
						try {
							connector.activate({chainId: 1});
						} catch (error) {
							console.error(error);
						}
					})
					.catch((): void => set_hasDisableAutoChainChange(true));
			} else if (Number(newChainID) === 4) {
				provider
					.send('wallet_switchEthereumChain', [{chainId: '0x4'}])
					.then((): void => {
						try {
							connector.activate({chainId: 4});
						} catch (error) {
							console.error(error);
						}
					})
					.catch((): void => set_hasDisableAutoChainChange(true));
			} else if (Number(newChainID) === 5) {
				provider
					.send('wallet_switchEthereumChain', [{chainId: '0x5'}])
					.then((): void => {
						try {
							connector.activate({chainId: 5});
						} catch (error) {
							console.error(error);
						}
					})
					.catch((): void => set_hasDisableAutoChainChange(true));
			} else {
				if (newChainID in chains.getAll()) {
					const chainSwap = chains.get(newChainID)?.chain_swap;
					provider
						.send('wallet_addEthereumChain', [chainSwap, account])
						.then((): void => {
							try {
								connector
									.activate({
										...chainSwap,
										chainId: Number(chainSwap?.chainId)
									});
							} catch (error) {
								console.error(error);
							}
						})
						.catch((error: ErrorInfo): void => console.error(error));
				}
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedChainID, isActive, hasDisableAutoChainChange, web3Options.supportedChainID, provider, account]);

	useClientEffect((): void => {
		if ((chainId || 0) > 0) {
			set_chainID(Number(chainId));
		} else if (chainId === 0) {
			set_chainID(Number(options?.defaultChainID || 1));
		}
	}, [chainId]);

	useEffect((): void => {
		onSwitchChain(web3Options?.defaultChainID || 1);
	}, [hasWindowInFocus, onSwitchChain, web3Options.defaultChainID]);

	/**************************************************************************
	**	connect
	**	What should we do when the user choose to connect it's wallet ?
	**	Based on the providerType (AKA Metamask or WalletConnect), differents
	**	actions should be done.
	**	Then, depending on the providerType, a similar action, but different
	**	code is executed to set :
	**	- The provider for the web3 actions
	**	- The current address/account
	**	- The current chain
	**	Moreover, we are starting to listen to events (disconnect, changeAccount
	**	or changeChain).
	**************************************************************************/
	const onConnect = useCallback(async (
		providerType: string,
		onError?: ((error: Error) => void) | undefined,
		onSuccess?: (() => void) | undefined
	): Promise<void> => {
		if (!web3Options.shouldUseWallets) {
			return;
		}
		set_isConnecting(true);
		if (providerType === 'INJECTED') {
			const	ethereum = (window?.ethereum as TWalletProvider);
			if (ethereum?.isFrame) {
				if (isActive) {
					await connectors.frame.connector.deactivate?.();
				}
				try {
					await connectors.frame.connector.activate();
					set_lastWallet('INJECTED');
					if (onSuccess) {
						onSuccess();
					}
					set_isConnecting(false);
				} catch (error) {
					set_lastWallet('NONE');
					if (onError) {
						onError(error as Error);
					}
					set_isConnecting(false);
				}
			} else {
				if (isActive) {
					await connectors.metamask.connector.deactivate?.();
				}
				try {
					await connectors.metamask.connector.activate();
					set_lastWallet('INJECTED');
					if (onSuccess) {
						onSuccess();
					}
					set_isConnecting(false);
				} catch (error) {
					set_lastWallet('NONE');
					if (onError) {
						onError(error as Error);
					}
					set_isConnecting(false);
				}
			}
		} else if (providerType === 'WALLET_CONNECT') {
			if (isActive) {
				await connectors.walletConnect.connector.deactivate();
			}
			try {
				await connectors.walletConnect.connector.activate(1);
				set_lastWallet('WALLET_CONNECT');
				if (onSuccess) {
					onSuccess();
				}
				set_isConnecting(false);
			} catch (error) {
				set_lastWallet('NONE');
				if (onError) {
					onError(error as Error);
				}
				set_isConnecting(false);
			}
		} else if (providerType === 'EMBED_LEDGER') {
			set_lastWallet('EMBED_LEDGER');
		} else if (providerType === 'EMBED_GNOSIS_SAFE') {
			if (isActive) {
				await connectors.gnosisSafe.connector.deactivate?.();
			}
			try {
				await connectors.gnosisSafe.connector.activate();
				set_lastWallet('EMBED_GNOSIS_SAFE');
				if (onSuccess) {
					onSuccess();
				}
				set_isConnecting(false);
			} catch (error) {
				set_lastWallet('NONE');
				if (onError) {
					onError(error as Error);
				}
				set_isConnecting(false);
			}
		} else if (providerType === 'EMBED_COINBASE') {
			if (isActive) {
				await connectors.coinbase.connector.deactivate?.();
			}
			try {
				await connectors.coinbase.connector.activate(1);
				set_lastWallet('EMBED_COINBASE');
				if (onSuccess) {
					onSuccess();
				}
				set_isConnecting(false);
			} catch (error) {
				set_lastWallet('NONE');
				if (onError) {
					onError(error as Error);
				}
				set_isConnecting(false);
			}
		} else if (providerType === 'EMBED_TRUSTWALLET') {
			if (isActive) {
				await connectors.metamask.connector.deactivate?.();
			}
			try {
				await connectors.metamask.connector.activate(1);
				set_lastWallet('EMBED_TRUSTWALLET');
				if (onSuccess) {
					onSuccess();
				}
				set_isConnecting(false);
			} catch (error) {
				set_lastWallet('NONE');
				if (onError) {
					onError(error as Error);
				}
				set_isConnecting(false);
			}
		}
	}, [isActive, web3Options.shouldUseWallets, detectedWalletProvider]); // eslint-disable-line react-hooks/exhaustive-deps

	useClientEffect((): void => {
		if (isIframe()) {
			const params = new Proxy(new URLSearchParams(window.location.search), {
				get: (searchParams, prop): string | null => searchParams.get(prop.toString())
			});

			// TODO Are we sure that `params` has an `origin` prop?
			let	{origin} = params as URLSearchParams & {origin: string};
			if (!origin && window?.location?.ancestorOrigins?.length > 0 ) {
				origin = window.location?.ancestorOrigins[0];
			}
			const	partnerInformation = getPartner(origin || '');

			/* 🔵 - Yearn Finance **************************************************
			**	First, do we have a way to know that we are working with a known
			**	provider (aka Ledger for example).
			**	If we don't know the provider, we will suppose it's a Gnosis Safe
			**	and try to connect.
			**********************************************************************/
			if (partnerInformation.id !== addressZero) {
				const	frameProvider = new IFrameEthereumProvider();
				const	frameWeb3Provider = frameProvider as unknown as Provider; // TODO Are we sure these are equivalent?
				frameWeb3Provider.request = frameProvider.request;
				connectors.eip1193.connector.init(frameWeb3Provider);
				connectors.eip1193.connector.activate();
				set_currentPartner(partnerInformation);
				onConnect(partnerInformation.walletType);
			} else {
				try {
					connectors.gnosisSafe.connector.activate().then(async (): Promise<void> => {
						if (connectors.gnosisSafe.connector.provider) {
							const	web3Provider = new BrowserProvider(connectors.gnosisSafe.connector.provider);
							const	signer = await web3Provider.getSigner();
							const	signerAddress = await signer.getAddress();
							set_currentPartner({
								id: signerAddress,
								walletType: 'EMBED_GNOSIS_SAFE'
							});
							set_lastWallet('EMBED_GNOSIS_SAFE');
							connectors.gnosisSafe.connector.activate();
						}
					});
				} catch (error) {
					console.error(error);
					//
				}
			}
		} else if (detectedWalletProvider.type === 'EMBED_COINBASE') {
			connectors.coinbase.connector.activate().then((): void => {
				set_lastWallet('EMBED_COINBASE');
			});
		} else if (detectedWalletProvider.name === 'EMBED_TRUSTWALLET') {
			connectors.metamask.connector.activate().then((): void => {
				set_lastWallet('EMBED_TRUSTWALLET');
			});
		}
	}, [detectedWalletProvider]);

	useClientEffect((): void => {
		if (!isActive && lastWallet !== 'NONE') {
			onConnect(lastWallet);
		}
	}, [isActive]);

	useUpdateEffect((): void => {
		if (account && isActive) {
			getProvider(1).lookupAddress(toAddress(account))
				.then((_ens: string | null): void => {
					set_ens(_ens || '');
					lensProtocolFetcher(`{defaultProfile(request: {ethereumAddress: "${account?.toLowerCase()}"}) {handle}}`)
						.then(({defaultProfile}: {defaultProfile: {handle: string}}): void => {
							set_lensProtocolHandle(defaultProfile?.handle || '');
						});
				});
		}
	}, [account, chainID]);

	/* 💙 - Yearn Finance *********************************************************************
	**	Used to fully disconnect a wallet from the UI. Will reset the state, the ENS and the
	**	lastWallet.
	******************************************************************************************/
	const onDesactivate = useCallback((): void => {
		performBatchedUpdates((): void => {
			set_ens('');
			set_lensProtocolHandle('');
			set_lastWallet('NONE');
			set_isDisconnected(true);
			connector.deactivate?.();
			connector.resetState?.();
		});
		setTimeout((): void => set_isDisconnected(false), 100);
	}, [connector]); // eslint-disable-line react-hooks/exhaustive-deps

	/* 💙 - Yearn Finance *********************************************************************
	**	Used to open the login modal.
	******************************************************************************************/
	const openLoginModal = useCallback((): void => {
		if (isIframe()) {
			//TODO: REFACTOR TO EXPORT FROM HERE
			const params = new Proxy(new URLSearchParams(window.location.search), {
				get: (searchParams, prop): string | null => searchParams.get(prop.toString())
			});

			let	{origin} = params as URLSearchParams & {origin: string};
			if (!origin && window?.location?.ancestorOrigins?.length > 0 ) {
				origin = window.location?.ancestorOrigins[0];
			}
			const	partnerInformation = getPartner(origin || '');

			/* 🔵 - Yearn Finance **************************************************
			**	First, do we have a way to know that we are working with a known
			**	provider (aka Ledger for example).
			**	If we don't know the provider, we will suppose it's a Gnosis Safe
			**	and try to connect.
			**********************************************************************/
			if (partnerInformation.id !== addressZero) {
				const	frameProvider = new IFrameEthereumProvider();
				const	frameWeb3Provider = frameProvider as unknown as Provider; // TODO Are we sure these are equivalent?
				frameWeb3Provider.request = frameProvider.request;
				connectors.eip1193.connector.init(frameWeb3Provider);
				connectors.eip1193.connector.activate();
				set_currentPartner(partnerInformation);
				onConnect(partnerInformation.walletType);
			} else {
				try {
					connectors.gnosisSafe.connector.activate().then(async (): Promise<void> => {
						if (connectors.gnosisSafe.connector.provider) {
							const	web3Provider = new BrowserProvider(connectors.gnosisSafe.connector.provider);
							const	signer = await web3Provider.getSigner();
							const	signerAddress = await signer.getAddress();
							set_currentPartner({
								id: signerAddress,
								walletType: 'EMBED_GNOSIS_SAFE'
							});
							set_lastWallet('EMBED_GNOSIS_SAFE');
							connectors.gnosisSafe.connector.activate();
						}
					});
				} catch (error) {
					console.error(error);
					//
				}
			}
		} else {
			set_isModalLoginOpen(true);
		}
	}, [onConnect, set_lastWallet]);

	/* 💙 - Yearn Finance *********************************************************************
	**	Render the Web3Context with it's parameters.
	**	The parameters will be accessible to the children via the useWeb3 hook.
	******************************************************************************************/
	const	contextValue = useMemo((): TWeb3Context => {
		const	isReallyActive = isActive && (web3Options?.supportedChainID || defaultOptions.supportedChainID || []).includes(Number(chainId || 0));

		return ({
			address: account as TAddress,
			ens: isReallyActive ? ens : '',
			lensProtocolHandle: isReallyActive ? lensProtocolHandle : '',
			isDisconnected,
			isActive: isReallyActive,
			isConnecting,
			hasProvider: !!provider,
			provider: provider as unknown as TWeb3Provider,
			chainID,
			currentPartner,
			onConnect,
			onSwitchChain,
			openLoginModal,
			onDesactivate: onDesactivate,
			options: web3Options,
			walletType: lastWallet
		});
	}, [account, ens, lensProtocolHandle, isDisconnected, isActive, isConnecting, provider, currentPartner, onConnect, onSwitchChain, openLoginModal, onDesactivate, web3Options, chainId, chainID, lastWallet]);

	return (
		<Web3Context.Provider value={contextValue}>
			{children}
			<ModalLogin
				isOpen={isModalLoginOpen}
				onClose={(): void => set_isModalLoginOpen(false)} />
		</Web3Context.Provider>
	);
};

export const useWeb3 = (): TWeb3Context => useContext(Web3Context);
export default useWeb3;
