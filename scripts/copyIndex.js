import { copyFileSync } from 'fs'

// copy the generated index.html to 404.html so GitHub Pages will serve the app
copyFileSync('dist/index.html', 'dist/404.html')
console.log('404.html created')
