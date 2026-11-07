import type { Metadata } from 'next';
import './globals.css';
import './themes.css';
import './reading-layout.css';
import {ReadingThemeProvider} from '../components/theme-control';
export const metadata: Metadata = {title:'Haṭha Pradīpikā · The Study Atlas',icons:{icon:'/favicon.svg'},description:'Explore the Sanskrit Haṭhayogapradīpikā through an interactive knowledge graph, complete verse text, and a transparent Sanskrit study apparatus.'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en" suppressHydrationWarning><body><ReadingThemeProvider>{children}</ReadingThemeProvider></body></html>}
