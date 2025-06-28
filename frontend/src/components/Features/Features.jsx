import React from 'react';
import {
  MapPin, BarChart, Navigation, Recycle, Truck, Clock, Bell, QrCode
} from 'lucide-react';
import { assets } from '../../assets/assets';

const Features = () => {
  const features = [
    {
      icon: <QrCode className="w-10 h-10 text-[#279e0a]" />,
      title: "Scan QR",
      description: "Easily scan bin QR codes to update status and track locations."
    },
    {
      icon: <MapPin className="w-10 h-10 text-[#279e0a]" />,
      title: "Smart Bin Tracking",
      description: "Real-time monitoring of fill levels and bin status across cities."
    },
    {
      icon: <Navigation className="w-10 h-10 text-[#279e0a]" />,
      title: "Route Optimization",
      description: "AI-powered routes that save fuel and reduce carbon emissions."
    },
    {
      icon: <BarChart className="w-10 h-10 text-[#279e0a]" />,
      title: "Data Analytics",
      description: "Comprehensive waste management insights and trend analysis."
    },
    {
      icon: <Recycle className="w-10 h-10 text-[#279e0a]" />,
      title: "Recycling Support",
      description: "Identify recyclables and track separation rates in communities."
    },
    {
      icon: <Truck className="w-10 h-10 text-[#279e0a]" />,
      title: "Fleet Management",
      description: "Track collection vehicles and optimize maintenance schedules."
    },
    {
      icon: <Clock className="w-10 h-10 text-[#279e0a]" />,
      title: "Real-time Updates",
      description: "Live updates on collection status and schedule changes."
    },
    {
      icon: <Bell className="w-10 h-10 text-[#279e0a]" />,
      title: "Alert System",
      description: "Instant notifications for critical waste management events."
    }
  ];

  const steps = [
    "Smart sensors monitor bin fill levels and send data to our cloud platform",
    "AI algorithms analyze data and optimize collection routes",
    "Waste collection vehicles receive optimized routes via mobile app",
    "Real-time updates on bin status, vehicle location, and collection progress",
    "Analytics dashboard provides insights for continuous improvement"
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-[#279e0a]">BinBuddy</span> Features
          </h2>
          <div className="w-20 h-1 bg-[#279e0a] mx-auto mb-6" />
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Our comprehensive waste management platform offers innovative solutions
            to make waste collection more efficient, transparent, and sustainable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h3 className="text-3xl font-bold mb-6">How BinBuddy Works</h3>
            <ul className="space-y-6">
              {steps.map((step, index) => (
                <li key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#279e0a] text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ul>
            <a 
              href="#contact" 
              className="inline-block px-8 py-3 bg-[#279e0a] hover:bg-[#e7f5e4] text-white rounded-full font-semibold transition-colors"
            >
              Learn More
            </a>
          </div>
          <div className="relative">
            <img
              src={assets.BinBuddy_Process}
              alt="BinBuddy technology in action"
              className="rounded-lg shadow-xl w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
