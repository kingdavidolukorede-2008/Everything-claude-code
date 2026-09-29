import { telHref } from "@data/lib.js";
import { IMG } from "../util.js";
import Icon from "./Icon.jsx";
import SearchBar from "./SearchBar.jsx";

export default function Hero({ onSearch }) {
  return (
    <section className="hero" id="home" aria-labelledby="hero-title">
      <div className="hero__media">
        <img src={IMG("hero.svg")} alt="" width="1600" height="1000" fetchPriority="high" decoding="async" />
      </div>
      <div className="container">
        <div className="hero__content">
          <p className="eyebrow">Real estate in Lekki, Lagos</p>
          <h1 id="hero-title">Find your place <em>in Lagos.</em></h1>
          <p className="hero__lead">Homes, rentals, offices, warehouses and industrial land, found, negotiated and closed for you by a Lekki team clients rate 4.9 out of 5.</p>
          <div className="hero__ctas">
            <a className="btn btn--gold" href="#properties">Browse Properties <Icon name="arrowRight" /></a>
            <a className="btn btn--ghost" href={telHref()}><Icon name="phone" /> Talk to an Agent</a>
          </div>
        </div>
        <SearchBar onSearch={onSearch} />
      </div>
    </section>
  );
}
