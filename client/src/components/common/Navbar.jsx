import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
export default function Navbar() {
  const { user, logout } = useAuth(); const { count } = useCart(); const [open, setOpen] = useState(false); const navigate = useNavigate();
  const dashboard = user?.role === 'admin' ? '/admin' : user?.role === 'seller' ? '/seller' : '/profile';
  const endSession = () => { logout(); navigate('/'); setOpen(false); };
  return <header className="site-header"><nav className="nav-shell"><Link className="brand" to="/"><span className="brand-mark">a</span> artisan<span>craft</span></Link><button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X/> : <Menu/>}</button><div className={`nav-links ${open ? 'nav-open' : ''}`}><NavLink to="/products">Shop</NavLink><NavLink to="/about">Our story</NavLink>{user && <NavLink to={dashboard}>{user.role === 'user' ? 'My account' : 'Dashboard'}</NavLink>}<NavLink to="/contact">Contact</NavLink><Link className="cart-link" to="/cart"><ShoppingBag size={18}/> Bag <span className="cart-count">{count}</span></Link>{user ? <button className="nav-signin" onClick={endSession}>Sign out</button> : <Link className="nav-signin" to="/login">Sign in</Link>}</div></nav></header>;
}
