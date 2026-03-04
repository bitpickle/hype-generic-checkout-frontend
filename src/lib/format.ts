import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100)
}

export function formatDate(dateStr: string, pattern = "d MMM yyyy"): string {
  try {
    return format(parseISO(dateStr), pattern, { locale: ptBR })
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "d MMM yyyy '·' HH:mm", { locale: ptBR })
  } catch {
    return dateStr
  }
}

export function formatDateRange(startsAt: string, endsAt: string): string {
  try {
    const start = parseISO(startsAt)
    const end = parseISO(endsAt)
    const startStr = format(start, "d MMM yyyy '·' HH:mm", { locale: ptBR })
    const endStr = format(end, "HH:mm", { locale: ptBR })
    return `${startStr} – ${endStr}`
  } catch {
    return startsAt
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function formatCpf(cpf: string): string {
  return cpf
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .slice(0, 14)
}

export function formatPhone(phone: string): string {
  return phone
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15)
}

export function formatCardNumber(card: string): string {
  return card
    .replace(/\D/g, '')
    .replace(/(\d{4})/g, '$1 ')
    .trim()
    .slice(0, 19)
}

export function formatCardExpiry(expiry: string): string {
  return expiry
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .slice(0, 5)
}
