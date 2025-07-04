import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Tag, DollarSign, Search, Eye, Download, ChevronDown, ChevronUp } from 'lucide-react';
import PhotographerWaitlistModal from '../auth/PhotographerWaitlistModal';

const HowItWorksPage: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [showPhotographerWaitlistModal, setShowPhotographerWaitlistModal] = useState(false);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I sign up as a photographer?",
      answer: "We're currently growing our platform gradually to ensure we deliver the best possible experience for both photographers and surfers. As part of this, we're limiting the number of photographers we onboard at the moment. However, we're working on expanding access soon. If you're interested in joining, please leave your contact details here, and we'll reach out as soon as we're ready to welcome new photographers."
    },
    {
      question: "What resolutions are the photos and videos?",
      answer: "All photos and videos on Waawave are high-resolution originals. Photos are minimum 12MP and videos are minimum 1080p resolution. When you purchase media, you receive the full-quality files without watermarks."
    },
    {
      question: "How do I find images from my surf session?",
      answer: "You can search for sessions by location, date, and time. Browse through session galleries to find yourself in action. All sessions are organized by photographer, location, and date to make finding your waves easy."
    },
    {
      question: "Is my payment information secure?",
      answer: "Yes, absolutely. We use Stripe for secure payment processing, which is trusted by millions of businesses worldwide. Your payment information is encrypted and never stored on our servers."
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How Waawave works
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Waawave makes it easy for photographers to sell their surf shots and for surfers to find and purchase high-quality photos and videos of their sessions
          </p>
        </div>
      </section>

      {/* For Surf Photographers Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-12">For Surf Photographers</h2>
              
              <div className="space-y-8">
                {/* Step 1 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Your Session</h3>
                    <p className="text-gray-600">
                      Publish a session by uploading your photos and videos from your shooting a surf spot.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Tag Your Content</h3>
                    <p className="text-gray-600">
                      Add location, date, and time tags to help surfers easily find sessions they were part of.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Earn 80% Per Sale</h3>
                    <p className="text-gray-600">
                      Set your prices and keep 80% of every sale. Waawave takes just 20% to maintain the platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl overflow-hidden">
                <img
                  src="https://waawave-previews.s3.eu-north-1.amazonaws.com/kvnga-M_972qLb_cU-unsplash.jpg"
                  alt="Surf photographer in action"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Surfers Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Image */}
            <div className="relative order-2 lg:order-1">
              <div className="aspect-[4/3] bg-gradient-to-br from-green-100 to-blue-200 rounded-2xl overflow-hidden">
                <img
                  src="https://waawave-previews.s3.eu-north-1.amazonaws.com/macourt-media-mF8P3_yenjQ-unsplash.jpg"
                  alt="Surfer riding a wave"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Content */}
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-12">For Surfers</h2>
              
              <div className="space-y-8">
                {/* Step 1 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Search Your sessions</h3>
                    <p className="text-gray-600">
                      Search to find surf sessions by location, date, and time that match when you were in the water.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Your Shots</h3>
                    <p className="text-gray-600">
                      Browse through session galleries to spot yourself in action. Preview images before purchasing.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Buy & Download</h3>
                    <p className="text-gray-600">
                      Secure checkout with Stripe, then instantly download high-resolution photos and videos to keep forever.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Powered by Modern Technology</h2>
          <p className="text-lg text-gray-600 mb-16 max-w-2xl mx-auto">
            Secure, fast, and reliable platform built for the surf community.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Stripe Payments */}
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <img
                  src="/images/stripe.svg"
                  alt="Stripe"
                  className="h-8 w-auto"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Stripe Payments</h3>
              <p className="text-gray-600">
                Search to find surf sessions by location, date, and time that match when you were in the water.
              </p>
            </div>

            {/* Cloud Storage */}
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <img
                  src="/images/cloud.svg"
                  alt="Cloud Storage"
                  className="h-10 w-auto"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Cloud Storage</h3>
              <p className="text-gray-600">
                High-resolution media stored safely in the cloud
              </p>
            </div>

            {/* Instant Download */}
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <img
                  src="/images/Download.svg"
                  alt="Instant Download"
                  className="h-10 w-auto"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Instant Download</h3>
              <p className="text-gray-600">
                Immediate access to purchased high-res files
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {openFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-gray-300 mb-8">
            Join our Waawave community today
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowPhotographerWaitlistModal(true)}
              className="bg-white text-gray-900 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
            >
              Start Selling Photos
            </button>
            <Link
              to="/sessions"
              className="border border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white hover:text-gray-900 transition-colors inline-flex items-center justify-center"
            >
              Find My Waves
            </Link>
          </div>
        </div>
      </section>

      {/* Photographer Waitlist Modal */}
      {showPhotographerWaitlistModal && (
        <PhotographerWaitlistModal
          onClose={() => setShowPhotographerWaitlistModal(false)}
          onSuccess={() => {
            setShowPhotographerWaitlistModal(false);
          }}
        />
      )}
    </div>
  );
};

export default HowItWorksPage;