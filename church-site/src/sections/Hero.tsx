export default function Hero() {
  return (
    <section className="bg-paper pt-[72px]">
      <div className="mx-auto max-w-[1400px] px-5 pb-14 pt-16 sm:px-8 sm:pb-20 sm:pt-24 lg:px-12 lg:pb-24 lg:pt-32">
        <div className="reveal max-w-4xl">
          <h1 className="m-0 font-display text-[clamp(3rem,11vw,8.5rem)] font-semibold uppercase leading-[0.86] tracking-[-0.035em] text-ink">
            Welcome
            <br className="sm:hidden" /> home.
          </h1>
          <p className="mt-8 max-w-xl text-[1.05rem] leading-[1.7] text-ash sm:mt-10 sm:text-[1.2rem]">
            Dive into our teachings, events and community.
            <br className="hidden sm:block" />
            Your journey of faith begins here.
          </p>
        </div>
      </div>
    </section>
  );
}
