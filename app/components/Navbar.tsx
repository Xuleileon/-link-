import { Bell, User, Home, Search, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const NavbarIcon = ({ icon: Icon, href }) => (
  <Link href={href} passHref>
    <motion.a
      className="p-2 rounded-full text-gray-700 hover:bg-blue-50 hover:text-blue-500 transition-colors duration-200"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon className="h-6 w-6" />
    </motion.a>
  </Link>
)

export function Navbar() {
  return (
    <motion.nav 
      className="bg-white shadow-sm border-b border-gray-200"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-xl font-bold text-blue-500">全域Link+</span>
          </motion.div>
          <div className="flex items-center space-x-4">
            <NavbarIcon icon={Home} href="/" />
            <NavbarIcon icon={Search} href="/search" />
            <NavbarIcon icon={Bell} href="/notifications" />
            <NavbarIcon icon={Mail} href="/messages" />
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <button className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200">
                <User className="h-6 w-6 text-gray-700" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

