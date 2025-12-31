import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaUsers, FaHandshake, FaStar, FaAward, FaHeart, FaPhone, FaEnvelope } from 'react-icons/fa';

const About = () => {
  return (
    <div className='min-h-screen bg-[#F5F5F5]'>
      {/* Hero Section */}
      <section className='bg-gradient-to-br from-[#DC2626] via-[#B91C1C] to-[#991B1B] text-white py-12 md:py-20 lg:py-24 px-4 md:px-6'>
        <div className='container mx-auto max-w-7xl text-center'>
          <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6' style={{ fontFamily: 'Playfair Display, serif' }}>
            About PreEvent
          </h1>
          <p className='text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto opacity-95'>
            Your Premier Event Planning Partner - Connecting Dreams with Excellence
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className='py-12 md:py-16 lg:py-20 px-4 md:px-6 bg-white'>
        <div className='container mx-auto max-w-7xl'>
          <div className='max-w-4xl mx-auto'>
            <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] mb-6 text-center' style={{ fontFamily: 'Playfair Display, serif' }}>
              Who We Are
            </h2>
            <div className='space-y-4 text-[#6B7280] text-base md:text-lg leading-relaxed'>
              <p>
                PreEvent is India's premier event planning platform, revolutionizing how people plan and organize their special occasions. We understand that every event is unique and deserves meticulous attention to detail, whether it's a grand wedding, a corporate gathering, a birthday celebration, or any special moment in your life.
              </p>
              <p>
                Founded with a vision to simplify event planning, PreEvent connects customers with a curated network of trusted vendors, including photographers, makeup artists, caterers, decorators, event planners, and many more. Our platform eliminates the hassle of searching multiple sources, negotiating with different vendors, and coordinating various services.
              </p>
              <p>
                We believe that planning an event should be exciting, not stressful. That's why we've created a seamless, user-friendly platform where you can browse, compare, and book all your event services in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className='py-12 md:py-16 lg:py-20 px-4 md:px-6 bg-[#F5F5F5]'>
        <div className='container mx-auto max-w-7xl'>
          <div className='grid md:grid-cols-2 gap-8 md:gap-12'>
            {/* Mission */}
            <div className='bg-white rounded-2xl p-8 shadow-lg'>
              <div className='flex items-center gap-3 mb-4'>
                <FaHeart className='text-[#DC2626] text-3xl' />
                <h3 className='text-2xl md:text-3xl font-bold text-[#111827]' style={{ fontFamily: 'Playfair Display, serif' }}>
                  Our Mission
                </h3>
              </div>
              <p className='text-[#6B7280] text-base md:text-lg leading-relaxed'>
                To empower individuals and businesses to create unforgettable events by providing easy access to the best event planning services, trusted vendors, and competitive prices. We strive to make event planning accessible, transparent, and stress-free for everyone.
              </p>
            </div>

            {/* Vision */}
            <div className='bg-white rounded-2xl p-8 shadow-lg'>
              <div className='flex items-center gap-3 mb-4'>
                <FaAward className='text-[#DC2626] text-3xl' />
                <h3 className='text-2xl md:text-3xl font-bold text-[#111827]' style={{ fontFamily: 'Playfair Display, serif' }}>
                  Our Vision
                </h3>
              </div>
              <p className='text-[#6B7280] text-base md:text-lg leading-relaxed'>
                To become India's most trusted and comprehensive event planning platform, recognized for excellence, innovation, and customer satisfaction. We envision a future where planning any event is as simple as a few clicks, with guaranteed quality and reliability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose PreEvent Section */}
      <section className='py-12 md:py-16 lg:py-20 px-4 md:px-6 bg-white'>
        <div className='container mx-auto max-w-7xl'>
          <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] mb-8 md:mb-12 text-center' style={{ fontFamily: 'Playfair Display, serif' }}>
            Why Choose PreEvent?
          </h2>
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
            {/* Feature 1 */}
            <div className='bg-[#F5F5F5] rounded-xl p-6 hover:shadow-lg transition-all duration-300'>
              <FaUsers className='text-[#DC2626] text-4xl mb-4' />
              <h3 className='text-xl font-bold text-[#111827] mb-3'>Trusted Vendors</h3>
              <p className='text-[#6B7280]'>
                We carefully vet and verify all vendors on our platform, ensuring you work with professional, reliable service providers who deliver exceptional results.
              </p>
            </div>

            {/* Feature 2 */}
            <div className='bg-[#F5F5F5] rounded-xl p-6 hover:shadow-lg transition-all duration-300'>
              <FaHandshake className='text-[#DC2626] text-4xl mb-4' />
              <h3 className='text-xl font-bold text-[#111827] mb-3'>Best Prices</h3>
              <p className='text-[#6B7280]'>
                Compare prices from multiple vendors and get the best deals. We ensure competitive pricing without compromising on quality.
              </p>
            </div>

            {/* Feature 3 */}
            <div className='bg-[#F5F5F5] rounded-xl p-6 hover:shadow-lg transition-all duration-300'>
              <FaStar className='text-[#DC2626] text-4xl mb-4' />
              <h3 className='text-xl font-bold text-[#111827] mb-3'>Wide Assortment</h3>
              <p className='text-[#6B7280]'>
                Access 50+ service categories with hundreds of vendors. From photography to catering, decoration to entertainment - we have it all.
              </p>
            </div>

            {/* Feature 4 */}
            <div className='bg-[#F5F5F5] rounded-xl p-6 hover:shadow-lg transition-all duration-300'>
              <FaCheckCircle className='text-[#DC2626] text-4xl mb-4' />
              <h3 className='text-xl font-bold text-[#111827] mb-3'>Easy Booking</h3>
              <p className='text-[#6B7280]'>
                Simple, intuitive booking process. Browse, select, and book your services in minutes. No complicated procedures or hidden fees.
              </p>
            </div>

            {/* Feature 5 */}
            <div className='bg-[#F5F5F5] rounded-xl p-6 hover:shadow-lg transition-all duration-300'>
              <FaAward className='text-[#DC2626] text-4xl mb-4' />
              <h3 className='text-xl font-bold text-[#111827] mb-3'>Quality Assured</h3>
              <p className='text-[#6B7280]'>
                Every vendor is rated and reviewed by real customers. We maintain high standards and ensure quality service delivery.
              </p>
            </div>

            {/* Feature 6 */}
            <div className='bg-[#F5F5F5] rounded-xl p-6 hover:shadow-lg transition-all duration-300'>
              <FaHeart className='text-[#DC2626] text-4xl mb-4' />
              <h3 className='text-xl font-bold text-[#111827] mb-3'>24/7 Support</h3>
              <p className='text-[#6B7280]'>
                Our dedicated support team is always ready to help. Get assistance whenever you need it, ensuring a smooth event planning experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='py-12 md:py-16 lg:py-20 px-4 md:px-6 bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white'>
        <div className='container mx-auto max-w-7xl'>
          <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold mb-8 md:mb-12 text-center' style={{ fontFamily: 'Playfair Display, serif' }}>
            Our Achievements
          </h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8'>
            <div className='text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm'>
              <div className='text-3xl md:text-5xl font-extrabold mb-2'>1K+</div>
              <div className='text-sm md:text-base opacity-90'>Happy Customers</div>
            </div>
            <div className='text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm'>
              <div className='text-3xl md:text-5xl font-extrabold mb-2'>500+</div>
              <div className='text-sm md:text-base opacity-90'>Trusted Vendors</div>
            </div>
            <div className='text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm'>
              <div className='text-3xl md:text-5xl font-extrabold mb-2'>50+</div>
              <div className='text-sm md:text-base opacity-90'>Service Categories</div>
            </div>
            <div className='text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm'>
              <div className='text-3xl md:text-5xl font-extrabold mb-2'>4.8★</div>
              <div className='text-sm md:text-base opacity-90'>Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className='py-12 md:py-16 lg:py-20 px-4 md:px-6 bg-white'>
        <div className='container mx-auto max-w-7xl'>
          <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] mb-8 md:mb-12 text-center' style={{ fontFamily: 'Playfair Display, serif' }}>
            What We Offer
          </h2>
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            <div className='border-2 border-gray-200 rounded-xl p-6 hover:border-[#DC2626] transition-all duration-300'>
              <h3 className='text-xl font-bold text-[#111827] mb-3'>Wedding Planning</h3>
              <p className='text-[#6B7280]'>
                Complete wedding planning services including venue selection, decoration, photography, catering, and coordination.
              </p>
            </div>
            <div className='border-2 border-gray-200 rounded-xl p-6 hover:border-[#DC2626] transition-all duration-300'>
              <h3 className='text-xl font-bold text-[#111827] mb-3'>Corporate Events</h3>
              <p className='text-[#6B7280]'>
                Professional corporate event management for conferences, seminars, product launches, and team building activities.
              </p>
            </div>
            <div className='border-2 border-gray-200 rounded-xl p-6 hover:border-[#DC2626] transition-all duration-300'>
              <h3 className='text-xl font-bold text-[#111827] mb-3'>Birthday Parties</h3>
              <p className='text-[#6B7280]'>
                Creative birthday party planning with themes, decorations, catering, and entertainment for all ages.
              </p>
            </div>
            <div className='border-2 border-gray-200 rounded-xl p-6 hover:border-[#DC2626] transition-all duration-300'>
              <h3 className='text-xl font-bold text-[#111827] mb-3'>Photography Services</h3>
              <p className='text-[#6B7280]'>
                Professional photographers for weddings, events, portraits, and commercial photography needs.
              </p>
            </div>
            <div className='border-2 border-gray-200 rounded-xl p-6 hover:border-[#DC2626] transition-all duration-300'>
              <h3 className='text-xl font-bold text-[#111827] mb-3'>Makeup Artists</h3>
              <p className='text-[#6B7280]'>
                Expert makeup artists for bridal makeup, party makeup, and special occasion styling.
              </p>
            </div>
            <div className='border-2 border-gray-200 rounded-xl p-6 hover:border-[#DC2626] transition-all duration-300'>
              <h3 className='text-xl font-bold text-[#111827] mb-3'>Catering Services</h3>
              <p className='text-[#6B7280]'>
                Delicious catering options for all types of events, from intimate gatherings to large celebrations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className='py-12 md:py-16 lg:py-20 px-4 md:px-6 bg-[#F5F5F5]'>
        <div className='container mx-auto max-w-4xl'>
          <div className='bg-white rounded-2xl p-8 md:p-12 shadow-lg text-center'>
            <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] mb-4' style={{ fontFamily: 'Playfair Display, serif' }}>
              Ready to Plan Your Event?
            </h2>
            <p className='text-[#6B7280] text-base md:text-lg mb-8'>
              Let us help you create unforgettable memories. Get started today and experience the PreEvent difference.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-8'>
              <Link
                to="/"
                className='bg-[#DC2626] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#B91C1C] transition-all duration-300 hover:shadow-lg'
              >
                Explore Services
              </Link>
              <Link
                to="/support"
                className='bg-white text-[#DC2626] border-2 border-[#DC2626] px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-all duration-300'
              >
                Contact Us
              </Link>
            </div>
            <div className='flex flex-col sm:flex-row gap-6 justify-center items-center text-[#6B7280]'>
              <div className='flex items-center gap-2'>
                <FaPhone className='text-[#DC2626]' />
                <span>+91 7439001746</span>
              </div>
              <div className='flex items-center gap-2'>
                <FaEnvelope className='text-[#DC2626]' />
                <span>tradeoxford123@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

