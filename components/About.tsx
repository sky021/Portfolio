"use client";

import { motion } from "framer-motion";
import { education } from "@/lib/resume-data";

export default function About() {
  return (
    <section
      id="about"
      className="py-20 bg-white dark:bg-gray-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            About Me
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                I&apos;m a Full-Stack Software Engineer with a passion for building production-grade systems
                that operate at scale. With a Master&apos;s in Computer Science from Arizona State University
                (Dec 2025) and hands-on experience across AI/ML, distributed systems, and cloud infrastructure,
                I thrive on solving complex engineering challenges.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                My work spans the entire stack—from architecting scalable deep learning pipelines on AWS
                to building secure, performant middleware for financial systems. I stay on the bleeding edge
                of technology, constantly exploring new frameworks, tools, and methodologies to deliver
                impactful solutions.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                I&apos;m seeking full-time opportunities where I can leverage my expertise in AI/ML, cloud computing,
                and systems engineering to build products that matter. Whether it&apos;s optimizing data pipelines,
                deploying machine learning models in production, or engineering resilient distributed systems,
                I&apos;m ready to make an immediate impact.
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Education
              </h3>
              {education.map((edu, index) => (
                <div
                  key={index}
                  className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {edu.degree}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-1">
                    {edu.institution}, {edu.location}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {edu.graduationDate}
                  </p>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Relevant Courses:</strong>
                    <p className="mt-1">{edu.courses.join(", ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
