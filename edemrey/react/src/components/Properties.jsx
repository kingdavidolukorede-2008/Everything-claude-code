import { useRef } from "react";
import { BUDGETS, CATEGORIES, PROPERTIES } from "@data/content.js";
import { filterProperties } from "@data/lib.js";
import { useReveal } from "../hooks/useReveal.js";
import PropertyCard from "./PropertyCard.jsx";

/** Featured listings: category chips + results of the hero search. */
export default function Properties({ filters, setFilters, onClear }) {
  const list = filterProperties(PROPERTIES.filter((p) => p.featured), filters);
  const gridRef = useRef(null);
  useReveal(gridRef, [list.map((p) => p.id).join()]);

  const count = (c) => PROPERTIES.filter((p) => c === "all" || p.category === c).length;
  const searching = filters.area || filters.type || filters.budget !== "any";
  const summary = [filters.type, filters.area && `in ${filters.area}`, filters.budget !== "any" && BUDGETS.find((b) => b.id === filters.budget)?.label].filter(Boolean).join(" · ");

  return (
    <section className="section" id="properties" aria-labelledby="props-title">
      <div className="container">
        <div className="section-head section-head--split">
          <div>
            <p className="eyebrow">Featured properties</p>
            <h2 id="props-title">Handpicked listings across Lagos</h2>
            <p>From family homes in Lekki to warehouses on the Lekki–Epe corridor, every listing is verified by our team.</p>
          </div>
          <div className="chips" role="group" aria-label="Filter by category">
            {["all", ...CATEGORIES].map((c) => (
              <button key={c} className="chip" type="button" aria-pressed={filters.category === c} onClick={() => setFilters({ ...filters, category: c })}>
                {c === "all" ? "All" : c}<span className="chip__count">{count(c)}</span>
              </button>
            ))}
          </div>
        </div>
        {searching && (
          <div className="results-bar">
            <span><strong>{list.length}</strong> {list.length === 1 ? "property" : "properties"} · {summary}</span>
            <button type="button" onClick={onClear}>Clear search</button>
          </div>
        )}
        <div className="grid-props" ref={gridRef} aria-live="polite">
          {list.length ? list.map((p, i) => <PropertyCard key={p.id} p={p} i={i} />) : (
            <div className="empty" style={{ gridColumn: "1/-1" }}>
              <h3>No matching properties right now</h3>
              <p>New listings arrive every week and many never reach the internet. Tell us what you need.</p>
              <div style={{ display: "flex", gap: ".75rem", justifyContent: "center", flexWrap: "wrap" }}>
                <button className="btn btn--outline" type="button" onClick={onClear}>Clear filters</button>
                <a className="btn btn--gold" href="#contact">Ask an agent</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
