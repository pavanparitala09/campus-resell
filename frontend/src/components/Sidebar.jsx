import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, PlusCircle, ShoppingBag, MessageSquare, User, ShieldCheck, HelpCircle } from 'lucide-react';

const Sidebar = () => {
  const { user, unreadNotifications } = useAuth();

  if (!user) return null;

  const links = [
    { to: '/dashboard', label: 'Explore', icon: LayoutDashboard },
    { to: '/sell', label: 'Sell Item', icon: PlusCircle },
    { to: '/profile?tab=listings', label: 'My Listings', icon: ShoppingBag },
    { to: '/inbox', label: 'Inbox', icon: MessageSquare, badge: unreadNotifications },
    { to: '/lost-found', label: 'Lost & Found', icon: HelpCircle },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  if (user.role === 'ADMIN') {
    links.push({ to: '/admin', label: 'Admin Panel', icon: ShieldCheck });
  }

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-100 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="flex flex-col gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard' || link.to === '/profile'}
              className={({ isActive }) => 
                `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-smooth ${
                  isActive 
                    ? 'bg-blue-50 text-primary' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className="shrink-0" />
                <span>{link.label}</span>
              </div>
              {link.badge && link.badge > 0 ? (
                <span className="bg-rose-500 text-white rounded-full px-2 py-0.5 text-[10px] font-bold">
                  {link.badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </div>

      {/* Mini Profile card at the bottom of the sidebar */}
      <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3 border border-gray-100">
        {user.profilePic ? (
          <img 
            src={user.profilePic} 
            alt={user.name} 
            className="w-9 h-9 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-800 truncate">{user.name}</p>
          <span className="text-[10px] font-semibold text-gray-400 capitalize bg-gray-200/50 px-1.5 py-0.5 rounded-sm">
            {user.role}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
