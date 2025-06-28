import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        <div className="contact-intro-card mb-16 text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">Get in <span className="text-[#279e0a]">Touch</span></h2>
          <div className="w-24 h-1 bg-[#279e0a] mx-auto"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Have questions about BinBuddy? Want to learn more about how our 
            smart waste management solutions can help your community? Reach out to us.
          </p>
        </div>

        <div className="contact-content">
          <div className="contact-form-box">
            <h3>Send us a Message</h3>
            <form onSubmit={handleSubmit}>
              <label htmlFor="name">Your Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />

              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />

              <label htmlFor="message">Your Message</label>
              <textarea id="message" name="message" rows={5} value={formData.message} onChange={handleChange} required></textarea>

              <button type="submit" className="submit-btn">
                <Send size={18} className="icon" /> Send Message
              </button>
            </form>
          </div>

          <div className="contact-info-box">
            <h3>Contact Information</h3>
            <div className="info-item">
              <div className="icon-box"><MapPin size={24} color="#ffffff" /></div>
              <div>
                <h4>Our Location</h4>
                <p>BinBuddy Headquarters<br />123 Green Tech Park<br />Bangalore, Karnataka 560001</p>
              </div>
            </div>

            <div className="info-item">
              <div className="icon-box"><Mail size={24} color="#ffffff" /></div>
              <div>
                <h4>Email Us</h4>
                <p>info@binbuddy.com</p>
                <p>support@binbuddy.com</p>
              </div>
            </div>

            <div className="info-item">
              <div className="icon-box"><Phone size={24} color="#ffffff" /></div>
              <div>
                <h4>Call Us</h4>
                <p>+91 1234 567 890</p>
                <p>+91 9876 543 210</p>
              </div>
            </div>

            <div className="social-section">
              <h4>Follow Us</h4>
              <div className="social-icons">
                {[
                    { icon: <Facebook size={18} color="currentColor" />, href: '#facebook', label: 'facebook' },
                    { icon: <Twitter size={18} color="currentColor" />, href: '#twitter', label: 'twitter' },
                    { icon: <Instagram size={18} color="currentColor" />, href: '#instagram', label: 'instagram' },
                    { icon: <Linkedin size={18} color="currentColor" />, href: '#linkedin', label: 'linkedin' }
                  ].map(({ icon, href, label }) => (
                  <a key={label} href={href} className="social-icon" aria-label={label}>
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
