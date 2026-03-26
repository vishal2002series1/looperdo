export const mockStudentProfile = {
  readinessScore: 72,
  totalTestsTaken: 24,
  totalStudyHours: 48.5,
  currentStreak: 7,
  longestStreak: 14,
  certifications: [
    {
      certificationSlug: 'aws-saa',
      certificationName: 'AWS Solutions Architect Associate',
      readinessScore: 78,
      testsCompleted: 16,
      topicScores: {
        'Design Secure Architectures': 85,
        'Design Resilient Architectures': 72,
        'Design High-Performing Architectures': 68,
        'Design Cost-Optimized Architectures': 80,
        'VPC & Networking': 62,
        'IAM & Security': 90,
        'S3 & Storage Solutions': 75,
        'EC2 & Compute': 82,
        'RDS & DynamoDB': 58,
        'CloudFront & Route 53': 70,
      },
    },
    {
      certificationSlug: 'lean-six-sigma',
      certificationName: 'Lean Six Sigma Black Belt',
      readinessScore: 45,
      testsCompleted: 8,
      topicScores: {
        'Define Phase': 65,
        'Measure Phase': 52,
        'Analyze Phase': 40,
        'Improve Phase': 35,
        'Control Phase': 30,
        'Statistical Process Control': 48,
        'Hypothesis Testing': 42,
        'Regression Analysis': 38,
      },
    },
  ],
};

export const mockTestHistory = [
  { id: '1', certificationSlug: 'aws-saa', certificationName: 'AWS SAA', score: 82, totalQuestions: 20, correctAnswers: 16, difficulty: 'hard', completedAt: '2026-03-24T14:30:00Z' },
  { id: '2', certificationSlug: 'aws-saa', certificationName: 'AWS SAA', score: 75, totalQuestions: 20, correctAnswers: 15, difficulty: 'medium', completedAt: '2026-03-22T10:15:00Z' },
  { id: '3', certificationSlug: 'lean-six-sigma', certificationName: 'LSSBB', score: 60, totalQuestions: 15, correctAnswers: 9, difficulty: 'medium', completedAt: '2026-03-21T16:45:00Z' },
  { id: '4', certificationSlug: 'aws-saa', certificationName: 'AWS SAA', score: 70, totalQuestions: 20, correctAnswers: 14, difficulty: 'medium', completedAt: '2026-03-20T09:00:00Z' },
  { id: '5', certificationSlug: 'aws-saa', certificationName: 'AWS SAA', score: 65, totalQuestions: 20, correctAnswers: 13, difficulty: 'easy', completedAt: '2026-03-18T11:30:00Z' },
  { id: '6', certificationSlug: 'lean-six-sigma', certificationName: 'LSSBB', score: 53, totalQuestions: 15, correctAnswers: 8, difficulty: 'easy', completedAt: '2026-03-17T15:00:00Z' },
];

export const mockTestQuestions = [
  {
    id: 'q1',
    question: 'A company needs to store objects that are frequently accessed for the first 30 days, then rarely accessed. Which S3 storage strategy minimizes cost?',
    options: [
      'A) Store in S3 Standard, use lifecycle policy to transition to S3 Glacier after 30 days',
      'B) Store in S3 Intelligent-Tiering',
      'C) Store in S3 Standard-IA from the start',
      'D) Store in S3 One Zone-IA with lifecycle policy to Glacier Deep Archive',
    ],
    correctAnswer: 0,
    topic: 'Design Cost-Optimized Architectures',
    difficulty: 'medium',
    explanation: 'S3 Standard with a lifecycle policy to transition to Glacier after 30 days is the most cost-effective for objects that are frequently accessed initially then rarely accessed.',
  },
  {
    id: 'q2',
    question: 'Which AWS service provides a managed, serverless message queuing service that decouples application components?',
    options: ['A) Amazon SNS', 'B) Amazon SQS', 'C) Amazon MQ', 'D) AWS Step Functions'],
    correctAnswer: 1,
    topic: 'Design Resilient Architectures',
    difficulty: 'easy',
    explanation: 'Amazon SQS (Simple Queue Service) is a fully managed, serverless message queuing service used to decouple and scale microservices and distributed systems.',
  },
  {
    id: 'q3',
    question: 'An application requires low-latency access to data stored in S3 with the ability to run SQL queries. Which service should be used?',
    options: ['A) Amazon Redshift Spectrum', 'B) Amazon Athena', 'C) Amazon ElastiCache', 'D) Amazon RDS'],
    correctAnswer: 1,
    topic: 'Design High-Performing Architectures',
    difficulty: 'medium',
    explanation: 'Amazon Athena allows you to run SQL queries directly on data stored in S3 without loading data into a database, providing serverless querying capability.',
  },
  {
    id: 'q4',
    question: 'A VPC needs to allow instances in a private subnet to access the internet for software updates while preventing inbound connections. What should be configured?',
    options: ['A) Internet Gateway', 'B) NAT Gateway in a public subnet', 'C) VPC Peering', 'D) AWS Direct Connect'],
    correctAnswer: 1,
    topic: 'VPC & Networking',
    difficulty: 'medium',
    explanation: 'A NAT Gateway placed in a public subnet allows instances in private subnets to initiate outbound connections to the internet while preventing unsolicited inbound connections.',
  },
  {
    id: 'q5',
    question: 'Which IAM policy evaluation logic applies when there is both an Allow and Deny statement for the same action?',
    options: ['A) Allow takes precedence', 'B) Deny takes precedence', 'C) The most specific statement takes precedence', 'D) The most recent policy takes precedence'],
    correctAnswer: 1,
    topic: 'IAM & Security',
    difficulty: 'easy',
    explanation: 'In AWS IAM, an explicit Deny always takes precedence over any Allow. This is a fundamental security principle in AWS access control.',
  },
];

