import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { AuthKitProvider } from "@workos-inc/authkit-react";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({
    env: {
      WORKOS_CLIENT_ID: process.env.VITE_WORKOS_CLIENT_ID || '',
      WORKOS_REDIRECT_URI: process.env.VITE_WORKOS_REDIRECT_URI || 'http://localhost:5173/auth/callback',
    },
  });
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { env } = useLoaderData<typeof loader>();
  
  return (
    <AuthKitProvider
      clientId={env.WORKOS_CLIENT_ID}
      apiHostname="https://api.workos.com"
    >
      <Outlet />
    </AuthKitProvider>
  );
}