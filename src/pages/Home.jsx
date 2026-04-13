import Slider from '../components/Slider.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { defaultContent } from '../data/defaultContent.js';

const categories = [
  { title: 'Accessories', name: 'accessories' },
  { title: 'Services', name: 'services' },
  { title: 'Jobs', name: 'jobs' },
  { title: 'Offers', name: 'home' },
];

function Home({ onNavigate, content = defaultContent }) {
  const posts = content.posts?.length ? content.posts : defaultContent.posts;
  const featured = content.products?.length ? content.products.slice(0, 3) : defaultContent.products.slice(0, 3);

  return (
    <section className="page-content home-page">
      <section className="section-block instagram-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Instagram Posts</p>
            <h3>Top to bottom post feed with order action</h3>
          </div>
        </div>

        <div className="instagram-feed">
          {posts.map((post) => {
            const whatsappText = encodeURIComponent(
              `Hi, I want to order ${post.title}. Description: ${post.description}. Price: ${post.price}.`,
            );
            const whatsappLink = `https://wa.me/9385497906?text=${whatsappText}`;

            return (
              <Card
                key={post.id}
                className="instagram-card instagram-post-card"
                image={post.imageUrl ? <img src={post.imageUrl} alt={post.title} /> : <div className="post-placeholder">Upload image</div>}
                title={post.title}
                subtitle="Instagram post"
              >
                <p>{post.description}</p>
                <div className="instagram-footer">
                  <Button
                    variant="solid"
                    className="instagram-order-btn"
                    onClick={() => window.open(whatsappLink, '_blank', 'noopener,noreferrer')}
                  >
                    Order on WhatsApp
                  </Button>
                  <span className="price-tag accent">{post.price}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="hero-panel">
        <div>
          <span className="eyebrow">SUBI Exclusive</span>
          <h2>Your one-stop Phone & Service Studio</h2>
          <p>
            Explore modern accessories, quick mobile repair services, job openings,
            and premium offers curated for your lifestyle.
          </p>
          <div className="hero-actions">
            <Button variant="solid" onClick={() => onNavigate('accessories')}>
              Shop Accessories
            </Button>
            <Button variant="ghost" onClick={() => onNavigate('services')}>
              Book Service
            </Button>
          </div>
        </div>
      </div>

      <Slider />

      <section className="section-block category-grid">
        {categories.map((item) => (
          <button
            key={item.title}
            className="category-pill"
            onClick={() => onNavigate(item.name)}
          >
            {item.title}
          </button>
        ))}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Featured</p>
            <h3>Hot picks from SUBI Collections</h3>
          </div>
          <Button variant="outline" onClick={() => onNavigate('accessories')}>
            View All
          </Button>
        </div>
        <div className="grid-cols">
          {featured.map((item) => (
            <Card
              key={item.id}
              title={item.title}
              subtitle={item.model}
              footer={<span className="price-tag">{item.price}</span>}
            >
              <p>{item.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </section>
  );
}

export default Home;
