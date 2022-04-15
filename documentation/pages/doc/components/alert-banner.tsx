import	React, {ReactElement}		from	'react';
import	{Card, AlertBanner}			from	'@yearn/web-lib/components';
import	VariantSelectors			from	'components/documentation/VariantSelectors';
import	ComponentAPI				from	'components/documentation/ComponentAPI';
import	Highlight					from	'components/documentation/Highlight';

const code = `
import	React			from	'react';
import	{AlertBanner}	from	'@yearn/web-lib/components';

export default function	App(): React.ReactElement {
	return (
		<AlertBanner
			id={'someID'}
			title={'Spend your time wisely'}
			level={'info'}
			maxHeight={'max-h-[600px] md:max-h-[300px]'}>
			<div>
				<p>{'Yearn Vaults are a way to use technology to help manage your holdings. You choose the strategy that best suits you, deposit into that vault, and Yearn tech helps maximize yield through shifting capital, auto-compounding, and rebalancing.'}</p>
				<p className={'block mt-4'}>{'Custody, and responsibility, for your holdings remains yours.'}</p>
				<p className={'block mt-4'}>{'You can withdraw anytime.'}</p>
			</div>
		</AlertBanner>
	);
}`.trim();

export function	AlertBannerComponent(): ReactElement {
	const	[refresher, set_refresher] = React.useState(0);
	const	resetStorage = (): void => {
		window.localStorage.setItem('someID-info', JSON.stringify(true));
		setTimeout((): void => set_refresher(refresher + 1), 100);
	};
	return (
		<div className={'relative w-full flex-center'}>
			<div className={'z-10'}>
				<AlertBanner
					key={`someID-info${refresher}`}
					id={'someID-info'}
					title={'Spend your time wisely'}
					level={'info'}
					maxHeight={'max-h-[600px] md:max-h-[300px] alertBanner--wrapper'}>
					<div>
						<p>{'Yearn Vaults are a way to use technology to help manage your holdings.'}</p>
					</div>
				</AlertBanner>
			</div>
			<div className={'absolute z-0'}>
				<div onClick={resetStorage} className={'flex px-2 h-8 font-bold rounded-lg transition-colors cursor-pointer bg-surface flex-center hover:bg-surface-variant'}>{'Reset'}</div>
			</div>
		</div>
	);
}

function	VariantLevel(): ReactElement {
	const	[variant, set_variant] = React.useState(0);
	const	[refresher, set_refresher] = React.useState(0);
	const	variantType = ['info', 'warning', 'error', 'critical', 'multi'];
	const	resetStorage = (): void => {
		window.localStorage.setItem(`someID-${variantType[variant]}`, JSON.stringify(true));
		setTimeout((): void => set_refresher(refresher + 1), 100);
	};

	function	renderAlertBanner(): ReactElement {
		if (variant === 4) {
			return (
				<AlertBanner
					key={`someID-multi${refresher}`}
					id={'someID-multi'}
					title={'Spend your time wisely (multi)'}
					maxHeight={'max-h-[600px] md:max-h-[300px] alertBanner--wrapper'}>
					<div>
						<p>{'Yearn Vaults are a way to use technology to help manage your holdings. You choose the strategy that best suits you, deposit into that vault, and Yearn tech helps maximize yield through shifting capital, auto-compounding, and rebalancing.'}</p>
						<p className={'block mt-4'}>{'Custody, and responsibility, for your holdings remains yours.'}</p>
						<p className={'block mt-4'}>{'You can withdraw anytime.'}</p>
					</div>
					<div>
						<p>{'And we may have a lot of pages!'}</p>
						<p className={'block mt-4'}>{'Quia et autem officiis. Nemo ut commodi accusamus qui. Quo sit eum amet aut dolore. Quo consectetur enim voluptatem repudiandae provident et.'}</p>
						<p className={'block mt-4'}>{'Ut est velit dolor ut. Laudantium cum et enim consequatur rem. Architecto sed ducimus dolores et in neque et.'}</p>
					</div>
					<div>
						<p>{'Exercitationem ab sed dolor dolorum omnis. Qui laudantium voluptatem possimus excepturi aliquid vel necessitatibus et. Iste similique illum cumque mollitia aut voluptatibus quia nam. Nemo atque vel vero est. Perspiciatis officiis veritatis animi libero.'}</p>
						<p className={'block mt-4'}>{'Quis repellendus est pariatur est eos et autem qui. '}</p>
					</div>
				</AlertBanner>
			);
		}
		return (
			<AlertBanner
				key={`someID-${variantType[variant]}${refresher}`}
				id={`someID-${variantType[variant]}`}
				title={`Spend your time wisely (${variantType[variant]})`}
				level={variantType[variant]}
				maxHeight={'max-h-[600px] md:max-h-[300px] alertBanner--wrapper'}>
				<div>
					<p>{'Yearn Vaults are a way to use technology to help manage your holdings. You choose the strategy that best suits you, deposit into that vault, and Yearn tech helps maximize yield through shifting capital, auto-compounding, and rebalancing.'}</p>
					<p className={'block mt-4'}>{'Custody, and responsibility, for your holdings remains yours.'}</p>
					<p className={'block mt-4'}>{'You can withdraw anytime.'}</p>
				</div>
			</AlertBanner>
		);
	}

	return (
		<div className={'box-gradient-default'}>
			<div className={'w-3/4'}>
				{renderAlertBanner()}
			</div>
			<VariantSelectors
				selected={variantType[variant]}
				variants={variantType}
				onChange={(n: number): void => set_variant(n)} />
			<div className={'absolute right-4 bottom-4'}>
				<div onClick={resetStorage} className={'flex px-2 h-8 font-bold rounded-lg transition-colors cursor-pointer bg-surface flex-center hover:bg-surface-variant'}>{'Reset'}</div>
			</div>
		</div>
	);
}

function	DocumentationAlertBanner(): ReactElement {
	return (
		<section aria-label={'some default section'}>
			<Card>
				<h1 className={'mb-2 text-3xl text-typo-primary'}>{'AlertBanner'}</h1>
				<section aria-label={'code-part'}>
					<VariantLevel />
					<Highlight code={code} />
				</section>

				<section aria-label={'description-part'} className={'mt-6'}>
					<h4 className={'mb-1'}>{'Description'}</h4>
					<p className={'mb-2'}>{'The Alert Banner component is used to display some notice. A few levels are available, info, warning, error and critical and multiple pages could be used.'}</p>
					<p className={'mb-4'}>{'Note: the component uses the localStorage to save the user choice, aka once dismissed, the alert with the provided id will no longer be displayed.'}</p>

					<ComponentAPI
						elements={[{
							title: 'id',
							type: 'string',
							description: 'Unique string to identify the alert in the local storage'
						},
						{
							title: 'level',
							type: 'info | warning | error | critical',
							description: 'Indicate the type of banner to display, aka mostly the colors. Default is set to info'
						},
						{
							title: 'title',
							type: 'string',
							description: 'Title to use for this banner. The title is a h4 title.'
						},
						{
							title: 'maxHeight?',
							type: 'string',
							description: 'Special variable to use as className. In pure CSS, it is impossible to correctly animate height, we need to animate max-height. This allow us to customize the max-height and have a correct transition on banner close.'
						},
						{
							title: 'children',
							type: 'ReactElement | ReactElement[]',
							description: 'Worth a mention: can be a single ReactElement or an array of ReactElement. If it is an array, this will enable the multi-page banner.'
						}]} />
				</section>
			</Card>
		</section>
	);
}

export default DocumentationAlertBanner;
