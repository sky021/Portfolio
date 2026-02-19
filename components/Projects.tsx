'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

export default function Projects() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const projects = [
    {
      title: 'LambdaLens',
      description: 'Created LambdaLens—a smart video analysis tool on AWS that automatically spots key scenes and identifies faces in real-time, slashing cloud costs. Built with Python and Docker, it\'s like giving videos a sharp eye for detail!',
      image: '/images/FaceRec.jpeg',
      github: 'https://github.com/sky021/LambdaLens.git',
      tags: ['Python', 'React.js', 'AWS S3', 'Tailwind', 'AWS Lambda', 'SQS']
    },
    {
      title: 'PersonalizedFeed',
      description: 'Built an Android app that shows users only the messages they care about by learning their interests. Trained ML models to sort 11K+ messages with 96% accuracy and used Firebase to deliver a clean, personalized feed that cuts out the noise.',
      image: '/images/FeedsPersonalization.jpg',
      publication: 'https://drive.google.com/file/d/1ZtknOA5m8jvUkdNEFvjLaBJIM8uJCuv4/view?usp=sharing',
      tags: ['NLP', 'SVM', 'NB', 'LR', 'GCP']
    }
  ]

  return (
    <section id="projects" className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          Sample Work
        </motion.h2>
        <div ref={ref} className="max-w-6xl mx-auto space-y-12">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="md:w-1/2 relative h-64 md:h-auto">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Content */}
                <div className="md:w-1/2 p-8">
                  {/* Header with title and icon */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      {project.title}
                    </h3>
                    {project.github && (
                      <Link
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xl text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        <i className="fab fa-github"></i>
                      </Link>
                    )}
                    {project.publication && (
                      <Link
                        href={project.publication}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xl text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        <i className="fas fa-file-alt"></i>
                      </Link>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
