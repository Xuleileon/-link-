import './globals.css'

export const metadata = {
  title: '全域Link+ | 千川全域素材分析平台',
  description: '专业的千川全域广告素材数据分析平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}

