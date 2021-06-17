const { AuthService } = require('./auth');
const base64url = require('base64-url');

class WebServerService extends AuthService {
    constructor() {
        super();
    }


    generateAuthorizationRequest() {
        // Set parameter values for retrieving authorization code
        let responseType = 'code';
        let scope = 'full%20refresh_token';
        let endpointUrl = this.getAuthorizeEndpoint();

        // Create a state to prevent CSRF
        this.state = Math.floor(Math.random() * 1000);

        // Generate the url to request the authorization code, including parameters
        let authorizationUrl =
            endpointUrl +
            '?client_id=' +
            this.clientId +
            '&redirect_uri=' +
            encodeURI(this.callbackURL) +
            '&response_type=' +
            responseType +
            '&state=' +
            this.state +
            '&scope=' +
            scope;

        return authorizationUrl;
    }

    /**
     * Step 2 Web Server Flow - Get access token using authorization code.
     * Gets launched as part of the callback actions from the first step of the web server flow.
     * This is the second step in the flow where the access token is retrieved by passing the previously
     * obtained authorization code to the token endpoint.
     */
    generateTokenRequest(code) {
        // Set parameter values for retrieving access token
        let grantType = 'authorization_code';
        let endpointUrl = this.getTokenEndpoint();

        // Set the different parameters in the body of the post request
        let paramBody =
            'client_id=' +
            this.clientId +
            '&redirect_uri=' +
            encodeURI(this.callbackURL) +
            '&grant_type=' +
            grantType +
            '&code=' +
            code;


        // Create the full POST request with all required parameters
        return this.createPostRequest(endpointUrl, paramBody);
    }
}

exports.WebServerService = WebServerService;
