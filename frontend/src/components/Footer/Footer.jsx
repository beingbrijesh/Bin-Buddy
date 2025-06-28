// Footer.jsx
import React from 'react';
import { Trash2, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <Trash2 size={32} className="logo-icon" />
              <h2 className="brand-name">BinBuddy</h2>
            </div>
            <p className="footer-description">
              Revolutionizing waste management across India with smart technology and sustainable solutions.
            </p>
            <div className="footer-socials">
              {[
                { icon: <Facebook size={18} />, href: '#facebook', label: 'facebook' },
                { icon: <Twitter size={18} />, href: '#twitter', label: 'twitter' },
                { icon: <Instagram size={18} />, href: '#instagram', label: 'instagram' },
                { icon: <Linkedin size={18} />, href: '#linkedin', label: 'linkedin' }
              ].map(({ icon, href, label }) => (
                <a key={label} href={href} className="social-icon" aria-label={label}>
                  {icon}
                </a>
              ))}
            </div>
          </div>

          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              {['Home', 'About', 'Features', 'Map', 'Contact'].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`}>{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-links">
            <h3>Our Services</h3>
            <ul>
              {[
                'Smart Bin Management',
                'Route Optimization',
                'Waste Analytics',
                'Fleet Management',
                'Municipal Partnerships'
              ].map((item) => (
                <li key={item}>
                  <a href="#features">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-subscribe">
            <h3>Subscribe</h3>
            <p>Stay updated with our latest news and developments</p>
            <form className="subscribe-form">
              <input type="email" placeholder="Your email address" />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} BinBuddy. All rights reserved.</p>
          <ul>
            {['Privacy Policy', 'Terms of Service', 'Sitemap'].map((item) => (
              <li key={item}>
                <a href="#">{item}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
