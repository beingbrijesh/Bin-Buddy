import React from 'react'
import Header from '../../components/Header/Header'
import AboutPreview from './AboutPreview/AboutPreview'
import Features from '../../components/Features/Features'
import Contact from '../../components/Contact/Contact'
import Footer from '../../components/Footer/Footer'

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <main className="flex flex-col">
        <Header />
        <AboutPreview />
        <Features />
        <Contact />
        <Footer />
      </main>
    </div>
  )
}

export default Home