import { mount } from 'svelte';
import './app.css';

// Bundled fonts — loaded here so sheet CSS (which only references the family
// names) always has identical metrics, in preview and in print.
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import '@fontsource/karla/400.css';
import '@fontsource/karla/700.css';
import '@fontsource/karla/800.css';
import '@fontsource/patrick-hand/400.css';

import App from './App.svelte';

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;
