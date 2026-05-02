export const metadata = { title: "Privacy Policy — ReplyRocket" };

export default function Privacy() {
  return (
    <main className="mesh-bg min-h-screen">
      <article className="mx-auto max-w-3xl px-6 py-16 prose prose-sm">
      <h1>Privacy Policy</h1>
      <p>
        <em>Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</em>
      </p>

      <p>
        ReplyRocket (&ldquo;we&rdquo;, &ldquo;us&rdquo;) builds an AI assistant that helps you draft
        replies to messages you choose to send through it. This policy explains
        what we collect, why, and your rights.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account info.</strong> Your email and (if you sign in with
          Google) your name and avatar.
        </li>
        <li>
          <strong>Generation requests.</strong> The text you highlight, the
          tone, the goal, and the platform — sent to our backend and to
          Anthropic to generate drafts.
        </li>
        <li>
          <strong>Drafts and edits.</strong> The drafts the model returns and,
          if you choose &ldquo;Insert&rdquo;, the final text you sent. We use these
          to learn your voice over time.
        </li>
        <li>
          <strong>Voice samples.</strong> Any text you upload during onboarding
          or via the dashboard.
        </li>
        <li>
          <strong>Usage logs.</strong> Counters of how many replies you
          generate, for billing and abuse prevention.
        </li>
      </ul>

      <h2>What we do NOT collect</h2>
      <ul>
        <li>
          <strong>We never read your inbox.</strong> The extension only sees
          the text you actively highlight and click the ReplyRocket button on.
        </li>
        <li>No browsing history, no other tabs, no keystrokes.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To generate reply drafts (calls Anthropic&rsquo;s API).</li>
        <li>To improve your personal voice profile (private to you).</li>
        <li>To enforce monthly quotas and bill paid plans.</li>
      </ul>
      <p>
        We do not sell your data. We do not use your messages to train shared
        models.
      </p>

      <h2>Sub-processors</h2>
      <ul>
        <li>
          <strong>Supabase</strong> — database and authentication (US/EU
          regions).
        </li>
        <li>
          <strong>Anthropic</strong> — large language model inference.
          Anthropic does not train on API inputs.
        </li>
        <li>
          <strong>Vercel</strong> — application hosting.
        </li>
        <li>
          <strong>Stripe</strong> (paid plans only) — billing.
        </li>
      </ul>

      <h2>Your rights</h2>
      <ul>
        <li>Export all your data from the dashboard at any time.</li>
        <li>Delete your account to permanently remove your data.</li>
        <li>Email <a href="mailto:privacy@replyrocket.io">privacy@replyrocket.io</a> for any request.</li>
      </ul>

      <h2>Contact</h2>
      <p>
        Questions? <a href="mailto:hello@replyrocket.io">hello@replyrocket.io</a>
      </p>
      </article>
    </main>
  );
}
