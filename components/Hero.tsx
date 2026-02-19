'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section 
      id="home" 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 pt-20 transition-colors duration-300"
    >
      <div className="container mx-auto px-4 py-20">
        <motion.div 
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Profile Image */}
          <motion.div 
            className="mb-8 relative w-48 h-48 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-2xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Image
              src="/images/Photo.jpeg"
              alt="Akash Agrawal"
              fill
              className="object-cover"
              priority
            />
          </motion.div>

          {/* Name and Title */}
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Akash Agrawal
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Software Engineer | Machine Learning Engineer | Data Scientist
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link
              href="https://drive.google.com/file/d/1P40RrIwUYP21LqoVb1LpgKvG4eDpeP8o/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg shadow-lg hover:bg-primary-700 transition-all transform hover:scale-105"
            >
              View Resume
            </Link>
          </motion.div>

          {/* Social Links */}
          <motion.div 
            className="flex gap-6 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <Link
              href="https://linkedin.com/in/akashagrawal021"
              target="_blank"
              rel="noopener noreferrer"
              className="text-3xl text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors transform hover:scale-110"
            >
              <i className="fab fa-linkedin"></i>
            </Link>
            <Link
              href="https://github.com/sky021"
              target="_blank"
              rel="noopener noreferrer"
              className="text-3xl text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors transform hover:scale-110"
            >
              <i className="fab fa-github"></i>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
