import { mount } from "svelte";
import "@fontsource-variable/mona-sans/wdth.css";
import "@fontsource-variable/ibm-plex-sans/wght.css";
import "@fontsource/ibm-plex-mono/400.css";
import "./app.css";
import App from "./App.svelte";

if ("scrollRestoration" in history) history.scrollRestoration = "manual";

const app = mount(App, {
  target: document.getElementById("app")!,
});

export default app;
