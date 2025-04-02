import { Link } from "wouter";
import { 
  Tree, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <Tree className="text-amber-400 h-6 w-6 mr-2" />
              <span className="text-white font-bold text-xl">WoodMarket</span>
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted marketplace for quality plywood and wood products. Connecting suppliers and customers since 2018.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-gray-400 hover:text-white transition-colors">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/products">
                  <a className="text-gray-400 hover:text-white transition-colors">Products</a>
                </Link>
              </li>
              <li>
                <Link href="/suppliers">
                  <a className="text-gray-400 hover:text-white transition-colors">Suppliers</a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-gray-400 hover:text-white transition-colors">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-gray-400 hover:text-white transition-colors">Contact</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/profile">
                  <a className="text-gray-400 hover:text-white transition-colors">My Account</a>
                </Link>
              </li>
              <li>
                <Link href="/profile/orders">
                  <a className="text-gray-400 hover:text-white transition-colors">Order Tracking</a>
                </Link>
              </li>
              <li>
                <Link href="/shipping">
                  <a className="text-gray-400 hover:text-white transition-colors">Shipping Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/returns">
                  <a className="text-gray-400 hover:text-white transition-colors">Returns & Refunds</a>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <a className="text-gray-400 hover:text-white transition-colors">FAQ</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-400">123 Wood Lane, Timber City, TC 12345</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0" />
                <span className="text-gray-400">(555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0" />
                <span className="text-gray-400">info@woodmarket.com</span>
              </li>
              <li className="flex items-center">
                <Clock className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0" />
                <span className="text-gray-400">Mon-Fri: 9AM-5PM</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} WoodMarket. All rights reserved.</p>
            <div className="flex space-x-4">
              <Link href="/privacy">
                <a className="text-gray-500 hover:text-white text-sm transition-colors">Privacy Policy</a>
              </Link>
              <Link href="/terms">
                <a className="text-gray-500 hover:text-white text-sm transition-colors">Terms of Service</a>
              </Link>
              <Link href="/shipping">
                <a className="text-gray-500 hover:text-white text-sm transition-colors">Shipping Policy</a>
              </Link>
              <Link href="/sitemap">
                <a className="text-gray-500 hover:text-white text-sm transition-colors">Sitemap</a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
