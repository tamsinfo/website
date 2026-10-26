import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionProvider, useMotion } from "./motion/MotionProvider";
import { ExperienceProvider } from "./experience/Experience";
import { Cursor, InspectOverlay, Preloader } from "./experience/ui";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Illustration } from "./illustrations";
import Home from "./pages/Home";

const DetailPage = lazy(() => import("./pages/DetailPage"));
const HubPage = lazy(() => import("./pages/HubPage"));
const About = lazy(() => import("./pages/About"));
const Careers = lazy(() => import("./pages/Careers"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const Brand = lazy(() => import("./pages/Brand"));
const Legal = lazy(() => import("./pages/Legal"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const NotFound = lazy(() => import("./pages/NotFound"));

/** Route changes: jump to top (or the hash target), refresh ScrollTrigger. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  const { lenis } = useMotion();
  useEffect(() => {
    const go = () => {
      const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
      if (target) {
        if (lenis) lenis.scrollTo(target, { offset: -80, immediate: true, force: true });
        else target.scrollIntoView();
      } else if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
      else window.scrollTo(0, 0);
      ScrollTrigger.refresh();
    };
    if (!hash) return;
    const t = window.setTimeout(go, 300);
    return () => window.clearTimeout(t);
  }, [pathname, hash, lenis]);
  return null;
}

/** Magnetic buttons: fine pointers only, never under reduced motion. */
function Magnetic() {
  const { reduced } = useMotion();
  useEffect(() => {
    if (reduced || !matchMedia("(pointer: fine)").matches) return;
    const setters = new WeakMap<HTMLElement, { x: (v: number) => void; y: (v: number) => void }>();
    let current: HTMLElement | null = null;
    const get = (el: HTMLElement) => {
      let s = setters.get(el);
      if (!s) {
        s = { x: gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" }), y: gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" }) };
        setters.set(el, s);
      }
      return s;
    };
    const onMove = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-magnetic]");
      if (current && current !== el) {
        get(current).x(0);
        get(current).y(0);
      }
      current = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const s = get(el);
      s.x((e.clientX - r.left - r.width / 2) * 0.18);
      s.y((e.clientY - r.top - r.height / 2) * 0.28);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, [reduced]);
  return null;
}

function RouteLoading() {
  return (
    <div className="route-loading" aria-busy="true">
      <Illustration id="loading" decorative />
      <span className="sr-only">Loading</span>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  return (
    <div className="route" key={location.pathname}>
      <Suspense fallback={<RouteLoading />}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<HubPage kind="services" />} />
          <Route path="/solutions" element={<HubPage kind="solutions" />} />
          <Route path="/products" element={<HubPage kind="products" />} />
          <Route path="/industries" element={<HubPage kind="industries" />} />
          <Route path="/services/:slug" element={<DetailPage kind="services" />} />
          <Route path="/solutions/:slug" element={<DetailPage kind="solutions" />} />
          <Route path="/products/:slug" element={<DetailPage kind="products" />} />
          <Route path="/industries/:slug" element={<DetailPage kind="industries" />} />
          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/brand" element={<Brand />} />
          <Route path="/privacy" element={<Legal kind="privacy" />} />
          <Route path="/terms" element={<Legal kind="terms" />} />
          <Route path="/cookies" element={<Legal kind="cookies" />} />
          <Route path="/sitemap" element={<Sitemap />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <MotionProvider>
      <ExperienceProvider>
        <ScrollManager />
        <Magnetic />
        <Preloader />
        <Header />
        <main id="main" tabIndex={-1}>
          <AppRoutes />
        </main>
        <Footer />
        <InspectOverlay />
        <Cursor />
      </ExperienceProvider>
    </MotionProvider>
  );
}
