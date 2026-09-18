import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest { return { name:'GramSwasthya', short_name:'GramSwasthya', description:'Secure offline-first rural healthcare coordination platform', start_url:'/', display:'standalone', background_color:'#f5f8fc', theme_color:'#1d4ed8', icons:[] }; }
