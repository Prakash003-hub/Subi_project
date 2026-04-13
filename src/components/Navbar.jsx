import Button from './Button.jsx';

function Navbar({ activePage, onNavigate, pages }) {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <div className="brand-mark">SUBI</div>
        <div>
          <h1>SUBI Online Service</h1>
          <p>Mobile Accessories & Support</p>
        </div>
      </div>

      <nav className="topbar-nav">
        {pages.slice(0, 3).map((page) => (
          <Button
            key={page.key}
            variant={activePage === page.key ? 'solid' : 'ghost'}
            onClick={() => onNavigate(page.key)}
            className="topbar-link"
          >
            {page.label}
          </Button>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;
