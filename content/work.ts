/**
 * Single source of truth for every piece of portfolio content.
 *
 * Components read from here rather than embedding copy in JSX, so the resume
 * and the site can be kept in sync from one place.
 */

export type DemoKey = 'nl2sql' | 'lambdalens' | 'tracking' | 'revocation'

export type DiagramNodeKind =
  | 'client'
  | 'gateway'
  | 'compute'
  | 'store'
  | 'model'
  | 'queue'
  | 'security'

export type DiagramNode = {
  id: string
  label: string
  sublabel?: string
  /** Zero-based grid column. */
  col: number
  /** Zero-based grid row. */
  row: number
  kind: DiagramNodeKind
}

export type DiagramEdge = {
  from: string
  to: string
  label?: string
  /** Renders as a dashed, animated line for async or event-driven hops. */
  async?: boolean
}

export type Diagram = {
  cols: number
  rows: number
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  caption?: string
}

export type Metric = {
  value: string
  label: string
  detail?: string
}

export type Decision = {
  title: string
  choice: string
  rationale: string
  tradeoff: string
}

export type CaseStudy = {
  slug: string
  title: string
  tagline: string
  context: string
  period: string
  role: string
  featured: boolean
  demo?: DemoKey
  /** Shown on the demo frame when the demo is illustrative rather than live. */
  demoNote?: string
  problem: string
  constraints: string[]
  approach: string[]
  diagram: Diagram
  decisions: Decision[]
  outcomes: Metric[]
  stack: { group: string; items: string[] }[]
  links?: { label: string; href: string }[]
}

export type Role = {
  company: string
  client?: string
  title: string
  location: string
  period: string
  start: string
  current?: boolean
  summary: string
  highlights: string[]
  stack: string[]
  caseStudy?: string
}

export type CurrentProject = {
  title: string
  status: string
  summary: string
  problem: string
  links: { label: string; href: string }[]
}

export const profile = {
  name: 'Akash Agrawal',
  /** Primary positioning line. Deliberately one discipline, not three. */
  headline: 'Software Engineer - AI',
  subhead:
    'I work backward from real customer problems to build reliable AI products, backend services, and cloud systems that create measurable value.',
  bio: 'Software Engineer - AI at NewsGenie, building real-time content protection for publishers. Currently building Regalia Pass On and rebuilding ReFocus.AI for public launch.',
  location: 'Mesa, AZ, open to relocation',
  email: 'agrawal.akash@asu.edu',
  phone: '+1 (480) 589-7445',
  links: {
    linkedin: 'https://linkedin.com/in/akashagrawal021',
    github: 'https://github.com/sky021',
    resume: '/Akash_Agrawal.pdf',
  },
  /** Three hardest-hitting proof points, surfaced immediately under the hero. */
  proof: [
    { value: '95%', label: 'analysis time cut', detail: '40 hours to 2 hours per cycle' },
    { value: '1,000+', label: 'hours automated / yr', detail: 'agentic content pipeline' },
    { value: 'Top 2.4%', label: 'ICPC 2019', detail: '239th of 10,000 teams worldwide' },
  ] satisfies Metric[],
}

export const currentProjects: CurrentProject[] = [
  {
    title: 'Regalia Pass On',
    status: 'In active development',
    summary:
      'A student marketplace for passing academic regalia on to current students. Deployment is coming soon.',
    problem:
      'Graduation attire is expensive, used briefly, and often left unused while the next class needs it.',
    links: [
      { label: 'View source', href: 'https://github.com/sky021/regalia-pass-on' },
    ],
  },
  {
    title: 'ReFocus.AI',
    status: 'Hackathon prototype, now rebuilding',
    summary:
      'A productivity app that uses psychology-informed, real-time nudges to help people recover from distraction. I am continuously improving it for a public launch.',
    problem:
      'Most productivity tools block distractions without helping people understand and recover from losing focus.',
    links: [
      { label: 'View source', href: 'https://github.com/sky021/FocusWhisper' },
      { label: 'View hackathon project', href: 'https://devpost.com/software/refocus-ai' },
    ],
  },
]

export const impactMetrics: Metric[] = [
  { value: '95', label: 'Percent faster analysis', detail: '40hr to 2hr per research cycle' },
  { value: '1000', label: 'Hours automated yearly', detail: 'Multi-LLM review pipeline' },
  { value: '10', label: 'Million records consolidated', detail: 'Enterprise MDM migration' },
  { value: '50', label: 'Percent cloud cost cut', detail: 'Optimized Lambda container builds' },
  { value: '99.9', label: 'Percent uptime held', detail: 'CloudWatch-backed observability' },
  { value: '3500', label: 'Entities tracked per run', detail: '0.82 mAP multi-object tracking' },
]