export const mockWorkbook = {
  title: 'Personalized Workbook: AWS SAA - Weak Areas',
  generatedAt: '2026-03-24T14:35:00Z',
  sections: [
    {
      topic: 'RDS & DynamoDB',
      score: 58,
      theory: 'Amazon RDS supports multiple database engines including MySQL, PostgreSQL, MariaDB, Oracle, and SQL Server. Key concepts include Multi-AZ deployments for high availability, Read Replicas for read scaling, and automated backups. DynamoDB is a fully managed NoSQL database with single-digit millisecond performance at any scale.',
      keyPoints: [
        'RDS Multi-AZ provides synchronous replication for HA',
        'Read Replicas use async replication for read scaling',
        'DynamoDB uses partition keys for data distribution',
        'DynamoDB Streams enable event-driven architectures',
        'RDS automated backups have a retention period of 0-35 days',
      ],
      tricks: [
        'Multi-AZ = High Availability, Read Replica = Performance',
        'DynamoDB: Think "partition key" for even data distribution',
        'Aurora = 5x MySQL, 3x PostgreSQL performance',
      ],
      youtubeLinks: [
        { title: 'AWS RDS Deep Dive', url: 'https://youtube.com/watch?v=example1' },
        { title: 'DynamoDB Masterclass', url: 'https://youtube.com/watch?v=example2' },
      ],
      practiceQuestions: [
        'What is the maximum retention period for RDS automated backups?',
        'How does DynamoDB handle hot partitions?',
        'When would you choose Aurora over standard RDS MySQL?',
      ],
    },
    {
      topic: 'VPC & Networking',
      score: 62,
      theory: 'Amazon VPC lets you provision a logically isolated section of AWS Cloud. Key components include subnets (public/private), route tables, internet gateways, NAT gateways, security groups (stateful), and network ACLs (stateless).',
      keyPoints: [
        'Security Groups are stateful; NACLs are stateless',
        'NAT Gateway allows private subnet internet access',
        'VPC Peering connects VPCs without traversing internet',
        'Transit Gateway connects multiple VPCs and on-premises networks',
        'VPC Endpoints provide private access to AWS services',
      ],
      tricks: [
        'Security Group = Stateful (remembers), NACL = Stateless (forgets)',
        'Public subnet = has route to IGW, Private = no route to IGW',
        'VPC Peering is NOT transitive',
      ],
      youtubeLinks: [
        { title: 'VPC Networking Explained', url: 'https://youtube.com/watch?v=example3' },
      ],
      practiceQuestions: [
        'What is the difference between Security Groups and NACLs?',
        'How do you enable internet access for a private subnet?',
        'What are VPC Endpoints and when should you use them?',
      ],
    },
  ],
};

export const mockDiagnosis = {
  overallScore: 75,
  totalCorrect: 15,
  totalQuestions: 20,
  strongAreas: ['IAM & Security', 'Design Secure Architectures', 'EC2 & Compute'],
  weakAreas: ['RDS & DynamoDB', 'VPC & Networking'],
  recommendations: [
    'Focus on RDS Multi-AZ vs Read Replica differences',
    'Practice VPC networking scenarios with NAT Gateways',
    'Review DynamoDB partition key design patterns',
  ],
  topicBreakdown: [
    { topic: 'IAM & Security', correct: 3, total: 3, score: 100 },
    { topic: 'Design Secure Architectures', correct: 3, total: 4, score: 75 },
    { topic: 'EC2 & Compute', correct: 2, total: 2, score: 100 },
    { topic: 'S3 & Storage Solutions', correct: 2, total: 3, score: 67 },
    { topic: 'Design Cost-Optimized Architectures', correct: 2, total: 3, score: 67 },
    { topic: 'VPC & Networking', correct: 1, total: 3, score: 33 },
    { topic: 'RDS & DynamoDB', correct: 2, total: 2, score: 100 },
  ],
};
