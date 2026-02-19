'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

export default function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          About Me
        </motion.h2>
        <div ref={ref} className="max-w-4xl mx-auto space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            I am a Computer Science graduate student at Arizona State University, graduating in December 2025. 
            I bring over two years of professional experience as a Software Engineer at LTIMindtree, where I led 
            and contributed to enterprise-scale projects involving cloud migration, backend automation, and 
            configuration tools using technologies like SQL, Python, APIs, JavaScript and Oracle Fusion.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            In parallel with my graduate studies, I have worked as a Research Assistant on computer vision projects 
            and developed real-time AI applications such as LambdaLens and PersonalizedFeed—showcasing my ability 
            to deploy machine learning models, automate workflows, and build scalable backend systems using AWS, 
            PyTorch, OpenCV, and FastAPI.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            I am currently seeking Summer 2025 internship opportunities in Software Engineering, Machine Learning 
            Engineering, or Data Science roles. With a strong foundation in algorithms, practical experience deploying 
            ML systems, and a track record of solving real-world problems at scale, I am confident in my ability to 
            contribute to teams building impactful, data-driven products.
          </motion.p>
        </div>
      </div>
    </section>
  )
}
