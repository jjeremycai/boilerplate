import { useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import { useAuth } from '@workos-inc/authkit-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (!isLoading && user) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-gray-600">Authenticating...</div>
    </div>
  );
}