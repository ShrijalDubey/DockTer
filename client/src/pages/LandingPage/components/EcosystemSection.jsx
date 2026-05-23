import React from 'react';
import pythonIcon from '../../../assets/icon/python-svgrepo-com.svg';
import nodejsIcon from '../../../assets/icon/nodejs-icon-svgrepo-com.svg';
import goIcon from '../../../assets/icon/Go-Logo_Blue.svg';
import rustIcon from '../../../assets/icon/rust-svgrepo-com.svg';
import postgresIcon from '../../../assets/icon/postgresql-svgrepo-com.svg';
import redisIcon from '../../../assets/icon/redis-svgrepo-com.svg';
import nginxIcon from '../../../assets/icon/nginx-svgrepo-com.svg';

const EcosystemSection = () => {
  return (
    <section className="landing-section" style={{ gridTemplateColumns: '1fr' }}>
      <div className="section-info" style={{ alignItems: 'center', marginBottom: '2.5rem', textAlign: 'center' }}>
        <span className="section-tag">Ecosystem</span>
        <h2 className="section-title" style={{ maxWidth: '600px' }}>Built for the modern stack</h2>
        <p className="section-desc" style={{ maxWidth: '600px' }}>
          Out of the box support for standard software frameworks, web servers, databases, and container orchestrations.
        </p>
      </div>

      <div className="stacks-grid">
        {/* PYTHON */}
        <div className="stack-card python-card">
          <div className="stack-icon">
            <img src={pythonIcon} alt="Python Logo" style={{ height: '60px', width: '60px', objectFit: 'contain' }} />
          </div>
          <div className="stack-name">Python</div>
          <p className="stack-desc">Pip, Poetry, & cached multi-stage builds</p>
        </div>

        {/* NODE.JS */}
        <div className="stack-card node-card">
          <div className="stack-icon">
            <img src={nodejsIcon} alt="Node.js Logo" style={{ height: '36px', width: '36px', objectFit: 'contain' }} />
          </div>
          <div className="stack-name">Node.js</div>
          <p className="stack-desc">Npm, Yarn, Pnpm, & Alpine targets</p>
        </div>

        {/* GO */}
        <div className="stack-card go-card">
          <div className="stack-icon">
            {/* Resized with auto width and slightly shorter height for perfect visual optical alignment */}
            <img src={goIcon} alt="Go Logo" style={{ height: '50px', width: '50', objectFit: 'contain' }} />
          </div>
          <div className="stack-name">Go</div>
          <p className="stack-desc">Modules resolution & static scratch targets</p>
        </div>

        {/* RUST */}
        <div className="stack-card rust-card">
          <div className="stack-icon">
            <img src={rustIcon} alt="Rust Logo" style={{ height: '36px', width: '36px', objectFit: 'contain' }} />
          </div>
          <div className="stack-name">Rust</div>
          <p className="stack-desc">Cargo layers & optimized compiler volumes</p>
        </div>

        {/* POSTGRESQL */}
        <div className="stack-card postgres-card">
          <div className="stack-icon">
            <img src={postgresIcon} alt="PostgreSQL Logo" style={{ height: '36px', width: '36px', objectFit: 'contain' }} />
          </div>
          <div className="stack-name">Postgres</div>
          <p className="stack-desc">Persistent volumes & credential bounds</p>
        </div>

        {/* REDIS */}
        <div className="stack-card redis-card">
          <div className="stack-icon">
            <img src={redisIcon} alt="Redis Logo" style={{ height: '36px', width: '36px', objectFit: 'contain' }} />
          </div>
          <div className="stack-name">Redis</div>
          <p className="stack-desc">Cache networks & connection bridge routing</p>
        </div>

        {/* NGINX */}
        <div className="stack-card nginx-card">
          <div className="stack-icon">
            <img src={nginxIcon} alt="Nginx Logo" style={{ height: '36px', width: '36px', objectFit: 'contain' }} />
          </div>
          <div className="stack-name">Nginx</div>
          <p className="stack-desc">Reverse proxy & asset static cache setup</p>
        </div>

        {/* DOCKER & K8S */}
        <div className="stack-card docker-card">
          <div className="stack-icon">
            {/* Sized to perfectly match the 36px visual weight */}
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1D63ED" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="10" width="6" height="6" rx="1" />
              <rect x="9" y="10" width="6" height="6" rx="1" />
              <rect x="16" y="10" width="6" height="6" rx="1" />
              <rect x="9" y="3" width="6" height="6" rx="1" />
              <path d="M2 19h20c0-2-1.5-3-3-3H5c-1.5 0-3 1-3 3z" fill="rgba(29, 99, 237, 0.1)" />
            </svg>
          </div>
          <div className="stack-name">Orchestration</div>
          <p className="stack-desc">Compose multi-clusters & K8s declarations</p>
        </div>
      </div>
    </section>
  );
};

export default EcosystemSection;
