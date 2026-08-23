import { useState, type FormEvent } from "react";
import { MessageCircle } from "lucide-react";
import Photo from "@/components/Photo";
import { CHURCH, IMAGES } from "@/lib/site";
import { submitForm } from "@/lib/forms";

export default function Community() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", interest: "Sunday worship" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await submitForm("connect", form);
      setStatus("sent");
      setForm({ name: "", phone: "", email: "", interest: "Sunday worship" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="community" className="bg-paper py-[clamp(72px,10vw,132px)]">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-12">
        <div className="reveal relative aspect-[4/3] overflow-hidden bg-ink lg:aspect-[4/4.4]">
          <Photo
            src={IMAGES.community}
            alt="Members of the church family talking together after a service"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="reveal">
          <p className="eyebrow m-0 text-flame">Join our community</p>
          <h2 className="mt-5 font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold uppercase leading-[0.95] tracking-[-0.02em] text-ink">
            Connect with us
          </h2>
          <p className="mt-6 max-w-[46ch] text-[1.02rem] leading-[1.7] text-ash">
            Tell us how to reach you and someone from the church will call before your first
            Sunday — so you arrive knowing at least one name.
          </p>

          {status === "sent" ? (
            <div className="mt-9 border-l-2 border-flame bg-bone p-7">
              <p className="m-0 font-display text-xl text-ink">Thank you.</p>
              <p className="m-0 mt-2 text-[0.95rem] text-ash">
                We have your details and will be in touch shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-9 flex max-w-md flex-col gap-3">
              <input
                required
                className="field"
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                required
                className="field"
                type="tel"
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <input
                className="field"
                type="email"
                placeholder="Email (optional)"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <select
                className="field"
                value={form.interest}
                onChange={(e) => setForm({ ...form, interest: e.target.value })}
                aria-label="What are you most interested in?"
              >
                <option>Sunday worship</option>
                <option>Bible study</option>
                <option>Revival hour</option>
                <option>Night vigil</option>
                <option>Serving on a team</option>
              </select>
              <button type="submit" disabled={status === "sending"} className="btn btn--dark mt-2">
                {status === "sending" ? "Sending…" : "Sign up"}
              </button>
              {status === "error" && (
                <p className="m-0 text-[0.85rem] text-flame-dp">
                  That did not go through. Call {CHURCH.phoneDisplay} and we will take your details
                  over the phone.
                </p>
              )}
              <p className="m-0 flex items-center gap-2 text-[0.78rem] text-ash">
                <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Opens WhatsApp to send your details to the church line.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
