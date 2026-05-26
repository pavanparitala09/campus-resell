import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, PlusCircle, MessageSquare, User, HelpCircle } from 'lucide-react';

const BottomNav = () => {
  const { user, unreadNotifications } = useAuth();

  if (!user) return null;

  const links = [
    { to: '/dashboard', label: 'Explore', icon: LayoutDashboard },
    { to: '/lost-found', label: 'Lost & Found', icon: HelpCircle },
    { to: '/sell', label: 'Sell', icon: PlusCircle },
    { to: '/inbox', label: 'Inbox', icon: MessageSquare, badge: unreadNotifications },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 flex justify-around items-center h-16 md:hidden shadow-lg pb-safe">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.label}
            to={link.to}
            end={link.to === '/dashboard' || link.to === '/profile'}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center flex-1 h-full text-center relative ${
                isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <Icon size={20} className="stroke-2" />
            <span className="text-[10px] font-medium mt-1">{link.label}</span>
            {link.badge && link.badge > 0 ? (
              <span className="absolute top-2 right-[25%] bg-rose-500 text-white rounded-full w-4 h-4 text-[9px] font-bold flex items-center justify-center">
                {link.badge}
              </span>
            ) : null}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;
