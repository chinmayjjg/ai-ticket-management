import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Lock, Loader2, Mail, Shield, Sparkles, User } from 'lucide-react';
import type { SignupData } from '@/types';

const Signup: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupData>();

  const onSubmit = async (data: SignupData) => {
    setIsSubmitting(true);
    try {
      await signup(data);
      navigate('/dashboard', { replace: true });
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
              Secure workspace setup
            </p>
            <h1 className="text-[40px] font-bold leading-[48px]">Create a high-signal support workspace</h1>
            <p className="mt-5 max-w-md text-lg leading-7 text-[#eaf1ff]/70">
              Add agents or admins, then let AI-assisted triage help categorize and prioritize incoming support demand.
            </p>
          </div>
          <div className="mt-16 grid gap-3">
            {['Role-aware access', 'JWT protected routes', 'AI-assisted categorization'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                <Shield className="h-4 w-4 text-[#00D1FF]" />
                {item}
              </div>
            ))}
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
            <h2 className="section-title">Create your account</h2>
            <p className="mt-2 text-sm muted-text">Choose a role and join the SuperOps workspace.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-[#0b1c30]">Full name</label>
              <div className="relative mt-2">
                <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#777587]" />
                <input
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                    maxLength: { value: 100, message: 'Name must be less than 100 characters' },
                  })}
                  type="text"
                  autoComplete="name"
                  className={`input-field pl-10 ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Alex Morgan"
                />
              </div>
              {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#0b1c30]">Email address</label>
              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#777587]" />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Please enter a valid email address' },
                  })}
                  type="email"
                  autoComplete="email"
                  className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="alex@superops.com"
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#0b1c30]">Password</label>
              <div className="relative mt-2">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#777587]" />
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Create a secure password"
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

            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-[#0b1c30]">Role</label>
              <select {...register('role')} className="input-field mt-2">
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
              <p className="mt-2 text-sm muted-text">Agents manage assigned tickets. Admins have full system access.</p>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm muted-text">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#3525cd] hover:text-[#170426]">
              Sign in
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Signup;