export const roles: Role[] = [
  {
    company: 'NewsGenie, Inc.',
    title: 'Software Engineer - AI',
    location: 'Mesa, AZ',
    period: 'Feb 2026 to Present',
    start: '2026',
    current: true,
    summary:
      'Building a real-time content protection service that lets publishers encrypt digital content and revoke access from bots and scrapers in under a second.',
    highlights: [
      'Built a real-time content protection service for publishers to encrypt and revoke access to digital content against unauthorized bots and scrapers, using FastAPI, React, MongoDB, Redis, and AWS KMS.',
      'Designed per-user, per-article access control with sub-second revocation, blocking 7 distinct bot categories for publisher customers across service boundaries.',
      'Built an agentic content pipeline using LangChain with multi-LLM orchestration and automated review gates, cutting manual workflow by 1,000+ hours annually.',
    ],
    stack: ['FastAPI', 'React', 'MongoDB', 'Redis', 'AWS KMS', 'LangChain'],
    caseStudy: 'content-protection',
  },
  {
    company: 'Arizona State University',
    title: 'AI Engineer',
    location: 'Tempe, AZ',
    period: 'Aug 2024 to Jul 2025',
    start: '2024',
    summary:
      'Replaced a manual geotechnical research workflow with a serverless deep learning pipeline and a multi-object tracker that follows thousands of soil particles across video.',
    highlights: [
      'Architected a deep learning pipeline on AWS Lambda and S3 to reduce data analysis time by 95% (40hr to 2hr per cycle).',
      'Engineered a multi-object tracking system using FairMOT and YOLOv8 to process 3500+ entities at 0.82 mAP.',
      'Standardized deployment environments using Docker and Terraform to eliminate config drift and cut setup time by 90%.',
      'Implemented system observability using AWS CloudWatch to ensure 99.9% uptime and accelerate incident resolution.',
    ],
    stack: ['Python', 'PyTorch', 'FairMOT', 'YOLOv8', 'AWS Lambda', 'Terraform'],
    caseStudy: 'particle-tracking',
  },
  {
    company: 'LTIMindtree',
    client: 'CITI Bank',
    title: 'Software Engineer',
    location: 'Remote',
    period: 'Jan 2023 to Nov 2023',
    start: '2023',
    summary:
      'Automated configuration management for financial systems behind hardened middleware, with SSO, role-based access control, and a full audit trail.',
    highlights: [
      'Developed secure, scalable middleware using Node.js and Angular to automate config management for financial systems.',
      'Accelerated data processing by 35% through Oracle PL/SQL optimization, RESTful API integration, and parallel execution logic.',
      'Hardened application security by implementing SSO, RBAC, and full audit logging to protect sensitive financial data.',
      'Deployed an end-to-end CI/CD pipeline using Jenkins, Docker, Kubernetes, and SonarQube with enforced code reviews.',
    ],
    stack: ['Node.js', 'Angular', 'Oracle PL/SQL', 'Jenkins', 'Kubernetes', 'SonarQube'],
    caseStudy: 'financial-middleware',
  },
  {
    company: 'LTIMindtree',
    client: 'Avery Dennison',
    title: 'Software Engineer - Data',
    location: 'Remote',
    period: 'Aug 2021 to Dec 2022',
    start: '2021',
    summary:
      'Consolidated ten million customer records scattered across regional systems into a single trusted master data set feeding downstream CRM and analytics.',
    highlights: [
      'Engineered an enterprise MDM pipeline using Informatica (ETL) to consolidate 10M global customer records for unified CRM.',
      'Boosted legacy pipeline efficiency by 30% through data enrichment using Python, Oracle PL/SQL, and REST APIs.',
      'Enhanced data reliability using automated validation testing and deduplication logic to improve governance metrics by 4x.',
      'Delivered 2.5M golden customer records to downstream systems to enable AI-driven analytics across Oracle CRM/CX.',
    ],
    stack: ['Informatica', 'Python', 'Oracle PL/SQL', 'REST APIs', 'Oracle CRM/CX'],
    caseStudy: 'master-data-pipeline',
  },
]

export const education = [
  {
    degree: 'M.S. Computer Science',
    school: 'Arizona State University',
    location: 'Tempe, AZ',
    period: 'Dec 2025',
    courses: [
      'Statistical Machine Learning',
      'Cloud Computing',
      'Data Processing at Scale',
      'Software Security',
      'Semantic Web Mining',
    ],
  },
  {
    degree: 'B.S. Computer Science',
    school: 'Nagpur University',
    location: 'India',
    period: 'Jul 2021',
    courses: [
      'Data Structures & Algorithms',
      'Operating Systems',
      'Database Management Systems',
      'Distributed Systems',
      'AI/ML',
    ],
  },
]

