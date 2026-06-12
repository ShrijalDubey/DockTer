import './LandingPage.css';
import LandingNav from './components/LandingNav';
import LandingHero from './components/LandingHero';
import EcosystemSection from './components/EcosystemSection';
import LandingFooter from './components/LandingFooter';

const LandingPage = ({ onNavigate }) => {
  return (
    <div className="landing-container">
      {/* Fullscreen Hero & Navigation Fold */}
      <div className="hero-fullscreen-wrapper">
        {/* Top Navigation Bar */}
        <LandingNav onNavigate={onNavigate} />

        {/* Hero Header CTA Block */}
        <LandingHero onNavigate={onNavigate} />
      </div>

      {/* SECTION 1: Config File Code Preview */}
      <section className="landing-section">
        <div className="section-info">
          <span className="section-tag">Configuration</span>
          <h2 className="section-title">Automatically generate container assets</h2>
          <p className="section-desc">
            No more trial-and-error writing Dockerfiles or Docker Compose configurations. DockTer's analyzer scans your imports, resolves package managers, structures database configurations, and outputs optimized standard files.
          </p>
        </div>

        <pre className="section-code">
          <code>
            <span className="code-comment"># dockter-compose.yml</span>{"\n"}
            <span className="code-keyword">version</span>: <span className="code-string">"3.8"</span>{"\n"}
            <span className="code-keyword">services</span>:{"\n"}
            {"  "}<span className="code-keyword">web</span>:{"\n"}
            {"    "}<span className="code-keyword">build</span>: .{"\n"}
            {"    "}<span className="code-keyword">ports</span>:{"\n"}
            {"      "}- <span className="code-string">"8000:8000"</span>{"\n"}
            {"    "}<span className="code-keyword">environment</span>:{"\n"}
            {"      "}- <span className="code-string">NODE_ENV=production</span>{"\n"}
            {"  "}<span className="code-keyword">database</span>:{"\n"}
            {"    "}<span className="code-keyword">image</span>: <span className="code-string">postgres:15-alpine</span>{"\n"}
            {"    "}<span className="code-keyword">volumes</span>:{"\n"}
            {"      "}- <span className="code-string">pgdata:/var/lib/postgresql/data</span>
          </code>
        </pre>
      </section>

      {/* SECTION 2: REST API Curl Payload Preview */}
      <section className="landing-section reverse">
        <pre className="section-code">
          <code>
            <span className="code-comment"># Deploy configurations via localhost triggers</span>{"\n"}
            <span className="code-keyword">curl</span> http://127.0.0.1:8001/api/deploy \{"\n"}
            {"  "}-H <span className="code-string">"Content-Type: application/json"</span> \{"\n"}
            {"  "}-d '{"{"}{"\n"}
            {"    "}<span className="code-keyword">"project"</span>: <span className="code-string">"microservice"</span>,{"\n"}
            {"    "}<span className="code-keyword">"action"</span>: <span className="code-string">"compile"</span>,{"\n"}
            {"    "}<span className="code-keyword">"files"</span>: {"{"} ... {"}"}{"\n"}
            {"  "}{"}'"}
          </code>
        </pre>

        <div className="section-info">
          <span className="section-tag">Companion API</span>
          <h2 className="section-title">DockTer has a local REST API</h2>
          <p className="section-desc">
            The local CLI companion agent starts a secure HTTP listener bound strictly to port <code>8001</code> on your loopback device. Deploy compose configurations, build runtime images, and stream console output logs via pure JSON triggers.
          </p>
        </div>
      </section>

      {/* SECTION 3: Supported Stacks Grid */}
      <EcosystemSection />

      {/* Multi-Column Developer Directory Footer */}
      <LandingFooter onNavigate={onNavigate} />
    </div>
  );
};

export default LandingPage;
