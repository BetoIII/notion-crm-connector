# Notion CRM Connector

A Next.js web application that creates and manages personal CRM databases in your Notion workspace. Build structured databases for Accounts, Contacts, and Opportunities with intelligent bidirectional relations.

## Features

- 🔐 **Secure OAuth Authentication** with Notion
- 📊 **3-Database CRM System**: Accounts, Contacts, and Opportunities
- ✏️ **Customizable Schema Editor**: Add, edit, and delete properties before creation
- 🔗 **Smart Relations**: Automatically creates bidirectional links between databases
- 📡 **Real-time Progress**: Live updates during database creation via Server-Sent Events
- 🎨 **Modern UI**: Built with shadcn/ui and Tailwind CSS

## Default CRM Schema

### Accounts (🏢)
- Company information, segments, location
- Links to Contacts and Opportunities

### Contacts (👤)
- Contact details, buying roles, engagement levels
- Links to Accounts and Opportunities

### Opportunities (🏆)
- Sales pipeline, deal values, stages
- Links to Accounts and Contacts (including Champion relation)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Authentication**: Manual Notion OAuth + JWE encrypted cookies (jose)
- **Real-time**: Server-Sent Events via Route Handler ReadableStream
- **API**: Native fetch (no Notion SDK)

## Prerequisites

- Node.js 18+ (via nvm recommended)
- A Notion account
- A Notion integration (created at [developers.notion.com](https://developers.notion.com))

## Getting Started

### 1. Clone the repository

```bash
cd "Notion CRM Connector"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Notion Integration

1. Go to [https://www.notion.com/my-integrations](https://www.notion.com/my-integrations)
2. Click "New integration"
3. Name it "CRM Connector" (or any name)
4. Set the integration type to "Public"
5. Under "OAuth Domain & URIs", add:
   - **Redirect URI**: `http://localhost:3000/auth/callback`
6. Under "Capabilities", ensure these are enabled:
   - Read content
   - Update content
   - Insert content
7. Save and copy your:
   - **OAuth client ID**
   - **OAuth client secret**

### 4. Configure environment variables

Copy `.env.local` and update with your values:

```bash
# Notion OAuth Configuration
NOTION_OAUTH_CLIENT_ID=your_client_id_here
NOTION_OAUTH_CLIENT_SECRET=your_client_secret_here
NOTION_REDIRECT_URI=http://localhost:3000/auth/callback

# Public client ID (exposed to browser)
NEXT_PUBLIC_NOTION_CLIENT_ID=your_client_id_here

# Session Encryption (already generated)
ENCRYPTION_SECRET=965b22b5402c9008ded3b3d3aca5ef66995e2ca916b4e453f4ac3efe3dda9285

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Connect and Create

1. Click "Connect with Notion"
2. Authorize the integration to access your workspace
3. Customize the CRM schema (optional)
4. Click "Create CRM"
5. Watch the real-time progress as your databases are created!

## Project Structure

```
src/
├── app/
│   ├── api/                # API routes
│   │   ├── auth/           # OAuth callback
│   │   └── crm/            # CRM creation SSE endpoint
│   ├── auth/               # Auth routes
│   ├── dashboard/          # Main dashboard
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
│
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── auth/               # Auth components
│   ├── schema-editor/      # Schema tree editor
│   ├── creation-progress/  # Progress UI
│   └── dashboard/          # Dashboard components
│
├── lib/
│   ├── auth/               # OAuth & session management
│   ├── notion/             # Notion API client & pipeline
│   └── schema/             # Schema types & validators
│
└── hooks/
    └── use-schema.ts       # Schema state management
```

## Database Creation Pipeline

The app uses a 3-phase creation pipeline:

1. **Phase 1**: Create all 3 databases (without relations)
2. **Phase 2**: Add bidirectional relations via PATCH requests
3. **Result**: Fully connected CRM with 5 dual-property relations

All API calls are rate-limited (~3 req/sec) and handle 429 retries automatically.

## Deployment to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Update environment variables in Vercel dashboard:
   - Set `NOTION_REDIRECT_URI` to your production URL (e.g., `https://your-domain.vercel.app/auth/callback`)
   - Update `NEXT_PUBLIC_APP_URL` to your production URL
   - Add the same redirect URI to your Notion integration settings
4. Deploy!

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
