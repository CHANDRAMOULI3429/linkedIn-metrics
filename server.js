const express = require('express');
const axios = require('axios');
const app = express();

// Use environment variables for security
const clientId = process.env.CLIENT_ID || '78ij1crwf9emwe'; // Your LinkedIn client ID
const clientSecret = process.env.CLIENT_SECRET || 'WPL_AP1.tln4doBmmCLUbpSJ.X/eeyA=='; // Your LinkedIn client secret
const redirectUri = process.env.REDIRECT_URI || 'https://superb-curse-decade.glitch.me/auth/callback'; // Your Glitch URL

// Function to generate a random state string
const generateState = () => {
    return Math.random().toString(36).substring(2, 15);
};

// Step 1: Redirect user to LinkedIn for authentication
app.get('/auth/linkedin', (req, res) => {
    const state = generateState(); // Generate a random state
    console.log(`Generated state: ${state}`); // Log the state
    const authURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&scope=openid%20profile%20email%20r_ads%20r_organization_social%20rw_organization_admin%20w_member_social%20r_ads_reporting%20r_liteprofile%20r_emailaddress&state=${state}&redirect_uri=${redirectUri}`;
    res.redirect(authURL);
});

// Step 2: LinkedIn redirects here after successful login
app.get('/auth/callback', async (req, res) => {
    const code = req.query.code;
    const state = req.query.state; // Capture the state returned by LinkedIn

    // Optional: Validate state here

    try {
        // Step 3: Exchange authorization code for access token
        const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
            params: {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
                client_id: clientId,
                client_secret: clientSecret,
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const accessToken = tokenResponse.data.access_token;

        // Step 4: Fetch user profile data using access token
        const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        // Example: Fetching connection metrics
        const connectionsResponse = await axios.get('https://api.linkedin.com/v2/connections?q=viewer&projection=(elements*(to~))', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        // Combine responses
        const responseData = {
            profile: profileResponse.data,
            connections: connectionsResponse.data,
        };

        // Step 5: Return the profile data and connections as response
        res.json(responseData);
    } catch (error) {
        console.error('Error exchanging authorization code for access token:', error);
        res.status(500).json({ message: 'Failed to fetch LinkedIn data', error: error.message });
    }
});

// Start the server
const port = process.env.PORT || 3001; // Changed port to 3001
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
