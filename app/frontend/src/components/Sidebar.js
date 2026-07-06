import React from 'react';
   import { NavLink } from 'react-router-dom';
   import { useAuth } from '../context/AuthContext';
   import { 
     LayoutDashboard, 
     Container, 
     Network, 
     Activity, 
     GitBranch, 
     Info, 
     Settings, 
     LogOut, 
     Terminal
   } from 'lucide-react';
   import './Sidebar.css';
   
   const Sidebar = ({ isCollapsed, toggleCollapse }) => {
     const { logout, user } = useAuth();
   
     const navItems = [
       { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
       { path: '/deployments', label: 'Deployments', icon: GitBranch },
       { path: '/docker', label: 'Docker', icon: Container },
       { path: '/kubernetes', label: 'Kubernetes', icon: Network },
       { path: '/monitoring', label: 'Monitoring', icon: Activity },
       { path: '/settings', label: 'Settings', icon: Settings },
       { path: '/about', label: 'About', icon: Info },
     ];
   
     return (
       <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
         <div className="sidebar-header">
           <Terminal className="logo-icon" size={24} />
           {!isCollapsed && <span className="logo-text">InfraPilot</span>}
         </div>
   
         <div className="user-profile-summary">
           <div className="avatar">
             {user?.name ? user.name.charAt(0) : 'A'}
           </div>
           {!isCollapsed && (
             <div className="user-info">
               <div className="user-name">{user?.name || 'Administrator'}</div>
               <div className="user-role">{user?.role || 'DevOps Architect'}</div>
             </div>
           )}
         </div>
   
         <nav className="sidebar-nav">
           {navItems.map((item) => {
             const Icon = item.icon;
             return (
               <NavLink
                 key={item.path}
                 to={item.path}
                 className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                 title={item.label}
               >
                 <Icon className="nav-icon" size={18} />
                 {!isCollapsed && <span className="nav-label">{item.label}</span>}
               </NavLink>
             );
           })}
         </nav>
   
         <div className="sidebar-footer">
           <button onClick={logout} className="logout-btn" title="Logout">
             <LogOut className="nav-icon" size={18} />
             {!isCollapsed && <span className="nav-label">Logout</span>}
           </button>
         </div>
       </aside>
     );
   };
   
   export default Sidebar;
