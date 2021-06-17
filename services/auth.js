
class AuthService {
    constructor() {
        this.clientId = process.env.CLIENT_ID;
        this.clientSecret = process.env.CLIENT_SECRET;
        this.callbackURL = process.env.CALLBACK_URL;
        this.state = '';
        this.apiVersion = 'v45.0';
    }

    /**
     * Return the base URL for sending any HTTP requests to
     */
    getBaseUrl() {
        return 'https://login.salesforce.com/';
    }

    /**
     * Return the Authorization Endpoint for the set base URL
     */
    getAuthorizeEndpoint() {
        return this.getBaseUrl() + '/services/oauth2/authorize';
    }

    /**
     * Return the Token Endpoint for the set base URL
     * @returns The token endpoint URL
     */
    getTokenEndpoint() {
        return this.getBaseUrl() + '/services/oauth2/token';
    }


    // TODO: find a more elegant way of managing the callback.
    // There are 4 types of results: error returned, access token received, access token & refresh token received, redirect required.
    processCallback(remoteBody) {
        return this.parseResults(remoteBody);
    }

    parseResults(remoteBody) {
        let error;
        let accessTokenHeader;
        let refreshToken;

        // Retrieve the response and store in JSON object
        let salesforceResponse = JSON.parse(remoteBody);

        // Parse specific parts of the response and store in variables
        let accessToken = salesforceResponse.access_token;
        refreshToken = salesforceResponse.refresh_token;

        console.log('AT: ' + accessToken);

        // For correct (or blank) signatures, check if access token is present
        if (accessToken) {
            // If access token is present, we redirect to queryresult page with some cookies.
            accessTokenHeader = {
                Location: 'queryresult',
                'Set-Cookie': [
                    'AccToken=' + accessToken,
                    'APIVer=' + this.apiVersion,
                    'InstURL=' + salesforceResponse.instance_url,
                    'idURL=' + salesforceResponse.id,
                ],
            };
        } else {
            // If no access token is present, something went wrong
            error = 'An error occurred. For more details, see the response from Salesforce: ' + remoteBody;
        }
        return { error, accessTokenHeader, refreshToken };
    }
}

exports.AuthService = AuthService;
