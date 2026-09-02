import { BUSINESS } from '../data/business'

export function buildWhatsAppLink(message: string, number: string = BUSINESS.whatsappNumber): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
