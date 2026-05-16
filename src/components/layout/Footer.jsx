import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-white/5">
      {/* Main footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-black font-display text-lg leading-none">P</span>
              </div>
              <span className="font-display text-2xl tracking-wide">
                <span className="text-white">PLAY</span>
                <span className="text-primary-400">MATE</span>
                <span className="text-white">.LK</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-5">
              Sri Lanka's #1 indoor sports venue booking platform. Find and book your favourite 
              court in seconds.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: '#' },
                { icon: Facebook, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Youtube, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a key={i} href={href}
                  className="w-9 h-9 rounded-lg bg-dark-800 border border-white/5 flex items-center justify-center text-slate-500 hover:text-primary-400 hover:border-primary-500/30 transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-heading font-semibold text-lg mb-4 tracking-wide">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/venues', label: 'Browse Venues' },
                { to: '/venues?sport=Futsal', label: 'Futsal Courts' },
                { to: '/venues?sport=Badminton', label: 'Badminton Courts' },
                { to: '/venues?sport=Cricket', label: 'Cricket Nets' },
                { to: '/about', label: 'About Us' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-slate-500 hover:text-primary-400 text-sm transition-colors flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-primary-500/50 group-hover:bg-primary-500 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-heading font-semibold text-lg mb-4 tracking-wide">Support</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/help', label: 'Help Center' },
                { to: '/terms', label: 'Terms of Service' },
                { to: '/privacy', label: 'Privacy Policy' },
                { to: '/refund', label: 'Refund Policy' },
                { to: '/contact', label: 'Contact Us' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-slate-500 hover:text-primary-400 text-sm transition-colors flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-primary-500/50 group-hover:bg-primary-500 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-heading font-semibold text-lg mb-4 tracking-wide">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={15} className="text-primary-500 mt-0.5 shrink-0" />
                <span className="text-slate-500 text-sm">42 Independence Ave,<br />Colombo 07, Sri Lanka</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={15} className="text-primary-500 shrink-0" />
                <a href="tel:+94112345678" className="text-slate-500 hover:text-primary-400 text-sm transition-colors">
                  +94 11 234 5678
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={15} className="text-primary-500 shrink-0" />
                <a href="mailto:hello@playmate.lk" className="text-slate-500 hover:text-primary-400 text-sm transition-colors">
                  hello@playmate.lk
                </a>
              </li>
            </ul>

            <div className="mt-5 p-3 rounded-xl bg-primary-500/5 border border-primary-500/10">
              <p className="text-primary-400 text-xs font-semibold mb-1">📱 Download App Coming Soon</p>
              <p className="text-slate-600 text-xs">iOS & Android apps in development</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} PlayMate.lk. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-slate-600 text-sm">
            <span>Made with</span>
            <span className="text-primary-500">♥</span>
            <span>in Sri Lanka 🇱🇰</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
