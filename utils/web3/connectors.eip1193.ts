import {Connector} from '@web3-react/types';

import type {Actions, Provider, ProviderConnectInfo, ProviderRpcError} from '@web3-react/types';

function parseChainId(chainId: string | number): number {
	return typeof chainId === 'string' ? Number.parseInt(chainId, 16) : chainId;
}

export class EIP1193 extends Connector {
	/** {@inheritdoc Connector.provider} */
	declare provider: Provider | undefined;

	/**
	 * @param provider - An EIP-1193 ({@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md}) provider.
	 * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
	 */
	constructor({actions, provider}: {actions: Actions, provider?: Provider}) {
		super(actions);
		this.provider = provider;
	}

	public init(provider: Provider): void {
		this.provider = provider;
		this.provider.on('connect', ({chainId}: ProviderConnectInfo): void => {
			this.actions.update({chainId: parseChainId(chainId)});
		});

		this.provider.on('disconnect', (error: ProviderRpcError): void => {
			this.onError?.(error);
		});

		this.provider.on('close', (error: ProviderRpcError): void => {
			this.onError?.(error);
		});

		this.provider.on('chainChanged', (chainId: string): void => {
			this.actions.update({chainId: parseChainId(chainId)});
		});

		this.provider.on('accountsChanged', (accounts: string[]): void => {
			this.actions.update({accounts});
		});
	}

	/** {@inheritdoc Connector.connectEagerly} */
	public async connectEagerly(): Promise<void> {
		const cancelActivation = this.actions.startActivation();

		return Promise.all([
			this.provider?.request({method: 'eth_chainId'}) as Promise<string>,
			this.provider?.request({method: 'eth_requestAccounts'})
				.catch(async (): Promise<unknown> => this.provider?.request({method: 'eth_accounts'})) as Promise<string[]>
		]).then(([chainId, accounts]): void => {
			this.actions.update({chainId: parseChainId(chainId), accounts});
		}).catch((error): void => {
			console.debug('Could not connect eagerly', error);
			cancelActivation();
		});
	}

	/** {@inheritdoc Connector.activate} */
	public async activate(): Promise<void> {
		const cancelActivation = this.actions.startActivation();

		return Promise.all([
			this.provider?.request({method: 'eth_chainId'}) as Promise<string>,
			this.provider?.request({method: 'eth_accounts'}) as Promise<string[]>
		]).then(([chainId, accounts]): void => {
			this.actions.update({chainId: parseChainId(chainId), accounts});
		}).catch((error: Error): void => {
			this.onError?.(error);
			cancelActivation();
		});
	}
}
