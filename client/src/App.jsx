import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import ProtectedRoute from './components/routes/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import CartPage from './pages/CartPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SellerDashboard from './pages/SellerDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import './styles/page-backgrounds.css';
function NotFound(){return <main className="empty-state"><span>404</span><h1>That page wandered off.</h1><a className="button button-primary" href="/">Back home</a></main>;}
function sceneForPath(path) {
	if (path === '/') return 'home';
	if (path === '/about') return 'about';
	if (path === '/products') return 'catalog';
	if (path.startsWith('/products/')) return 'product';
	if (path === '/cart') return 'cart';
	if (path === '/contact') return 'contact';
	if (path === '/login') return 'login';
	if (path === '/register') return 'register';
	if (path === '/profile') return 'profile';
	if (path === '/seller') return 'seller';
	if (path === '/admin') return 'admin';
	return 'not-found';
}
function AppLayout(){const {pathname}=useLocation();return <div className={`app-shell scene-${sceneForPath(pathname)}`}><Navbar/><Routes><Route path="/" element={<HomePage/>}/><Route path="/about" element={<AboutPage/>}/><Route path="/products" element={<ProductsPage/>}/><Route path="/products/:id" element={<ProductDetailPage/>}/><Route path="/cart" element={<CartPage/>}/><Route path="/contact" element={<ContactPage/>}/><Route path="/login" element={<LoginPage/>}/><Route path="/register" element={<RegisterPage/>}/><Route element={<ProtectedRoute/>}><Route path="/profile" element={<ProfilePage/>}/></Route><Route element={<ProtectedRoute roles={['seller','admin']}/> }><Route path="/seller" element={<SellerDashboard/>}/></Route><Route element={<ProtectedRoute roles={['admin']}/> }><Route path="/admin" element={<AdminDashboard/>}/></Route><Route path="*" element={<NotFound/>}/></Routes><Footer/></div>;}
export default function App(){return <AppLayout/>;}
