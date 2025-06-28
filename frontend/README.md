# BinBuddy Frontend

## 🗺️ Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API

### Getting API Keys

1. In Google Cloud Console, go to "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy your new API key

### Creating a Map ID (Optional)

If you're using advanced markers or custom styles:

1. Go to "Maps" → "Map Management"
2. Click "Create Map ID"
3. Copy your Map ID

### Environment Setup

1. Create a `.env` file in the frontend directory:
```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key
VITE_GOOGLE_MAP_ID=your_map_id_here  # Optional
```

2. For development, configure your API key restrictions:
   - Go to API key settings in Google Cloud Console
   - Under "Application restrictions" select "None" or "HTTP referrers"
   - Add `localhost` and your development domains

### API Key Security

For production:
1. Set appropriate API key restrictions
2. Add your production domain to allowed referrers
3. Enable billing and set quotas
4. Monitor usage in Google Cloud Console

## 🚀 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 📦 Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🧪 Testing

```bash
# Run tests
npm test
```

## 📝 Environment Variables

Create a `.env` file with these variables:

```env
# Required
VITE_GOOGLE_MAPS_API_KEY=your_api_key

# Optional
VITE_GOOGLE_MAP_ID=your_map_id
VITE_API_URL=your_backend_url
```

## 🔧 Troubleshooting

### Common Issues

1. "ApiProjectMapError"
   - Check if your API key is correct
   - Ensure the Maps JavaScript API is enabled
   - Verify domain restrictions

2. "NoApiKeys"
   - Make sure your `.env` file exists
   - Check if the API key variable is correct
   - Restart the development server

3. "LoadScript has been reloaded unintentionally"
   - This is just a warning
   - We've already fixed it by memoizing the libraries array

4. Map not displaying
   - Check browser console for errors
   - Verify API key restrictions
   - Ensure billing is enabled in Google Cloud Console
