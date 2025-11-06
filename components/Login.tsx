
import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseClient';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, OAuthProvider } from "firebase/auth";


const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Manejar el resultado del redirect cuando el usuario regresa de Google/Apple
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        setLoading(true);
        const result = await getRedirectResult(auth);
        if (result) {
          // El usuario se autenticó exitosamente
          console.log('Usuario autenticado después del redirect:', result.user);
        }
      } catch (error: any) {
        console.error('Error al procesar redirect:', error);
        if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
          setError(getErrorMessage(error.code) || 'Error al iniciar sesión. Intenta de nuevo.');
        }
      } finally {
        setLoading(false);
      }
    };

    handleRedirectResult();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // El usuario será redirigido automáticamente cuando se establezca el estado de autenticación
    } catch (error: any) {
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Este correo electrónico ya está registrado.';
      case 'auth/invalid-email':
        return 'El correo electrónico no es válido.';
      case 'auth/operation-not-allowed':
        return 'La operación no está permitida.';
      case 'auth/weak-password':
        return 'La contraseña es muy débil.';
      case 'auth/user-disabled':
        return 'Esta cuenta ha sido deshabilitada.';
      case 'auth/user-not-found':
        return 'No existe una cuenta con este correo electrónico.';
      case 'auth/wrong-password':
        return 'La contraseña es incorrecta.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Intenta más tarde.';
      default:
        return 'Ocurrió un error. Por favor, intenta de nuevo.';
    }
  };

  const handleSocialLogin = async (providerName: 'google' | 'apple') => {
    setLoading(true);
    setError(null);
    const provider = providerName === 'google' ? new GoogleAuthProvider() : new OAuthProvider('apple.com');

    // Detectar si estamos en un dispositivo móvil o en Safari
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    try {
        // Usar redirect en dispositivos móviles o Safari para evitar problemas con popups
        if (isMobile || isSafari) {
          await signInWithRedirect(auth, provider);
          // El usuario será redirigido y luego regresará a la app
        } else {
          await signInWithPopup(auth, provider);
          // El usuario será autenticado en un popup
        }
    } catch (error: any) {
        // Si el usuario cancela el popup, no mostrar error
        if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
          // No mostrar error si el usuario cerró el popup intencionalmente
        } else {
          setError(getErrorMessage(error.code) || 'Error al iniciar sesión. Intenta de nuevo.');
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary">FinanZen</h1>
          <p className="text-text-secondary mt-2">Tu asistente financiero inteligente.</p>
        </div>

        <div className="bg-base-100 p-8 rounded-xl shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-primary text-center">
              {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </h2>
            <p className="text-sm text-text-secondary text-center mt-2">
              {isSignUp ? 'Regístrate para comenzar a gestionar tus finanzas' : 'Ingresa a tu cuenta para continuar'}
            </p>
          </div>

          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
                Correo Electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border-transparent bg-base-300 rounded-md shadow-sm placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border-transparent bg-base-300 rounded-md shadow-sm placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary sm:text-sm"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary">
                  Confirmar Contraseña
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border-transparent bg-base-300 rounded-md shadow-sm placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary sm:text-sm"
                  />
                </div>
              </div>
            )}
            
            {error && <p className="text-sm text-red-500">{error}</p>}

            {!isSignUp && (
              <div className="flex items-center justify-end">
                <div className="text-sm">
                  <a href="#" className="font-medium text-brand-primary hover:text-indigo-400">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-base-100 disabled:opacity-50"
              >
                {loading 
                  ? (isSignUp ? 'Creando cuenta...' : 'Iniciando...') 
                  : (isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión')
                }
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-base-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-base-100 text-text-secondary">O continúa con</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <button
                  onClick={() => handleSocialLogin('google')}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 border border-base-300 rounded-md shadow-sm bg-base-200 text-sm font-medium text-text-primary hover:bg-base-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Iniciar sesión con Google"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="hidden sm:inline">Google</span>
                </button>
              </div>
              <div>
                <button
                  onClick={() => handleSocialLogin('apple')}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 border border-base-300 rounded-md shadow-sm bg-base-200 text-sm font-medium text-text-primary hover:bg-base-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Iniciar sesión con Apple"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span className="hidden sm:inline">Apple</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-text-secondary">
          {isSignUp ? (
            <>
              ¿Ya tienes una cuenta?{' '}
              <button 
                onClick={() => {
                  setIsSignUp(false);
                  setError(null);
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                }} 
                className="font-medium text-brand-primary hover:text-indigo-400"
              >
                Inicia sesión
              </button>
            </>
          ) : (
            <>
              ¿No tienes una cuenta?{' '}
              <button 
                onClick={() => {
                  setIsSignUp(true);
                  setError(null);
                }} 
                className="font-medium text-brand-primary hover:text-indigo-400"
              >
                Crea una ahora
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;
