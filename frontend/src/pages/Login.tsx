import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Lock, Loader2, Mail, Sparkles } from 'lucide-react';
import type { LoginData } from '@/types';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>();

  const onSubmit = async (data: LoginData) => {
    setIsSubmitting(true);
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (error) {
      // Error toast is handled by AuthContext.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-[#c7c4d8] bg-white/75 shadow-[0_4px_20px_rgba(15,23,42,0.05)] backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden bg-[#170426] p-10 text-[#eaf1ff] lg:block">
          <Link to="/" className="inline-flex items-center gap-2 text-lg font-bold text-white">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#3525cd]">
              <Sparkles className="h-4 w-4" />
            </span>
            SuperOps
          </Link>
          <div className="mt-20">
            <p className="mb-4 inline-flex rounded-full border border-[#00D1FF]/30 bg-[#00D1FF]/10 px-3 py-1 text-xs font-semibold uppercase text-[#89ceff]">
              Cognitive Operations
            </p>
            <h1 className="text-[40px] font-bold leading-[48px]">AI-assisted support command center</h1>
            <p className="mt-5 max-w-md text-lg leading-7 text-[#eaf1ff]/70">
              Sign in to triage tickets, validate AI suggestions, and keep service operations moving with precision.
            </p>
          </div>
          <div className="mt-16 rounded-2xl border border-[#00D1FF]/25 bg-white/5 p-5 shadow-[0_0_40px_rgba(0,209,255,0.15)]">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span>AI routing health</span>
              <span className="rounded-full bg-[#00D1FF]/15 px-2 py-1 text-xs text-[#00D1FF]">Live</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div className="h-2 w-[86%] rounded-full bg-[#00D1FF]" />
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-10">
          <div className="mb-8 text-center lg:text-left">
            <Link to="/" className="mb-8 inline-flex items-center gap-2 text-lg font-bold text-[#3525cd] lg:hidden">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#3525cd] text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              SuperOps
            </Link>
            <h2 className="section-title">Sign in to your account</h2>
            <p className="mt-2 text-sm muted-text">Use your SuperOps workspace credentials.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#0b1c30]">
                Email address
              </label>
              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#777587]" />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Please enter a valid email address',
                    },
                  })}
                  type="email"
                  autoComplete="email"
                  className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="agent@superops.com"
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#0b1c30]">
                Password
              </label>
              <div className="relative mt-2">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#777587]" />
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="password123"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 grid w-10 place-items-center text-[#777587] transition hover:text-[#3525cd]"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm muted-text">
            Do not have an account?{' '}
            <Link to="/signup" className="font-semibold text-[#3525cd] hover:text-[#170426]">
              Sign up
            </Link>
          </div>

          <div className="ai-panel mt-8">
            <h3 className="mb-2 text-sm font-semibold text-[#004666]">Demo Accounts</h3>
            <div className="space-y-1 text-sm text-[#464555]">
              <p><strong>Agent:</strong> agent@superops.com / password123</p>
              <p><strong>Admin:</strong> admin@superops.com / password123</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
