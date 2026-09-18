import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest { return { name:'GramCare', short_name:'GramCare', description:'Connected healthcare for rural communities', start_url:'/', display:'standalone', background_color:'#f5f8fc', theme_color:'#1d4ed8', icons:[] }; }
