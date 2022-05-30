import	React, {ReactElement}			from	'react';
import	{Card, Banner, Button}			from	'@yearn/web-lib/components';
import	VariantSelectors				from	'components/documentation/VariantSelectors';
import	ComponentAPI					from	'components/documentation/ComponentAPI';
import	Highlight						from	'components/documentation/Highlight';
import	CodeExample						from	'components/CodeExample';

const code = `<Banner
	title={'Welcome to banner'}
	primaryButton={<Button>Primary CTA</Button>}
	secondaryButton={<Button variant='outlined'>Secondary CTA</Button>}>
	<div>
		<p>{\`This is a banner component. It can appear on different pages to inform users about anything. There can be multiple banners on a single page. Banners should be shown one by one. This component has controls. There is a cross mark in the top right corner to close one banner. There are arrows in the bottom right corner to switch between banners.\`}</p>
		<p>{\`Also the banner can have CTA as one or two buttons to provide some usefull links.\`}</p>
		<p>{\`The component’s height could be changed to fit text length. Please, be sure you have 24px gaps between outer borders and the whole content inside. And 16px between text and CTA buttons if there are some.\`}</p>
		<br />
		<p>{\`Have a nice day.\`}</p>
	</div>
</Banner>`.trim();

export function BannerComponent(): ReactElement {
	return (
		<div className={'w-full scale-75'}>
			<Banner
				title={'Welcome to banner 3'}
				variant={'split'}
				primaryButton={<Button>{'Primary CTA'}</Button>}
				image={'/mommy-bunny.jpg'}>
				<div>
					<p>{'Have a nice day.'}</p>
				</div>
			</Banner>
		</div>
	);
}

function	BannerComponentDefault(): ReactElement {
	return (
		<Banner
			title={'Welcome to banner'}
			primaryButton={<Button>{'Primary CTA'}</Button>}
			secondaryButton={<Button variant={'outlined'}>{'Secondary CTA'}</Button>}>
			<div>
				<p>{'This is a banner component. It can appear on different pages to inform users about anything. There can be multiple banners on a single page. Banners should be shown one by one. This component has controls. There is a cross mark in the top right corner to close one banner. There are arrows in the bottom right corner to switch between banners.'}</p>
				<p>{'Also the banner can have CTA as one or two buttons to provide some usefull links.'}</p>
				<p>{'The component’s height could be changed to fit text length. Please, be sure you have 24px gaps between outer borders and the whole content inside. And 16px between text and CTA buttons if there are some.'}</p>
				<br />
				<p>{'Have a nice day.'}</p>
			</div>
		</Banner>
	);
}

function	BannerComponentBackground(): ReactElement {
	return (
		<Banner
			className={'text-white'}
			title={'Welcome to banner 4'}
			variant={'background'}
			primaryButton={<Button>{'Primary CTA'}</Button>}
			secondaryButton={<Button variant={'light'}>{'Secondary CTA'}</Button>}
			image={<img src={'https://yfistory.org/static/media/transmission-bkg_bleed__1-25-22_100DPI_cymk_1-25-22.fcf16a4ba7df751345ec.jpg'} className={'object-cover relative w-full h-full'} loading={'eager'} />}>
			<div>
				<p>{'This is a second image banner component. It has an image as a background with a slight black gradient on it to have a contrast with text. Use this type of banner if the image is not a primay content and could be just an accompagnement. Please be careful with the contrast. The text should be readable. The color of the text and controls can be changed according to image color to have a contrast. Also be sure that the image you use doesn’t have many details and is not very motley - again - to have a contrast.'}</p>
				<br />
				<p>{'Have a nice day.'}</p>
			</div>
		</Banner>
	);
}

