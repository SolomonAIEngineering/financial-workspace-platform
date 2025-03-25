import localFont from 'next/font/local'

export const geistMono = localFont({
    src: '../node_modules/geist/font/mono/GeistMono-Regular.woff2',
    variable: '--font-geist-mono',
    display: 'swap',
})

export const geistSans = localFont({
    src: '../node_modules/geist/font/sans/GeistSans-Regular.woff2',
    variable: '--font-geist-sans',
    display: 'swap',
}) 