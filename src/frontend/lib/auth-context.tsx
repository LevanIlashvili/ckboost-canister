import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth as useNfidAuth } from '@nfid/identitykit/react';
import { Principal } from '@dfinity/principal';
import { useNavigate } from 'react-router-dom';

// Define the NFID user type based on the actual structure
interface NfidUser {
  principal: Principal;
  subAccount?: any;
}

// Define our application's user type
interface User {
  principal: string;
  subAccount?: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Use the NFID auth hook
  const nfidAuth = useNfidAuth();

  useEffect(() => {
    // Check if we're still connecting
    const isLoading = nfidAuth.isConnecting;
    
    if (!isLoading) {
      if (nfidAuth.user) {
        const user: User = {
          principal: nfidAuth.user.principal.toString(),
          subAccount: nfidAuth.user.subAccount,
        };

        console.log(user);

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    }
  }, [nfidAuth.user, nfidAuth.isConnecting]);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        // Redirect to homepage if not authenticated
        navigate('/');
      }
    }, [isAuthenticated, isLoading, navigate]);

    if (isLoading) {
      // Loading component
      return (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }

    // Only render component if authenticated
    return isAuthenticated ? <Component {...props} /> : null;
  };
} 