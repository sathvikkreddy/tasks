import { Geist_Mono, Inter } from "next/font/google"
import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react"
import { Providers as TRPCProvider } from "@/components/trpc-provider"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <ThemeProvider>
          <ErrorBoundary fallback={<div>Something went wrong</div>}>
            <Suspense fallback={<div>Loading...</div>}>
              <TRPCProvider>{children}</TRPCProvider>
            </Suspense>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
