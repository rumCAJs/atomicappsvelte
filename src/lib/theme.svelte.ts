const THEME_KEY = 'theme';

type Theme = 'light' | 'dark';

class ThemeStore {
	current = $state<Theme>('dark');

	constructor() {
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem(THEME_KEY) as Theme | null;
			this.current = stored ?? 'dark';
			this.applyTheme();
		}
	}

	toggle() {
		this.current = this.current === 'dark' ? 'light' : 'dark';
		this.applyTheme();
		this.persist();
	}

	setTheme(theme: Theme) {
		this.current = theme;
		this.applyTheme();
		this.persist();
	}

	private applyTheme() {
		if (typeof document === 'undefined') return;

		const root = document.documentElement;
		if (this.current === 'dark') {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
	}

	private persist() {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem(THEME_KEY, this.current);
	}
}

export const theme = new ThemeStore();

