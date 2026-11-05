import { AppHeader } from '../../components/AppHeader';
import { ConversationThread } from '../../components/production/ConversationThread';
import { FailureLab } from '../../components/production/FailureLab';
import { InventoryPager } from '../../components/production/InventoryPager';
import { LongTextLab } from '../../components/production/LongTextLab';

const GAPS = [
  {
    href: '#failures',
    title: 'When the API fails',
    prototype: 'Every request succeeds.',
    production: 'Each failure class gets its own message and recovery path.',
  },
  {
    href: '#volume',
    title: 'When there’s too much data',
    prototype: '16 items, all in memory.',
    production: '10,000 records, paged and searched on the server.',
  },
  {
    href: '#conversation',
    title: 'When history never ends',
    prototype: 'No long-running lists.',
    production: '2,400 messages, loaded upward without losing your place.',
  },
  {
    href: '#long-text',
    title: 'When content breaks layout',
    prototype: 'Short, tidy names.',
    production: 'Components hold up against text nobody planned for.',
  },
];

export default function ProductionPage() {
  return (
    <>
      <AppHeader eyebrow="Beyond the prototype" current="production" />
      <main className="shell prod-page">
        <section className="prod-intro">
          <p className="eyebrow">Production readiness</p>
          <h1 className="heading-xl">
            Off the
            <br />
            <em className="heading-display">happy path.</em>
          </h1>
          <p className="body-lg">
            A prototype shows what happens when everything goes right. This page shows what happens
            when it doesn’t, using live requests against test endpoints and the same components as
            the app.
          </p>
        </section>

        <nav className="prod-gaps" aria-label="Production readiness sections">
          {GAPS.map((gap) => (
            <a key={gap.href} className="prod-gap" href={gap.href}>
              <strong>{gap.title}</strong>
              <span className="prod-gap__before">{gap.prototype}</span>
              <span className="prod-gap__after">{gap.production}</span>
            </a>
          ))}
        </nav>

        <section className="prod-section" id="failures">
          <p className="eyebrow">01 · Error states</p>
          <h2 className="heading-lg">Every failure tells you what to do next</h2>
          <p className="prod-section__lede">
            A blanket “something went wrong” hides the one thing people need to know. Some errors
            can be retried, some need a wait, and some never succeed however often you try.
          </p>
          <FailureLab />
        </section>

        <section className="prod-section" id="volume">
          <p className="eyebrow">02 · Too much data</p>
          <h2 className="heading-lg">The browser only gets what it needs</h2>
          <p className="prod-section__lede">
            Search and paging run on the server. Fast typing cancels older requests, so a slow
            response can’t overwrite a newer one, and a failed page keeps your results on screen.
          </p>
          <InventoryPager />
        </section>

        <section className="prod-section" id="conversation">
          <p className="eyebrow">03 · Infinite scroll</p>
          <h2 className="heading-lg">Scroll up through history without losing your place</h2>
          <p className="prod-section__lede">
            Older messages load as you near the top, and your position holds still when they
            arrive. New messages won’t pull you away from what you’re reading, and a failed load
            stops and offers a retry.
          </p>
          <ConversationThread />
        </section>

        <section className="prod-section" id="long-text">
          <p className="eyebrow">04 · Unexpected content</p>
          <h2 className="heading-lg">Long text can’t break the cards</h2>
          <p className="prod-section__lede">
            Switch between the original and hardened CSS, then narrow the container. The counter
            measures the rendered page for text escaping its container. These fixes live in the
            shared components, so the main app gets them too.
          </p>
          <LongTextLab />
        </section>
      </main>
      <footer className="site-footer">
        PantryPilot · Test endpoints with simulated faults and sample data
      </footer>
    </>
  );
}
