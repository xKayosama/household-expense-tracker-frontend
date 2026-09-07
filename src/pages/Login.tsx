import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLoginMutation } from '@/features/auth/authApi';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '@/features/auth/authSlice';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage('');

    try {
      const response = await login({
        email,
        password,
      }).unwrap();

      dispatch(
        setCredentials({
          token: response.data.token,
          user: response.data.user,
        })
      );

      navigate('/dashboard');
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'data' in error
      ) {
        const apiError = error as {
          data?: {
            message?: string;
          };
        };

        setErrorMessage(
          apiError.data?.message || 'Login failed.'
        );
      } else {
        setErrorMessage('Something went wrong.');
      }
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Welcome back
          </CardTitle>

          <CardDescription>
            Sign in to your HomeSplit account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password
              </Label>

              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600">
                {errorMessage}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default Login;