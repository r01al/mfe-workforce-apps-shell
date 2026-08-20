import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, LoaderCircle } from 'lucide-react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { loadRemoteComponent } from './federation';

const Navigation = lazy(loadRemoteComponent('navigation', './Navigation'));
const Header = lazy(loadRemoteComponent('header', './Header'));
const Overview = lazy(loadRemoteComponent('overview', './Overview'));
const Calendar = lazy(loadRemoteComponent('calendar', './Calendar'));
const Workers = lazy(loadRemoteComponent('workers', './Workers'));
const Settings = lazy(loadRemoteComponent('settings', './Settings'));

function Loading({ compact = false }: { compact?: boolean }) {
	return (
		<div className={compact ? 'mfe-loading mfe-loading--compact' : 'mfe-loading'} role="status">
			<LoaderCircle size={18} className="spin" aria-hidden="true" />
			{!compact && <span>Loading workspace…</span>}
		</div>
	);
}

interface BoundaryState { failed: boolean }

class RemoteBoundary extends Component<{ children: ReactNode; label: string }, BoundaryState> {
	state: BoundaryState = { failed: false };

	static getDerivedStateFromError(): BoundaryState {
		return { failed: true };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error(`Failed to render ${this.props.label}`, error, info);
	}

	render() {
		if (this.state.failed) {
			return (
				<div className="mfe-error" role="alert">
					<AlertTriangle size={20} aria-hidden="true" />
					<div>
						<strong>{this.props.label} is unavailable</strong>
						<p>Check its remote URL, then refresh this page.</p>
					</div>
				</div>
			);
		}
		return this.props.children;
	}
}

function RemotePage({ children, label }: { children: ReactNode; label: string }) {
	return (
		<RemoteBoundary label={label}>
			<Suspense fallback={<Loading />}>{children}</Suspense>
		</RemoteBoundary>
	);
}

export default function Shell() {
	return (
		<div className="app-shell">
			<aside className="app-sidebar">
				<RemoteBoundary label="Navigation">
					<Suspense fallback={<Loading compact />}><Navigation /></Suspense>
				</RemoteBoundary>
			</aside>

			<div className="app-workspace">
				<header className="app-header">
					<RemoteBoundary label="Header">
						<Suspense fallback={<Loading compact />}><Header /></Suspense>
					</RemoteBoundary>
				</header>

				<main className="app-main">
					<Routes>
						<Route path="/" element={<RemotePage label="Overview"><Overview /></RemotePage>} />
						<Route path="/calendar" element={<RemotePage label="Calendar"><Calendar /></RemotePage>} />
						<Route path="/workers/*" element={<RemotePage label="Workers"><Workers /></RemotePage>} />
						<Route path="/settings" element={<RemotePage label="Settings"><Settings /></RemotePage>} />
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</main>
			</div>
		</div>
	);
}
