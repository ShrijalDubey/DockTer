import { useState } from 'react';

const LANGUAGE_MAP = {
  // Languages
  python: { color: '#ffde57', bg: 'rgba(53, 114, 165, 0.12)', border: 'rgba(53, 114, 165, 0.35)' },
  javascript: { color: '#f7df1e', bg: 'rgba(247, 223, 30, 0.08)', border: 'rgba(247, 223, 30, 0.25)' },
  typescript: { color: '#3178c6', bg: 'rgba(49, 120, 198, 0.12)', border: 'rgba(49, 120, 198, 0.35)' },
  go: { color: '#00add8', bg: 'rgba(0, 173, 216, 0.12)', border: 'rgba(0, 173, 216, 0.35)' },
  rust: { color: '#ff9248', bg: 'rgba(222, 165, 132, 0.12)', border: 'rgba(222, 165, 132, 0.35)' },
  java: { color: '#f89820', bg: 'rgba(176, 114, 25, 0.12)', border: 'rgba(176, 114, 25, 0.35)' },
  ruby: { color: '#ff4848', bg: 'rgba(204, 0, 0, 0.12)', border: 'rgba(204, 0, 0, 0.35)' },
  php: { color: '#777bb4', bg: 'rgba(119, 123, 180, 0.12)', border: 'rgba(119, 123, 180, 0.35)' },
  elixir: { color: '#a262f7', bg: 'rgba(162, 98, 247, 0.12)', border: 'rgba(162, 98, 247, 0.35)' },
  swift: { color: '#ff5a36', bg: 'rgba(255, 90, 54, 0.12)', border: 'rgba(255, 90, 54, 0.35)' },
  shell: { color: '#4ebd3d', bg: 'rgba(78, 189, 61, 0.12)', border: 'rgba(78, 189, 61, 0.35)' },
  bash: { color: '#4ebd3d', bg: 'rgba(78, 189, 61, 0.12)', border: 'rgba(78, 189, 61, 0.35)' },
  c: { color: '#a8b9cc', bg: 'rgba(168, 185, 204, 0.12)', border: 'rgba(168, 185, 204, 0.35)' },
  cpp: { color: '#f34b7d', bg: 'rgba(243, 75, 125, 0.12)', border: 'rgba(243, 75, 125, 0.35)' },
  'c++': { color: '#f34b7d', bg: 'rgba(243, 75, 125, 0.12)', border: 'rgba(243, 75, 125, 0.35)' },
  html: { color: '#fc4f08', bg: 'rgba(252, 79, 8, 0.12)', border: 'rgba(252, 79, 8, 0.35)' },
  css: { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.35)' },
  dart: { color: '#00e676', bg: 'rgba(0, 230, 118, 0.12)', border: 'rgba(0, 230, 118, 0.35)' },
  kotlin: { color: '#c2410c', bg: 'rgba(194, 65, 12, 0.12)', border: 'rgba(194, 65, 12, 0.35)' },

  // Frameworks
  react: { color: '#58c4dc', bg: 'rgba(88, 196, 220, 0.12)', border: 'rgba(88, 196, 220, 0.35)' },
  'react native': { color: '#58c4dc', bg: 'rgba(88, 196, 220, 0.12)', border: 'rgba(88, 196, 220, 0.35)' },
  vue: { color: '#41b883', bg: 'rgba(65, 184, 131, 0.12)', border: 'rgba(65, 184, 131, 0.35)' },
  angular: { color: '#c3002f', bg: 'rgba(195, 0, 47, 0.12)', border: 'rgba(195, 0, 47, 0.35)' },
  nextjs: { color: '#f8fafc', bg: 'rgba(248, 250, 252, 0.08)', border: 'rgba(248, 250, 252, 0.25)' },
  'next.js': { color: '#f8fafc', bg: 'rgba(248, 250, 252, 0.08)', border: 'rgba(248, 250, 252, 0.25)' },
  express: { color: '#e2e8f0', bg: 'rgba(226, 232, 240, 0.08)', border: 'rgba(226, 232, 240, 0.25)' },
  django: { color: '#092e20', bg: 'rgba(9, 46, 32, 0.12)', border: 'rgba(9, 46, 32, 0.35)' },
  flask: { color: '#cbd5e1', bg: 'rgba(203, 213, 225, 0.08)', border: 'rgba(203, 213, 225, 0.25)' },
  fastapi: { color: '#059669', bg: 'rgba(5, 150, 105, 0.12)', border: 'rgba(5, 150, 105, 0.35)' },
  spring: { color: '#6db33f', bg: 'rgba(109, 179, 63, 0.12)', border: 'rgba(109, 179, 63, 0.35)' },
  'spring boot': { color: '#6db33f', bg: 'rgba(109, 179, 63, 0.12)', border: 'rgba(109, 179, 63, 0.35)' },
  laravel: { color: '#ff2d20', bg: 'rgba(255, 45, 32, 0.12)', border: 'rgba(255, 45, 32, 0.35)' },
  rails: { color: '#cc0000', bg: 'rgba(204, 0, 0, 0.12)', border: 'rgba(204, 0, 0, 0.35)' },
  flutter: { color: '#02569b', bg: 'rgba(2, 86, 155, 0.12)', border: 'rgba(2, 86, 155, 0.35)' },

  // Addons / Services
  database: { color: '#e4a62e', bg: 'rgba(228, 166, 46, 0.12)', border: 'rgba(228, 166, 46, 0.35)' },
  redis: { color: '#d82c20', bg: 'rgba(216, 44, 32, 0.12)', border: 'rgba(216, 44, 32, 0.35)' },
  celery: { color: '#33b65c', bg: 'rgba(51, 182, 92, 0.12)', border: 'rgba(51, 182, 92, 0.35)' },
  nginx: { color: '#009639', bg: 'rgba(0, 150, 57, 0.12)', border: 'rgba(0, 150, 57, 0.35)' },
  'github actions': { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.35)' },
};

