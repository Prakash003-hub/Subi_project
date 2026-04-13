import { useEffect, useState } from 'react';
import slide1 from '../assets/slide-1.svg';
import slide2 from '../assets/slide-2.svg';
import slide3 from '../assets/slide-3.svg';

const slides = [
  {
    title: 'Protect your screen with style',
    description: 'Top-quality glass protectors for every phone brand.',
    image: slide1,
    badge: 'New Arrival',
  },
  {
    title: 'Daily deals on phone covers',
    description: 'Premium textures, soft grips and vibrant palettes.',
    image: slide2,
    badge: 'Featured',
  },
  {
    title: 'Book service without hassle',
    description: 'Fast repairs, trusted technicians and clear pricing.',
    image: slide3,
    badge: 'Popular',
  },
];

function Slider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((value) => (value + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="section-block slider-shell">
      <div className="slider-card">
        <div className="slide-copy">
          <span className="eyebrow">{slides[active].badge}</span>
          <h3>{slides[active].title}</h3>
          <p>{slides[active].description}</p>
          <button className="btn btn-solid">Explore Offer</button>
        </div>
        <div className="slide-image">
          <img src={slides[active].image} alt={slides[active].title} />
        </div>
      </div>

      <div className="slider-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === active ? 'active' : ''}`}
            onClick={() => setActive(index)}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default Slider;
