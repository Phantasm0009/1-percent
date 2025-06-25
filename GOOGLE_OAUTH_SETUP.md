# Google OAuth Setup Guide for Daily 1% App

## Overview
This guide walks you through setting up Google OAuth authentication for your Daily 1% habit tracking app using Supabase.

## Prerequisites
- Supabase project created and configured
- Google account for accessing Google Cloud Console
- Daily 1% app running locally (http://localhost:8000)

## Step 1: Google Cloud Console Setup

### 1.1 Create/Select Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Either create a new project or select an existing one:
   - **New Project**: Click "Select a project" → "New Project"
   - **Name**: "Daily 1% App" (or your preferred name)
   - **Organization**: Leave as default or select your organization
   - Click "Create"

### 1.2 Enable Required APIs
1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for and enable these APIs:
   - **Google+ API** (required for OAuth)
   - **People API** (optional, for enhanced user data)

### 1.3 Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you're using Google Workspace)
3. Fill out the required fields:
   - **App name**: "Daily 1%"
   - **User support email**: Your email
   - **App logo**: Upload your app icon (optional)
   - **App domain**: Leave blank for now
   - **Developer contact email**: Your email
4. Click **Save and Continue**
5. **Scopes**: Click **Add or Remove Scopes**
   - Add these scopes:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `openid`
   - Click **Update** then **Save and Continue**
6. **Test users**: Add your email address for testing
7. Click **Save and Continue**
8. Review and click **Back to Dashboard**

### 1.4 Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. **Application type**: Select **Web application**
4. **Name**: "Daily 1% Web Client"
5. **Authorized JavaScript origins**:
   - Add: `http://localhost:8000`
   - Add: `https://yourdomain.com` (for production)
6. **Authorized redirect URIs**:
   - Add: `https://iifydyhlgintkvwvrjrt.supabase.co/auth/v1/callback`
   - Add: `http://localhost:8000` (for development testing)
7. Click **Create**
8. **Important**: Copy the **Client ID** and **Client Secret** - you'll need these for Supabase

## Step 2: Supabase Configuration

### 2.1 Enable Google Provider
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `iifydyhlgintkvwvrjrt`
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list and click the toggle to enable it
5. Fill in the credentials from Google Cloud Console:
   - **Client ID**: Paste the Client ID from step 1.4
   - **Client Secret**: Paste the Client Secret from step 1.4
6. Click **Save**

### 2.2 Configure Site URL (Production)
1. In Supabase Dashboard, go to **Authentication** → **Settings**
2. **Site URL**: Set to your production domain (e.g., `https://yourdomain.com`)
3. **Redirect URLs**: Add allowed redirect URLs:
   - `http://localhost:8000` (for development)
   - `https://yourdomain.com` (for production)
4. Click **Save**

## Step 3: Test the Integration

### 3.1 Local Testing
1. Ensure your test server is running: `python test-server.py`
2. Open the test dashboard: http://localhost:8000/test-auth.html
3. Click **Test Google Auth Setup** - should show success
4. Click **🔍 Sign in with Google** - should redirect to Google
5. Complete the OAuth flow and verify you're redirected back

### 3.2 Main App Testing
1. Open the main app: http://localhost:8000
2. Click **Sign Up** or **Sign In**
3. Click **Continue with Google** button
4. Complete Google authentication
5. Verify you're signed in and can access authenticated features

## Step 4: Troubleshooting

### Common Issues and Solutions

#### 4.1 "OAuth Error: redirect_uri_mismatch"
**Problem**: The redirect URI doesn't match what's configured in Google Console.
**Solution**: 
- Ensure redirect URI in Google Console exactly matches: `https://iifydyhlgintkvwvrjrt.supabase.co/auth/v1/callback`
- No trailing slashes or extra parameters

#### 4.2 "OAuth Error: invalid_client"
**Problem**: Client ID or Client Secret is incorrect.
**Solution**:
- Double-check Client ID and Secret in Supabase match Google Console exactly
- Regenerate credentials if necessary

#### 4.3 "OAuth Error: access_denied"
**Problem**: User denied access or app isn't approved.
**Solution**:
- For testing, add user email to "Test users" in Google Console
- For production, submit app for verification

#### 4.4 Google Sign-in Button Not Working
**Problem**: JavaScript errors or network issues.
**Solution**:
- Check browser console for JavaScript errors
- Verify Supabase JavaScript client is properly imported
- Ensure internet connection is stable

#### 4.5 "Invalid Scope" Error
**Problem**: Required scopes aren't configured.
**Solution**:
- Ensure these scopes are added in Google Console OAuth consent screen:
  - `../auth/userinfo.email`
  - `../auth/userinfo.profile`
  - `openid`

## Step 5: Production Deployment

### 5.1 Update Redirect URIs
When deploying to production, update these locations:
1. **Google Console**: Add production domain to authorized redirect URIs
2. **Supabase**: Update Site URL and Redirect URLs

### 5.2 App Verification (for Public Apps)
If your app will be used by users outside your organization:
1. In Google Console, go to **OAuth consent screen**
2. Click **Publish App**
3. Submit for verification (required for production use)

## Step 6: Security Best Practices

### 6.1 Environment Variables
Never commit OAuth credentials to version control:
```bash
# .env file (don't commit)
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### 6.2 Scope Limiting
Only request necessary scopes:
- `email`: For user identification
- `profile`: For user name and avatar
- Avoid requesting sensitive scopes unless absolutely necessary

### 6.3 Regular Rotation
- Rotate OAuth credentials periodically
- Monitor OAuth usage in Google Console
- Review and remove unused credentials

## Expected Results

After completing this setup:
- ✅ Google sign-in button appears in auth modal
- ✅ Clicking button redirects to Google OAuth
- ✅ Users can sign in with their Google account
- ✅ User profile is automatically created in Supabase
- ✅ Users can access all authenticated features
- ✅ OAuth flow works on both development and production

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review browser console for JavaScript errors
3. Check Supabase logs in the dashboard
4. Verify all configuration steps were completed exactly as described

## Testing Checklist

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] Google+ API enabled
- [ ] OAuth credentials created
- [ ] Supabase Google provider enabled
- [ ] Redirect URIs match exactly
- [ ] Test authentication flow works
- [ ] User profile created automatically
- [ ] No console errors during sign-in
- [ ] Sign-out works properly
