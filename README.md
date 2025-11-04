# 🚀 Crypto Dashboard - Real-Time Cryptocurrency Tracker

A modern, real-time cryptocurrency dashboard built with Next.js, Supabase, and deployed on Cloudflare Pages. Track top cryptocurrencies with live price updates, market data, and beautiful visualizations.

![Crypto Dashboard](https://img.shields.io/badge/Next.js-14.0-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Real--time-3ECF8E?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=for-the-badge&logo=cloudflare)

## ✨ Features

- 🔴 **Real-time Updates**: Live cryptocurrency price tracking with 30-second refresh intervals
- 💾 **Supabase Integration**: Backend powered by Supabase for data storage and real-time subscriptions
- 📊 **Live Data**: Fetches current prices from CoinGecko API
- 🎨 **Modern UI**: Beautiful gradient design with Tailwind CSS
- 📱 **Responsive**: Works perfectly on desktop, tablet, and mobile devices
- ⚡ **Fast**: Deployed on Cloudflare Pages with OpenNext for optimal performance
- 🔄 **Real-time Subscriptions**: Instant updates when data changes in Supabase
- 📈 **Market Data**: Display of price, 24h change, and market cap for top 20 cryptocurrencies

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Database**: Supabase (PostgreSQL with real-time capabilities)
- **Styling**: Tailwind CSS + PostCSS
- **Data Fetching**: SWR for client-side data fetching
- **API**: CoinGecko API for live cryptocurrency prices
- **Deployment**: Cloudflare Pages with OpenNext adapter
- **Language**: JavaScript/React

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18.x or higher installed
- A Supabase account (free tier available at [supabase.com](https://supabase.com))
- A Cloudflare account (for deployment)
- Git installed on your machine

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/oli5bo5/supabase-crypto-dashboard.git
cd supabase-crypto-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Go to [Supabase](https://app.supabase.com) and create a new project
2. Once your project is ready, go to **Settings** > **API**
3. Copy your **Project URL** and **anon public** key
4. In your Supabase project, go to **SQL Editor** and run this SQL to create the crypto_prices table:

```sql
CREATE TABLE crypto_prices (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  price DECIMAL(20, 8),
  market_cap BIGINT,
  change_24h DECIMAL(10, 4),
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable real-time for the table
ALTER PUBLICATION supabase_realtime ADD TABLE crypto_prices;

-- Create index for better query performance
CREATE INDEX idx_crypto_market_cap ON crypto_prices(market_cap DESC);
```

### 4. Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the dashboard!

## 📦 Project Structure

```
supabase-crypto-dashboard/
├── lib/
│   └── supabase.js          # Supabase client configuration
├── pages/
│   └── index.js             # Main dashboard page with crypto table
├── styles/
│   └── globals.css          # Global styles with Tailwind directives
├── .env.local.example       # Example environment variables
├── next.config.js           # Next.js configuration
├── open-next.config.ts      # OpenNext configuration for Cloudflare
├── package.json             # Project dependencies
├── postcss.config.js        # PostCSS configuration
└── tailwind.config.js       # Tailwind CSS configuration
```

## 🌐 Deployment to Cloudflare Pages

### Option 1: Automatic Deployment (Recommended)

1. **Connect GitHub to Cloudflare Pages**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to **Workers & Pages** > **Create application** > **Pages**
   - Connect your GitHub account
   - Select the `supabase-crypto-dashboard` repository

2. **Configure Build Settings**:
   - **Build command**: `npm run build`
   - **Build output directory**: `.open-next/worker`
   - **Root directory**: `/` (leave default)

3. **Set Environment Variables**:
   - Add your Supabase credentials:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy**:
   - Click **Save and Deploy**
   - Wait for the build to complete (usually 2-5 minutes)
   - Your dashboard will be live at `https://your-project.pages.dev`

### Option 2: Manual Deployment via Wrangler CLI

1. **Install Wrangler**:

```bash
npm install -g wrangler
```

2. **Login to Cloudflare**:

```bash
wrangler login
```

3. **Build the Project**:

```bash
npm run build
```

4. **Deploy**:

```bash
wrangler pages deploy .open-next/worker
```

## 🔧 Configuration

### Customize Refresh Interval

Edit `pages/index.js` and modify the `refreshInterval` in the SWR configuration:

```javascript
const { data: liveData } = useSWR(
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false',
  fetcher,
  { refreshInterval: 30000 } // Change this value (in milliseconds)
)
```

### Change Number of Displayed Cryptocurrencies

In `pages/index.js`, modify the API URL parameter `per_page` and the Supabase query limit:

```javascript
// Change per_page=20 to your desired number
const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false'

// Also update the Supabase query
.limit(50) // Change to match per_page
```

## 🎨 Customization

### Tailwind Theme

Edit `tailwind.config.js` to customize colors, fonts, and other design tokens:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Add your custom colors here
      },
    },
  },
}
```

### Global Styles

Edit `styles/globals.css` to modify the global CSS variables and base styles.

## 📊 API Reference

### CoinGecko API

This project uses the free CoinGecko API. Rate limits apply:
- **Free tier**: 10-50 calls/minute
- **Demo tier**: More generous limits

For production use, consider upgrading to a paid plan or implementing caching.

### Supabase Realtime

The dashboard subscribes to real-time changes on the `crypto_prices` table. Any updates to this table will trigger an automatic refresh of the dashboard.

## 🐛 Troubleshooting

### Build Errors

**Issue**: `Error: Missing Supabase environment variables`

**Solution**: Ensure `.env.local` exists and contains valid Supabase credentials.

**Issue**: OpenNext build fails

**Solution**: Run `npm install` again and ensure all dependencies are installed correctly.

### Runtime Errors

**Issue**: "Failed to fetch crypto data"

**Solution**: Check your Supabase table exists and has the correct schema. Verify your API keys are correct.

**Issue**: Real-time updates not working

**Solution**: Ensure you've run the SQL command to enable real-time for the `crypto_prices` table.

## 📝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [CoinGecko](https://www.coingecko.com/) - Cryptocurrency data API
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Cloudflare Pages](https://pages.cloudflare.com/) - JAMstack deployment platform
- [OpenNext](https://open-next.js.org/) - Open-source Next.js adapter

## 📧 Contact

For questions or support, please open an issue in the GitHub repository.

---

**Built with ❤️ using Next.js, Supabase, and Cloudflare Pages**
