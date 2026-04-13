import { useEffect, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import { cloneDefaultContent } from './data/defaultContent.js';
import { loadContent } from './lib/contentApi.js';
import Home from './pages/Home.jsx';
import Accessories from './pages/Accessories.jsx';
import Services from './pages/Services.jsx';
import Form from './pages/Form.jsx';
import Jobs from './pages/Jobs.jsx';
import Admin from './pages/Admin.jsx';

const pages = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'accessories', label: 'Accessories', icon: '📱' },
  { key: 'services', label: 'Online Services', icon: '🛠️' },
  { key: 'form', label: 'Service Form', icon: '📝' },
  { key: 'jobs', label: 'Jobs', icon: '💼' },
];

function getPageFromPath(pathname) {
  const cleanPath = pathname.replace(/\/+$/, '');

  if (cleanPath === '/admin') {
    return 'admin';
  }

  if (cleanPath === '/accessories') {
    return 'accessories';
  }

  if (cleanPath === '/services') {
    return 'services';
  }

  if (cleanPath === '/form') {
    return 'form';
  }

  if (cleanPath === '/jobs') {
    return 'jobs';
  }

  return 'home';
}

function getPathFromPage(page) {
  if (page === 'home') {
    return '/';
  }

  return `/${page}`;
}

function App() {
  const [activePage, setActivePage] = useState(() => getPageFromPath(window.location.pathname));
  const [content, setContent] = useState(cloneDefaultContent());
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage]);

  useEffect(() => {
    const handlePopState = () => {
      setActivePage(getPageFromPath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (page) => {
    const nextPath = getPathFromPage(page);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    setActivePage(page);
  };

  useEffect(() => {
    let alive = true;

    async function hydrateContent() {
      const nextContent = await loadContent();
      if (alive) {
        setContent(nextContent);
        setContentReady(true);
      }
    }

    hydrateContent();

    return () => {
      alive = false;
    };
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'accessories':
        return <Accessories content={content} />;
      case 'services':
        return <Services content={content} />;
      case 'form':
        return <Form content={content} />;
      case 'jobs':
        return <Jobs content={content} />;
      case 'admin':
        return (
          <Admin
            content={content}
            onContentSaved={(nextContent) => setContent(nextContent)}
            onNavigate={navigate}
          />
        );
      default:
        return <Home onNavigate={navigate} content={content} />;
    }
  };

  const showUserPortal = activePage !== 'admin';

  return (
    <div className="app-shell">
      {showUserPortal ? <Navbar activePage={activePage} onNavigate={navigate} pages={pages} /> : null}
      <main className="page-shell">{renderPage()}</main>

      {showUserPortal ? (
        <footer className="bottom-nav">
          {pages.map((page) => (
            <button
              key={page.key}
              className={`bottom-nav-item ${activePage === page.key ? 'active' : ''}`}
              onClick={() => navigate(page.key)}
              aria-label={page.label}
            >
              <span className="bottom-nav-icon">{page.icon}</span>
              <span className="bottom-nav-label">{page.label}</span>
            </button>
          ))}
        </footer>
      ) : null}

      {showUserPortal ? (
        <div className="app-badge">
          {contentReady ? 'Content synced with admin backend' : 'Loading backend content...'}
        </div>
      ) : null}
    </div>
  );
}

export default App;
