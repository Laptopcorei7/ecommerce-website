import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-ink-950 text-ink-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <span className="text-white font-serif text-sm font-bold">L</span>
              </div>
              <span className="font-serif text-xl font-semibold text-white">Luxe</span>
            </div>
            <p className="text-sm text-ink-400 leading-relaxed">
              Curated quality, delivered with care. Premium products for the modern lifestyle.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {['Instagram', 'Twitter', 'Pinterest'].map((s) => (
                <a key={s} href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-ink-300 hover:bg-brand-600 hover:text-white transition-all duration-200 text-xs font-medium">
                  {s.charAt(0)}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-4">Shop</p>
            <ul className="space-y-2.5">
              {['New Arrivals', 'Best Sellers', 'Sale', 'All Products'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-sm text-ink-400 hover:text-white transition-colors duration-200">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-4">Account</p>
            <ul className="space-y-2.5">
              {[
                { label: 'My Orders',  to: '/orders' },
                { label: 'Wishlist',   to: '/wishlist' },
                { label: 'Profile',    to: '/profile' },
                { label: 'Sign In',    to: '/login' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-ink-400 hover:text-white transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-4">Stay Updated</p>
            <p className="text-sm text-ink-400 mb-4 leading-relaxed">
              Get the latest drops and exclusive offers in your inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 min-w-0 px-3 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder:text-ink-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
              <button className="px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-500 transition-colors whitespace-nowrap">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-500">© {new Date().getFullYear()} Luxe. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {['Privacy Policy', 'Terms', 'Shipping'].map((item) => (
              <a key={item} href="#" className="text-xs text-ink-500 hover:text-ink-300 transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
