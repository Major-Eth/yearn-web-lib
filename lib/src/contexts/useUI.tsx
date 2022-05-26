import	React, {createContext, ReactElement}	from	'react';
import	toast, {Toaster}						from	'react-hot-toast';
import	{useLocalStorage}						from	'../hooks/useLocalStorage';
import	{useClientEffect}						from	'../hooks/useClientEffect';
import type * as useUITypes						from	'./useUI.d';

const	defaultOptions: useUITypes.TUIOptions = {
	shouldUseDefaultToaster: true,
	shouldUseThemes: true
}

const	UI = createContext<useUITypes.TUIContext>({theme: '', switchTheme: (): void => undefined, toast});
export const UIContextApp = ({children, options = defaultOptions}: {
	children: ReactElement,
	options?: useUITypes.TUIOptions
}): ReactElement => {
	const	userPrefersColorScheme = React.useRef<useUITypes.TPossibleThemes>();
	const	[themeFromLs, set_themeFromLs] = useLocalStorage('theme', 'system-prefs');
	const	[theme, set_theme] = React.useState(themeFromLs) as [string, (value: string) => void];

	const switchTheme = React.useCallback((): void => {
		if (options.shouldUseThemes)
			set_theme(theme === 'light' ? 'dark' : 'light');
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [theme]);

	function	listenToThemeChange(event: MediaQueryListEvent) {
		userPrefersColorScheme.current = event.matches ? 'dark' : 'light';
	}

	useClientEffect((): void => {
		if (options.shouldUseThemes) {
			set_theme(themeFromLs as string);
		} else {
			set_theme('light');
		}
	}, [themeFromLs]);

	/* 🔵 - Yearn Finance ******************************************************
	** Once we are on the user's device, detect the user's preferes color
	** scheme and set the theme variable to it. This will allow us to have a 
	** better control on the theme switch
	**************************************************************************/
	useClientEffect(() => {
		if (!options.shouldUseThemes) {
			return;
		}
		const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		darkModeMediaQuery.addEventListener('change', listenToThemeChange)
		if (darkModeMediaQuery.matches) {
			if (themeFromLs === 'dark') {
				userPrefersColorScheme.current = 'dark';
				set_theme('dark');
			}
		} else {
			if (themeFromLs === 'light') {
				userPrefersColorScheme.current = 'light';
				set_theme('light');
			}
		}
		return () => darkModeMediaQuery.removeEventListener('change', listenToThemeChange);
	}, []);

	/* 🔵 - Yearn Finance ******************************************************
	** If the theme changes, we will update our document body to add the
	** data-theme property. This property can be used to add more theme than
	** the regular light/dark pair.
	** if the selected theme matches the user's preference, clear this value.
	**************************************************************************/
	useClientEffect((): void => {
		if (!options.shouldUseThemes) {
			return;
		}
		if (theme === userPrefersColorScheme.current) {
			document.body.dataset.theme = 'system-prefs';
			set_themeFromLs(theme);
		} else if (theme === 'light') {
			document.body.dataset.theme = 'light';
			set_themeFromLs('light');
		} else if (theme === 'dark') {
			document.body.dataset.theme = 'dark';
			set_themeFromLs('dark');
		}
	}, [theme]);

	return (
		<UI.Provider value={{theme, switchTheme, toast}}>
			{options.shouldUseDefaultToaster ? <Toaster
				position={'bottom-right'}
				containerClassName={'!z-[1000000]'}
				containerStyle={{zIndex: 1000000}}
				toastOptions={{
					className: 'text-sm text-typo-primary',
					style: {borderRadius: '0.5rem'}
				}} /> : null}
			{children}
		</UI.Provider>
	);
};

export const useUI = (): useUITypes.TUIContext => React.useContext(UI);
export default useUI;