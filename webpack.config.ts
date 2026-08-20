import { createHostConfig, type BuildArguments } from '@r01al/mfe-workforce-common-server/build';
const appDirectory = process.cwd();

export default (environment: Record<string, unknown>, argv: BuildArguments) => createHostConfig({
	appDirectory,
	remotes: {
		navigation: { port: 3001 },
		header: { port: 3002 },
		overview: { port: 3003 },
		calendar: { port: 3004 },
		workers: { port: 3005 },
		settings: { port: 3006 },
	},
}, environment, argv);
