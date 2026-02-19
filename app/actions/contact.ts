'use server'

import { z } from 'zod'

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
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

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const validatedFields = contactFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check your inputs.',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email, message } = validatedFields.data

  try {
    // Option 1: Using Resend (requires RESEND_API_KEY environment variable)
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: process.env.CONTACT_EMAIL || 'agrawal.akash@asu.edu',
        subject: `Portfolio Contact: ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
      })
    } else {
      // Option 2: Log to console (for development/demo)
      console.log('Contact Form Submission:', { name, email, message })
      console.log('Note: Set RESEND_API_KEY environment variable to enable email sending')
    }

    // Optional: Store in database here
    // await db.insert(contacts).values({ name, email, message, createdAt: new Date() })

    return {
      success: true,
      message: 'Thank you for your message! I will get back to you soon.',
    }
  } catch (error) {
    console.error('Error submitting contact form:', error)
    return {
      success: false,
      message: 'Failed to send message. Please try again later or email me directly at agrawal.akash@asu.edu',
    }
  }
}
