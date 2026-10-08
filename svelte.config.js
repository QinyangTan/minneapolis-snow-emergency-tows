import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// A GitHub Pages *project* site is served below /<repo-name>; local and
// root-domain previews use ''. This only changes static asset URLs; publishing
// requires the team's separate approval and GitHub Pages configuration.
const base = process.env.PAGES_BASE_PATH || '';
if (base && (!base.startsWith('/') || base.endsWith('/') || base.includes('..'))) {
  throw new Error('PAGES_BASE_PATH must be a path like /minneapolis-snow-emergency-tows');
}
export default {
  preprocess: vitePreprocess(),
  kit: { paths: { base }, adapter: adapter({ pages: 'build', assets: 'build', fallback: undefined }) }
};
