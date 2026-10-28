import { createRouter } from "sv-router";
import Home from "./routes/Home.svelte";
import { afterLoad, beforeLoad } from "./lib/transition";

export const { route } = createRouter({
  "/": Home,
  "/services": {
    "/": () => import("./routes/Services.svelte"),
    "/:slug": () => import("./routes/ServiceDetail.svelte"),
  },
  "/solutions": {
    "/": () => import("./routes/Solutions.svelte"),
    "/:slug": () => import("./routes/SolutionDetail.svelte"),
  },
  "/products": {
    "/": () => import("./routes/Products.svelte"),
    "/:slug": () => import("./routes/ProductDetail.svelte"),
  },
  "/industries": {
    "/": () => import("./routes/Industries.svelte"),
    "/:slug": () => import("./routes/IndustryDetail.svelte"),
  },
  "/about": () => import("./routes/About.svelte"),
  "/contact": () => import("./routes/Contact.svelte"),
  "*notfound": () => import("./routes/NotFound.svelte"),
  hooks: { beforeLoad, afterLoad },
});
