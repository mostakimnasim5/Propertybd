import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'নতুন Developer প্রজেক্ট | PropertyBD',
  description: 'বাংলাদেশের সেরা Builder ও Developer-দের নতুন আবাসিক ও বাণিজ্যিক প্রজেক্ট। ফ্ল্যাট, অ্যাপার্টমেন্ট, কমার্শিয়াল স্পেস — সরাসরি Developer-এর কাছ থেকে।',
  keywords: 'new project bangladesh, developer project dhaka, apartment project, real estate developer bd, নতুন প্রজেক্ট, ফ্ল্যাট প্রজেক্ট',
  openGraph: {
    title: 'নতুন Developer প্রজেক্ট | PropertyBD',
    description: 'বাংলাদেশের সেরা Developer-দের নতুন প্রজেক্ট — সরাসরি Developer-এর কাছ থেকে।',
    locale: 'bn_BD',
    type: 'website',
  },
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
