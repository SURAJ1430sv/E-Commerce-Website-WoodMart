import { Link } from "wouter";
import { 
  Warehouse, 
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
              <Warehouse className="text-amber-400 h-6 w-6 mr-2" />
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
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/suppliers" className="text-gray-400 hover:text-white transition-colors">
                  Suppliers
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/profile" className="text-gray-400 hover:text-white transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/profile/orders" className="text-gray-400 hover:text-white transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-400 hover:text-white transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-400 hover:text-white transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-400">Plot No. 123, Ghatkopar,Mumbai,Maharashtra, India</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0" />
                <span className="text-gray-400">(+91) 9876543210</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0" />
                <span className="text-gray-400">info@rest-express.com</span>
              </li>
              <li className="flex items-center">
                <Clock className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0" />
                <span className="text-gray-400">Mon-Sat: 9AM-5PM</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} WoodMarket. All rights reserved.</p>
            <div className="flex space-x-4">
              <Link href="/privacy" className="text-gray-500 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/shipping" className="text-gray-500 hover:text-white text-sm transition-colors">
                Shipping Policy
              </Link>
              <Link href="/sitemap" className="text-gray-500 hover:text-white text-sm transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
