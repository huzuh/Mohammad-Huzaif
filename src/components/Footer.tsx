import { Link } from 'react-router-dom';
import { Globe, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Link to="/" className="font-display text-xl font-bold text-white block">
              Plan My Trip India
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Comprehensive travel discovery, interactive budget estimation, and AI-assisted
              itinerary planning across all 28 Indian states and 8 union territories.
            </p>
            <div className="flex items-center gap-4 pt-1">
              <a
                href="#explore-channels"
                aria-label="Explore India Travel Journal"
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
              >
                <Globe className="w-4 h-4" />
              </a>
              <Link
                to="/contact"
                aria-label="Email Plan My Trip India"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
              >
                <Mail className="w-4 h-4" />
              </Link>
              <Link
                to="/explore"
                aria-label="Browse Indian States Map"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
              >
                <MapPin className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Discover India</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">
                  All 28 States &amp; 8 UTs
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-white transition-colors">
                  Browse All Destinations
                </Link>
              </li>
              <li>
                <Link to="/state/rajasthan" className="hover:text-white transition-colors">
                  Rajasthan Heritage
                </Link>
              </li>
              <li>
                <Link to="/state/kerala" className="hover:text-white transition-colors">
                  Kerala Backwaters
                </Link>
              </li>
              <li>
                <Link to="/state/ladakh" className="hover:text-white transition-colors">
                  Ladakh Expeditions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Planning Tools</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/planner" className="hover:text-white transition-colors">
                  Smart Trip Planner
                </Link>
              </li>
              <li>
                <Link to="/planner#budget" className="hover:text-white transition-colors">
                  Travel Budget Calculator
                </Link>
              </li>
              <li>
                <Link to="/destinations?category=Mountains" className="hover:text-white transition-colors">
                  Himalayan Escapes
                </Link>
              </li>
              <li>
                <Link to="/destinations?category=Beaches" className="hover:text-white transition-colors">
                  Coastal &amp; Island Getaways
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Saved Trips &amp; Bookmarks
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Company &amp; Support</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Travel Desk
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Traveler Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} Plan My Trip India. All prices shown are sample
            planning estimates, not live market quotes.
          </p>
          <p>Curated across 28 Indian States &amp; 8 Union Territories.</p>
        </div>
      </div>
    </footer>
  );
}
