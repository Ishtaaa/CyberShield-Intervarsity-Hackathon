# CyberShield Academy - Setup Instructions

Follow the steps below to set up and run the CyberShield Academy project.

---

## 📦 Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher (comes with Node.js)
- **Git**: For cloning the repository
- **Web Browser**: Chrome, Firefox, Safari, or Edge (latest versions)


---

## ⚙️ Installation

### Method 1: Direct Setup
``` bash
# Clone the repository
git clone https://github.com/your-username/CyberShield-Intervarsity-Hackathon.git
cd CyberShield-Intervarsity-Hackathon

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Method 2: Using Docker (Recommended for Production)
``` bash
# Clone the repository
git clone https://github.com/your-username/CyberShield-Intervarsity-Hackathon.git
cd CyberShield-Intervarsity-Hackathon

# Build the Docker image
docker build -t cybershield-academy .

# Run the container
docker run -p 3000:3000 cybershield-academy
```

---

## ▶️ Running the Project

### Development Mode
``` bash
# Start the development server
npm run dev

# The application will be available at:
# http://localhost:5173
### IDE Configuration
The project includes configuration files for consistent development:
- `.editorconfig` - Code formatting standards
- `eslint.config.js` - Code linting rules
- `tsconfig.json` - TypeScript configuration

### Hot Reload
Changes to source files will automatically reload the browser during development.

### File Structure
```
src/
├── lib/
│   ├── components/     # Reusable UI components
│   └── stores/         # Application state
├── routes/             # SvelteKit pages
├── app.html           # HTML template
└── app.css           # Global styles```
