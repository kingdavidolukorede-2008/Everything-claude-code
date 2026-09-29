import { BUDGETS, PROPERTY_TYPES } from "@data/content.js";
import { LOCATIONS } from "@data/lib.js";
import Icon from "./Icon.jsx";

/** Location / type / budget search. Reports values up; the grid filters. */
export default function SearchBar({ onSearch }) {
  const submit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSearch({ area: fd.get("area"), type: fd.get("type"), budget: fd.get("budget") });
  };
  return (
    <form className="search" id="search" role="search" aria-label="Property search" onSubmit={submit}>
      <p className="search__title" aria-hidden="true">Search properties</p>
      <div className="search__fields">
        <div className="field">
          <label htmlFor="s-area">Location</label>
          <select className="select" id="s-area" name="area"><option value="">All locations</option>{LOCATIONS.map((l) => <option key={l}>{l}</option>)}</select>
        </div>
        <div className="field">
          <label htmlFor="s-type">Property type</label>
          <select className="select" id="s-type" name="type"><option value="">Any type</option>{PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        </div>
        <div className="field">
          <label htmlFor="s-budget">Budget</label>
          <select className="select" id="s-budget" name="budget">{BUDGETS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}</select>
        </div>
        <button className="btn btn--navy" type="submit"><Icon name="search" /> Search</button>
      </div>
    </form>
  );
}
