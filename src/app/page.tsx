import Link from 'next/link'

import styles from './page.module.css'

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <span className={styles.badge}>Coming soon</span>
          <h1 className={styles.title}>Handyman Marketplace (London)</h1>
          <p className={styles.subtitle}>
            A simple way to book reliable local handymen for small jobs — and a
            lightweight tool for trades to manage requests.
          </p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.h2}>What it does</h2>
          <ul className={styles.list}>
            <li>
              Homeowners post a job (e.g. mounting, minor repairs, flat-pack
              assembly) with photos, location, and preferred time.
            </li>
            <li>
              Handymen respond with availability and pricing, and customers pick
              the best fit.
            </li>
            <li>
              Keep everything in one place: messaging, job details, and updates.
            </li>
          </ul>
        </section>

        <footer className={styles.footer}>
          <p className={styles.small}>
            We’re building the MVP right now. Check back soon.
          </p>
          <div className={styles.linksRow}>
            <Link className={styles.link} href="/register">
              Register
            </Link>
            <Link className={styles.link} href="/login">
              Log in
            </Link>
            <Link className={styles.link} href="/dashboard">
              Dashboard
            </Link>
          </div>
        </footer>
      </main>
    </div>
  )
}
