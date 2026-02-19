'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useFormState, useFormStatus } from 'react-dom'
import { submitContactForm, ContactFormState } from '@/app/actions/contact'

const initialState: ContactFormState = {
  success: false,
  message: '',
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <motion.button
      type="submit"
      disabled={pending}
      className="w-full px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg shadow-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
      whileHover={{ scale: pending ? 1 : 1.02 }}
      whileTap={{ scale: pending ? 1 : 0.98 }}
    >
      {pending ? 'Sending...' : 'Send Message'}
    </motion.button>
  )
}

export default function Contact() {
  const ref = useRef(null)
  const formRef = useRef<HTMLFormElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [state, formAction] = useFormState(submitContactForm, initialState)

  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset()
    }
  }, [state.success])

  return (
    <section id="contact" className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          Contact Me
        </motion.h2>
        <motion.div 
          ref={ref}
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form ref={formRef} action={formAction} className="space-y-6">
            <div>
              <input
                type="text"
                name="name"
                placeholder="Name"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-colors"
              />
              {state.errors?.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {state.errors.name[0]}
                </p>
              )}
            </div>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-colors"
              />
              {state.errors?.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {state.errors.email[0]}
                </p>
              )}
            </div>
            <div>
              <textarea
                name="message"
                placeholder="Message"
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-colors"
              />
              {state.errors?.message && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {state.errors.message[0]}
                </p>
              )}
            </div>
            <SubmitButton />
            {state.message && (
              <p className={`text-center text-sm mt-2 ${
                state.success 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {state.message}
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  )
}
