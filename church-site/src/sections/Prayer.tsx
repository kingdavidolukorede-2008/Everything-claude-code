import { useState, type FormEvent } from "react";
import { Phone, MessageCircle } from "lucide-react";
import { CHURCH } from "@/lib/site";
import { submitForm } from "@/lib/forms";

export default function Prayer() {
  const [form, setForm] = useState({ name: "", phone: "", request: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await submitForm("prayer", form);
      setStatus("sent");
      setForm({ name: "", phone: "", request: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="prayer" className="bg-ink py-[clamp(72px,10vw,132px)] text-white">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-12">
        <div className="reveal">
          <p className="eyebrow m-0 text-flame">The prayer line</p>
          <h2 className="mt-5 max-w-[14ch] font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold uppercase leading-[0.95] tracking-[-0.02em]">
            Tell us what to pray about
          </h2>
          <p className="mt-6 max-w-[40ch] text-[1.02rem] leading-[1.7] text-white/55">
            You do not have to wait for Sunday, and you do not have to explain everything. A first
            name and one sentence is enough.
          </p>
          <a
            href={CHURCH.phoneHref}
            className="mt-8 inline-block font-display text-[clamp(2rem,5.5vw,3.2rem)] font-medium leading-none text-white transition-colors hover:text-flame"
          >
            {CHURCH.phoneDisplay}
          </a>
        </div>

        <div className="reveal">
          {status === "sent" ? (
            <div className="border-l-2 border-flame bg-white/5 p-8">
              <p className="m-0 font-display text-2xl">We have it.</p>
              <p className="m-0 mt-2 text-white/55">
                Your request goes before the church at the next Revival hour. You are not carrying
                it alone.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="flex max-w-lg flex-col gap-3">
              <input
                className="field field--dark"
                type="text"
                placeholder="Your name (optional)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="field field--dark"
                type="tel"
                placeholder="Phone number (optional)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <textarea
                required
                rows={5}
                className="field field--dark resize-y"
                placeholder="What would you like us to pray about?"
                value={form.request}
                onChange={(e) => setForm({ ...form, request: e.target.value })}
              />
              <button type="submit" disabled={status === "sending"} className="btn btn--flame mt-2">
                {status === "sending" ? "Sending…" : "Submit prayer request"}
              </button>
              {status === "error" && (
                <p className="m-0 text-[0.85rem] text-flame">
                  That did not go through. Call {CHURCH.phoneDisplay} — someone will pray with you
                  now.
                </p>
              )}
            </form>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              className="btn btn--outline-light border-white/40 text-white"
              href={CHURCH.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
            </a>
            <a className="btn btn--outline-light border-white/40 text-white" href={CHURCH.phoneHref}>
              <Phone className="h-4 w-4" aria-hidden="true" /> Call now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
