export interface Certification {
  slug: string;
  name: string;
  shortName: string;
  provider: string;
  image: string;
  description: string;
  examDetails: string;
  topics: string[];
  difficulty: string;
  passingScore: string;
  examDuration: string;
  questionCount: string;
}

export const certifications: Certification[] = [
  {
    slug: 'aws-saa',
    name: 'AWS Solutions Architect Associate',
    shortName: 'AWS SAA-C03',
    provider: 'Amazon Web Services',
    image: '/images/aws-saa.png',
    description: 'Validate your ability to design distributed systems on AWS. This certification demonstrates your expertise in designing cost-optimized, high-performing, resilient, and secure architectures.',
    examDetails: 'The AWS Certified Solutions Architect – Associate (SAA-C03) exam validates your ability to design solutions that are secure, resilient, high-performing, and cost-optimized.',
    topics: ['Design Secure Architectures', 'Design Resilient Architectures', 'Design High-Performing Architectures', 'Design Cost-Optimized Architectures', 'VPC & Networking', 'IAM & Security', 'S3 & Storage Solutions', 'EC2 & Compute', 'RDS & DynamoDB', 'CloudFront & Route 53'],
    difficulty: 'Intermediate',
    passingScore: '720/1000',
    examDuration: '130 minutes',
    questionCount: '65 questions',
  },
  {
    slug: 'lean-six-sigma',
    name: 'Lean Six Sigma Black Belt (IASSC)',
    shortName: 'LSSBB',
    provider: 'IASSC',
    image: '/images/lean-six-sigma.png',
    description: 'Master the DMAIC methodology and lead process improvement projects. Demonstrate advanced knowledge of Lean Six Sigma tools and statistical analysis.',
    examDetails: 'The IASSC Certified Lean Six Sigma Black Belt exam tests comprehensive understanding of Lean Six Sigma methodology, tools, and their application in leading complex improvement projects.',
    topics: ['Define Phase', 'Measure Phase', 'Analyze Phase', 'Improve Phase', 'Control Phase', 'Statistical Process Control', 'Hypothesis Testing', 'Regression Analysis', 'Design of Experiments', 'Value Stream Mapping'],
    difficulty: 'Advanced',
    passingScore: '580/750',
    examDuration: '4 hours',
    questionCount: '150 questions',
  },
  {
    slug: 'azure-az104',
    name: 'Microsoft Azure Administrator',
    shortName: 'AZ-104',
    provider: 'Microsoft',
    image: '/images/azure-az104.png',
    description: 'Prove your skills in implementing, managing, and monitoring Azure environments. Covers identity, governance, storage, compute, and virtual networking.',
    examDetails: 'The Azure Administrator Associate certification validates your expertise in implementing, managing, and monitoring an organization\'s Microsoft Azure environment.',
    topics: ['Manage Azure Identities & Governance', 'Implement & Manage Storage', 'Deploy & Manage Compute Resources', 'Configure & Manage Virtual Networking', 'Monitor & Maintain Azure Resources', 'Azure Active Directory', 'Azure Policy', 'ARM Templates', 'Azure Monitor', 'Network Security Groups'],
    difficulty: 'Intermediate',
    passingScore: '700/1000',
    examDuration: '100 minutes',
    questionCount: '40-60 questions',
  },
  {
    slug: 'power-bi-pl300',
    name: 'Microsoft Power BI Data Analyst',
    shortName: 'PL-300',
    provider: 'Microsoft',
    image: '/images/power-bi-pl300.png',
    description: 'Demonstrate your ability to design, build, and deploy data-driven solutions using Power BI. Covers data preparation, modeling, visualization, and analysis.',
    examDetails: 'The Power BI Data Analyst Associate certification validates expertise in maximizing the value of data assets using Microsoft Power BI.',
    topics: ['Prepare the Data', 'Model the Data', 'Visualize & Analyze the Data', 'Deploy & Maintain Assets', 'DAX Formulas', 'Power Query', 'Data Relationships', 'Row-Level Security', 'Dashboard Design', 'Report Publishing'],
    difficulty: 'Intermediate',
    passingScore: '700/1000',
    examDuration: '100 minutes',
    questionCount: '40-60 questions',
  },
  {
    slug: 'gcp-ace',
    name: 'Google Cloud Associate Cloud Engineer',
    shortName: 'GCP ACE',
    provider: 'Google Cloud',
    image: '/images/gcp-ace.png',
    description: 'Certify your ability to deploy applications, monitor operations, and manage enterprise solutions on Google Cloud Platform.',
    examDetails: 'The Associate Cloud Engineer certification demonstrates your ability to deploy applications, monitor operations, and maintain cloud projects on Google Cloud.',
    topics: ['Setting Up a Cloud Solution Environment', 'Planning & Configuring Cloud Solutions', 'Deploying & Implementing Cloud Solutions', 'Ensuring Successful Cloud Operations', 'Configuring Access & Security', 'Compute Engine', 'Kubernetes Engine', 'Cloud Storage', 'BigQuery', 'Cloud IAM'],
    difficulty: 'Intermediate',
    passingScore: 'Pass/Fail (scaled)',
    examDuration: '120 minutes',
    questionCount: '50 questions',
  },
  {
    slug: 'pmp',
    name: 'Project Management Professional',
    shortName: 'PMP',
    provider: 'PMI',
    image: '/images/pmp.png',
    description: 'The gold standard in project management certification. Prove your competence in leading and directing projects using predictive, agile, and hybrid approaches.',
    examDetails: 'The PMP certification validates your competence to perform in the role of a project manager, leading and directing projects and teams.',
    topics: ['People', 'Process', 'Business Environment', 'Predictive Approaches', 'Agile Methodologies', 'Hybrid Approaches', 'Stakeholder Management', 'Risk Management', 'Schedule Management', 'Cost Management'],
    difficulty: 'Advanced',
    passingScore: 'Pass/Fail (scaled)',
    examDuration: '230 minutes',
    questionCount: '180 questions',
  },
];
