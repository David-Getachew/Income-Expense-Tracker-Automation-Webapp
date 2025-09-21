# Income-Expense Tracker Automation Webapp



A comprehensive web application for tracking income and expenses with automated reporting and dashboard visualization. This application helps individuals and small businesses manage their finances efficiently through an intuitive interface and powerful analytics.



Note: This is the frontend-only version of the application. Database integration has not been implemented yet.



## Table of Contents

- [Features](#features)

- [Technology Stack](#technology-stack)

- [Project Structure](#project-structure)

- [Getting Started](#getting-started)

- [Prerequisites](#prerequisites)

- [Installation](#installation)

- [Development](#development)

- [Components](#components)

- [Pages](#pages)

- [Authentication](#authentication)

- [Contributing](#contributing)

- [License](#license)



## Features



- **Dashboard Analytics**: Visual representation of income/expense data with interactive charts

- **Data Entry**: Simple interface for adding income and expense transactions

- **Reporting**: Generate detailed financial reports

- **Filtering**: Date range filters for all data views

- **Responsive Design**: Works on desktop and mobile devices

- **Real-time Updates**: Live data updates as transactions are added

- **Data Visualization**: Charts and graphs for financial insights



## Technology Stack



### Frontend

- **React 18** with TypeScript

- **Vite** for fast development and building

- **Tailwind CSS** for styling

- **shadcn/ui** components built on Radix UI

- **React Router** for navigation

- **React Query** for server state management

- **Recharts** for data visualization

- **Date-fns** for date manipulation



### Development Tools

- **pnpm** as package manager

- **ESLint** for code linting

- **TypeScript** for type safety

- **Prettier** for code formatting



## Project Structure



```

src/

├── components/ # Reusable UI components

├── contexts/ # React context providers

├── data/ # Mock data (for development)

├── hooks/ # Custom React hooks

├── lib/ # Utility functions and API wrappers

├── pages/ # Page components

├── types/ # TypeScript type definitions

├── utils/ # Helper functions

├── App.tsx # Main application component

└── main.tsx # Application entry point

```



## Getting Started



### Prerequisites



- Node.js (version 16 or higher)

- pnpm (package manager)



### Installation



1. Clone the repository:

```bash

git clone <repository-url>

```



2. Navigate to the project directory:

```bash

cd Income-Expense-Tracker-Automation-Webapp

```



3. Install dependencies:

```bash

pnpm install

```



### Development



1. Start the development server:

```bash

pnpm dev

```



2. Build for production:

```bash

pnpm build

```



3. Preview the production build:

```bash

pnpm preview

```



4. Run linting:

```bash

pnpm lint

```



## Components



### Core Components

- **Layout** - Main application layout with header and navigation

- **KPICard** - Key performance indicator cards for dashboard

- **DateFilter** - Date range selection component

- **ProtectedRoute** - Route protection for authenticated pages



### UI Components

- Built using shadcn/ui components which are based on Radix UI

- Customized with Tailwind CSS

- Includes forms, tables, charts, dialogs, and more



## Pages



1. **Dashboard** (`/dashboard`) - Main analytics view with charts and KPIs

2. **Data Entry** (`/data-entry`) - Form for adding new transactions

3. **Reports** (`/reports`) - Detailed financial reporting

4. **Login** (`/login`) - Authentication page

5. **404** (`*`) - Not found page



## Authentication



The application uses a context-based authentication system:

- **AuthContext** manages user authentication state

- **ProtectedRoute** component wraps protected pages

- Local storage is used to persist session data



## Contributing



1. Fork the repository

2. Create a feature branch (`git checkout -b feature/AmazingFeature`)

3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)

4. Push to the branch (`git push origin feature/AmazingFeature`)

5. Open a pull request



## License



This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



## Acknowledgments



- Built with [Vite](https://vitejs.dev/)

- UI components from [shadcn/ui](https://ui.shadcn.com/)

- Charts powered by [Recharts](https://recharts.org/)

- Icons from [Lucide React](https://lucide.dev/)

