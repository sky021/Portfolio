'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <section 
      id="home" 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 pt-20"
    >
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center">
          {/* Profile Image */}
          <div className="mb-8 relative w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-2xl">
            <Image
              src="/images/Photo.jpeg"
              alt="Akash Agrawal"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Name and Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-4">
            Akash Agrawal
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl">
            Software Engineer | Machine Learning Engineer | Data Scientist
          </p>

          {/* CTA Button */}
          <Link
            href="https://drive.google.com/file/d/1P40RrIwUYP21LqoVb1LpgKvG4eDpeP8o/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg shadow-lg hover:bg-primary-700 transition-all transform hover:scale-105"
          >
            View Resume
          </Link>

          {/* Social Links */}
          <div className="flex gap-6 mt-8">
            <Link
              href="https://linkedin.com/in/akashagrawal021"
              target="_blank"
              rel="noopener noreferrer"
              className="text-3xl text-gray-700 hover:text-primary-600 transition-colors"
            >
              <i className="fab fa-linkedin"></i>
            </Link>
            <Link
              href="https://github.com/sky021"
              target="_blank"
              rel="noopener noreferrer"
              className="text-3xl text-gray-700 hover:text-primary-600 transition-colors"
            >
              <i className="fab fa-github"></i>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
