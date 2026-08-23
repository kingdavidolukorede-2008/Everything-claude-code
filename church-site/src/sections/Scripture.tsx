import { CHURCH } from "@/lib/site";

export default function Scripture() {
  return (
    <section className="bg-ink py-[clamp(72px,11vw,140px)] text-white">
      <div className="mx-auto max-w-[900px] px-5 text-center sm:px-8">
        <blockquote className="reveal m-0">
          <p className="m-0 font-display text-[clamp(1.5rem,3.6vw,2.6rem)] font-light italic leading-[1.4]">
            &ldquo;{CHURCH.scripture.text}&rdquo;
          </p>
          <footer className="mt-8 text-[0.7rem] font-bold uppercase tracking-[0.3em] text-flame">
            {CHURCH.scripture.ref}
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
