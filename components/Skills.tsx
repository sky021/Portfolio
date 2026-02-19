export default function Skills() {
  const skills = [
    'HTML', 'CSS', 'JavaScript', 'React', 'Node.js',
    'Python', 'Java', 'Django', 'SQL', 'MongoDB',
    'PostgreSQL', 'Oracle Fusion', 'AWS', 'Docker', 'Kubernetes',
    'Git', 'Jira', 'Pandas', 'Numpy', 'OpenCV',
    'PyTorch', 'FastAPI', 'Flask', 'Scikit-Learn'
  ]

  return (
    <section id="skills" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">
          Skills
        </h2>
        <div className="max-w-5xl mx-auto">
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {skills.map((skill) => (
              <li
                key={skill}
                className="bg-white px-4 py-3 rounded-lg shadow-md text-center font-medium text-gray-800 hover:shadow-lg hover:scale-105 transition-all"
              >
                {skill}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
