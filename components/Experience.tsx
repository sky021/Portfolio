'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

export default function Experience() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const experiences = [
    {
      year: '2024',
      title: 'Graduate Research Assistant',
      organization: 'Arizona State University',
      description: 'At Arizona State University, I built an AI tool that detects and tracks soil particles movement with 94% accuracy, automating geo-technical researcher\'s manual efforts. Using thousands of soil particle\'s images and smart data analysis, this tool makes soil research faster and more reliable.'
    },
    {
      year: '2023',
      title: 'Software Engineer',
      organization: 'LTIMINDTREE',
      description: 'At LTIMINDTREE, I moved over a million customer records to Oracle Cloud using SQL and Python, making data safer and cheaper to handle. I also built an automation tool that saved 300+ hours of manual work for efficient migration of configurations across environments, hence boosting operational efficiency.'
    },
    {
      year: '2021',
      title: 'Bachelor\'s in Computer Science',
      organization: 'Ramdeobaba University',
      description: 'Earned my Bachelor\'s in Computer Science from Ramdeobaba University, mastering the building blocks of tech—machine learning, data systems, and web development. Courses in algorithms, databases, and distributed systems taught me how to design solutions that scale and work seamlessly in the real world.'
    }
  ]

  return (
    <section id="experience" className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          Professional Timeline
        </motion.h2>
        <div ref={ref} className="max-w-4xl mx-auto space-y-8">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              className="flex flex-col md:flex-row gap-6 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all"
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              {/* Year Badge */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-primary-600 text-white rounded-lg flex items-center justify-center text-xl font-bold">
                  {exp.year}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {exp.title}
                </h3>
                <h4 className="text-lg font-semibold text-primary-600 dark:text-primary-400 mb-3">
                  {exp.organization}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {exp.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
