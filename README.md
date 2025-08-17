# Solar Charge Frontend

A Vue 3 + Vite frontend application with Tailwind CSS for the Solar Charge project.

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (version 16 or higher)
- [Git](https://git-scm.com/)

### One-Command Setup
```bash
git clone <your-repo-url> && cd solar-charge-frontend && npm install && npm run dev
```

### Step-by-Step Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd solar-charge-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

4. **Start development server with network access** (for testing on other devices)
   ```bash
   npm run dev -- --host
   ```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🛠️ Tech Stack

- **Frontend Framework**: [Vue 3](https://vuejs.org/) with Composition API
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **SVG Support**: vite-svg-loader

## 📁 Project Structure

```
solar-charge-frontend/
├── public/           # Static assets
├── src/              # Source code
│   ├── components/   # Vue components
│   ├── assets/       # Images, styles, etc.
│   └── main.js       # Application entry point
├── index.html        # HTML template
├── package.json      # Dependencies and scripts
├── vite.config.js    # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
└── postcss.config.js # PostCSS configuration
```

## 🔧 Configuration

The project is configured with:
- **Vite**: Modern build tool with hot module replacement
- **Vue 3**: Using `<script setup>` syntax
- **Tailwind CSS**: Utility-first CSS framework
- **SVG Loader**: Import SVGs as Vue components

## 🌐 Network Access

To access the development server from other devices on your network, use:
```bash
npm run dev -- --host
```

This will make the server accessible via your local IP address.

## 🏗️ Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 👥 Development

### IDE Recommendations
- [VS Code](https://code.visualstudio.com/) with [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension
- [WebStorm](https://www.jetbrains.com/webstorm/)

### Code Style
- Follow Vue 3 Composition API patterns
- Use `<script setup>` syntax
- Utilize Tailwind CSS utility classes

## 📚 Learn More

- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vue 3 Script Setup](https://vuejs.org/api/sfc-script-setup.html)

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   - Vite will automatically find an available port
   - Or specify a port: `npm run dev -- --port 3000`

2. **Node modules issues**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Build errors**
   - Ensure all dependencies are installed
   - Check for syntax errors in Vue components

### Getting Help

If you encounter issues:
1. Check the console for error messages
2. Verify Node.js version compatibility
3. Ensure all dependencies are properly installed
