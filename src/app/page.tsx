import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing-shell">
      <nav className="topbar" aria-label="Main navigation">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            B
          </span>
          <span>Beaver AI</span>
        </Link>
        <Link className="button button-secondary button-small" href="/auth">
          Sign in
        </Link>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Learning that follows your path</p>
          <h1>Build understanding, one thoughtful step at a time.</h1>
          <p className="hero-lede">
            Beaver AI is creating a calm, personal learning space shaped around
            what you know, what you want to learn, and where you want to go.
          </p>
          <div className="button-row">
            <Link className="button button-primary" href="/auth?mode=signup">
              Create your account
            </Link>
            <Link className="button button-quiet" href="/auth?mode=signin">
              I already have an account
            </Link>
          </div>
          <p className="privacy-note">
            Your learning space is private by default. You decide if and what to
            share.
          </p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="river-line river-line-one" />
          <div className="river-line river-line-two" />
          <div className="hero-tree tree-one" />
          <div className="hero-tree tree-two" />
          <div className="hero-tree tree-three" />
          <div className="wood-disc">
            <span>B</span>
          </div>
        </div>
      </section>
    </main>
  );
}
