import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { defaultContent } from '../data/defaultContent.js';

function Services({ content = defaultContent }) {
  const services = content.services?.length ? content.services : defaultContent.services;

  return (
    <section className="page-content services-page">
      <div className="section-hero">
        <div>
          <span className="eyebrow">Mobile Services</span>
          <h2>Trusted repair and support in one place</h2>
          <p>Submit your device details and discover fast, reliable service options with transparent pricing.</p>
        </div>
      </div>

      <div className="grid-cols service-grid">
        {services.map((item) => (
          <Card
            key={item.id}
            title={item.title}
            subtitle={item.description}
            footer={<Button variant="solid">Apply Now</Button>}
            className="service-card"
          />
        ))}
      </div>
    </section>
  );
}

export default Services;
