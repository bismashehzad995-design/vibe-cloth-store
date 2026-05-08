"use client";
import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [returnsOpen, setReturnsOpen] = useState(false);

  return (
    <>
      <footer className="bg-gray-900 text-gray-300 mt-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-bold mb-4">Cloth Reseller</h3>
              <p className="text-sm">Authentic premium brands for fashion lovers.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/products" className="hover:text-white">Shop</Link></li>
                <li>
                  <button onClick={() => setAboutOpen(true)} className="hover:text-white">
                    About Us
                  </button>
                </li>
                <li>
                  <button onClick={() => setContactOpen(true)} className="hover:text-white">
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => setFaqOpen(true)} className="hover:text-white">
                    FAQ
                  </button>
                </li>
                <li>
                  <button onClick={() => setShippingOpen(true)} className="hover:text-white">
                    Shipping
                  </button>
                </li>
                <li>
                  <button onClick={() => setReturnsOpen(true)} className="hover:text-white">
                    Returns
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Contact</h4>
              <p className="text-sm">Email: clothreseller@gmail.com</p>
              <p className="text-sm">Follow us on social media</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-xs">
            © 2026 Cloth Reseller. All rights reserved.
          </div>
        </div>
      </footer>

      {/* About Us Modal - same as before */}
      {aboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button onClick={() => setAboutOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">About Cloth Reseller</h2>
            <div className="space-y-3 text-gray-600">
              <p>Welcome to <span className="font-semibold text-indigo-600">Cloth Reseller</span> – your trusted destination for premium fashion at affordable prices.</p>
              <p>We specialize in reselling authentic, branded clothing including <strong>Stitched & Unstitched Clothes</strong> from top international and local brands.</p>
              <p>Our mission is to provide you with stylish, high‑quality outfits that help you express your personality without breaking the bank. Every piece is carefully curated to ensure you get the best value.</p>
              <p className="pt-2 text-sm italic text-gray-500">#OutfitVibes – Wear Your Confidence.</p>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal - same as before */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setContactOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Us</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                <a href="mailto:clothreseller@gmail.com" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  clothreseller@gmail.com
                </a>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">WhatsApp Channel</p>
                <a href="https://wa.me/923451928626?text=Hi%21%20I%27m%20interested%20in%20your%20products%20from%20Outfit%20Vibes." target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.032 2.001c-5.525 0-10 4.475-10 10 0 1.83.493 3.542 1.355 5.016l-1.386 4.349 4.482-1.35c1.422.789 3.053 1.216 4.783 1.216 5.525 0 10-4.475 10-10s-4.475-10-10-10zm0 18.418c-1.652 0-3.225-.449-4.589-1.289l-3.054.918 1.008-3.016c-.9-1.381-1.414-2.97-1.414-4.613 0-4.676 3.804-8.48 8.48-8.48 4.676 0 8.48 3.804 8.48 8.48 0 4.676-3.804 8.48-8.48 8.48zm4.586-6.846c-.164-.082-1.074-.53-1.234-.592-.16-.062-.296-.094-.406.094-.11.188-.574.592-.704.724-.13.133-.256.147-.418.064-.162-.082-.684-.252-1.304-.808-.482-.43-.806-.96-.9-1.122-.094-.162-.01-.27.076-.354.076-.082.164-.21.246-.316.082-.105.11-.18.164-.3.055-.12.028-.224-.014-.314-.042-.09-.406-1.048-.556-1.436-.148-.378-.302-.316-.406-.316-.104 0-.23-.02-.352-.02-.122 0-.328.046-.5.228-.172.182-.656.64-.656 1.562 0 .922.672 1.814.764 1.938.093.124 1.316 2.008 3.176 2.82.458.2.836.332 1.146.434.482.154.92.132 1.266.08.386-.058 1.074-.438 1.226-.862.152-.424.152-.788.106-.864-.046-.076-.164-.124-.328-.206z" /></svg>
                  Outfit Vibes (WhatsApp)
                </a>
                <p className="text-xs text-gray-500 mt-4">Click to chat with us on WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {faqOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[80vh] overflow-y-auto">
            <button onClick={() => setFaqOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-semibold text-gray-800">Q: Are the products authentic?</h3>
                <p>A: Yes, we source only genuine branded products from trusted suppliers. Quality is our top priority.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Q: How can I track my order?</h3>
                <p>A: Once shipped, you'll receive a tracking number via email/SMS. You can also check status in "My Orders".</p>
              </div>
              {/* <div>
                <h3 className="font-semibold text-gray-800">Q: Do you offer size exchanges?</h3>
                <p>A: Yes, we offer size exchange within 7 days of delivery. Please contact support for assistance.</p>
              </div> */}
              <div>
                <h3 className="font-semibold text-gray-800">Q: What payment methods are accepted?</h3>
                <p>A: Cash on Delivery (COD) and Bank Transfer are currently accepted.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Q: How long does delivery take?</h3>
                <p>A: Usually 3-5 business days for major cities, 5-7 for remote areas.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Modal */}
      {shippingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <button onClick={() => setShippingOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Shipping Policy</h2>
            <div className="space-y-3 text-gray-600">
              <p><strong>Delivery Time:</strong> Orders are processed within 1-2 business days. Delivery typically takes 3-7 business days.</p>
              <p><strong>Shipping Charges:</strong> A flat delivery fee of Rs 250 applies to all orders.</p>
              {/* <p><strong>Order Tracking:</strong> After dispatch, you'll receive a tracking link via email and WhatsApp.</p> */}
              <p><strong>International Shipping:</strong> Currently, we only deliver within Pakistan.</p>
              <p><strong>Lost/Damaged:</strong> If your package arrives damaged or is lost, contact us within 48 hours for resolution.</p>
            </div>
          </div>
        </div>
      )}

      {/* Returns Modal */}
      {returnsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <button onClick={() => setReturnsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Returns & Exchange</h2>
            <div className="space-y-3 text-gray-600">
              <p><strong>Return Window:</strong> You can request a return or exchange within 7 days of delivery.</p>
              <p><strong>Conditions:</strong> Items must be unworn, unwashed, with original tags attached.</p>
              <p><strong>How to Initiate:</strong> Go to "My Orders", select the order, and click "Return". Or contact our WhatsApp support.</p>
              <p><strong>Refund:</strong> Refunds are processed within 5-7 business days after quality check. Only bank transfer refunds.</p>
              <p><strong>Exchange:</strong> We do not offer size/color exchange .</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}