import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../services/api';
import { Briefcase } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signup(email, password);
      // Auto-redirect to login after successful signup
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error signing up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Or{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="card-base p-8 space-y-6">
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm font-medium text-red-800 text-center">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900 mb-2">Email address</label>
                <input 
                  type="email" 
                  className="input-field"
                  value={email} onChange={(e) => setEmail(e.target.value)} required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900 mb-2">Password</label>
                <input 
                  type="password" 
                  className="input-field"
                  value={password} onChange={(e) => setPassword(e.target.value)} required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full flex justify-center py-2.5"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
