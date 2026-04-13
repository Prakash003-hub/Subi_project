function Card({ image, title, subtitle, footer, children, className = '' }) {
  return (
    <article className={`card ${className}`}>
      {image && <div className="card-media">{image}</div>}
      <div className="card-body">
        {title && <h3>{title}</h3>}
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
        {children}
      </div>
      {footer && <div className="card-footer">{footer}</div>}
    </article>
  );
}

export default Card;
