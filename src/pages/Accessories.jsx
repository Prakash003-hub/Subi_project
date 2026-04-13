import { useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { defaultContent, productIconMap } from '../data/defaultContent.js';

function Accessories({ content = defaultContent }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set((content.products || defaultContent.products).map((item) => item.category)),
    );
    return ['All', ...uniqueCategories];
  }, [content.products]);

  const filtered = useMemo(
    () =>
      (content.products || defaultContent.products).filter(
        (product) => activeCategory === 'All' || product.category === activeCategory,
      ),
    [activeCategory, content.products],
  );

  return (
    <section className="page-content accessories-page">
      <div className="section-hero">
        <div>
          <span className="eyebrow">Accessories Shop</span>
          <h2>Premium mobile essentials for every style</h2>
          <p>
            Choose from phone covers, glass protectors, charging kits and audio gear,
            designed for everyday convenience.
          </p>
        </div>
        <Button variant="solid">Explore Now</Button>
      </div>

      <div className="filter-bar">
        {categories.map((category) => (
          <button
            key={category}
            className={`filter-pill ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid-cols accessory-grid">
        {filtered.map((item) => (
          <Card
            key={item.id}
            title={item.title}
            subtitle={`${item.model} • ${item.category}`}
            footer={<span className="price-tag accent">{item.price}</span>}
            className="product-card"
            image={
              item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} />
              ) : (
                <div className="product-icon">{productIconMap[item.imageKey] || '🛍️'}</div>
              )
            }
          >
            <p>{item.description}</p>
            <Button variant="outline" className="full-width">
              Buy Now
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default Accessories;
