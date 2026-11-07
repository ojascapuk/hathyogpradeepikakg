import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Haṭha Pradīpikā · The Study Atlas',icons:{icon:'/favicon.svg'},description:'Explore the Sanskrit Haṭhayogapradīpikā through an interactive knowledge graph, complete verse text, and a transparent Sanskrit study apparatus.'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