export const skillGroups = [
  {
    group: 'Languages',
    items: ['Python', 'JavaScript', 'TypeScript', 'Java', 'SQL', 'C#', 'C/C++', 'Bash'],
  },
  {
    group: 'AI & ML',
    items: [
      'LangChain',
      'LangGraph',
      'RAG',
      'Multi-LLM orchestration',
      'PyTorch',
      'HuggingFace',
      'OpenCV',
      'YOLOv8',
      'FairMOT',
      'RAGAS',
    ],
  },
  {
    group: 'Backend & APIs',
    items: ['FastAPI', 'Node.js', 'Next.js', 'React', 'GraphQL', 'REST', 'Spring Boot', '.NET', 'Angular'],
  },
  {
    group: 'Cloud & Infra',
    items: [
      'AWS Lambda',
      'AWS S3',
      'AWS KMS',
      'CloudWatch',
      'Docker',
      'Kubernetes',
      'Terraform',
      'Jenkins',
      'SonarQube',
    ],
  },
  {
    group: 'Data',
    items: [
      'PostgreSQL',
      'MySQL',
      'Oracle DB',
      'SQLite',
      'MongoDB',
      'Redis',
      'ChromaDB',
      'Informatica ETL',
    ],
  },
]

export const credentials = [
  {
    title: 'ICPC 2019: 239th of 10,000 teams',
    detail: 'International Collegiate Programming Contest, top 2.4% worldwide.',
    kind: 'award' as const,
  },
  {
    title: 'Super Crew Award at LTIMindtree',
    detail: 'Recognized for technical excellence and cross-team collaboration.',
    kind: 'award' as const,
  },
  {
    title: 'M.S. Computer Science at Arizona State University',
    detail: 'Statistical Machine Learning, Cloud Computing, Data Processing at Scale.',
    kind: 'education' as const,
  },
  {
    title: 'Communities',
    detail: 'SoDA, HackerDevils, and GDSC at ASU; active in open source on GitHub.',
    kind: 'community' as const,
  },
  {
    title: 'InnovationHacks 2025 participant',
    detail:
      'Built the ReFocus.AI productivity assistant during the 24-hour ASU hackathon, Apr 19 to 20, 2025.',
    kind: 'community' as const,
    href: 'https://devpost.com/software/refocus-ai',
    linkLabel: 'View project on Devpost',
  },
]

