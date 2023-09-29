import Link from "next/link";
import GoogleCalendarAuth from "../components/google-calendar/GoogleCalendarAuth";

const SettingsPage = () => (
  <div className="mx-auto sm:px-6 lg:max-w-[1400px] bg-white shadow-md p-6 rounded-lg">
    <h1 className="text-4xl mb-8">Settings page</h1>
    <Link
      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border rounded-md shadow-sm mb-4 bg-blue-600 text-white hover:bg-blue-700"
      href="/"
    >
      Go home
    </Link>
    <GoogleCalendarAuth />
  </div>
);

export default SettingsPage;
