import { FEATURED_DISHES } from '../data/menu'
import { useCart } from '../context/CartContext'
import { dishImage, formatNaira } from '../utils/format'
import { Container } from './Container'
import { Reveal } from './Reveal'
import { PlusIcon } from './Icons'

export function Kitchen() {
  const cart = useCart()

  return (
    <section id="kitchen" className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <p className="eyebrow">From the Kitchen</p>
          <h2 className="mt-4 max-w-xl font-display text-4xl leading-tight text-cream sm:text-5xl">
            Three plates worth the trip.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_DISHES.map((dish, i) => {
            const picture = dishImage(dish.id, dish.name)
            return (
              <Reveal key={dish.id} delay={i * 90}>
                <article className="card card-hover group flex h-full flex-col overflow-hidden">
                  <div className="relative overflow-hidden">
                    <img
                      src={picture.src}
                      alt={picture.alt}
                      className={`aspect-[4/3] w-full ${picture.fit} transition-transform duration-500 group-hover:scale-105`}
                      loading="lazy"
                    />
                    <span className="absolute left-3 top-3 chip bg-ink/80">House favourite</span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-xl text-cream">{dish.name}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-cream-dim">
                      {dish.description}
                    </p>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="font-mono text-sm text-gold-soft">
                        {formatNaira(dish.price)}
                      </span>
                      <button
                        type="button"
                        onClick={() => cart.addItem(dish)}
                        className="btn btn-ghost !px-3 !py-2"
                        aria-label={`Add ${dish.name} to order`}
                      >
                        <PlusIcon className="h-3.5 w-3.5" />
                        Add
                      </button>
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
