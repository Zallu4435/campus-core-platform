import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { FaRegCheckCircle, FaRegIdCard, FaShieldAlt } from 'react-icons/fa';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { Input } from '../../components/base/Input';
import { Button } from '../../components/base/Button';
import { loginSchema } from '../../../domain/validation/authentication/login';
import { useLoginUser } from '../../../application/hooks/useAuthQueries';
import { useAnimation } from '../../../shared/hooks/useAnimation';
import { setAuth } from '../../../appStore/authSlice';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import type { LoginFormData } from '../../../domain/types/auth/Login';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const formAnimation = useAnimation(300);
  const backgroundAnimation = useAnimation(0);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [pendingError, setPendingError] = useState('');
  const [loginError, setLoginError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const mutation = useLoginUser();


  const onSubmit = (data: LoginFormData) => {
    setPendingError('');
    setLoginError('');
    mutation.mutate(data, {
      onSuccess: (response) => {
        dispatch(setAuth({
          user: { ...response.user, role: response.user.role || response.collection },
          collection: response.collection
        }));

        toast.success('Login successful!');
        switch (response.collection) {
          case 'register':
            navigate('/admission');
            break;
          case 'admin':
            navigate('/admin');
            break;
          case 'user':
            navigate('/dashboard');
            break;
          case 'faculty':
            navigate('/faculty');
            break;
          default:
            console.error('Unknown collection type:', response.collection);
            navigate('/dashboard');
        }
      },
      onError: (error: Error) => {
        if (error.message.toLowerCase().includes('confirm your email')) {
          setPendingError('You must confirm your email before logging in. Please check your inbox.');
        } else {
          setLoginError(error.message || 'Login failed. Please try again.');
        }
      },
    });
  };

  return (
    <div
      className="bg-gradient-to-b from-cyan-50 via-white to-cyan-50 px-3 sm:px-4 lg:px-6 pt-10 pb-6 sm:py-6 lg:py-8 sm:min-h-screen sm:flex sm:items-center sm:justify-center"
      style={backgroundAnimation}
    >
      <div className="w-full max-w-6xl flex flex-col lg:flex-row shadow-xl rounded-lg sm:rounded-xl overflow-hidden">
        <div className="w-full lg:w-1/2 bg-white p-4 sm:p-6 lg:p-8 xl:p-12" style={formAnimation}>
          <div className="max-w-md mx-auto">
            <div className="text-center mb-4 sm:mb-6 lg:mb-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-800 mb-2 sm:mb-4">Account Login</h2>
              <p className="text-sm sm:text-base text-cyan-600">Sign in to your VAGO Academy account as a user, faculty, or admin</p>
              <div className="w-16 sm:w-20 lg:w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 mx-auto mt-3 sm:mt-4" />
            </div>

            {pendingError && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 sm:px-4 py-2 sm:py-3 rounded relative mb-4 sm:mb-6 text-sm sm:text-base" role="alert">
                <span className="block sm:inline">{pendingError}</span>
              </div>
            )}

            {loginError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded relative mb-4 sm:mb-6 text-sm sm:text-base" role="alert">
                <span className="block sm:inline">{loginError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 lg:space-y-5">
              <div>
                <Input
                  id="email"
                  type="email"
                  label="Email Address"
                  {...register('email')}
                  placeholder="you@example.com"
                  className="border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500"
                />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <div className="relative">
                  <Input
                    id="password"
                    type={isPasswordVisible ? "text" : "password"}
                    label="Password"
                    {...register('password')}
                    placeholder="••••••••"
                    className="border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500 pr-10"
                  />
                  <button
                    type="button"
                    onMouseDown={() => setIsPasswordVisible(true)}
                    onMouseUp={() => setIsPasswordVisible(false)}
                    onMouseLeave={() => setIsPasswordVisible(false)}
                    onTouchStart={() => setIsPasswordVisible(true)}
                    onTouchEnd={() => setIsPasswordVisible(false)}
                    className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {isPasswordVisible ? <FiEyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <FiEye className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                label={
                  mutation.isPending ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      </svg>
                      Logging in...
                    </span>
                  ) : (
                    'Login'
                  )
                }
                disabled={mutation.isPending}
                variant="primary"
                className="w-full"
              />

              <div className="text-center text-xs sm:text-sm text-cyan-700 mt-2 sm:mt-3 lg:mt-4 space-y-1 sm:space-y-2">
                <div>
                  Don't have an account?{' '}
                  <Link to="/register" className="text-cyan-600 hover:underline font-medium">Register</Link>
                  <span className="mx-1 sm:mx-2">|</span>
                  <Link to="/faculty/request" className="text-cyan-600 hover:underline font-medium">Apply as Faculty</Link>
                </div>
                <div>
                  <Link to="/forgot-password" className="text-red-600 hover:underline font-medium">Forgot Password?</Link>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div
          className="hidden lg:block lg:w-1/2 p-6 sm:p-8 lg:p-12 text-white bg-cover bg-center relative"
          style={{
            ...formAnimation,
            backgroundImage: `url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/30 to-blue-900/30"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 opacity-20 transform -rotate-45"
              style={{ textShadow: '0 0 20px rgba(0, 255, 255, 0.3)' }}
            >
              VAGO
            </span>
          </div>
          <div className="relative h-full flex flex-col justify-between p-4 sm:p-6 rounded-lg">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">Welcome Back to VAGO Academy</h1>
              <p className="text-sm sm:text-base text-white mb-6 sm:mb-8">
                Log in to continue your academic journey with VAGO Academy and access your personalized dashboard and resources.
              </p>
              <div className="space-y-4 sm:space-y-6 mt-8 sm:mt-12">
                <div className="flex items-center">
                  <div className="bg-cyan-500 bg-opacity-30 p-2 rounded-full">
                    <FaRegCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <h3 className="font-medium text-sm sm:text-base">Quick Access</h3>
                    <p className="text-xs sm:text-sm text-white">Sign in to manage your account in seconds</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-cyan-500 bg-opacity-30 p-2 rounded-full">
                    <FaRegIdCard className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <h3 className="font-medium text-sm sm:text-base">Personalized Dashboard</h3>
                    <p className="text-xs sm:text-sm text-white">Access your courses and resources</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-cyan-500 bg-opacity-30 p-2 rounded-full">
                    <FaShieldAlt className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <h3 className="font-medium text-sm sm:text-base">Secure Login</h3>
                    <p className="text-xs sm:text-sm text-white">Your credentials are protected</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-white">© 2025 VAGO Academy. All rights reserved.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;