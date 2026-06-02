/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent, MouseEvent, useRef, ChangeEvent } from 'react';
import { 
  Scissors, 
  Shirt, 
  Sparkles, 
  Phone, 
  MapPin, 
  Mail, 
  ArrowRight, 
  ExternalLink, 
  Menu, 
  X, 
  ChevronDown, 
  Check, 
  GraduationCap, 
  Users, 
  FileText, 
  Calculator, 
  History, 
  Clock, 
  Trash, 
  User, 
  Plus,
  Send,
  Sparkle,
  Lock,
  Unlock,
  Settings,
  Image,
  Upload
} from 'lucide-react';

interface Inquiry {
  id: string;
  productType: string;
  material: string;
  quantity: number;
  customization: string;
  clientName: string;
  clientPhone: string;
  clientNotes: string;
  totalPrice: number;
  date: string;
}

interface BrandSettings {
  name: string;
  tagline: string;
  heroImage: string;
  logoImage: string;
  aboutTitle: string;
  aboutText1: string;
  aboutText2: string;
  adminPasswordHash: string;
  whatsappNumber: string;
}

interface CatalogProduct {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  basePrice: number;
}

const DEFAULT_BRAND_SETTINGS: BrandSettings = {
  name: 'RAFI KONVEKSI',
  tagline: 'Precision Sewing',
  heroImage: '/src/assets/images/hero_clothing_rack_1780410100838.png',
  logoImage: '',
  aboutTitle: 'RAFI KONVEKSI',
  aboutText1: 'Rafikonveksi berdiri di atas pilar presisi dan dedikasi. Kami percaya bahwa setiap pakaian adalah representasi dari karakter dan profesionalisme penggunanya.',
  aboutText2: 'Dengan menggunakan material terbaik dan teknik penjahitan modern, kami memastikan setiap produk yang keluar dari workshop kami memenuhi standar kualitas tinggi yang berkelanjutan.',
  adminPasswordHash: 'admin123',
  whatsappNumber: '6281234567890'
};

const DEFAULT_CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: 'jaket',
    title: 'Jaket & Outer',
    subtitle: 'PREMIUM SERIES',
    description: 'Konstruksi kokoh dengan material tahan cuaca untuk perlindungan maksimal.',
    image: '/src/assets/images/jacket_outer_flat_1780410123271.png',
    basePrice: 135000,
  },
  {
    id: 'polo',
    title: 'Kaos Polo',
    subtitle: 'Combed Cotton 30s & 24s.',
    description: 'Combed Cotton 30s & 24s berkerah rapi dengan warna-warna solid modern.',
    image: '/src/assets/images/polo_shirts_flat_1780410139619.png',
    basePrice: 65000,
  },
  {
    id: 'pdl',
    title: 'Kemeja PDL',
    subtitle: 'American Drill & Ripstop.',
    description: 'American Drill & Ripstop dengan saku dada kancing ganda standar lapangan.',
    image: '/src/assets/images/pdl_shirt_flat_1780410153691.png',
    basePrice: 95000,
  },
  {
    id: 'hoodie',
    title: 'Hoodie & Sweatshirt',
    subtitle: 'Fleece & Baby Terry.',
    description: 'Fleece & Baby Terry bertekstur lembut dengan jahitan ganda.',
    image: '/src/assets/images/hoodie_beige_flat_1780410167519.png',
    basePrice: 110000,
  }
];

