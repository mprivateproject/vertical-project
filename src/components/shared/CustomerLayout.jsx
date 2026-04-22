import { Outlet, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import LuxuryBottomNav from '@/components/ui/luxury-bottom-nav';

export default function CustomerLayout() {
  const navigate = useNavigate();

  const handleCenterClick = () => {
    navigate('/book');
  };

  return (
    <div className="min-h-screen w-full relative">
      <PageHeader />
      <main className="relative z-10">
        <Outlet />
      </main>
      <LuxuryBottomNav onCenterClick={handleCenterClick} />
    </div>
  );
}