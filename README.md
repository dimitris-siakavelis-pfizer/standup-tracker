# Daily Stand Up Tracker (DSUT)

A modern, web-based tool for managing daily stand up meetings with random name selection and team member management.

## Features

### Core Functionality
- **Team Member Management**: Add, edit, remove, and toggle enable/disable status for team members
- **Random Name Selection**: Animated random selection process that only considers enabled team members
- **Share Configuration**: Share your team setup via URL with all data stored locally
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Key Features
- ✅ **Name List Management**
  - Display list of team member names
  - Add new names to the list
  - Remove names from the list
  - Edit existing names inline
  - Toggle enable/disable status for each name
  - Clear button that clears winner and all blocker text fields

- ✅ **Random Name Selection**
  - Random selection from enabled names only
  - "Start" button to trigger selection
  - Visual animation during random selection
  - Prominent display of selected name
  - "Start a New Day!" button to clear selection and reset updates
  - Stop selection option during animation

- ✅ **Team Updates Tracking**
  - Track blockers for each enabled team member
  - "Update Given" checkbox for each team member
  - Green background styling when updates are given
  - Single-line text input for blockers
  - Real-time updates and persistence
  - Only shows enabled team members

- ✅ **Settings & Sharing**
  - Dedicated settings page with share functionality
  - Share link feature to share current state
  - All data stored in URL for easy sharing
  - No server-side storage required

## Technical Stack

- **Framework**: Next.js 15.0.0
- **Language**: TypeScript
- **Styling**: TailwindCSS 3.4.1
- **UI**: Modern, responsive design with smooth animations
- **State Management**: React hooks with URL-based persistence

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd standup-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run export` - Build static export for deployment
- `npm run deploy` - Build and prepare for GitHub Pages deployment

## Deployment

### GitHub Pages

This app is configured for automatic deployment to GitHub Pages. The deployment process is handled by GitHub Actions.

#### Setup Instructions:

1. **Update the homepage URL** in `package.json`:
   - Replace `[your-github-username]` with your actual GitHub username
   - The URL should be: `https://[your-github-username].github.io/standup-tracker`

2. **Enable GitHub Pages** in your repository:
   - Go to your repository Settings
   - Navigate to "Pages" section
   - Set source to "GitHub Actions"

3. **Push to main branch**:
   - The GitHub Actions workflow will automatically build and deploy your app
   - Your app will be available at the homepage URL

#### Manual Deployment:

If you prefer manual deployment, you can run:
```bash
npm run deploy
```

This will build the static files and create the necessary `.nojekyll` file for GitHub Pages.

## Usage

### Adding Team Members
1. Enter a team member's name in the input field
2. Click "Add" or press Enter
3. The member will be added to the list with enabled status

### Managing Team Members
- **Edit**: Click the "Edit" button next to a name to modify it inline
- **Remove**: Click the "Remove" button to delete a team member
- **Toggle Status**: Click the checkbox to enable/disable a member for selection
- **Clear All**: Use the "Clear All" button to reset the selection and clear blockers

### Random Selection
1. Ensure you have enabled team members in your list
2. Click "Start Selection" to begin the random selection process
3. Watch the animated selection process (3 seconds duration)
4. The selected team member will be displayed prominently
5. Use "Clear Selection" to reset the winner

### Sharing Your Configuration
1. Set up your team members and their status
2. Click "Copy Share Link" in the Settings panel
3. Share the URL with your team
4. When others open the link, they'll see your exact configuration

## Project Structure

```
standup-tracker/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles and TailwindCSS
│   │   ├── layout.tsx           # Root layout component
│   │   ├── page.tsx             # Main application page
│   │   └── settings/
│   │       └── page.tsx         # Settings page
│   ├── components/
│   │   ├── NameList.tsx         # Team member management
│   │   ├── RandomSelector.tsx   # Random selection logic
│   │   └── TeamUpdates.tsx      # Team updates tracking
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   └── utils/
│       └── urlState.ts          # URL state management
├── public/                      # Static assets
├── package.json                 # Dependencies and scripts
├── tailwind.config.js          # TailwindCSS configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## Features in Detail

### URL State Management
The application stores all team member data in the URL using base64 encoding. This allows for:
- Easy sharing of configurations
- No server-side storage required
- Persistent state across browser sessions
- Bookmarkable configurations

### Responsive Design
- **Desktop**: Three-column layout with all features visible
- **Mobile**: Stacked layout with optimized touch interactions
- **Tablet**: Adaptive layout that works on all screen sizes

### Animations and UX
- Smooth transitions between states
- Loading animations during random selection
- Visual feedback for all user interactions
- Disabled state styling for inactive team members

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

Built with Next.js and TailwindCSS for a modern, performant web experience.