const getBadgeStyle = (name) => {
  const normName = name.toLowerCase().trim();
  const info = LANGUAGE_MAP[normName] || {
    color: '#cbd5e1',
    bg: 'rgba(203, 213, 225, 0.08)',
    border: 'rgba(203, 213, 225, 0.2)'
  };
  return {
    backgroundColor: info.bg,
    color: info.color,
    borderColor: info.border,
    borderWidth: '1px',
    borderStyle: 'solid',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.35rem 0.6rem',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.2s',
  };
};

const TechStackBadges = ({ styles, result }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.sidebarSection}>
      <div 
        className={`${styles.sidebarHeader} ${styles.sidebarHeaderInteractive}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.4rem', color: 'var(--keyword)' }}><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          Tech Stack
        </div>
        <span className={`${styles.sidebarChevron} ${!isOpen ? styles.sidebarChevronCollapsed : ''}`}>▼</span>
      </div>
      {isOpen && (
        <div className={styles.sidebarCard}>
          <div className={styles.stackBadges}>
            {result.languages?.map((lang, i) => {
              const badgeStyle = getBadgeStyle(lang);
              return (
                <span key={`lang-${i}`} style={badgeStyle}>
                  {lang}
                </span>
              );
            })}
            {result.frameworks?.map((fw, i) => {
              const badgeStyle = getBadgeStyle(fw);
              return (
                <span key={`fw-${i}`} style={badgeStyle}>
                  {fw}
                </span>
              );
            })}
            {result.analysis_context?.has_db && (
              <span style={getBadgeStyle('database')}>
                Database
              </span>
            )}
            {result.analysis_context?.has_redis && (
              <span style={getBadgeStyle('redis')}>
                Redis
              </span>
            )}
            {result.analysis_context?.has_celery && (
              <span style={getBadgeStyle('celery')}>
                Celery
              </span>
            )}
            {result.analysis_context?.has_nginx && (
              <span style={getBadgeStyle('nginx')}>
                Nginx
              </span>
            )}
            {result.analysis_context?.ci_cd?.map((cicd, i) => {
              const badgeStyle = getBadgeStyle(cicd);
              return (
                <span key={`cicd-${i}`} style={badgeStyle}>
                  {cicd}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TechStackBadges;
