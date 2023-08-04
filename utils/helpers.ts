import {yToast} from '@yearn-finance/web-lib/components/yToast';

/* 🔵 - Yearn Finance ******************************************************
** Yearn Meta uses some markdown for some rich content. Instead of using
** a md parser and add some heavy dependencies, just use regex to replace
** the strings to some class and inject that to the code.
**************************************************************************/
export function	parseMarkdown(markdownText: string): string {
	const htmlText = markdownText
		.replace(/\[(.*?)\]\((.*?)\)/gim, "<a class='link' target='_blank' href='$2'>$1</a>")
		.replace(/~~(.*?)~~/gim, "<span class='line-through'>$1</span>")
		.replace(/\*\*(.*?)\*\*/gim, "<span class='font-bold'>$1</span>")
		;

	return htmlText.trim();
}

/* 🔵 - Yearn Finance ******************************************************
** We use the clipboard API in order to copy some data to the user's
** clipboard.
** A toast is displayed to inform the user that the address has been
** copied.
**************************************************************************/
export function	copyToClipboard(value: string): void {
	const {toast} = yToast();
	navigator.clipboard.writeText(value);
	toast({content: 'Copied to clipboard!', type: 'info'});
}

/* 🔵 - Yearn Finance ******************************************************
** Used to slugify a string.
** Src: https://gist.github.com/mathewbyrne/1280286
**************************************************************************/
export function slugify(text: string): string {
	return text.toString().toLowerCase()
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(/[^\w-]+/g, '') // Remove all non-word chars
		.replace(/--+/g, '-') // Replace multiple - with single -
		.replace(/^-+/, '') // Trim - from start of text
		.replace(/-+$/, ''); // Trim - from end of text
}

/* 🔵 - Yearn Finance ******************************************************
** Detect is we are running from an Iframe
**************************************************************************/
export function	isIframe(): boolean {
	if (typeof(window) === 'undefined') {
		return false;
	}
	if ((window !== window.top) || (window.top !== window.self) || ((document?.location?.ancestorOrigins || []).length !== 0)) {
		return true;
	}
	return false;
}