export default function App() {
  // Mobile Navigation States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active Catalog Details Modal
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<{
    id: string;
    title: string;
    category: string;
    text: string;
    materials: string[];
    basePrice: number;
    image: string;
  } | null>(null);

  // Quote Calculator Modal
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Quote Calculator Fields
  const [calcProduct, setCalcProduct] = useState('Jaket & Outer');
  const [calcMaterial, setCalcMaterial] = useState('American Drill & Taslan');
  const [calcQuantity, setCalcQuantity] = useState(30);
  const [calcCustomization, setCalcCustomization] = useState('Bordir Logo');
  const [calcName, setCalcName] = useState('');
  const [calcPhone, setCalcPhone] = useState('');
  const [calcNotes, setCalcNotes] = useState('');
  
  // Real-time calculated price values
  const [liveEstimatedPrice, setLiveEstimatedPrice] = useState(0);
  const [liveSinglePrice, setLiveSinglePrice] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);

  // Database State - Offline/Local Inquiry persistence
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [showInquiryPanel, setShowInquiryPanel] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState<Inquiry | null>(null);

  // Load database history on mount
  useEffect(() => {
    const cached = localStorage.getItem('rafi_konveksi_inquiries');
    if (cached) {
      try {
        setInquiries(JSON.parse(cached));
      } catch (e) {
        console.error("Failed loading inquiries data", e);
      }
    }
  }, []);

  // Sync to database
  const saveInquiriesToStorage = (updatedList: Inquiry[]) => {
    setInquiries(updatedList);
    localStorage.setItem('rafi_konveksi_inquiries', JSON.stringify(updatedList));
  };

  // Brand and Catalog customizable states
  const [brandSettings, setBrandSettings] = useState<BrandSettings>(() => {
    const cached = localStorage.getItem('rafi_konveksi_brand');
    if (cached) {
      try {
        return { ...DEFAULT_BRAND_SETTINGS, ...JSON.parse(cached) };
      } catch (e) {
        console.error("Failed loading brand settings", e);
      }
    }
    return DEFAULT_BRAND_SETTINGS;
  });

  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>(() => {
    const cached = localStorage.getItem('rafi_konveksi_catalog');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Failed loading catalog products", e);
      }
    }
    return DEFAULT_CATALOG_PRODUCTS;
  });

  // Admin states
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminError, setAdminError] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState<'general' | 'catalog' | 'inquiries' | 'password'>('general');

  // Helpers to update and persist
  const saveBrandSettings = (updated: BrandSettings) => {
    setBrandSettings(updated);
    try {
      localStorage.setItem('rafi_konveksi_brand', JSON.stringify(updated));
    } catch (e) {
      console.error("Quota exceeded limit on saving brand settings:", e);
      alert('Penyimpanan browser (LocalStorage) penuh. Silakan reset beberapa foto atau gunakan gambar berukuran lebih kecil.');
    }
  };

  const saveCatalogProducts = (updated: CatalogProduct[]) => {
    setCatalogProducts(updated);
    try {
      localStorage.setItem('rafi_konveksi_catalog', JSON.stringify(updated));
    } catch (e) {
      console.error("Quota exceeded limit on saving catalog settings:", e);
      alert('Penyimpanan browser (LocalStorage) penuh. Silakan reset beberapa foto atau gunakan gambar berukuran lebih kecil.');
    }
  };

  // Pricing Model constants computed dynamically from custom catalog configuration
  const basePrices: Record<string, number> = {};
  catalogProducts.forEach(item => {
    basePrices[item.title] = item.basePrice;
  });

  const materialMultipliers: Record<string, number> = {
    'American Drill & Taslan': 10000,
    'Combed Cotton 30s & 24s': 5000,
    'Fleece & Baby Terry': 15000,
    'Premium Heavy Cotton': 12000,
  };

  const customizationPrices: Record<string, number> = {
    'Bordir Logo': 12000,
    'Sablon High-Quality': 8000,
    'Tanpa Custom': 0,
  };

  // Live Pricing Calculation
  useEffect(() => {
    const base = basePrices[calcProduct] || 100000;
    const matAdd = materialMultipliers[calcMaterial] || 0;
    const custAdd = customizationPrices[calcCustomization] || 0;
    
    // Total cost per piece before discount
    const itemCost = base + matAdd + custAdd;
    
    // Bulk discount threshold
    let pct = 0;
    if (calcQuantity >= 500) {
      pct = 25; // Massive discount
    } else if (calcQuantity >= 100) {
      pct = 15;
    } else if (calcQuantity >= 50) {
      pct = 10;
    } else if (calcQuantity >= 24) {
      pct = 5;
    }

    const singlePrice = Math.round(itemCost * (1 - pct / 100));
    const total = singlePrice * calcQuantity;

    setLiveSinglePrice(singlePrice);
    setLiveEstimatedPrice(total);
    setDiscountPercent(pct);
  }, [calcProduct, calcMaterial, calcQuantity, calcCustomization]);

  // Form Submission
  const handleCalculateAndSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!calcName.trim() || !calcPhone.trim()) {
      alert("Harap lengkapi nama dan nomor WhatsApp Anda agar kami bisa menghubungi.");
      return;
    }

    const newInquiry: Inquiry = {
      id: 'RQ-' + Math.floor(1000 + Math.random() * 9000),
      productType: calcProduct,
      material: calcMaterial,
      quantity: calcQuantity,
      customization: calcCustomization,
      clientName: calcName,
      clientPhone: calcPhone,
      clientNotes: calcNotes || 'Tidak ada catatan tambahan',
      totalPrice: liveEstimatedPrice,
      date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }),
    };

    const nextInquiries = [newInquiry, ...inquiries];
    saveInquiriesToStorage(nextInquiries);
    setSubmittedInquiry(newInquiry);
    setShowSuccessToast(true);
    setIsQuoteModalOpen(false);

    // Reset Calculator details but keep profile info for convenience
    setCalcNotes('');
  };

  // Generate Whatsapp Link based on Inquiry structure
  const getWhatsAppLink = (inq: Inquiry) => {
    const text = `Halo ${brandSettings.name}! Saya ingin memesan pakaian dengan rincian berikut:
  
📋 *Kode Permintaan:* ${inq.id}
👤 *Nama Pemesan:* ${inq.clientName}
📞 *Kontak:* ${inq.clientPhone}
👕 *Jenis Apparel:* ${inq.productType}
🧶 *Bahan Kain:* ${inq.material}
🔢 *Jumlah Pesanan:* ${inq.quantity} pcs
✨ *Custom:* ${inq.customization}
📝 *Catatan Tambahan:* ${inq.clientNotes}
💰 *Estimasi Total:* Rp ${inq.totalPrice.toLocaleString('id-ID')}

Mohon informasi langkah pengerjaan selanjutnya. Terima kasih!`;
    
    const cleanPhone = (brandSettings.whatsappNumber || '6281234567890').replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const deleteInquiry = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const filtered = inquiries.filter(item => item.id !== id);
    saveInquiriesToStorage(filtered);
    if (submittedInquiry?.id === id) {
      setSubmittedInquiry(null);
    }
  };

  const handleAdminLogin = () => {
    const expectedPassword = brandSettings.adminPasswordHash || 'admin123';
    if (adminPasswordInput === expectedPassword) {
      setIsAdminLoggedIn(true);
      setIsAdminLoginModalOpen(false);
      setIsAdminDashboardOpen(true);
      setAdminPasswordInput('');
      setAdminError('');
    } else {
      setAdminError('Kata sandi salah. Silakan coba lagi.');
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar (PNG/JPG/WEBP)');
        return;
      }
      // Increased from 2.5MB to 10MB because we compress it anyway!
      if (file.size > 10 * 1024 * 1024) {
        alert('Ukuran gambar terlalu besar. Silakan gunakan berkas gambar di bawah 10MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const rawBase64 = event.target.result as string;
          try {
            const img = new Image();
            img.onload = () => {
              try {
                // Setup canvas
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Constrain maximum dimensions to 800px for supreme load speeds and minimal storage consumption
                const MAX_DIM = 800;
                if (width > MAX_DIM || height > MAX_DIM) {
                  if (width > height) {
                    height = Math.round((height * MAX_DIM) / width);
                    width = MAX_DIM;
                  } else {
                    width = Math.round((width * MAX_DIM) / height);
                    height = MAX_DIM;
                  }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(img, 0, 0, width, height);
                  // Convert to highly optimized JPEG with 0.75 ratio compression
                  const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
                  callback(compressedBase64);
                } else {
                  callback(rawBase64);
                }
              } catch (canvasErr) {
                console.warn("Canvas compression failed, falling back to raw Base64:", canvasErr);
                callback(rawBase64);
              }
            };
            img.onerror = (imgErr) => {
              console.warn("Image loading failed, falling back to raw Base64:", imgErr);
              callback(rawBase64);
            };
            img.src = rawBase64;
          } catch (setupErr) {
            console.warn("Setup image failed, falling back to raw Base64:", setupErr);
            callback(rawBase64);
          }
        }
      };
      reader.onerror = (readerErr) => {
        console.error("FileReader failed:", readerErr);
        alert('Gagal membaca file gambar.');
      };
      reader.readAsDataURL(file);
      
      // Reset input value so the same file selection can be triggered again correctly
      e.target.value = '';
    }
  };

  const openAppEstimator = (category: string) => {
    const text = `Halo ${brandSettings.name}! Saya tertarik untuk memesan produk *${category}* secara custom. Mohon informasi lebih lanjut mengenai harga, bahan, dan cara pemesanannya. Terima kasih!`;
    const cleanPhone = (brandSettings.whatsappNumber || '6281234567890').replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-[#0ea5e9]/20 selection:text-[#0284c7]">
      
      {/* SECTION ID ANCHORS */}
      
      {/* 1. STYLED HEADER / NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100">
        <div id="nav-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          
          {/* Logo Brand exactly matching the visual */}
          <a href="#home" className="flex items-center space-x-2 group focus:outline-none">
            {/* Custom Sewing machine icon outline in SVG matching prompt */}
            {brandSettings.logoImage ? (
              <img src={brandSettings.logoImage} className="w-9 h-9 object-contain rounded-lg shadow-sm border border-slate-100" alt="Logo" referrerPolicy="no-referrer" />
            ) : (
              <div className="text-[#0EA5E9] transition-transform duration-300 group-hover:scale-110">
                <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="15" y="65" width="70" height="8" rx="4" fill="#0EA5E9" />
                  <path d="M25 65V35C25 29.4772 29.4772 25 35 25H60V35" stroke="#0EA5E9" strokeWidth="6" strokeLinecap="round" />
                  <path d="M60 25C65.5228 25 70 29.4772 70 35V65" stroke="#0EA5E9" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="70" cy="40" r="10" stroke="#0EA5E9" strokeWidth="6" />
                  <path d="M45 25V65" stroke="#0EA5E9" strokeWidth="4" strokeDasharray="4 4" />
                  <circle cx="45" cy="50" r="6" fill="#10B981" />
                </svg>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-[#0A5C8C] font-mono leading-none">
                {brandSettings.name === 'RAFI KONVEKSI' ? (
                  <>RAFI<span className="text-[#0ea5e9]">KONVEKSI</span></>
                ) : (
                  brandSettings.name
                )}
              </span>
              <span className="text-[9px] mt-0.5 uppercase tracking-widest text-[#10B981] font-semibold">{brandSettings.tagline}</span>
            </div>
          </a>

          {/* Nav links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold tracking-wide uppercase text-slate-600">
            <a href="#home" className="hover:text-[#0EA5E9] transition-colors duration-200">Home</a>
            <a href="#catalog" className="hover:text-[#0EA5E9] transition-colors duration-200">Catalog</a>
            <a href="#portfolio" className="hover:text-[#0EA5E9] transition-colors duration-200">Portfolio</a>
            <a href="#contact" className="hover:text-[#0EA5E9] transition-colors duration-200">Contact</a>
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => {
                if (isAdminLoggedIn) {
                  setIsAdminDashboardOpen(true);
                } else {
                  setIsAdminLoginModalOpen(true);
                }
              }}
              className={`p-2.5 rounded-full transition-all flex items-center justify-center border ${
                isAdminLoggedIn 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 border-slate-200'
              }`}
              title="Admin Dashboard (Kelola Foto & Logo)"
              id="btn-admin-desktop"
            >
              {isAdminLoggedIn ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </button>

            {inquiries.length > 0 && (
              <button 
                onClick={() => setShowInquiryPanel(true)} 
                className="relative bg-slate-100 hover:bg-[#0ea5e9]/10 text-slate-700 hover:text-[#0284c7] px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 border border-slate-200"
                id="btn-history"
              >
                <History className="w-3.5 h-3.5" />
                <span>Riwayat ({inquiries.length})</span>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
              </button>
            )}
            
            <button 
              onClick={() => openAppEstimator('Custom Apparel')}
              className="bg-[#22c55e] hover:bg-[#16a34a] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-100 hover:shadow-lg focus:outline-none flex items-center space-x-1.5"
              id="btn-get-quote"
            >
              <span>PESAN VIA WA</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => {
                if (isAdminLoggedIn) {
                  setIsAdminDashboardOpen(true);
                } else {
                  setIsAdminLoginModalOpen(true);
                }
              }}
              className={`p-2.5 rounded-full transition-all flex items-center justify-center border ${
                isAdminLoggedIn 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                  : 'bg-slate-55 bg-slate-50 text-slate-400 border-slate-200'
              }`}
              title="Admin Panel"
            >
              {isAdminLoggedIn ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </button>
            {inquiries.length > 0 && (
              <button
                onClick={() => setShowInquiryPanel(true)}
                className="bg-slate-100 p-2.5 rounded-full text-slate-700 hover:bg-[#0ea5e9]/10 relative border border-slate-200"
              >
                <History className="w-4 h-4" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
              </button>
            )}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#0ea5e9] focus:outline-none"
              id="btn-mobile-menu"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile menu panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-sky-50 px-4 py-6 space-y-4 animate-fade-in">
            <nav className="flex flex-col space-y-4 text-base font-bold text-slate-700">
              <a href="#home" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#0EA5E9] py-1">Home</a>
              <a href="#catalog" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#0EA5E9] py-1">Catalog</a>
              <a href="#portfolio" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#0EA5E9] py-1">Portfolio</a>
              <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#0EA5E9] py-1">Contact</a>
            </nav>
            <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAppEstimator('Custom Apparel');
                }}
                className="bg-[#22c55e] hover:bg-[#16a34a] text-center text-white py-3 rounded-xl font-bold uppercase text-sm tracking-widest shadow-md flex items-center justify-center space-x-2"
              >
                <span>PESAN VIA WA</span>
              </button>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (isAdminLoggedIn) {
                    setIsAdminDashboardOpen(true);
                  } else {
                    setIsAdminLoginModalOpen(true);
                  }
                }}
                className="bg-slate-100 text-center text-slate-700 py-3 rounded-xl font-bold text-xs uppercase tracking-widest border border-slate-200"
              >
                💼 {isAdminLoggedIn ? 'Dashboard Admin (Masuk)' : 'Login Admin (Konfigurasi)'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION exactly matching layout and background shapes */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-b from-[#f0f9ff] via-[#f7fbfd] to-white pt-10 pb-16 md:py-24">
        {/* Soft curving pattern behind content like the image */}
        <div className="absolute top-0 right-0 w-full md:w-3/4 h-full pointer-events-none opacity-20 md:opacity-30">
          <svg viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute -top-36 -right-24 w-full h-full">
            <path d="M0,400 C300,550 600,250 1000,350 L1000,0 L0,0 Z" fill="#0EA5E9" opacity="0.1" />
            <path d="M100,500 C400,600 700,300 1000,450 L1000,0 L100,0 Z" fill="#10B981" opacity="0.05" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Hero text (Left) */}
          <div className="md:col-span-6 space-y-6 lg:space-y-8 text-center md:text-left">
            
            <div className="inline-block">
              <span className="text-[10px] md:text-xs tracking-[0.25em] font-extrabold text-[#0EA5E9] uppercase bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100">
                ESTABLISHED 2024
              </span>
            </div>

            <div className="space-y-1 md:space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                Presisi dalam <br className="hidden md:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] drop-shadow-sm">
                  Setiap Jahitan
                </span>
              </h1>
            </div>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium max-w-xl mx-auto md:mx-0 leading-relaxed">
              Crafting premium apparel with architectural precision. We transform textile into high-performance identity for your brand.
            </p>

            {/* CTAs matching colors */}
            <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center gap-4 pt-2">
              <a 
                href={`https://wa.me/${(brandSettings.whatsappNumber || '6281234567890').replace(/\D/g, '')}?text=${encodeURIComponent(`Halo ${brandSettings.name}, saya tertarik ingin konsultasi pembuatan apparel custom.`)}`}
                target="_blank"
                rel="no-referrer"
                className="w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] text-white px-7 py-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md shadow-emerald-100 hover:shadow-xl flex items-center justify-center space-x-2.5 focus:outline-none"
              >
                {/* Custom speech bubble SVG */}
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.98 4.29L2.03 21.3c-.15.46.3.9.76.76l5.01-.95C9.11 21.69 10.51 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
                </svg>
                <span>WHATSAPP US</span>
              </a>

              <a 
                href="#catalog"
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 px-7 py-4 rounded-xl font-bold text-sm tracking-wide transition-all text-center focus:outline-none"
              >
                VIEW COLLECTIONS
              </a>
            </div>

            {/* Micro Stats Banner underneath Hero to establish legitimacy */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-100 max-w-md mx-auto md:mx-0">
              <div>
                <span className="block text-xl lg:text-2xl font-black text-slate-800">100%</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Garansi QC</span>
              </div>
              <div>
                <span className="block text-xl lg:text-2xl font-black text-slate-800">15k+</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pcs Selesai</span>
              </div>
              <div>
                <span className="block text-xl lg:text-2xl font-black text-slate-800">24 Jam</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Respon Cs</span>
              </div>
            </div>

          </div>

          {/* Hero Image (Right) exactly matching the clothing rack image */}
          <div className="md:col-span-6 relative flex justify-center items-center">
            {/* Ambient circular highlights behind the rack */}
            <div className="absolute -top-10 -left-10 w-72 h-72 bg-sky-200/40 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-emerald-200/25 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative w-full max-w-lg aspect-square bg-sky-50/50 rounded-[2.5rem] border border-sky-100/50 p-6 md:p-8 flex items-center justify-center overflow-hidden shadow-2xl shadow-sky-100">
              <img 
                src={brandSettings.heroImage} 
                alt="Rafi Konveksi Premium Hanger Rack" 
                referrerPolicy="no-referrer"
                className="object-cover w-full h-full rounded-2xl shadow-md transition-all duration-700 hover:scale-[1.03]"
                id="img-hero-rack"
              />
              <div className="absolute bottom-10 left-10 right-10 bg-white/80 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/50 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center">
                    <Shirt className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Koleksi Terlaris</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Bahan Premium & Custom Bebas</p>
                  </div>
                </div>
                <div className="bg-[#10B981] hover:bg-[#059669] text-white p-2 rounded-xl transition-all cursor-pointer" onClick={() => openAppEstimator('Jaket & Outer')}>
                  <ArrowRight className="w-4.5 h-4.5" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. ABOUT SECTION ("TENTANG KAMI") */}
      <section id="about" className="py-20 bg-[#fbfcfd] border-y border-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center md:text-left mb-6">
            <span className="text-[11px] sm:text-xs font-black tracking-[0.3em] text-[#0EA5E9] uppercase">
              TENTANG KAMI
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
            
            {/* Left Brand block with line-art sewing machine SVG exactly matched */}
            <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
              <div className="flex items-center space-x-4">
                <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-950 leading-none">
                  {brandSettings.aboutTitle === 'RAFI KONVEKSI' ? (
                    <>RAFI <br /><span className="text-[#0ea5e9]">KONVEKSI</span></>
                  ) : (
                    brandSettings.aboutTitle
                  )}
                </h2>
                
                {/* Sewing Machine vector illustration or uploaded logo image */}
                <div className="w-24 h-24 shrink-0 flex items-center justify-center">
                  {brandSettings.logoImage ? (
                    <img 
                      src={brandSettings.logoImage} 
                      className="max-w-full max-h-full object-contain rounded-2xl shadow-md border border-slate-100" 
                      alt="Logo Brand" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#0ea5e9]">
                      {/* Machine base */}
                      <path d="M10 75H90V80C90 82.2091 88.2091 84 86 84H14C11.7909 84 10 82.2091 10 80V75Z" fill="#E0F2FE" stroke="#0ea5e9" strokeWidth="4" />
                      {/* Upper arm and body */}
                      <path d="M22 75V35C22 28 28 22 35 22H72V35C72 40 68 45 62 45H52V75" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      {/* Balance Wheel */}
                      <circle cx="72" cy="35" r="8" fill="white" stroke="#0ea5e9" strokeWidth="4" />
                      {/* Needle bar */}
                      <path d="M38 45V68" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
                      {/* Thread spool pin */}
                      <path d="M55 22V14" stroke="#0ea5e9" strokeWidth="3" />
                      <rect x="50" y="8" width="10" height="6" rx="2" fill="#10B981" />
                      {/* Sprout Botanical Leaf growing */}
                      <path d="M55 14C55 14 62 10 65 14C65 14 66 20 60 20Z" fill="#10B981" opacity="0.8" />
                      <path d="M55 14C55 14 50 8 46 11C46 11 44 18 50 19Z" fill="#10B981" opacity="0.8" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Right text narrative */}
            <div className="md:col-span-7 space-y-6 text-slate-600 font-medium leading-relaxed text-sm sm:text-base">
              <p>
                {brandSettings.aboutText1}
              </p>
              <p>
                {brandSettings.aboutText2}
              </p>
              <div className="pt-4 flex flex-wrap gap-3">
                <span className="bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-[#0ea5e9] text-xs font-bold px-4 py-2 rounded-lg transition-all border border-slate-200">
                  ⚡ Berpengalaman
                </span>
                <span className="bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-[#0ea5e9] text-xs font-bold px-4 py-2 rounded-lg transition-all border border-slate-200">
                  🧵 Jahitan Garansi Rapi
                </span>
                <span className="bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-[#0ea5e9] text-xs font-bold px-4 py-2 rounded-lg transition-all border border-slate-200">
                  🏷️ Custom Desain & Label
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. CATALOG BENTO GRID exactly matching asymmetrical layout */}
      <section id="catalog" className="py-20 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950 font-sans">
              Katalog {brandSettings.name}
            </h2>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">Klik pada produk untuk menghitung perkiraan harga produksi grosir.</p>
          </div>

          {/* Asymmetric Elegant Gerber Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* COMPONENT 1: JAKET & OUTER (Left Side - Big Column Span 5) */}
            <div className="lg:col-span-5 bg-white hover:bg-slate-50 border border-slate-200/70 rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-xl group relative overflow-hidden shadow-sm">
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-black text-[#0ea5e9] tracking-widest block">
                  {catalogProducts[0]?.subtitle || 'PREMIUM SERIES'}
                </span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
                  {catalogProducts[0]?.title || 'Jaket & Outer'}
                </h3>
                <p className="text-sm text-slate-500 font-medium max-w-sm leading-relaxed">
                  {catalogProducts[0]?.description || 'Konstruksi kokoh dengan material tahan cuaca untuk perlindungan maksimal.'}
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => openAppEstimator(catalogProducts[0]?.title || 'Jaket & Outer')}
                    className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl inline-flex items-center space-x-2 transition-all shadow-md shadow-emerald-50 focus:outline-none"
                  >
                    <span>PESAN VIA WHATSAPP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Unique Auto-adaptive Showcase Frame for Vertical, Horizontal, or 1:1 Images */}
              <div className="mt-6 flex-1 w-full min-h-[300px] bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden">
                <img 
                  src={catalogProducts[0]?.image || "/src/assets/images/jacket_outer_flat_1780410123271.png"} 
                  alt={catalogProducts[0]?.title || "Jaket & Outer"} 
                  referrerPolicy="no-referrer"
                  className="object-contain max-h-full max-w-full drop-shadow-md transition-transform duration-500 group-hover:scale-105"
                  id="img-catalog-jacket"
                />
              </div>
            </div>

            {/* Right Side Complex Column (Spans 7 in total) */}
            <div className="lg:col-span-7 flex flex-col space-y-8 justify-between">
              
              {/* TOP HALF: Dual Cards (Polo & PDL side-by-side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                
                {/* COMPONENT 2: KAOS POLO */}
                <div className="bg-white hover:bg-slate-50 border border-slate-200/70 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg group shadow-sm">
                  <div className="space-y-2">
                    <h4 className="text-xl font-extrabold text-slate-950 uppercase">{catalogProducts[1]?.title || 'Kaos Polo'}</h4>
                    <p className="text-xs text-[#0ea5e9] font-bold uppercase tracking-widest">
                      {catalogProducts[1]?.subtitle || 'Combed Cotton 30s & 24s.'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {catalogProducts[1]?.description}
                    </p>
                    <div className="pt-2">
                      <button 
                        onClick={() => openAppEstimator(catalogProducts[1]?.title || 'Kaos Polo')}
                        className="text-[#10B981] hover:text-[#059669] text-xs font-black tracking-widest uppercase inline-flex items-center space-x-1 border-b border-[#10B981] pb-0.5 group-hover:border-b-2 focus:outline-none"
                      >
                        <span>PESAN SEKARANG</span>
                      </button>
                    </div>
                  </div>
                  <div className="mt-5 w-full h-48 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-3 relative overflow-hidden shrink-0">
                    <img 
                      src={catalogProducts[1]?.image || "/src/assets/images/polo_shirts_flat_1780410139619.png"} 
                      alt={catalogProducts[1]?.title || "Kaos Polo"} 
                      referrerPolicy="no-referrer"
                      className="object-contain max-h-full max-w-full drop-shadow-sm transition-transform duration-500 group-hover:scale-105"
                      id="img-catalog-polo"
                    />
                  </div>
                </div>

                {/* COMPONENT 3: KEMEJA PDL */}
                <div className="bg-white hover:bg-slate-50 border border-slate-200/70 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg group shadow-sm">
                  <div className="space-y-2">
                    <h4 className="text-xl font-extrabold text-slate-950 uppercase">{catalogProducts[2]?.title || 'Kemeja PDL'}</h4>
                    <p className="text-xs text-[#0ea5e9] font-bold uppercase tracking-widest">
                      {catalogProducts[2]?.subtitle || 'American Drill & Ripstop.'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {catalogProducts[2]?.description}
                    </p>
                    <div className="pt-2">
                      <button 
                        onClick={() => openAppEstimator(catalogProducts[2]?.title || 'Kemeja PDL')}
                        className="text-[#10B981] hover:text-[#059669] text-xs font-black tracking-widest uppercase inline-flex items-center space-x-1 border-b border-[#10B981] pb-0.5 group-hover:border-b-2 focus:outline-none"
                      >
                        <span>PESAN SEKARANG</span>
                      </button>
                    </div>
                  </div>
                  <div className="mt-5 w-full h-48 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-3 relative overflow-hidden shrink-0">
                    <img 
                      src={catalogProducts[2]?.image || "/src/assets/images/pdl_shirt_flat_1780410153691.png"} 
                      alt={catalogProducts[2]?.title || "Kemeja PDL"} 
                      referrerPolicy="no-referrer"
                      className="object-contain max-h-full max-w-full drop-shadow-sm transition-transform duration-500 group-hover:scale-105"
                      id="img-catalog-pdl"
                    />
                  </div>
                </div>

              </div>

              {/* BOTTOM HALF: Wide Card for Hoodie & Sweatshirt */}
              <div className="bg-white hover:bg-slate-50 border border-slate-200/70 rounded-3xl p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center transition-all duration-300 hover:shadow-xl group shadow-sm">
                <div className="space-y-4">
                  <h4 className="text-3xl font-black text-slate-950 tracking-tight leading-none uppercase">
                    {catalogProducts[3]?.title.split('&').map((text, idx) => (
                      <span key={idx} className="block">
                        {text.trim()} {idx === 0 && catalogProducts[3]?.title.includes('&') && '&'}
                      </span>
                    )) || (
                      <>HOODIE & <br />SWEATSHIRT</>
                    )}
                  </h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    {catalogProducts[3]?.description || 'Fleece & Baby Terry bertekstur lembut dengan jahitan ganda.'}
                  </p>
                  <div>
                    <button 
                      onClick={() => openAppEstimator(catalogProducts[3]?.title || 'Hoodie & Sweatshirt')}
                      className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-xl inline-flex items-center transition-all shadow-md focus:outline-none"
                    >
                      Hubungi Admin
                    </button>
                  </div>
                </div>
                <div className="w-full h-48 md:h-56 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden">
                  <img 
                    src={catalogProducts[3]?.image || "/src/assets/images/hoodie_beige_flat_1780410167519.png"} 
                    alt={catalogProducts[3]?.title || "Hoodie & Sweatshirt"} 
                    referrerPolicy="no-referrer"
                    className="object-contain max-h-full max-w-full drop-shadow-sm transition-all duration-500 group-hover:scale-[1.04]"
                    id="img-catalog-hoodie"
                  />
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 5. PORTFOLIO / REKAM JEJAK KAMI SECTION */}
      <section id="portfolio" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16 space-y-2">
            <span className="text-[11px] sm:text-xs font-black tracking-[0.3em] text-[#0ea5e9] uppercase">
              PORTOFOLIO
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-sans tracking-tight">
              Rekam Jejak Kami
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="bg-white hover:border-[#0ea5e9]/50 border border-slate-200 rounded-3xl p-8 space-y-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-14 h-14 bg-sky-50 text-[#0ea5e9] rounded-2xl flex items-center justify-center border border-sky-100">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-black text-slate-900 tracking-wide uppercase">
                  CORPORATE UNIFORM
                </h3>
                <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                  Produksi seragam untuk 50+ perusahaan nasional dengan standar ISO.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white hover:border-[#0ea5e9]/50 border border-slate-200 rounded-3xl p-8 space-y-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-14 h-14 bg-sky-50 text-[#0ea5e9] rounded-2xl flex items-center justify-center border border-sky-100">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-black text-slate-900 tracking-wide uppercase">
                  SCHOOL IDENTITY
                </h3>
                <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                  Penyedia atribut sekolah terpadu mulai dari tingkat dasar hingga tinggi.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white hover:border-[#0ea5e9]/50 border border-slate-200 rounded-3xl p-8 space-y-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-14 h-14 bg-sky-50 text-[#0ea5e9] rounded-2xl flex items-center justify-center border border-sky-100">
                <Users className="w-7 h-7" />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-black text-slate-900 tracking-wide uppercase">
                  COMMUNITY MERCHANDISE
                </h3>
                <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                  Kolaborasi kreatif dengan berbagai komunitas hobi dan sosial.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION (CTA) SECTION WITH MAPS & CONTACT */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-[#0284c7] rounded-[2.5rem] p-8 md:p-14 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-center gap-10">
            {/* Visual background ripple detailing */}
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-white/5 opacity-10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#0ea5e9] opacity-35 rounded-full blur-3xl pointer-events-none"></div>

            {/* Contact Information */}
            <div className="space-y-8 max-w-xl relative x-10 text-center md:text-left">
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                  Mari Mulai <br className="hidden sm:inline" />
                  Kolaborasi Anda.
                </h2>
                <p className="text-sky-100 text-sm sm:text-base font-medium leading-relaxed">
                  Tim ahli kami siap membantu mewujudkan desain pakaian impian Anda dengan kualitas tanpa kompromi.
                </p>
              </div>

              {/* Contact parameters with SVGs */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-3 text-sm justify-center md:justify-start">
                  <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-sky-50">Jl. Industri Kreatif No. 12, Bandung, Jawa Barat</span>
                </div>
                <div className="flex items-center space-x-3 text-sm justify-center md:justify-start">
                  <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
                  <a href="mailto:hello@rafikonveksi.com" className="font-semibold text-sky-100 hover:text-white transition-all underline decoration-sky-300">
                    hello@rafikonveksi.com
                  </a>
                </div>
              </div>
            </div>

            {/* CTA action button */}
            <div className="relative z-10 w-full md:w-auto shrink-0 flex justify-center">
              <a 
                href={`https://wa.me/${(brandSettings.whatsappNumber || '6281234567890').replace(/\D/g, '')}?text=${encodeURIComponent(`Halo ${brandSettings.name}! Saya tertarik untuk berkolaborasi dan memesan apparel custom.`)}`}
                target="_blank"
                rel="no-referrer"
                className="w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] text-white px-8 py-5 rounded-2xl font-black tracking-widest text-sm uppercase transition-all shadow-xl hover:shadow-[#10B981]/20 border border-emerald-400/40 inline-flex items-center justify-center space-x-2"
                id="btn-cta-whatsapp"
              >
                <span>WHATSAPP ADMIN</span>
                <span className="text-lg">↗</span>
              </a>
            </div>

          </div>

          {/* Database History Dashboard (if any inquiries draft exist) */}
          {inquiries.length > 0 && (
            <div className="mt-12 bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-2.5">
                  <History className="w-5 h-5 text-[#0ea5e9]" />
                  <h3 className="text-lg font-bold text-slate-800">Inquiry Database ({inquiries.length} Draft)</h3>
                </div>
                <button 
                  onClick={() => {
                    if (confirm("Apakah anda yakin ingin menghapus semua riwayat kalkulasi?")) {
                      saveInquiriesToStorage([]);
                    }
                  }} 
                  className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center space-x-1"
                >
                  <Trash className="w-3.5 h-3.5" />
                  <span>Hapus Semua</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-96 overflow-y-auto pr-1">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono text-[#0ea5e9] bg-sky-50 px-2 py-1 rounded font-bold uppercase">{inq.id}</span>
                        <h4 className="text-sm font-black text-slate-800 mt-1">{inq.productType}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{inq.material} | Qty: <strong className="text-slate-700">{inq.quantity}</strong></p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400">{inq.date}</span>
                        <div className="text-sm font-black text-emerald-600 mt-1">Rp {inq.totalPrice.toLocaleString('id-ID')}</div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium truncate max-w-[150px]">Atas nama: {inq.clientName}</span>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => deleteInquiry(inq.id, e)}
                          className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-all"
                          title="Hapus Draft"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                        <a 
                          href={getWhatsAppLink(inq)}
                          target="_blank"
                          rel="no-referrer"
                          className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg inline-flex items-center space-x-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Kirim WA</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-slate-100 border-t border-slate-200/80 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Logo brand */}
          <div className="text-center md:text-left space-y-1">
            <h4 className="font-extrabold text-[#0A5C8C] text-sm font-mono tracking-wider">RAFIKONVEKSI</h4>
            <p className="font-medium tracking-wide">© 2026 RAFIKONVEKSI. PRECISION IN EVERY STITCH.</p>
          </div>

          {/* Socials quicklinks matching image */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-semibold">
            <a href="https://instagram.com" target="_blank" rel="no-referrer" className="hover:text-[#0ea5e9]">Instagram</a>
            <a href={`https://wa.me/${(brandSettings.whatsappNumber || '6281234567890').replace(/\D/g, '')}`} target="_blank" rel="no-referrer" className="hover:text-[#0ea5e9]">WhatsApp</a>
            <a href="#about" className="hover:text-[#0ea5e9]">Privacy Policy</a>
            <a href="#home" className="hover:text-[#0ea5e9]">Terms of Service</a>
          </div>

        </div>
      </footer>

      {/* --- FLOATING SUCCESS TOAST & RECEIPT POPUP --- */}
      {showSuccessToast && submittedInquiry && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative animate-scale-up border border-sky-100">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-xl font-black text-slate-950">Estimasi Draft Disimpan!</h3>
              <p className="text-xs text-slate-500">Permintaan Anda berhasil tercatat efisien dalam local database kami.</p>
            </div>

            {/* Receipt Summary detailing exact cost */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-3 font-mono">
              <div className="flex justify-between text-xs text-slate-400 border-b border-slate-200 pb-2">
                <span>DRAFT ID</span>
                <span className="font-bold text-slate-700">{submittedInquiry.id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>APPAREL TYPE</span>
                <span className="font-bold text-slate-800">{submittedInquiry.productType}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>FABRIC MATERIAL</span>
                <span className="font-bold text-slate-800 text-right">{submittedInquiry.material}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>ORDER QUANTITY</span>
                <span className="font-bold text-slate-800">{submittedInquiry.quantity} pcs</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>CUSTOMIZATION</span>
                <span className="font-bold text-slate-800">{submittedInquiry.customization}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-slate-200 pt-2 text-[#0ea5e9]">
                <span>BULK DISCOUNT</span>
                <span className="font-bold">{discountPercent}% OFF</span>
              </div>
              <div className="flex justify-between text-sm border-t border-dashed border-slate-300 pt-3 font-sans font-black text-slate-900">
                <span>ESTIMASI TOTAL</span>
                <span className="text-emerald-700">Rp {submittedInquiry.totalPrice.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Instruction Call to Action */}
            <div className="space-y-2">
              <a 
                href={getWhatsAppLink(submittedInquiry)}
                target="_blank"
                rel="no-referrer"
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest text-center block transition-all shadow-md shadow-emerald-100"
              >
                Kirim via WhatsApp Admin
              </a>
              <button 
                onClick={() => {
                  setShowSuccessToast(false);
                  setSubmittedInquiry(null);
                }}
                className="w-full text-slate-500 hover:text-slate-700 py-2.5 text-xs font-bold text-center transition-all bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Tutup & Lihat Desain
              </button>
            </div>
          </div>
        </div>
      )}




      {/* --- SIDEBAR DATABASE INQUIRY DRAWER --- */}
      {showInquiryPanel && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl p-6 overflow-y-auto border-l border-slate-200 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-[#0ea5e9]" />
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">Inquiry History</h3>
              </div>
              <button 
                onClick={() => setShowInquiryPanel(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List items rendering */}
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {inquiries.length === 0 ? (
                <div className="text-center py-10 space-y-2 text-slate-400">
                  <FileText className="w-12 h-12 stroke-[1.5] mx-auto text-slate-300" />
                  <p className="text-xs">Belum ada kalkulasi tersimpan.</p>
                </div>
              ) : (
                inquiries.map((inq) => (
                  <div key={inq.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded">{inq.id}</span>
                        <h4 className="text-xs font-black text-slate-900 mt-1">{inq.productType}</h4>
                        <p className="text-[11px] text-slate-400">{inq.material}</p>
                      </div>
                      <button 
                        onClick={(e) => deleteInquiry(inq.id, e)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-md"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex justify-between border-t border-slate-200/60 pt-2 text-[11px] font-semibold text-slate-500">
                      <span>Qty: {inq.quantity} pcs</span>
                      <span className="text-slate-800 font-bold">Rp {inq.totalPrice.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="flex gap-2 pt-1.5">
                      <a 
                        href={getWhatsAppLink(inq)}
                        target="_blank"
                        rel="no-referrer"
                        className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-center text-white py-1.5 rounded-lg text-[10px] font-extrabold transition-all"
                      >
                        Kirim WA
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={() => {
                setShowInquiryPanel(false);
                openAppEstimator('Custom Apparel');
              }}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Hubungi Admin via WA (+)</span>
            </button>
          </div>
        </div>
      )}

      {/* --- ADMIN LOGIN MODAL --- */}
      {isAdminLoginModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] max-w-sm w-full p-6 space-y-6 shadow-2xl relative border border-slate-100 animate-scale-up">
            
            {/* Close button */}
            <button 
              onClick={() => {
                setIsAdminLoginModalOpen(false);
                setAdminError('');
                setAdminPasswordInput('');
              }}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon & Title */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-sky-50 text-[#0ea5e9] rounded-2xl flex items-center justify-center mx-auto border border-sky-100">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-950">Login Dashboard Admin</h3>
              <p className="text-xs text-slate-500">Gunakan kata sandi administratif untuk mengatur logo, foto, dan tulisan.</p>
            </div>

            {/* Input Form */}
            <div className="space-y-4">
              <div className="space-y-1.5 flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Kata Sandi Administrator</label>
                <input
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="Masukkan password admin"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0ea5e9] transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAdminLogin();
                    }
                  }}
                />
                {adminError && (
                  <p className="text-xs text-rose-500 font-semibold">{adminError}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminLoginModalOpen(false);
                    setAdminError('');
                    setAdminPasswordInput('');
                  }}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleAdminLogin}
                  className="w-1/2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md shadow-sky-100"
                >
                  Masuk
                </button>
              </div>
            </div>
            <div className="text-center pt-2">
              <span className="text-[10px] text-slate-400 font-mono">Password Bawaan: <span className="font-bold underline">admin123</span></span>
            </div>
          </div>
        </div>
      )}

      {/* --- ADMIN DASHBOARD MODAL --- */}
      {isAdminDashboardOpen && isAdminLoggedIn && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border border-slate-100 max-h-[95vh] overflow-y-auto animate-scale-up">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-emerald-650 text-emerald-600">
                  <Settings className="w-5 h-5 animate-spin-slow" />
                  <span className="text-xs uppercase font-extrabold tracking-widest">Dashboard Panel Kendali</span>
                </div>
                <h3 className="text-2xl font-black text-slate-950 font-sans">
                  Pengaturan {brandSettings.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Ubah logo brand, foto display katalog, tulisan deskripsi, dan lihat riwayat pelanggan.</p>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto self-stretch sm:self-center">
                <button
                  type="button"
                  onClick={() => setIsAdminDashboardOpen(false)}
                  className="w-1/2 sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-705 text-slate-700 text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition-all"
                >
                  Kembali ke Web
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminLoggedIn(false);
                    setIsAdminDashboardOpen(false);
                  }}
                  className="w-1/2 sm:w-auto bg-rose-500 hover:bg-rose-650 text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md shadow-rose-100 flex items-center justify-center space-x-1"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Dashboard Tabs navigation */}
            <div className="flex border-b border-slate-100 overflow-x-auto gap-4 scrollbar-none pb-1">
              <button
                onClick={() => setActiveAdminTab('general')}
                className={`py-2 text-xs font-black tracking-wider uppercase border-b-2 transition-all shrink-0 ${
                  activeAdminTab === 'general'
                    ? 'border-[#0ea5e9] text-[#0284c7]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                ⚙️ Umum & Logo
              </button>
              <button
                onClick={() => setActiveAdminTab('catalog')}
                className={`py-2 text-xs font-black tracking-wider uppercase border-b-2 transition-all shrink-0 ${
                  activeAdminTab === 'catalog'
                    ? 'border-[#0ea5e9] text-[#0284c7]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                👕 Manajemen Katalog
              </button>
              <button
                onClick={() => setActiveAdminTab('inquiries')}
                className={`py-2 text-xs font-black tracking-wider uppercase border-b-2 transition-all shrink-0 ${
                  activeAdminTab === 'inquiries'
                    ? 'border-[#0ea5e9] text-[#0284c7]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                📊 Riwayat Pelanggan ({inquiries.length})
              </button>
              <button
                onClick={() => setActiveAdminTab('password')}
                className={`py-2 text-xs font-black tracking-wider uppercase border-b-2 transition-all shrink-0 ${
                  activeAdminTab === 'password'
                    ? 'border-[#0ea5e9] text-[#0284c7]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                🔑 Ganti Password
              </button>
            </div>

            {/* TAB CONTENT: GENERAL */}
            {activeAdminTab === 'general' && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left settings */}
                  <div className="space-y-4">
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nama Brand Konveksi</label>
                      <input
                        type="text"
                        value={brandSettings.name}
                        onChange={(e) => saveBrandSettings({ ...brandSettings, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#0ea5e9] transition-all text-slate-850"
                        placeholder="Contoh: RAFI KONVEKSI"
                      />
                    </div>

                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tagline Slogan</label>
                      <input
                        type="text"
                        value={brandSettings.tagline}
                        onChange={(e) => saveBrandSettings({ ...brandSettings, tagline: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#0ea5e9] transition-all text-slate-850"
                        placeholder="Contoh: Precision Sewing"
                      />
                    </div>

                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#10B981] flex items-center gap-1">🟢 No. WhatsApp Hubungi WA</label>
                      <input
                        type="text"
                        value={brandSettings.whatsappNumber}
                        onChange={(e) => saveBrandSettings({ ...brandSettings, whatsappNumber: e.target.value })}
                        className="w-full bg-slate-50 border border-[#10B981] rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-[#0ea5e9] transition-all text-slate-850"
                        placeholder="Contoh: 6281234567890"
                      />
                      <span className="text-[10px] text-slate-500 font-medium">Nomor WhatsApp tujuan untuk semua tombol hubungi. Masukkan angka saja dengan kode negara (contoh: 6281234567890) tanpa tanda + atau spasi.</span>
                    </div>

                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Judul Tentang Kami</label>
                      <input
                        type="text"
                        value={brandSettings.aboutTitle}
                        onChange={(e) => saveBrandSettings({ ...brandSettings, aboutTitle: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#0ea5e9] transition-all text-slate-850"
                        placeholder="Contoh: RAFI KONVEKSI"
                      />
                    </div>

                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Deskripsi Tentang Kami - Paragraf 1</label>
                      <textarea
                        value={brandSettings.aboutText1}
                        onChange={(e) => saveBrandSettings({ ...brandSettings, aboutText1: e.target.value })}
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#0ea5e9] transition-all text-slate-850"
                        placeholder="Paragraf deskripsi utama..."
                      />
                    </div>

                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Deskripsi Tentang Kami - Paragraf 2</label>
                      <textarea
                        value={brandSettings.aboutText2}
                        onChange={(e) => saveBrandSettings({ ...brandSettings, aboutText2: e.target.value })}
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#0ea5e9] transition-all text-slate-850"
                        placeholder="Paragraf deskripsi pendukung..."
                      />
                    </div>
                  </div>

                  {/* Right settings (Logo and Hero uploaders) */}
                  <div className="space-y-6">
                    {/* Brand Logo Display */}
                    <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50 space-y-3">
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Logo Usaha (Format PNG / JPG / WEBP)</span>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                          {brandSettings.logoImage ? (
                            <img src={brandSettings.logoImage} className="w-full h-full object-contain" alt="Logo preview" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="p-2 border border-slate-100 flex items-center justify-center rounded bg-slate-50 text-[#0ea5e9]">
                              <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="15" y="65" width="70" height="8" rx="4" fill="#0EA5E9" />
                                <path d="M25 65V35C25 29.4772 29.4772 25 35 25H60V35" stroke="#0EA5E9" strokeWidth="6" strokeLinecap="round" />
                                <circle cx="70" cy="40" r="10" stroke="#0EA5E9" strokeWidth="6" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col space-y-1.5 flex-1 select-none">
                          <label htmlFor="logo-image-upload-input" className="text-[10px] font-black uppercase text-[#0ea5e9] tracking-wider cursor-pointer bg-white px-3 py-2 border border-slate-200 rounded-lg text-center hover:bg-slate-50 block">💡 PILIH FILE LOGO</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, (base64) => saveBrandSettings({ ...brandSettings, logoImage: base64 }))}
                            className="hidden"
                            id="logo-image-upload-input"
                          />
                          <span className="text-[9px] text-slate-400">File maksimal berukuran 2.5MB</span>
                          {brandSettings.logoImage && (
                            <button
                              type="button"
                              onClick={() => saveBrandSettings({ ...brandSettings, logoImage: '' })}
                              className="text-left text-[10px] text-rose-500 font-bold hover:underline"
                            >
                              Reset ke Default SVG
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Hero Display Image */}
                    <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50 space-y-3">
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Foto Utama Banner Hero (Hanger Rack)</span>
                      <div className="flex flex-col space-y-3">
                        <div className="w-full h-32 bg-white border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                          <img src={brandSettings.heroImage} className="w-full h-full object-cover" alt="Hero preview" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex flex-col space-y-1.5 select-none">
                          <label htmlFor="hero-image-upload-input" className="text-[10px] font-black uppercase text-[#0ea5e9] tracking-wider cursor-pointer bg-white px-3 py-2 border border-slate-200 rounded-lg text-center hover:bg-slate-50 block">🖼️ UNGGAH BANNER BARU</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, (base64) => saveBrandSettings({ ...brandSettings, heroImage: base64 }))}
                            className="hidden"
                            id="hero-image-upload-input"
                          />
                          {brandSettings.heroImage !== DEFAULT_BRAND_SETTINGS.heroImage && (
                            <button
                              type="button"
                              onClick={() => saveBrandSettings({ ...brandSettings, heroImage: DEFAULT_BRAND_SETTINGS.heroImage })}
                              className="text-left text-[10px] text-rose-500 font-bold hover:underline mt-1"
                            >
                              Reset ke Foto Bawaan
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CATALOG */}
            {activeAdminTab === 'catalog' && (
              <div className="space-y-6 animate-fade-in text-left">
                <p className="text-xs text-slate-400 font-medium">Ubah nama produk, harga minimum, dan display foto pada grid katalog Anda.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {catalogProducts.map((p, idx) => (
                    <div key={p.id} className="border border-slate-200/80 rounded-2xl p-5 bg-stone-50/50 space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-[11px] font-black tracking-widest text-[#0ea5e9]">PRODUK SLOT #{idx + 1}</span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">{p.id.toUpperCase()}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1 flex flex-col">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nama Pakaian</label>
                          <input
                            type="text"
                            value={p.title}
                            onChange={(e) => {
                              const newCatalog = [...catalogProducts];
                              newCatalog[idx].title = e.target.value;
                              saveCatalogProducts(newCatalog);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1 flex flex-col">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Harga Dasar (Rp)</label>
                          <input
                            type="number"
                            value={p.basePrice}
                            onChange={(e) => {
                              const newCatalog = [...catalogProducts];
                              newCatalog[idx].basePrice = Number(e.target.value);
                              saveCatalogProducts(newCatalog);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 flex flex-col">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sub-judul / Spesifikasi</label>
                        <input
                          type="text"
                          value={p.subtitle}
                          onChange={(e) => {
                            const newCatalog = [...catalogProducts];
                            newCatalog[idx].subtitle = e.target.value;
                            saveCatalogProducts(newCatalog);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1 flex flex-col">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Deskripsi Singkat</label>
                        <textarea
                          value={p.description}
                          onChange={(e) => {
                            const newCatalog = [...catalogProducts];
                            newCatalog[idx].description = e.target.value;
                            saveCatalogProducts(newCatalog);
                          }}
                          rows={2}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-200">
                        <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
                          <img src={p.image} className="w-full h-full object-contain" alt="Current catalog" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex flex-col space-y-1 flex-1 select-none">
                          <label htmlFor={`catalog-image-upload-${p.id}`} className="text-[9px] font-bold uppercase text-[#0ea5e9] tracking-wider cursor-pointer bg-slate-50 border border-slate-250 py-1 px-2 rounded hover:bg-slate-100 text-center block">Upload Foto Baru</label>
                          <input
                            type="file"
                            id={`catalog-image-upload-${p.id}`}
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, (base64) => {
                              const newCatalog = [...catalogProducts];
                              newCatalog[idx].image = base64;
                              saveCatalogProducts(newCatalog);
                            })}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: INQUIRIES */}
            {activeAdminTab === 'inquiries' && (
              <div className="space-y-4 animate-fade-in text-left">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-400 font-medium">Berikut adalah daftar penawaran harga yang disimpan secara lokal oleh pelanggan.</p>
                  {inquiries.length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm('Apakah Anda yakin ingin menghapus seluruh riwayat pelanggan?')) {
                          saveInquiriesToStorage([]);
                        }
                      }}
                      className="text-xs text-rose-500 font-bold hover:underline"
                    >
                      Hapus Semua Disk
                    </button>
                  )}
                </div>

                {inquiries.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-400 text-xs">
                    Belum ada riwayat penetapan estimasi harga oleh pengguna.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="min-w-full divide-y divide-slate-100 text-xs text-left text-slate-600">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Kode / Tanggal</th>
                          <th className="px-4 py-3">Pelanggan</th>
                          <th className="px-4 py-3">Spesifikasi Pakaian</th>
                          <th className="px-4 py-3">Jumlah / Estimasi</th>
                          <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100 font-medium">
                        {inquiries.map((inq) => (
                          <tr key={inq.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 space-y-0.5 whitespace-nowrap">
                              <span className="font-bold text-slate-700 bg-sky-50 px-2 py-0.5 rounded text-[10px] border border-sky-150 inline-block">{inq.id}</span>
                              <span className="block text-[10px] text-slate-400">{inq.date}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap border-l border-slate-50">
                              <span className="block font-bold text-slate-800">{inq.clientName}</span>
                              <span className="block text-[10px] font-mono text-slate-400">{inq.clientPhone}</span>
                            </td>
                            <td className="px-4 py-3 max-w-xs border-l border-slate-50">
                              <span className="block font-bold text-slate-800">{inq.productType}</span>
                              <span className="block text-[10px] text-slate-400">{inq.material} • {inq.customization}</span>
                              <span className="block text-[10px] italic text-slate-500 truncate" title={inq.clientNotes}>"{inq.clientNotes}"</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap border-l border-slate-50">
                              <span className="block font-bold text-slate-800">{inq.quantity} pcs</span>
                              <span className="block text-emerald-600 font-bold text-[11px]">Rp {inq.totalPrice.toLocaleString('id-ID')}</span>
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap border-l border-slate-50">
                              <div className="inline-flex gap-2">
                                <a
                                  href={getWhatsAppLink(inq)}
                                  target="_blank"
                                  rel="no-referrer"
                                  className="bg-[#22c55e] hover:bg-[#16a34a] text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold"
                                >
                                  Hubungi WA
                                </a>
                                <button
                                  onClick={(e) => deleteInquiry(inq.id, e as any)}
                                  className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 p-1.5 rounded-lg border border-slate-200"
                                  title="Hapus"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: PASSWORD */}
            {activeAdminTab === 'password' && (
              <div className="max-w-md space-y-6 animate-fade-in text-left">
                <div className="space-y-4">
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Kata Sandi Saat Ini</label>
                    <input
                      type="password"
                      id="current-password-input"
                      placeholder="Masukkan kata sandi lama"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Kata Sandi Baru</label>
                    <input
                      type="password"
                      id="new-password-input"
                      placeholder="Masukkan kata sandi baru"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">Ulangi Kata Sandi Baru</label>
                    <input
                      type="password"
                      id="repeat-password-input"
                      placeholder="Ulangi kata sandi baru"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const oldInp = document.getElementById('current-password-input') as HTMLInputElement;
                      const newInp = document.getElementById('new-password-input') as HTMLInputElement;
                      const repInp = document.getElementById('repeat-password-input') as HTMLInputElement;

                      if (!oldInp || !newInp || !repInp) return;

                      const expected = brandSettings.adminPasswordHash || 'admin123';
                      if (oldInp.value !== expected) {
                        alert('Kata sandi saat ini tidak valid.');
                        return;
                      }

                      if (newInp.value.length < 4) {
                        alert('Kata sandi baru harus berukuran minimal 4 karakter.');
                        return;
                      }

                      if (newInp.value !== repInp.value) {
                        alert('Ulangi kata sandi baru tidak cocok.');
                        return;
                      }

                      saveBrandSettings({ ...brandSettings, adminPasswordHash: newInp.value });
                      alert('Kata sandi baru berhasil diperbarui!');
                      oldInp.value = '';
                      newInp.value = '';
                      repInp.value = '';
                    }}
                    className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Simpan Kata Sandi
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
