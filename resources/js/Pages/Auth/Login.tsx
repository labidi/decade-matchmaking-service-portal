import { Head } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';

export default function Login() {
    return (
        <FrontendLayout>
            <Head title="Welcome" />
            <div className="max-w-lg  mx-auto mt-8 p-6">
                <h2 className="text-2xl font-bold mb-6 text-center">Sign in to your account</h2>

                <form className="space-y-6">
                    {/* Email Address */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <p className="text-xs text-gray-500 mb-1">
                            Enter the email associated with your account.
                        </p>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-firefly-500"
                            placeholder="you@example.com"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <p className="text-xs text-gray-500 mb-1">
                            Must be at least 8 characters.
                        </p>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-firefly-500"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center">
                        <input
                            id="remember"
                            name="remember"
                            type="checkbox"
                            className="h-4 w-4 text-firefly-600 border-gray-300 rounded focus:ring-firefly-500"
                        />
                        <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                            Remember me
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center px-4 py-2 bg-firefly-600 text-white font-medium rounded-md hover:bg-firefly-700 focus:outline-none focus:ring-2 focus:ring-firefly-500"
                        >
                            Sign In
                        </button>
                    </div>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-4">
                    <button
                        type="button"
                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                    >
                        {/* You can replace with the Google SVG icon */}
                        <span className="mr-2">🔍</span>
                        <span>Sign in with Google</span>
                    </button>
                    <button
                        type="button"
                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                    >
                        {/* Replace with the LinkedIn SVG icon */}
                        <span className="mr-2">🔗</span>
                        <span>Sign in with LinkedIn</span>
                    </button>
                </div>
            </div>
        </FrontendLayout>
    );
}
