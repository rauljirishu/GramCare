import type { Config } from 'tailwindcss';
export default { content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'], theme: { extend: { colors: { brand: { 50:'#effaf8',100:'#d7f3ed',500:'#168c7b',600:'#0e7164',900:'#133d3b' } } } }, plugins: [] } satisfies Config;
