'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MotionSection } from '@/components/ui/MotionSection'
import { contactSchema, type ContactFormData } from '@/lib/validations'
import { cn } from '@/lib/utils'

export function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) })

  async function onSubmit(data: ContactFormData) {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error al enviar')
      toast.success('Mensaje enviado. Te respondo pronto.')
      reset()
    } catch {
      toast.error('Error al enviar el mensaje. Intenta de nuevo.')
    }
  }

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full bg-surface border rounded-sm px-4 py-3 text-text-primary placeholder:text-text-muted text-sm outline-none transition-colors focus:border-gold',
      hasError ? 'border-red-500' : 'border-[#1F1F1F]'
    )

  return (
    <section id="contacto" className="py-24">
      <div className="max-w-3xl mx-auto px-6">
        <MotionSection>
          <p className="text-gold text-sm font-sans uppercase tracking-widest mb-4 text-center">Contacto</p>
          <h2 className="font-heading text-4xl md:text-5xl text-text-primary mb-4 text-center">
            Hablemos de tu proyecto
          </h2>
          <p className="text-text-muted text-center mb-12">
            Cuéntame en qué puedo ayudarte y te respondo en menos de 24 horas.
          </p>
        </MotionSection>

        <MotionSection delay={0.1}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <input {...register('name')} placeholder="Tu nombre" className={inputClass(!!errors.name)} />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <input {...register('email')} placeholder="Tu email" className={inputClass(!!errors.email)} />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>
            </div>
            <div>
              <input {...register('subject')} placeholder="Asunto" className={inputClass(!!errors.subject)} />
              {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject.message}</p>}
            </div>
            <div>
              <textarea
                {...register('message')}
                placeholder="Cuéntame sobre tu proyecto..."
                rows={5}
                className={cn(inputClass(!!errors.message), 'resize-none')}
              />
              {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>}
            </div>
            <Button type="submit" size="lg" disabled={isSubmitting} className="w-full gap-2">
              <Send size={16} />
              {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
            </Button>
          </form>
        </MotionSection>
      </div>
    </section>
  )
}
