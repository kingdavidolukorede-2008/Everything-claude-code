import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import { CHURCH, NAV } from "@/lib/site";
import { submitForm } from "@/lib/forms";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await submitForm("newsletter", { email });
      setStatus("sent");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-[1400px] px-5 py-[clamp(56px,8vw,96px)] sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1.2fr] lg:gap-16">
          <div>
            <Logo className="h-12 w-12 text-white" />
            <p className="m-0 mt-6 font-display text-[1.5rem] font-medium leading-[1.25]">
              Ever Increasing Grace
              <br />
              and Revival Fire Assembly
            </p>
            <p className="eyebrow m-0 mt-3 text-flame">{CHURCH.nickname}</p>
            <address className="m-0 mt-6 not-italic text-[0.92rem] leading-[1.7] text-white/50">
              {CHURCH.address.line1}
              <br />
              {CHURCH.address.line2}
              <br />
              {CHURCH.address.line3}
            </address>
            <a
              href={CHURCH.phoneHref}
              className="mt-4 inline-block text-[0.92rem] text-white/70 hover:text-flame"
            >
              {CHURCH.phoneDisplay}
            </a>
          </div>

          <nav aria-label="Footer">
            <h2 className="eyebrow m-0 text-white/40">Pages</h2>
            <ul className="m-0 mt-5 flex list-none flex-col gap-3 p-0">
              {NAV.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-[0.92rem] text-white/60 hover:text-flame">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow m-0 text-white/40">Grace Weekly</h2>
            <p className="m-0 mt-5 max-w-[34ch] text-[0.92rem] leading-relaxed text-white/50">
              One short note each week — the passage we are in, and what to pray about.
            </p>
            {status === "sent" ? (
              <p className="mt-6 text-[0.95rem] text-flame">You are on the list.</p>
            ) : (
              <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  required
                  type="email"
                  className="field field--dark min-w-0 flex-1"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" disabled={status === "sending"} className="btn btn--flame">
                  {status === "sending" ? "…" : "Join"}
                </button>
              </form>
            )}
            {status === "error" && (
              <p className="mt-3 text-[0.85rem] text-flame">
                That did not go through — call {CHURCH.phoneDisplay} instead.
              </p>
            )}
          </div>
        </div>

        <div className="mt-[clamp(40px,6vw,72px)] flex flex-wrap justify-between gap-4 border-t border-white/10 pt-7 text-[0.78rem] text-white/35">
          <span>© {new Date().getFullYear()} {CHURCH.name}</span>
          <span>{CHURCH.scripture.ref} · Ipaja, Lagos</span>
        </div>
      </div>
    </footer>
  );
}
