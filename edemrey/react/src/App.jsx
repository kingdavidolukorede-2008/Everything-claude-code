/* ==========================================================================
   Edmery Homes and Properties — React app shell
   Content: ../../static/assets/data/content.js (shared with the static site)
   Routing: hash based. "#/property/<id>" shows a listing, any other hash is a
   section anchor on the home view.
   ========================================================================== */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NAV } from "@data/content.js";
import { getProperty } from "@data/lib.js";
import { useHashRoute } from "./hooks/useHashRoute.js";
import { useReveal } from "./hooks/useReveal.js";
import { announce, reducedMotion } from "./util.js";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import TrustBar from "./components/TrustBar.jsx";
import Properties from "./components/Properties.jsx";
import { About, HowItWorks, Services, WhyUs } from "./components/Sections.jsx";
import Testimonials from "./components/Testimonials.jsx";
import Contact from "./components/Contact.jsx";
import Footer, { MobileContactBar } from "./components/Footer.jsx";
import PropertyDetail from "./components/PropertyDetail.jsx";

const DEFAULT_FILTERS = { category: "all", area: "", type: "", budget: "any" };
const HOME_TITLE = document.title;

export default function App() {
  const hash = useHashRoute();
  const match = hash.match(/^#\/property\/([\w-]+)/);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [active, setActive] = useState("home");
  const [bookInterest, setBookInterest] = useState("");
  const homeRef = useRef(null);
  const homeScroll = useRef(0);
  const wasDetail = useRef(false);

  useReveal(homeRef, [!!match]);

  // remember scroll when leaving home; restore or jump to anchor on return
  useLayoutEffect(() => {
    if (match) { if (!wasDetail.current) homeScroll.current = scrollY; wasDetail.current = true; return; }
    if (wasDetail.current) {
      document.title = HOME_TITLE;
      const t = hash && document.getElementById(hash.slice(1));
      if (t) t.scrollIntoView({ behavior: "instant" }); else scrollTo({ top: homeScroll.current, behavior: "instant" });
    }
    wasDetail.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash]);

  // active nav link = section in the middle of the viewport
  useEffect(() => {
    if (match) { setActive(""); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    NAV.forEach((n) => { const s = document.getElementById(n.id); if (s) io.observe(s); });
    return () => io.disconnect();
  }, [match]);

  const onSearch = (v) => {
    const next = { ...filters, ...v, category: "all" };
    setFilters(next);
    document.getElementById("properties").scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth" });
    setTimeout(() => announce("Search results updated"), 100);
  };
  const clear = () => { setFilters(DEFAULT_FILTERS); document.getElementById("search")?.reset(); announce("Filters cleared"); };

  return (
    <>
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById("main").focus(); }}>Skip to content</a>
      <Navbar solid={!!match} active={active} onBook={() => setBookInterest("Buying a property")} />
      <main id="main" tabIndex={-1}>
        {match ? <PropertyDetail p={getProperty(match[1])} /> : (
          <div ref={homeRef}>
            <Hero onSearch={onSearch} />
            <TrustBar />
            <Properties filters={filters} setFilters={setFilters} onClear={clear} />
            <Services />
            <WhyUs />
            <HowItWorks />
            <Testimonials />
            <About />
            <Contact defaultInterest={bookInterest} />
          </div>
        )}
      </main>
      <Footer />
      <MobileContactBar />
      <div className="sr-only" aria-live="polite" data-announce />
    </>
  );
}
