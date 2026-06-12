import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './global.css';
import { AuthProvider } from './components/authProvider';

export const metadata = {
  title: 'SmartAccess',
  icons: {
    icon: '/favicon.svg',
  },
  description: 'Smart Access Control',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}