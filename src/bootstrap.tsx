import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { initializeTheme } from '@r01al/mfe-workforce-common-client';
import 'bulma/css/bulma.min.css';
import '@r01al/mfe-workforce-common-client/styles.css';
import './shell.css';
import Shell from './Shell';

initializeTheme();

const container = document.getElementById('root');

if (!container) throw new Error('Root element was not found.');

createRoot(container).render(
	<StrictMode>
		<BrowserRouter>
			<Shell />
		</BrowserRouter>
	</StrictMode>,
);