function	BannerComponentSplit(): ReactElement {
	return (
		<Banner
			title={'Welcome to banner 3'}
			variant={'split'}
			primaryButton={<Button>{'Primary CTA'}</Button>}
			secondaryButton={<Button variant={'outlined'}>{'Secondary CTA'}</Button>}
			image={'/mommy-bunny.jpg'}>
			<div>
				<p>{'This is a image banner component. It has an image on the right side that fills the half of the banner. The hight of the banner should adapt according to image and/or text hight.'}</p>
				<br />
				<p>{'Margin rules are the same as for regular banner'}</p>
				<br />
				<p>{'Have a nice day.'}</p>
			</div>
		</Banner>
	);
}

function	BannerComponentImage(): ReactElement {
	return (
		<Banner
			variant={'image'}
			image={'/goblin-town.jpg'}
			onClick={console.log} />
	);
}

function	VariantLevel(): ReactElement {
	const	[variant, set_variant] = React.useState(0);
	const	variantType = ['default', 'image', 'split', 'background'];

	function	renderBanner(): ReactElement {
		if (variantType[variant] === 'default')
			return (<BannerComponentDefault />);
		if (variantType[variant] === 'image')
			return (<BannerComponentImage />);
		if (variantType[variant] === 'split')
			return (<BannerComponentSplit />);
		if (variantType[variant] === 'background')
			return (<BannerComponentBackground />);
		return (<BannerComponentDefault />);
	}

	return (
		<CodeExample>
			<div className={'w-full scale-90'}>
				{renderBanner()}
			</div>
			<VariantSelectors
				selected={variantType[variant]}
				variants={variantType}
				onChange={(n: number): void => set_variant(n)} />
		</CodeExample>
	);
}

function	DocumentationBanner(): ReactElement {
	return (
		<section aria-label={'some default section'}>
			<Card>
				<h1 className={'mb-2 text-3xl text-typo-primary'}>{'Banner'}</h1>
				<section aria-label={'code-part'}>
					<VariantLevel />
					<Highlight code={code} />
				</section>

				<section aria-label={'description-part'} className={'mt-6'}>
					<h4 className={'mb-1'}>{'Description'}</h4>
					<p className={'mb-2'}>{'The Banner component is used to display some notice. There are 4 variations with image options.'}</p>
					<p className={'mb-4'}>{'Note: the component uses the localStorage to save the user choice, aka once dismissed, the banner with the provided id will no longer be displayed.'}</p>

					<ComponentAPI
						elements={[{
							title: 'variant',
							type: 'default | image | split | background',
							description: 'Indicate the type of banner to display'
						},
						{
							title: 'title?',
							type: 'string',
							description: 'Title displayed on the top of the banner. Not used with image variant'
						},
						{
							title: 'image?',
							type: 'string | ReactElement',
							description: 'Image displayed at banner. If  its an URL then it applies default image styling. If it\'s an <img /> component the default image styiling is overrided. Not used with default variant.'
						},
						{
							title: 'children?',
							type: 'string',
							description: 'Text displayed. Not used with image variant.'
						},
						{
							title: 'primaryButton?',
							type: 'ReactElement',
							description: 'Button to display as primary action. Not used with image variant.'
						},
						{
							title: 'secondaryButton?',
							type: 'ReactElement',
							description: 'Button to display as secondary action. Not used with image variant.'
						},
						{
							title: 'onClick?',
							type: 'string',
							description: 'Action to trigger when clicked and using the image variant.'
						},
						{
							title: 'canClose?',
							type: 'boolean',
							description: 'Can the banner be closed? Default is set to true. If false, the banner will always render and the cross will be hidden.'
						},
						{
							title: 'onClose?',
							type: 'function',
							description: 'Action to perform onClose. By default, this is handled by the component itself.'
						},
						{
							title: 'children',
							type: 'ReactElement | ReactElement[]',
							description: 'Worth a mention: can be a single ReactElement or an array of ReactElement. If it is an array, this will enable the multi-page banner.'
						}, {
							title: 'className',
							type: 'string',
							description: 'Custom className to provide to alter the style of the Banner.'
						}]} />
				</section>
			</Card>
		</section>
	);
}

export default DocumentationBanner;