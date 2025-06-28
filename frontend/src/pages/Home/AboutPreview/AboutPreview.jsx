import React, { useEffect, useState } from 'react';
import { Recycle, Truck, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Counter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16); // assuming ~60fps
    const counter = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(counter);
        setCount(end);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(counter);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
};

const AboutPreview = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            About <span className="text-[#279e0a]">BinBuddy</span>
          </h2>
          <div className="w-20 h-1 bg-[#279e0a] mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            BinBuddy is revolutionizing waste management across India with smart technology 
            and sustainable solutions that benefit communities and the environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#e7f5e4] rounded-full flex items-center justify-center">
                <Recycle className="w-8 h-8 text-[#279e0a]" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-center">Sustainable Solutions</h3>
            <p className="text-gray-600 text-center">
              Our smart waste management system reduces carbon footprint by optimizing 
              collection routes and promoting proper waste segregation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#e7f5e4] rounded-full flex items-center justify-center">
                <Truck className="w-8 h-8 text-[#279e0a]" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-center">Nationwide Coverage</h3>
            <p className="text-gray-600 text-center">
              BinBuddy's network spans across major cities in India, with continuous 
              expansion to reach more communities and make a greater impact.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#e7f5e4] rounded-full flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-[#279e0a]" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-center">Data-Driven Decisions</h3>
            <p className="text-gray-600 text-center">
              Real-time analytics and reporting help municipalities and waste management 
              companies make informed decisions for greater efficiency.
            </p>
          </div>
        </div>

        <div className="text-center mb-20">
          <button 
            className="px-8 py-3 bg-[#279e0a] hover:bg-[#1c7307] text-white rounded-full font-semibold transition-colors"
            onClick={() => navigate('/about')}
          >
            Know More
          </button>
        </div>

        <div className="bg-[#f3fbf0] rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">Our Mission</h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  At BinBuddy, we're committed to creating cleaner, healthier communities through innovative 
                  waste management solutions. Our technology not only makes waste collection more efficient 
                  but also raises awareness about proper waste disposal and recycling.
                </p>
                <p>
                  By 2025, we aim to reduce waste collection inefficiencies by 40% and increase recycling 
                  rates by 35% across all served municipalities.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-4xl font-bold text-[#279e0a] mb-2"><Counter end={60} />+</div>
                <div className="text-gray-600">Cities Covered</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-4xl font-bold text-[#279e0a] mb-2"><Counter end={15000} />+</div>
                <div className="text-gray-600">Smart Bins Deployed</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-4xl font-bold text-[#279e0a] mb-2"><Counter end={40} />%</div>
                <div className="text-gray-600">Efficiency Increase</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-4xl font-bold text-[#279e0a] mb-2"><Counter end={250000} /></div>
                <div className="text-gray-600">Tons Waste Managed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