export const caseStudies: CaseStudy[] = [
  {
    slug: 'nl2sql-agent',
    title: 'NL2SQL AI Agent',
    tagline: 'A reflective agent that turns plain English into verified SQL and catches its own mistakes.',
    context: 'Personal project',
    period: 'Summer 2025',
    role: 'Design, implementation, evaluation',
    featured: true,
    demo: 'nl2sql',
    demoNote:
      'This demo runs real SQL through a TypeScript query engine against an in-browser dataset. Results are computed live. Retrieval scores, model reasoning, and the repair sequence are curated demonstrations based on the project architecture and reported resume metrics; no language model runs in this page.',
    problem:
      'Business stakeholders needed answers that lived in a relational database but could not write SQL, so every question became a ticket for an analyst. Turnaround averaged three days, and the backlog meant simple questions never got asked at all.',
    constraints: [
      'Answers had to be trustworthy because a confidently wrong number is worse than no answer.',
      'The schema was large enough that pasting it into every prompt was neither affordable nor accurate.',
      'No fine-tuning budget, so accuracy had to come from retrieval and prompt design.',
      'Failures needed to be recoverable without a human in the loop.',
    ],
    approach: [
      'Schema metadata is chunked per table and embedded into ChromaDB, so each question retrieves only the handful of tables it actually needs instead of the entire catalog. This keeps the prompt small and cuts the model\'s opportunity to invent columns.',
      'Generation runs inside a LangGraph state machine rather than a single call. The graph generates SQL, validates it against the retrieved schema, executes it, and inspects the result. Any failure routes back to a repair node with the error message attached as context.',
      'The repair loop is bounded at three attempts. Each retry sees the previous SQL and the exact database error, which is usually enough to fix a bad column reference or a broken join on the second pass.',
      'Quality was measured rather than assumed. RAGAS evaluation over a labelled question set produced 0.71 retrieval precision and confirmed a 60% drop in hallucinated fields after the schema-retrieval and prompting changes.',
    ],
    diagram: {
      cols: 5,
      rows: 3,
      caption: 'Reflection loop: validation failures route back to repair rather than to the user.',
      nodes: [
        { id: 'q', label: 'Question', sublabel: 'natural language', col: 0, row: 1, kind: 'client' },
        { id: 'emb', label: 'Embedder', sublabel: 'HuggingFace', col: 1, row: 0, kind: 'model' },
        { id: 'chroma', label: 'ChromaDB', sublabel: 'schema chunks', col: 2, row: 0, kind: 'store' },
        { id: 'gen', label: 'LangGraph', sublabel: 'generate + repair', col: 2, row: 1, kind: 'compute' },
        { id: 'val', label: 'Validator', sublabel: 'schema check', col: 3, row: 1, kind: 'security' },
        { id: 'db', label: 'PostgreSQL', sublabel: 'execution', col: 4, row: 1, kind: 'store' },
        { id: 'ans', label: 'Answer', sublabel: 'rows + SQL shown', col: 4, row: 2, kind: 'client' },
      ],
      edges: [
        { from: 'q', to: 'emb' },
        { from: 'emb', to: 'chroma', label: 'top-k' },
        { from: 'chroma', to: 'gen', label: 'context' },
        { from: 'q', to: 'gen' },
        { from: 'gen', to: 'val' },
        { from: 'val', to: 'db', label: 'valid' },
        { from: 'val', to: 'gen', label: 'retry (max 3)', async: true },
        { from: 'db', to: 'ans' },
      ],
    },
    decisions: [
      {
        title: 'Retrieve the schema instead of pasting it',
        choice: 'Embed per-table schema chunks in ChromaDB and retrieve top-k per question.',
        rationale:
          'A full schema dump inflated token cost and gave the model far more surface area to hallucinate against. Narrow context measurably improved correctness.',
        tradeoff:
          'Retrieval can miss a table that a question genuinely needs, which turns a hallucination problem into a recall problem. Measuring retrieval precision separately is what made this tractable.',
      },
      {
        title: 'A state graph rather than a single prompt',
        choice: 'LangGraph nodes for generate, validate, execute, and repair.',
        rationale:
          'Text-to-SQL fails in predictable ways, including bad column names and invalid joins. Those failures are recoverable if the error is fed back, and a graph makes that routing explicit and inspectable.',
        tradeoff:
          'Latency rises on any question that needs repair, and the graph is more code to maintain than a single call would be.',
      },
      {
        title: 'Cap the retry loop at three',
        choice: 'Bounded retries with the error message carried into each attempt.',
        rationale:
          'Nearly all recoverable failures resolved by the second attempt. An unbounded loop mostly burns tokens on questions that were never answerable.',
        tradeoff:
          'Genuinely hard questions fail rather than eventually succeeding, so the agent has to say so honestly instead of guessing.',
      },
      {
        title: 'Evaluate with RAGAS before tuning prompts',
        choice: 'Measure retrieval precision and hallucination rate on a labelled set.',
        rationale:
          'Without a baseline, prompt changes are guesswork. Numbers made it clear that retrieval, not phrasing, was the dominant error source.',
        tradeoff:
          'Building and labelling the evaluation set took real time up front before any accuracy gain appeared.',
      },
    ],
    outcomes: [
      { value: '3 days to <1hr', label: 'Query resolution time' },
      { value: '0.71', label: 'Retrieval precision', detail: 'RAGAS evaluation' },
      { value: '60%', label: 'Fewer hallucinations' },
      { value: '3', label: 'Bounded repair attempts' },
    ],
    stack: [
      { group: 'Agent', items: ['LangGraph', 'LangChain', 'HuggingFace', 'RAG'] },
      { group: 'Data', items: ['ChromaDB', 'PostgreSQL', 'SQLite'] },
      { group: 'Evaluation', items: ['RAGAS', 'Prompt engineering'] },
    ],
  },
  {
    slug: 'content-protection',
    title: 'Real-Time Content Protection',
    tagline: 'Per-article, per-user encryption with revocation that lands in under a second.',
    context: 'NewsGenie, Inc.',
    period: 'Feb 2026 to Present',
    role: 'Software Engineer - AI',
    featured: true,
    demo: 'revocation',
    demoNote:
      'Abstracted representation. This demo illustrates the access-control and key-revocation model only. It contains no proprietary code, customer data, or production configuration.',
    problem:
      'Publishers were losing content to scrapers and unauthorized bots that consumed articles at machine speed. Blocking by IP or user agent was trivially evaded, and once content had been served in the clear it was already gone.',
    constraints: [
      'Revocation had to take effect in under a second, across independently deployed services.',
      'Legitimate readers could not be made to feel any of the protection machinery.',
      'Access decisions were per-user and per-article, not per-site, so caching a single answer was not viable.',
      'Key material could never sit in application memory or logs.',
    ],
    approach: [
      'Content is encrypted with a per-article data key, and that data key is itself wrapped by a customer master key held in AWS KMS. The application never handles the master key, so revoking access is a matter of refusing to unwrap rather than re-encrypting the article.',
      'Authorization state lives in Redis so that every service reads the same answer within milliseconds of it changing. A revocation writes once and is observed globally on the next request, which is what makes sub-second propagation possible across service boundaries.',
      'A classifier scores each request against seven distinct bot categories. Because the check sits in front of key unwrapping rather than inside the article renderer, a bot is stopped before any plaintext is produced.',
      'Separately, an agentic content pipeline built on LangChain orchestrates multiple models behind automated review gates, removing over a thousand hours of manual editorial work a year.',
    ],
    diagram: {
      cols: 5,
      rows: 3,
      caption: 'The bot check sits in front of key unwrapping, so refused requests never see plaintext.',
      nodes: [
        { id: 'reader', label: 'Reader', sublabel: 'browser', col: 0, row: 0, kind: 'client' },
        { id: 'bot', label: 'Bot client', sublabel: 'scraper', col: 0, row: 2, kind: 'client' },
        { id: 'api', label: 'FastAPI', sublabel: 'access gateway', col: 1, row: 1, kind: 'gateway' },
        { id: 'clf', label: 'Classifier', sublabel: '7 bot categories', col: 2, row: 2, kind: 'model' },
        { id: 'redis', label: 'Redis', sublabel: 'grant state', col: 2, row: 0, kind: 'store' },
        { id: 'kms', label: 'AWS KMS', sublabel: 'key unwrap', col: 3, row: 1, kind: 'security' },
        { id: 'mongo', label: 'MongoDB', sublabel: 'ciphertext', col: 4, row: 1, kind: 'store' },
      ],
      edges: [
        { from: 'reader', to: 'api' },
        { from: 'bot', to: 'api' },
        { from: 'api', to: 'clf', label: 'score' },
        { from: 'api', to: 'redis', label: 'grant?' },
        { from: 'redis', to: 'kms', label: 'if allowed' },
        { from: 'kms', to: 'mongo', label: 'unwrap key' },
        { from: 'clf', to: 'redis', label: 'revoke', async: true },
      ],
    },
    decisions: [
      {
        title: 'Envelope encryption over direct encryption',
        choice: 'Per-article data keys wrapped by a KMS master key.',
        rationale:
          'Revocation becomes a key-access decision instead of a bulk re-encryption job, so it is fast and cheap no matter how large the article corpus is.',
        tradeoff:
          'Every read depends on KMS availability and adds an unwrap call to the hot path, which has to be budgeted for and cached carefully.',
      },
      {
        title: 'Redis as the authorization source of truth',
        choice: 'Centralized grant state read by every service.',
        rationale:
          'Sub-second revocation across service boundaries is only achievable if no service is holding a stale local copy of the decision.',
        tradeoff:
          'Introduces a shared runtime dependency on the request path; it needs its own redundancy story or it becomes the outage.',
      },
      {
        title: 'Classify before decrypting, not after',
        choice: 'Bot scoring runs ahead of key unwrapping.',
        rationale:
          'Once plaintext exists, protection has already failed. Ordering the check first means a refused request never materializes readable content.',
        tradeoff:
          'A false positive blocks a real reader outright, so classifier precision matters more than recall in this position.',
      },
    ],
    outcomes: [
      { value: 'Sub-second', label: 'Revocation propagation' },
      { value: '7', label: 'Bot categories blocked' },
      { value: '1,000+', label: 'Hours automated yearly', detail: 'Agentic editorial pipeline' },
    ],
    stack: [
      { group: 'Services', items: ['FastAPI', 'React'] },
      { group: 'Data', items: ['MongoDB', 'Redis'] },
      { group: 'Security', items: ['AWS KMS', 'Envelope encryption', 'RBAC'] },
      { group: 'AI', items: ['LangChain', 'Multi-LLM orchestration'] },
    ],
  },
  {
    slug: 'lambdalens',
    title: 'LambdaLens',
    tagline: 'Serverless video analysis that scaled out to concurrent streams and halved its own cloud bill.',
    context: 'Personal project',
    period: 'Fall 2024',
    role: 'Architecture, implementation, cost tuning',
    featured: true,
    demo: 'lambdalens',
    demoNote:
      'Simulation. The topology follows the project architecture documented in the resume. Frames, logs, and timing values are illustrative. The relative cost comparison is calibrated only to the reported 50% reduction.',
    problem:
      'Analyzing video for faces and key scenes on a persistent GPU box meant paying for idle capacity between jobs, and a burst of uploads would queue behind whatever was already running.',
    constraints: [
      'Load was bursty and unpredictable, so fixed capacity was either wasteful or too small.',
      'Cold starts had to stay within an acceptable latency budget despite a heavy vision container.',
      'Every stage needed to be observable enough to debug a single failed frame.',
    ],
    approach: [
      'Uploads land in S3, which emits events into SQS. Lambda consumes that queue, so concurrency follows the actual arrival rate and there is no idle compute between bursts. A queue between storage and compute also means a spike is absorbed rather than dropped.',
      'FFmpeg decodes video into frames and OpenCV handles preprocessing before a ResNet-34 model classifies each frame. Running inference inside the same function avoids a network hop per frame.',
      'The container was the cost problem. Trimming layers, pruning build dependencies, and shrinking the image cut both cold-start time and per-invocation cost roughly in half.',
      'Structured CloudWatch logs carry a correlation identifier through every stage, so a single frame can be traced end to end instead of guessing which invocation failed.',
    ],
    diagram: {
      cols: 5,
      rows: 3,
      caption: 'The queue decouples arrival rate from processing rate, so bursts absorb instead of dropping.',
      nodes: [
        { id: 'up', label: 'Upload', sublabel: 'video', col: 0, row: 1, kind: 'client' },
        { id: 's3', label: 'S3', sublabel: 'object store', col: 1, row: 1, kind: 'store' },
        { id: 'sqs', label: 'SQS', sublabel: 'event queue', col: 2, row: 1, kind: 'queue' },
        { id: 'lam', label: 'Lambda pool', sublabel: 'FFmpeg + OpenCV', col: 3, row: 1, kind: 'compute' },
        { id: 'res', label: 'ResNet-34', sublabel: 'inference', col: 3, row: 0, kind: 'model' },
        { id: 'mongo', label: 'MongoDB', sublabel: 'detections', col: 4, row: 1, kind: 'store' },
        { id: 'cw', label: 'CloudWatch', sublabel: 'traces', col: 4, row: 2, kind: 'security' },
      ],
      edges: [
        { from: 'up', to: 's3' },
        { from: 's3', to: 'sqs', label: 'event', async: true },
        { from: 'sqs', to: 'lam', label: 'fan out', async: true },
        { from: 'lam', to: 'res' },
        { from: 'res', to: 'lam' },
        { from: 'lam', to: 'mongo' },
        { from: 'lam', to: 'cw', async: true },
      ],
    },
    decisions: [
      {
        title: 'Serverless instead of a persistent worker',
        choice: 'S3 events into SQS into Lambda.',
        rationale:
          'Workload arrived in bursts. Paying per invocation matched spend to actual usage and removed the idle cost entirely.',
        tradeoff:
          'Accepted cold starts and hard execution limits, which constrained how large a single unit of work could be.',
      },
      {
        title: 'Optimize the image before optimizing the model',
        choice: 'Aggressive container slimming.',
        rationale:
          'Profiling showed image pull and initialization dominated cost, not inference. The cheapest 50% came from the build, not the math.',
        tradeoff:
          'A leaner image is more brittle. Dependencies have to be pinned deliberately, and upgrades break more visibly.',
      },
      {
        title: 'Correlation identifiers in structured logs',
        choice: 'One traceable identifier threaded through every stage.',
        rationale:
          'With hundreds of concurrent invocations, unstructured logs make a single failure effectively unfindable.',
        tradeoff:
          'More log volume and cost, plus the discipline of passing context through every function boundary.',
      },
    ],
    outcomes: [
      { value: '50%', label: 'Cloud cost reduction' },
      { value: '90%+', label: 'Inference accuracy', detail: 'Unseen video data' },
      { value: 'Real time', label: 'Concurrent stream processing' },
    ],
    stack: [
      { group: 'Compute', items: ['AWS Lambda', 'Docker'] },
      { group: 'Vision', items: ['OpenCV', 'FFmpeg', 'ResNet-34'] },
      { group: 'Data', items: ['S3', 'SQS', 'MongoDB'] },
      { group: 'Observability', items: ['CloudWatch'] },
    ],
    links: [{ label: 'Source on GitHub', href: 'https://github.com/sky021/LambdaLens' }],
  },
  {
    slug: 'particle-tracking',
    title: 'Soil Particle Tracking Pipeline',
    tagline: 'Multi-object tracking that held identity across 3,500+ particles and cut a 40-hour cycle to 2.',
    context: 'Arizona State University',
    period: 'Aug 2024 to Jul 2025',
    role: 'AI Engineer',
    featured: true,
    demo: 'tracking',
    demoNote:
      'Simulation. Particle motion is generated in the browser to demonstrate the tracking and re-identification behaviour, including an occlusion event. It is not real research footage.',
    problem:
      'Geotechnical researchers were measuring soil particle movement by hand, frame by frame. A single experimental cycle consumed around forty hours of manual annotation, which capped how many experiments could realistically be run.',
    constraints: [
      'Particles are small, numerous, and visually near-identical, so appearance alone cannot distinguish them.',
      'Particles constantly occlude one another, and a broken track corrupts the displacement measurement it feeds.',
      'Results had to be reproducible across machines to be defensible in research.',
    ],
    approach: [
      'YOLOv8 handles detection and FairMOT supplies re-identification embeddings, so a particle that disappears behind another can be matched back to its original track when it reappears rather than being counted as a new object.',
      'The pipeline runs on AWS Lambda against S3, processing segments in parallel. Splitting the work by segment is what turned a forty-hour serial annotation cycle into a two-hour parallel one.',
      'Docker and Terraform pin the environment and the infrastructure together, which eliminated the configuration drift that had made earlier runs difficult to reproduce and cut new-environment setup time by 90%.',
      'CloudWatch instrumentation covers every stage, giving the 99.9% uptime figure something behind it and making failed segments visible immediately rather than at the end of a run.',
    ],
    diagram: {
      cols: 5,
      rows: 3,
      caption: 'Re-identification is what keeps a track alive through occlusion.',
      nodes: [
        { id: 'vid', label: 'Video', sublabel: 'experiment capture', col: 0, row: 1, kind: 'client' },
        { id: 's3', label: 'S3', sublabel: 'segments', col: 1, row: 1, kind: 'store' },
        { id: 'yolo', label: 'YOLOv8', sublabel: 'detection', col: 2, row: 0, kind: 'model' },
        { id: 'fair', label: 'FairMOT', sublabel: 're-identification', col: 2, row: 2, kind: 'model' },
        { id: 'assoc', label: 'Association', sublabel: 'track continuity', col: 3, row: 1, kind: 'compute' },
        { id: 'out', label: 'Displacement', sublabel: 'research output', col: 4, row: 1, kind: 'store' },
      ],
      edges: [
        { from: 'vid', to: 's3' },
        { from: 's3', to: 'yolo', label: 'parallel', async: true },
        { from: 's3', to: 'fair', async: true },
        { from: 'yolo', to: 'assoc', label: 'boxes' },
        { from: 'fair', to: 'assoc', label: 'embeddings' },
        { from: 'assoc', to: 'out' },
      ],
    },
    decisions: [
      {
        title: 'Pair detection with re-identification',
        choice: 'YOLOv8 for detection, FairMOT embeddings for identity.',
        rationale:
          'Detection alone loses a particle the moment it is occluded. Identity embeddings let the tracker recover the original track instead of fragmenting it.',
        tradeoff:
          'Higher compute per frame and a second model to tune and keep in step with the detector.',
      },
      {
        title: 'Parallelize by video segment',
        choice: 'Independent Lambda invocations per segment.',
        rationale:
          'Segments are largely independent, which makes the throughput win close to linear and is the bulk of the 95% time reduction.',
        tradeoff:
          'Tracks that span a segment boundary need stitching, which is extra logic and a source of subtle error.',
      },
      {
        title: 'Treat reproducibility as infrastructure',
        choice: 'Docker images plus Terraform-defined environments.',
        rationale:
          'Research conclusions are only as good as the ability to re-run them. Pinning both code and infrastructure removed drift as a variable.',
        tradeoff:
          'Slower initial setup and a requirement that collaborators work through the toolchain rather than around it.',
      },
    ],
    outcomes: [
      { value: '95%', label: 'Faster analysis', detail: '40hr to 2hr per cycle' },
      { value: '0.82', label: 'mAP', detail: '3,500+ tracked entities' },
      { value: '90%', label: 'Less setup time', detail: 'Docker + Terraform' },
      { value: '99.9%', label: 'Uptime' },
    ],
    stack: [
      { group: 'Vision', items: ['YOLOv8', 'FairMOT', 'PyTorch', 'OpenCV'] },
      { group: 'Cloud', items: ['AWS Lambda', 'S3', 'CloudWatch'] },
      { group: 'Infra', items: ['Docker', 'Terraform'] },
    ],
  },
  {
    slug: 'financial-middleware',
    title: 'Financial Config Automation',
    tagline: 'Middleware that took manual configuration changes out of a bank\'s release path.',
    context: 'LTIMindtree · CITI Bank',
    period: 'Jan 2023 to Nov 2023',
    role: 'Software Engineer',
    featured: false,
    problem:
      'Configuration changes across financial environments were applied by hand. That is slow, and in a regulated system it is also a compliance liability because there is no reliable record of who changed what.',
    constraints: [
      'Every change needed an attributable audit trail.',
      'Access had to be role-scoped, not shared.',
      'Nothing could ship without passing quality gates.',
    ],
    approach: [
      'A Node.js middleware layer with an Angular front end replaced manual configuration steps with reviewed, repeatable operations, so the same change could be promoted across environments without hand-editing.',
      'Security was built into the layer rather than bolted on: single sign-on for identity, role-based access control for authorization, and full audit logging so every mutation is attributable after the fact.',
      'Throughput came from the data layer. Oracle PL/SQL tuning, REST integration, and parallel execution together moved processing 35% faster.',
      'A Jenkins pipeline with Docker, Kubernetes, and SonarQube enforced code review and static analysis as a merge requirement rather than a convention.',
    ],
    diagram: {
      cols: 4,
      rows: 3,
      caption: 'Identity and audit wrap the middleware rather than living inside individual services.',
      nodes: [
        { id: 'ui', label: 'Angular', sublabel: 'operator console', col: 0, row: 1, kind: 'client' },
        { id: 'sso', label: 'SSO + RBAC', sublabel: 'identity', col: 1, row: 0, kind: 'security' },
        { id: 'mw', label: 'Node.js', sublabel: 'middleware', col: 1, row: 1, kind: 'gateway' },
        { id: 'ora', label: 'Oracle', sublabel: 'PL/SQL', col: 2, row: 1, kind: 'store' },
        { id: 'audit', label: 'Audit log', sublabel: 'attribution', col: 2, row: 2, kind: 'security' },
        { id: 'ci', label: 'Jenkins', sublabel: 'CI/CD gates', col: 3, row: 1, kind: 'compute' },
      ],
      edges: [
        { from: 'ui', to: 'mw' },
        { from: 'sso', to: 'mw', label: 'verify' },
        { from: 'mw', to: 'ora' },
        { from: 'mw', to: 'audit', async: true },
        { from: 'ora', to: 'ci', label: 'promote' },
      ],
    },
    decisions: [
      {
        title: 'Audit logging as a first-class feature',
        choice: 'Every mutation recorded with actor and payload.',
        rationale:
          'In a financial system, being unable to answer who changed a value is itself the defect.',
        tradeoff: 'Additional write volume and storage on every operation.',
      },
      {
        title: 'Quality gates enforced in the pipeline',
        choice: 'SonarQube and mandatory review wired into Jenkins.',
        rationale:
          'Standards that live in documentation get skipped under deadline; standards that block a merge do not.',
        tradeoff: 'Slower merges and occasional friction over false positives.',
      },
    ],
    outcomes: [
      { value: '35%', label: 'Faster data processing' },
      { value: 'SSO + RBAC', label: 'Access hardening' },
      { value: 'Full', label: 'Audit coverage' },
    ],
    stack: [
      { group: 'Application', items: ['Node.js', 'Angular'] },
      { group: 'Data', items: ['Oracle PL/SQL', 'REST APIs'] },
      { group: 'Delivery', items: ['Jenkins', 'Docker', 'Kubernetes', 'SonarQube'] },
    ],
  },
  {
    slug: 'master-data-pipeline',
    title: 'Enterprise Master Data Pipeline',
    tagline: 'Ten million fragmented customer records reduced to 2.5 million trustworthy ones.',
    context: 'LTIMindtree · Avery Dennison',
    period: 'Aug 2021 to Dec 2022',
    role: 'Software Engineer - Data',
    featured: false,
    problem:
      'Customer data lived in regional systems that disagreed with each other. The same customer existed several times over under different spellings, which made unified CRM reporting and any downstream analytics unreliable.',
    constraints: [
      'Source systems could not be changed, only read.',
      'Merging distinct customers is a worse failure than leaving duplicates, so matching had to be conservative.',
      'Data quality needed to be demonstrable, not asserted.',
    ],
    approach: [
      'An Informatica ETL pipeline consolidates ten million records from the regional systems into a single master flow, normalizing formats before any matching is attempted.',
      'Deduplication and automated validation testing run inside the pipeline, which moved governance metrics four-fold. The improvement came from measuring quality continuously rather than auditing it periodically.',
      'Python, Oracle PL/SQL, and REST enrichment lifted legacy pipeline efficiency by 30%, largely by replacing row-at-a-time work with set-based operations.',
      'The result is 2.5 million golden records published to downstream Oracle CRM/CX systems as the authoritative customer view for AI-driven analytics.',
    ],
    diagram: {
      cols: 5,
      rows: 3,
      caption: 'Validation runs inside the pipeline, so quality is measured continuously rather than audited later.',
      nodes: [
        { id: 'src', label: 'Regional systems', sublabel: '10M records', col: 0, row: 1, kind: 'store' },
        { id: 'etl', label: 'Informatica', sublabel: 'ETL', col: 1, row: 1, kind: 'compute' },
        { id: 'enr', label: 'Enrichment', sublabel: 'Python + REST', col: 2, row: 0, kind: 'compute' },
        { id: 'dedup', label: 'Dedup', sublabel: 'match rules', col: 2, row: 2, kind: 'compute' },
        { id: 'gold', label: 'Golden records', sublabel: '2.5M', col: 3, row: 1, kind: 'store' },
        { id: 'crm', label: 'Oracle CRM/CX', sublabel: 'downstream', col: 4, row: 1, kind: 'client' },
      ],
      edges: [
        { from: 'src', to: 'etl' },
        { from: 'etl', to: 'enr' },
        { from: 'etl', to: 'dedup' },
        { from: 'enr', to: 'gold' },
        { from: 'dedup', to: 'gold' },
        { from: 'gold', to: 'crm', label: 'publish' },
      ],
    },
    decisions: [
      {
        title: 'Conservative match thresholds',
        choice: 'Prefer leaving a duplicate over merging two real customers.',
        rationale:
          'An incorrect merge is very hard to unwind and corrupts downstream reporting silently. A surviving duplicate is visible and fixable.',
        tradeoff: 'A residual duplicate rate that needs periodic manual review.',
      },
      {
        title: 'Validation inside the pipeline',
        choice: 'Automated quality tests on every run.',
        rationale:
          'Continuous measurement is what produced the four-fold governance improvement; periodic audits only find problems long after they land.',
        tradeoff: 'Longer runtimes and a test suite that must evolve with the data.',
      },
    ],
    outcomes: [
      { value: '10M', label: 'Records consolidated' },
      { value: '2.5M', label: 'Golden records delivered' },
      { value: '4x', label: 'Governance metric gain' },
      { value: '30%', label: 'Pipeline efficiency gain' },
    ],
    stack: [
      { group: 'Pipeline', items: ['Informatica ETL', 'Python', 'Oracle PL/SQL'] },
      { group: 'Integration', items: ['REST APIs', 'Oracle CRM/CX'] },
    ],
  },
]

export const featuredCaseStudies = caseStudies.filter((study) => study.featured)

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug)
}

export const navItems = [
  { href: '/#work', label: 'Work' },
  { href: '/#experience', label: 'Experience' },
  { href: '/#skills', label: 'Skills' },
  { href: '/#about', label: 'About' },
  { href: '/#contact', label: 'Contact' },
]
