'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

export default function Skills() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const skills = [
    'HTML', 'CSS', 'JavaScript', 'React', 'Node.js',
    'Python', 'Java', 'Django', 'SQL', 'MongoDB',
    'PostgreSQL', 'Oracle Fusion', 'AWS', 'Docker', 'Kubernetes',
    'Git', 'Jira', 'Pandas', 'Numpy', 'OpenCV',
    'PyTorch', 'FastAPI', 'Flask', 'Scikit-Learn'
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const item = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1 }
  }

  return (
    <section id="skills" className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          Skills
        </motion.h2>
        <div className="max-w-5xl mx-auto">
          <motion.ul 
            ref={ref}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            variants={container}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
          >
            {skills.map((skill) => (
              <motion.li
                key={skill}
                variants={item}
                className="bg-white dark:bg-gray-700 px-4 py-3 rounded-lg shadow-md text-center font-medium text-gray-800 dark:text-gray-200 hover:shadow-lg hover:scale-105 transition-all cursor-default"
              >
                {skill}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  )
}
