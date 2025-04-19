import { useState } from 'react';
import { useAuthStore } from '../../../store/authSlice';
import api from '../../../api/apiInstance';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const { setUser, setIsLoading } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // const handleTest = async () => {
  //   try {
  //     const userDetail = await api.get('/users/me');
  //     console.log('TEST', userDetail);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
    e.preventDefault();
    if (isLogin) {
      console.log('Logging in with:', formData.email, formData.password);
      const { name, ...signInData } = formData;
      const signInResponse = await api.post('/users/login', signInData);
      setUser({
        ...signInResponse.data.user,
        token: signInResponse.data.token,
      });
      navigate('/tasks');
    } else {
      console.log(
        'Signing up with:',
        formData.name,
        formData.email,
        formData.password
      );
      // signup logic
      const signUpResponse = await api.post('/users/signup', formData);
      console.log(signUpResponse);
      setIsLogin(true);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-sm w-full">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {isLogin ? 'Task Manager' : 'Sign Up'}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {isLogin ? 'Sign in to your account.' : 'Create a new account.'}
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin((prev) => !prev)}
            className="text-indigo-600 hover:text-indigo-700 text-sm"
          >
            {isLogin
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Login'}
          </button>

          {/* <button
            onClick={handleTest}
            className="text-indigo-600 hover:text-indigo-700 text-sm"
          >
            TEST
          </button> */}
        </div>
      </div>
    </div>
  );
}

export default Login;
