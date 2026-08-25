import { BUSINESS, NAV_LINKS } from '../data/business'
import { Container } from './Container'
import { InstagramIcon, PhoneIcon, WhatsAppIcon } from './Icons'
import { buildWhatsAppLink } from '../utils/whatsapp'

export function Footer() {
  return (
    <footer className="border-t border-hairline py-16">
      <Container>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-xl font-semibold">
              <span className="text-cream">BELLE</span> <span className="text-gold">FOOD</span>
            </p>
            <p className="mt-3 font-display text-sm italic text-gold-soft">{BUSINESS.tagline}</p>
            <p className="mt-4 text-xs text-cream-faint">{BUSINESS.footerLine}</p>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-gold">Visit</p>
            <nav className="mt-4 flex flex-col gap-2.5" aria-label="Footer">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-cream-dim hover:text-gold-soft"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-gold">Order</p>
            <div className="mt-4 flex flex-col gap-2.5">
              <a href={`tel:${BUSINESS.phoneTel}`} className="flex items-center gap-2 text-sm text-cream-dim hover:text-gold-soft">
                <PhoneIcon className="h-4 w-4" />
                {BUSINESS.phoneDisplay}
              </a>
              <a
                href={buildWhatsAppLink("Hi Belle Food, I'd like to place an order.")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-cream-dim hover:text-gold-soft"
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href={BUSINESS.glovoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-cream-dim hover:text-gold-soft"
              >
                Glovo
              </a>
              <a
                href={BUSINESS.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-cream-dim hover:text-gold-soft"
              >
                <InstagramIcon className="h-4 w-4" />
                Instagram
              </a>
            </div>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-gold">Address</p>
            <p className="mt-4 text-sm leading-relaxed text-cream-dim">{BUSINESS.address}</p>
            <p className="mt-2 font-mono text-xs text-cream-faint">{BUSINESS.plusCode}</p>
          </div>
        </div>

        <div className="mt-14 border-t border-hairline pt-6 text-xs text-cream-faint">
          © 2026 Belle Food · Lekki, Lagos
        </div>
      </Container>
    </footer>
  )
}
