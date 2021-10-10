import preprocess from 'svelte-preprocess';
import vercel from '@sveltejs/adapter-vercel';
import path from 'path';


/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [preprocess({
		postcss: true
	})],
	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		adapter: vercel(),
		vite: {
			resolve: {
				alias: {
					$lib: path.resolve('./src/lib'),
					$components: path.resolve('./src/components'),
				}
			}
		}
	}
};

export default config;
