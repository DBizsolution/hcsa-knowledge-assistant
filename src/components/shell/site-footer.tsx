import { Brand } from './brand'

const legalLinks = [
  'Report Vulnerability',
  'Privacy Statement',
  'Terms of Use',
  'Sitemap',
  'Site Requirements',
]

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-footer-bg text-white">
      <div className="app-container py-12">
        <div className="flex flex-col gap-6 border-y border-white/15 py-6 md:flex-row md:items-center md:justify-between">
          <Brand href="/" subtitle={false} className="[&_span]:text-white" />
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <a href="#" className="font-normal text-white no-underline hover:underline">
              Contact Us
            </a>
            <a href="#" className="font-normal text-white no-underline hover:underline">
              Feedback
            </a>
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-6 text-sm text-white/80">
          {legalLinks.map((link, index) => (
            <span key={link} className="flex items-center gap-4">
              <a href="#" className="font-normal text-white/80 no-underline hover:underline">
                {link}
              </a>
              {index < legalLinks.length - 1 && (
                <span className="text-white/30">|</span>
              )}
            </span>
          ))}
        </div>
        <p className="mt-7 text-sm text-white/70">
          © 2026 Government of Pulau Ulu. Prototype for evaluation purposes.
        </p>
      </div>
    </footer>
  )
}
