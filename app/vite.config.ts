import { sveltekit } from '@sveltejs/kit/vite';
import basicSsl from '@vitejs/plugin-basic-ssl'
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [basicSsl(), sveltekit()]
};

export default config;
