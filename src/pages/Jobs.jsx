import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { defaultContent } from '../data/defaultContent.js';

function Jobs({ content = defaultContent }) {
  const jobs = content.jobs?.length ? content.jobs : defaultContent.jobs;

  return (
    <section className="page-content jobs-page">
      <div className="section-hero">
        <div>
          <span className="eyebrow">Career Openings</span>
          <h2>Join SUBI and grow with our retail team.</h2>
          <p>We are hiring talented people for customer-facing service roles with professional support.</p>
        </div>
      </div>

      <div className="jobs-stack">
        {jobs.map((job) => (
          <Card
            key={job.id}
            title={job.title}
            subtitle={job.description}
            className="job-card"
            footer={
              <div className="job-footer">
                <span>{job.qualification}</span>
                <div>
                  <span className="job-date">{job.date}</span>
                  <Button variant="outline">Apply</Button>
                </div>
              </div>
            }
          />
        ))}
      </div>
    </section>
  );
}

export default Jobs;
