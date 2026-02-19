// Resume Data - Single Source of Truth
// All content pulled from Akash Agrawal's resume

export interface PersonalInfo {
  name: string;
  tagline: string;
  email: string;
  linkedin: string;
  github: string;
  location: string;
  resumePdf: string;
}

export interface Education {
  degree: string;
  institution: string;
  location: string;
  graduationDate: string;
  courses: string[];
}

export interface Experience {
  title: string;
  company: string;
  client?: string;
  location: string;
  dateRange: string;
  bullets: string[];
}

export interface Project {
  title: string;
  techStack: string[];
  dateRange: string;
  bullets: string[];
  link?: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface Achievement {
  title: string;
  description: string;
}

export const personalInfo: PersonalInfo = {
  name: "Akash Agrawal",
  tagline: "Full-Stack Software Engineer · AI/ML · Systems at Scale",
  email: "agrawal.akash@asu.edu",
  linkedin: "https://linkedin.com/in/akashagrawal021",
  github: "https://github.com/sky021",
  location: "Tempe, AZ",
  resumePdf: "https://drive.google.com/file/d/1P40RrIwUYP21LqoVb1LpgKvG4eDpeP8o/view?usp=sharing",
};

export const education: Education[] = [
  {
    degree: "M.S. Computer Science",
    institution: "Arizona State University",
    location: "Tempe, AZ",
    graduationDate: "Dec 2025",
    courses: [
      "Statistical Machine Learning",
      "Cloud Computing",
      "Data Processing at Scale",
      "Software Security",
      "Semantic Web Mining",
    ],
  },
  {
    degree: "B.S. Computer Science",
    institution: "Nagpur University",
    location: "India",
    graduationDate: "Jul 2021",
    courses: [
      "Data Structures & Algorithms",
      "Operating Systems",
      "DBMS",
      "Distributed Systems",
      "AI/ML",
    ],
  },
];

export const experience: Experience[] = [
  {
    title: "AI Engineer",
    company: "Arizona State University",
    location: "Tempe, AZ",
    dateRange: "Aug 2024 – Jul 2025",
    bullets: [
      "Architected a scalable deep learning pipeline on AWS (SageMaker, S3) reducing data analysis time by 95% (40hr → 2hr)",
      "Standardized deployment with Docker + Terraform, eliminating config drift, cutting setup time by 90%",
      "Implemented observability via AWS CloudWatch for 99.9% uptime",
      "Engineered modular object tracking (FairMOT/YOLOv8): 3,500+ entities, 0.82 mAP, low latency",
    ],
  },
  {
    title: "Software Engineer",
    company: "LTIMindtree",
    client: "Citi Bank",
    location: "Remote",
    dateRange: "Jan 2023 – Nov 2023",
    bullets: [
      "Built secure, scalable middleware with Node.js + Angular for financial systems config management",
      "Accelerated real-time data processing by 35% via SQL optimization + parallel execution",
      "Hardened security: SSO, RBAC, full audit logging",
      "Deployed CI/CD pipeline (Jenkins, Docker, K8s, SonarQube) saving 1,000+ hrs/year",
    ],
  },
  {
    title: "Software Engineer — Data",
    company: "LTIMindtree",
    client: "Avery Dennison",
    location: "Remote",
    dateRange: "Aug 2021 – Dec 2022",
    bullets: [
      "Engineered enterprise MDM pipeline (Python ETL) consolidating 10M global customer records",
      "Boosted legacy pipeline efficiency by 30% via schema mapping + enrichment",
      "Enhanced data reliability: automated validation, deduplication, 4x governance improvement",
      "Exposed 2.5M golden records to downstream AI analytics (Oracle CRM/CX)",
    ],
  },
];

export const projects: Project[] = [
  {
    title: "NL2SQL AI Agent",
    techStack: [
      "Python",
      "RAG",
      "HuggingFace",
      "LangChain",
      "LLM",
      "Next.js",
      "ChromaDB",
      "SQLite",
      "PostgreSQL",
    ],
    dateRange: "Summer 2025",
    bullets: [
      "Reduced client query resolution from 3 days to <1 hour via NL-to-database interface",
      "Built reflection-based conversational AI with 3 fault-tolerant loops (LangGraph, LangChain, RAG)",
      "0.71 retrieval precision, 60% hallucination reduction via RAGAS + Prompt Engineering",
    ],
  },
  {
    title: "LambdaLens",
    techStack: [
      "AWS Lambda",
      "OpenCV",
      "Docker",
      "FFmpeg",
      "ResNet-34",
      "MongoDB",
    ],
    dateRange: "Fall 2024",
    bullets: [
      "Scalable event-driven video analysis pipeline on AWS Lambda for real-time media streams",
      "Optimized Docker builds: 50% cost reduction, observability via CloudWatch",
      "90%+ inference accuracy on unseen video data (ResNet-34, serverless)",
    ],
  },
  {
    title: "PersonalizedFeed",
    techStack: [
      "Java (Android)",
      "Python",
      "NLP",
      "Scikit-learn",
      "Firebase",
    ],
    dateRange: "Spring 2021",
    bullets: [
      "Real-time message filtering engine on Android with negligible UI latency",
      "96% filtering accuracy (Naive Bayes, Logistic Regression, SVM)",
      "Firebase cross-device sync, saving users 35 min/day",
    ],
  },
];

export const skills: SkillCategory[] = [
  {
    category: "Languages",
    skills: ["Python", "JavaScript", "Java", "SQL", "C#", "C/C++"],
  },
  {
    category: "AI/ML",
    skills: [
      "Pandas",
      "NumPy",
      "Scikit-learn",
      "XGBoost",
      "PyTorch",
      "TensorFlow",
      "LangChain",
      "LangGraph",
      "RAG",
      "HuggingFace",
      "OpenCV",
    ],
  },
  {
    category: "Frameworks",
    skills: [
      "Next.js",
      "Node.js",
      "Flask",
      "FastAPI",
      "GraphQL",
      "Spring Boot",
      ".NET",
      "React",
      "Angular",
      "Streamlit",
      "RESTful APIs",
    ],
  },
  {
    category: "DevOps",
    skills: [
      "Jenkins",
      "Git",
      "OpenShift",
      "AWS (Lambda, S3, SageMaker)",
      "GCP",
      "Docker",
      "Kubernetes",
      "Kafka",
    ],
  },
  {
    category: "Databases",
    skills: [
      "MySQL",
      "PostgreSQL",
      "Oracle DB",
      "SQLite",
      "MongoDB",
      "Redis",
      "ChromaDB",
    ],
  },
  {
    category: "Observability",
    skills: ["Grafana", "Prometheus", "Splunk", "AWS CloudWatch"],
  },
];

export const achievements: Achievement[] = [
  {
    title: "ICPC 2019",
    description: "Ranked 239th/10,000 teams internationally",
  },
  {
    title: "'Super Crew' Honor",
    description: "Recognized at LTIMindtree for exceptional performance",
  },
  {
    title: "Community Involvement",
    description: "Active in SoDA, HackerDevils, GDSC at ASU",
  },
  {
    title: "Open-Source Contributor",
    description: "Contributing to GitHub open-source projects",
  },
];
