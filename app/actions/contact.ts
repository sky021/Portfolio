'use server'

import { z } from 'zod'

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
})

export type ContactFormState = {
  success: boolean
  message: string
  errors?: {
    name?: string[]
    email?: string[]
    message?: string[]
  }
}

export const initialContactState: ContactFormState = {
  success: false,
  message: '',
}

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // Honeypot: a field hidden from humans but usually filled by bots. Respond as
  // though it succeeded so the sender learns nothing about the check.
  if (typeof formData.get('company_website') === 'string' && formData.get('company_website') !== '') {
    return { success: true, message: 'Thanks for reaching out. I will get back to you soon.' }
  }

  const validatedFields = contactFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Please check the highlighted fields.',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email, message } = validatedFields.data

  try {
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: process.env.CONTACT_EMAIL || 'agrawal.akash@asu.edu',
        reply_to: email,
        subject: `Portfolio contact: ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      })
    } else {
      // Without an API key the form still validates and responds, which keeps
      // local development and preview deployments usable.
      console.log('[contact] submission received', { name, email, message })
      console.log('[contact] set RESEND_API_KEY to enable delivery')
    }

    return {
      success: true,
      message: 'Thanks for reaching out. I will get back to you soon.',
    }
  } catch (error) {
    console.error('[contact] delivery failed', error)
    return {
      success: false,
      message:
        'Something went wrong sending that. Email me directly at agrawal.akash@asu.edu and it will reach me.',
    }
  }
}
