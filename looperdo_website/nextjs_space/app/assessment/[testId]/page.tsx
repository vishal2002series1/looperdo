import AssessmentClient from './assessment-client';

export default function AssessmentPage({ params }: { params: { testId: string } }) {
  return <AssessmentClient testId={params.testId} />;
}