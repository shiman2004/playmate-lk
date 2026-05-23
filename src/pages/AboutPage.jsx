import { Link } from 'react-router-dom'
import { Target, Heart, Zap, Users, Shield, Star } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="bg-dark-950 min-h-screen pt-16">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        </div>
        <div className="container-custom text-center relative z-10">
          <div className="inline-flex items-center gap-2 glass-green rounded-full px-4 py-2 mb-6">
            <Heart size={13} className="text-primary-400" />
            <span className="text-primary-400 text-xs font-semibold">Made in Sri Lanka 🇱🇰</span>
          </div>
          <h1 className="font-display text-6xl md:text-8xl text-white mb-5">
            ABOUT <span className="text-gradient">US</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Sportive.lk was born from a simple frustration — booking a sports court in Sri Lanka
            shouldn't require 5 phone calls and two days of waiting. So we built something better.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section bg-dark-900/30">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Target, title: 'Our Mission', desc: 'To make every indoor sports court in Sri Lanka bookable online — instantly, reliably, and at the best price.' },
              { icon: Heart, title: 'Our Vision', desc: 'A Sri Lanka where every player can focus on the game, not the logistics. Sport for everyone, everywhere.' },
              { icon: Zap, title: 'Our Promise', desc: 'Instant confirmation. Transparent pricing. Zero hidden fees. Your booking is guaranteed the moment you click confirm.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-hover text-center group">
                <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-500/20 transition-all">
                  <Icon size={24} className="text-primary-400" />
                </div>
                <h3 className="text-white font-heading font-bold text-xl mb-3">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section">
        <div className="container-custom text-center">
          <p className="text-primary-400 text-sm font-semibold tracking-widest uppercase mb-3">By The Numbers</p>
          <h2 className="font-display text-5xl text-white mb-12">
            THE <span className="text-gradient">IMPACT</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { value: '54+', label: 'Venues Listed', icon: '🏟️' },
              { value: '12', label: 'Cities Covered', icon: '🗺️' },
              { value: '8,400+', label: 'Active Players', icon: '👥' },
              { value: '3,200+', label: 'Bookings Made', icon: '📅' },
            ].map(({ value, label, icon }) => (
              <div key={label} className="card text-center group hover:border-primary-500/20 transition-all">
                <div className="text-4xl mb-3">{icon}</div>
                <div className="font-display text-4xl text-primary-400 mb-1">{value}</div>
                <div className="text-slate-500 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-dark-900/30">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-display text-5xl text-white">OUR <span className="text-gradient">VALUES</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Shield, title: 'Trust & Transparency', desc: 'No hidden fees. No surprise cancellations. What you see is what you get, every time.' },
              { icon: Zap, title: 'Speed & Simplicity', desc: 'From search to confirmed booking in under 60 seconds. We respect your time.' },
              { icon: Users, title: 'Community First', desc: 'We serve players and venue owners equally. A thriving community keeps sport alive.' },
              { icon: Star, title: 'Quality Standards', desc: 'Every venue is verified. Every rating is real. We curate only the best sports facilities.' },
              { icon: Heart, title: 'Passion for Sport', desc: 'We love sport. That drives everything we build — for players, by players.' },
              { icon: Target, title: 'Local Focus', desc: 'Built specifically for Sri Lanka. We understand our local sports culture deeply.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-hover group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-500/20 transition-all">
                    <Icon size={18} className="text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-heading font-semibold text-lg mb-1">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container-custom text-center">
          <h2 className="font-display text-5xl text-white mb-4">
            JOIN THE <span className="text-gradient">GAME</span>
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            Be part of Sri Lanka's fastest growing sports community on Sportive.lk
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/register" className="btn-primary">Create Free Account</Link>
            <Link to="/venues" className="btn-secondary">Explore Venues</Link>
          </div>
        </div>
      </section>
    </div>
  )
}