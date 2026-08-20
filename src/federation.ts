import type { ComponentType } from 'react';

export type RemoteName = 'calendar' | 'header' | 'navigation' | 'overview' | 'settings' | 'workers';

interface RemoteContainer {
	get(module: string): Promise<() => unknown>;
	init(shareScope: unknown): Promise<void> | void;
}

interface RemoteComponentModule {
	default: ComponentType;
}

declare const __MFE_DEFAULT_REMOTES__: Readonly<Record<RemoteName, string>>;
declare const __webpack_init_sharing__: (scope: string) => Promise<void>;
declare const __webpack_share_scopes__: { default: unknown };

declare global {
	interface Window {
		__MFE_REMOTES__?: Partial<Record<RemoteName, string>>;
		calendarMfe?: RemoteContainer;
		headerMfe?: RemoteContainer;
		navigationMfe?: RemoteContainer;
		overviewMfe?: RemoteContainer;
		settingsMfe?: RemoteContainer;
		workersMfe?: RemoteContainer;
	}
}

const containerNames = {
	calendar: 'calendarMfe',
	header: 'headerMfe',
	navigation: 'navigationMfe',
	overview: 'overviewMfe',
	settings: 'settingsMfe',
	workers: 'workersMfe',
} as const satisfies Record<RemoteName, keyof Window>;

const containerLoads = new Map<RemoteName, Promise<RemoteContainer>>();
const containerInitializations = new WeakMap<RemoteContainer, Promise<void>>();

function getContainer(remote: RemoteName): RemoteContainer | undefined {
	return window[containerNames[remote]];
}

function getRemoteUrl(remote: RemoteName): string {
	const url = window.__MFE_REMOTES__?.[remote] ?? __MFE_DEFAULT_REMOTES__[remote];
	if (!url) throw new Error(`No remote URL is configured for ${remote}`);
	return url;
}

function loadContainer(remote: RemoteName): Promise<RemoteContainer> {
	const loadedContainer = getContainer(remote);
	if (loadedContainer) return Promise.resolve(loadedContainer);

	const pendingLoad = containerLoads.get(remote);
	if (pendingLoad) return pendingLoad;

	const url = getRemoteUrl(remote);
	const load = new Promise<RemoteContainer>((resolve, reject) => {
		const selector = `script[data-mfe="${remote}"]`;
		const existingScript = document.querySelector<HTMLScriptElement>(selector);
		const script = existingScript ?? document.createElement('script');

		const handleLoad = (): void => {
			script.dataset.mfeState = 'loaded';
			const container = getContainer(remote);
			if (container) resolve(container);
			else reject(new Error(`Remote ${remote} did not register its container`));
		};

		const handleError = (): void => {
			script.dataset.mfeState = 'failed';
			reject(new Error(`Unable to load ${remote} from ${url}`));
		};

		if (existingScript?.dataset.mfeState === 'loaded') {
			handleLoad();
			return;
		}

		script.addEventListener('load', handleLoad, { once: true });
		script.addEventListener('error', handleError, { once: true });

		if (!existingScript) {
			script.src = url;
			script.async = true;
			script.dataset.mfe = remote;
			script.dataset.mfeState = 'loading';
			document.head.appendChild(script);
		}
	});

	containerLoads.set(remote, load);
	void load.catch(() => {
		if (containerLoads.get(remote) === load) containerLoads.delete(remote);
	});
	return load;
}

function initializeContainer(container: RemoteContainer): Promise<void> {
	const pendingInitialization = containerInitializations.get(container);
	if (pendingInitialization) return pendingInitialization;

	const initialization = (async () => {
		await __webpack_init_sharing__('default');
		await container.init(__webpack_share_scopes__.default);
	})();
	containerInitializations.set(container, initialization);
	return initialization;
}

export function loadRemoteComponent(
	remote: RemoteName,
	exposedModule: string,
): () => Promise<RemoteComponentModule> {
	return async () => {
		const container = await loadContainer(remote);
		await initializeContainer(container);
		const factory = await container.get(exposedModule);
		const remoteModule = factory() as Partial<RemoteComponentModule>;
		if (!remoteModule.default) throw new Error(`${remote}/${exposedModule} has no default component export`);
		return remoteModule as RemoteComponentModule;
	};
}
