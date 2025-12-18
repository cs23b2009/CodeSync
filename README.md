# CodeSync Pro

> **Advanced Competitive Programming Analytics Platform**

CodeSync Pro is a comprehensive analytics and performance tracking platform designed for competitive programmers. It provides real-time insights, intelligent recommendations, and detailed performance analytics across multiple programming platforms.

Live Demo: [https://codesync-xgdu.onrender.com/](https://codesync-xgdu.onrender.com/)

## 🚀 Key Features

### 🎯 **Smart Contest Management**
- Live contest tracking from Codeforces, LeetCode, CodeChef, AtCoder, and HackerRank
- Intelligent contest recommendations based on skill level
- Advanced filtering and search capabilities
- Personalized contest difficulty predictions

### 🔔 **Intelligent Notifications**
- Email reminders for upcoming contests
- Customizable notification preferences
- Smart timing based on user timezone
- Contest status updates (upcoming, live, completed)

### 🎨 **Modern User Experience**
- Responsive design optimized for all devices
- Dark/Light theme with system preference detection
- Smooth animations and micro-interactions
- Professional dashboard-style interface

## 🛠 Tech Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Radix UI** - Accessible component primitives
- **Recharts** - Interactive data visualization

### **Backend & Data**
- **MongoDB** - Document database for flexible data storage
- **TanStack Query** - Powerful data fetching and caching
- **Zod** - Runtime type validation
- **Axios** - HTTP client with interceptors

### **Development Tools**
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality assurance

## 🏗 Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── contests/      # Contest data endpoints
│   │   ├── analytics/     # Analytics endpoints
│   │   └── notifications/ # Notification services
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── features/         # Feature-specific components
├── features/             # Feature modules
│   ├── analytics/        # Analytics dashboard
│   ├── contests/         # Contest management
│   └── notifications/    # Notification system
├── hooks/                # Custom React hooks
├── providers/            # Context providers
├── services/             # API services
├── types/                # TypeScript definitions
├── utils/                # Utility functions
└── constants/            # Application constants
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB instance
- npm/yarn/pnpm

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/codesync-pro.git
cd codesync-pro
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Environment Setup**
Create a `.env.local` file:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/codesync-pro

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# External APIs
YOUTUBE_API_KEY=your_youtube_api_key
CODEFORCES_API_URL=https://codeforces.com/api
LEETCODE_API_URL=https://leetcode.com/api
CODECHEF_API_URL=https://codechef.com/api

# Email Service (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 API Endpoints

### Contest Management
- `GET /api/contests` - Fetch all contests with filtering
- `GET /api/contests/[platform]` - Platform-specific contests
- `POST /api/contests/bookmark` - Bookmark/unbookmark contests

### Analytics
- `GET /api/analytics/performance` - User performance data
- `GET /api/analytics/trends` - Rating and participation trends
- `GET /api/analytics/platforms` - Platform-wise statistics

### Notifications
- `POST /api/notifications/subscribe` - Subscribe to contest reminders
- `PUT /api/notifications/preferences` - Update notification settings

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#1f8dd6 to #3f51b5)
- **Secondary**: Purple accent (#9c27b0)
- **Success**: Green (#4caf50)
- **Warning**: Orange (#ff9800)
- **Error**: Red (#f44336)

### Typography
- **Headings**: Geist Sans (Bold/Semibold)
- **Body**: Geist Sans (Regular/Medium)
- **Code**: Geist Mono

## 🔧 Development

### Code Quality
```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Build
npm run build
```

### Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Docker
```bash
# Build image
docker build -t codesync-pro .

# Run container
docker run -p 3000:3000 codesync-pro
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Contest data provided by platform APIs
- UI components built with Radix UI
- Charts powered by Recharts
- Icons from Lucide React

---

**Built with ❤️ for the competitive programming community**
