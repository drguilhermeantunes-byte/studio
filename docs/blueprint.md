# **App Name**: ChamaUBS

## Core Features:

- Staff Call Panel: Provides a user interface for staff to input patient names and room numbers, with input validation, triggering new call events upon submission and automatically clearing fields.
- Real-time TV Display: Automatically updates the TV screen in real-time via Firestore 'onSnapshot' with the current patient's name, assigned room, and relevant instructions, alongside a digital clock.
- Intelligent Audio Announcement Tool: Utilizes the Web Speech API to synthesize and automatically play a clear Portuguese voice announcement ('pt-BR', female if available) for new patient calls, preventing audio repetition for unchanged data.
- Recent Calls History: Displays a history of the last 5 called patients and their assigned rooms on the TV screen for quick reference, with a button to reset this history.
- Firestore Data Persistence & Sync: Securely saves patient call information (name, room, timestamp) to Firestore and ensures all client interfaces (staff and TV) are updated and synchronized in real-time.

## Style Guidelines:

- Color scheme: Light and institutional, inspired by the Brazilian public healthcare system (SUS). Primary color: a calm, professional blue (#2989CC). Background color: a very light, desaturated blue (#ECF3F6) to maintain clarity and calm. Accent color: a distinctive yet harmonious blue-purple (#748DFC) for highlights and calls to action.
- Font for headlines and body text: 'Inter', a clean, modern sans-serif, chosen for its excellent readability and neutral, professional aesthetic suitable for an institutional environment.
- Icons: Simple, line-art, and professional, ensuring quick recognition and maintaining a clean visual language across the application.
- Layout: Clean, professional, and inspired by hospital aesthetics, using a grid-based approach with ample whitespace to ensure excellent readability and easy navigation on both staff and TV interfaces. Responsiveness will ensure optimal viewing across devices.
- Animation: Subtle fades and transitions for content updates on the TV panel, and a soft, slow background gradient animation for a calm and modern visual appeal without distractions.