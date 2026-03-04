import { ArrowLeft, Share2 } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface EventBannerProps {
  imageUrl: string
  onBack?: () => void
  onShare?: () => void
  className?: string
}

export function EventBanner({ imageUrl, onBack, onShare, className }: EventBannerProps) {
  return (
    <div
      className={cn('relative w-full h-65 bg-muted shrink-0', className)}
      style={{
        backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/50 to-transparent pointer-events-none" />

      {/* Back button */}
      {onBack && (
        <motion.button
          onClick={onBack}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute left-4 top-14 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </motion.button>
      )}

      {/* Share button */}
      {onShare && (
        <motion.button
          onClick={onShare}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute right-4 top-14 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          aria-label="Compartilhar"
        >
          <Share2 size={20} />
        </motion.button>
      )}
    </div>
  )
}
