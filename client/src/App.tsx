
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import type { DashboardData, Product } from '../../server/src/schema';

// Icons (using simple SVG components for mobile optimization)
const BellIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a6 6 0 00-12 0v3l-5 5h5m10 0v1a3 3 0 01-6 0v-1m6 0H9" />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12.95 12.95" />
  </svg>
);

const SwapIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const ShoppingBagIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
  </svg>
);

const CreditCardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const SendIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0V11a1 1 0 011-1h2a1 1 0 011 1v10m3 0a1 1 0 001-1V10M9 21h6" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

function App() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showSavingsAmount, setShowSavingsAmount] = useState(true);
  const [showLoansAmount, setShowLoansAmount] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);

  // Load dashboard data
  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await trpc.getMemberDashboard.query({ memberId: 1 });
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load products
  const loadProducts = useCallback(async () => {
    try {
      const productsData = await trpc.getProducts.query({ 
        limit: 4, 
        status: 'promo' 
      });
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    loadProducts();
  }, [loadDashboard, loadProducts]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getSavingsTypeLabel = (type: string) => {
    switch (type) {
      case 'simpanan_pokok':
        return 'Simpanan Pokok';
      case 'simpanan_wajib':
        return 'Simpanan Wajib';
      case 'simpanan_sukarela':
        return 'Simpanan Sukarela';
      default:
        return type;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'promo':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'baru':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'promo':
        return 'Promo';
      case 'baru':
        return 'Baru';
      default:
        return 'Regular';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Gagal memuat data dashboard</p>
          <Button onClick={loadDashboard} className="mt-4">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Halo, {dashboardData.member.name} 👋
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              No. Anggota: {dashboardData.member.member_number}
            </p>
          </div>
          <div className="relative">
            <BellIcon className="w-6 h-6 text-gray-600" />
            {dashboardData.unreadNotifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {dashboardData.unreadNotifications}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Simpanan Card */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Simpanan</h2>
                <div className="text-2xl font-bold text-blue-600 mt-2">
                  {showSavingsAmount ? formatCurrency(dashboardData.totalSavings) : '••••••••'}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSavingsAmount(!showSavingsAmount)}
                className="p-2"
              >
                {showSavingsAmount ? (
                  <EyeIcon className="w-5 h-5 text-gray-600" />
                ) : (
                  <EyeOffIcon className="w-5 h-5 text-gray-600" />
                )}
              </Button>
            </div>
            <div className="space-y-2">
              {dashboardData.savingsBreakdown.map((savings) => (
                <div key={savings.type} className="flex justify-between text-sm">
                  <span className="text-gray-600">{getSavingsTypeLabel(savings.type)}</span>
                  <span className="font-medium">
                    {showSavingsAmount ? formatCurrency(savings.amount) : '••••••'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pinjaman Card */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Pinjaman</h2>
                <div className="text-2xl font-bold text-orange-600 mt-2">
                  {showLoansAmount ? formatCurrency(dashboardData.totalLoans) : '••••••••'}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLoansAmount(!showLoansAmount)}
                className="p-2"
              >
                {showLoansAmount ? (
                  <EyeIcon className="w-5 h-5 text-gray-600" />
                ) : (
                  <EyeOffIcon className="w-5 h-5 text-gray-600" />
                )}
              </Button>
            </div>
            <div className="space-y-2">
              {dashboardData.loans.map((loan) => (
                <div key={loan.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{loan.name}</span>
                  <span className="font-medium">
                    {showLoansAmount ? formatCurrency(loan.remaining_amount) : '••••••'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Menu Buttons */}
        <div className="grid grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-20 flex-col space-y-2 bg-green-50 border-green-200 hover:bg-green-100"
            onClick={() => setActiveTab('mutasi')}
          >
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <SwapIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium text-green-700">Mutasi</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col space-y-2 bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
            onClick={() => setActiveTab('produk')}
          >
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <ShoppingBagIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium text-yellow-700">Produk</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col space-y-2 bg-red-50 border-red-200 hover:bg-red-100"
          >
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <CreditCardIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium text-red-700">Bayar</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col space-y-2 bg-blue-50 border-blue-200 hover:bg-blue-100"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <SendIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium text-blue-700">Transfer</span>
          </Button>
        </div>

        {/* Mutasi Terakhir Section */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mutasi Terakhir</h3>
            <div className="space-y-4">
              {dashboardData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {transaction.title}
                    </h4>
                    {transaction.subtitle && (
                      <p className="text-xs text-gray-600 mt-1">
                        {transaction.subtitle}
                      </p>
                    )}
                  </div>
                  <div className={`font-semibold text-sm ${
                    transaction.type === 'expense' 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {transaction.type === 'expense' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Promo Produk Section */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Promo Produk</h3>
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {product.name}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusBadgeColor(product.status)}`}
                      >
                        {getStatusLabel(product.status)}
                      </Badge>
                    </div>
                    <p className="font-semibold text-blue-600 text-sm mt-1">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-4 py-2">
          <Button
            variant="ghost"
            className={`flex-col space-y-1 h-16 ${
              activeTab === 'home' ? 'text-blue-600' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('home')}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Button>

          <Button
            variant="ghost"
            className={`flex-col space-y-1 h-16 ${
              activeTab === 'mutasi' ? 'text-blue-600' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('mutasi')}
          >
            <SwapIcon className="w-5 h-5" />
            <span className="text-xs">Mutasi</span>
          </Button>

          <Button
            variant="ghost"
            className={`flex-col space-y-1 h-16 ${
              activeTab === 'produk' ? 'text-blue-600' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('produk')}
          >
            <ShoppingBagIcon className="w-5 h-5" />
            <span className="text-xs">Produk</span>
          </Button>

          <Button
            variant="ghost"
            className={`flex-col space-y-1 h-16 ${
              activeTab === 'profil' ? 'text-blue-600' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('profil')}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-xs">Profil</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
