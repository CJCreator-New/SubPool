import '../styles/fonts.css';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: '#161616',
            border: '1px solid #2A2A2A',
            color: '#F0ECE4',
            fontFamily: 'Syne, sans-serif',
          },
        }}
      />
    </>
  );
}
