function extendedaccess() {
    const authURL = "https://login.irishexaminer.com/authorize?response_type=code" +
      "&client_id=c2qxCJJgybC9yXH1bbw2xSDzZyCPtcQU&scope=SCOPE&state=STATE&connection=google-oauth2" +
      "&redirect_uri=" + encodeURIComponent(parent.window.location.origin +
        "/login-redirect/?returnUrl=" + encodeURIComponent(parent.window.location.href))

    const allowedReferrers = [
        "https://dev-iec1.irishexaminer.com",
        "https://test.irishexaminer.com",
        "https://prelive.irishexaminer.com",
        "https://www.irishexaminer.com"
    ];

    /**
     * Constructs the userState object for checking entitlements
     */
    function getUserState() {
        if (isUserLoggedIn()) {
            if (isArticleFree() || hasMeterAccess()) {
                return {
                    id: getUserID(),
                    registrationTimestamp: getUserRegistrationTime(),
                    granted: true,
                    grantReason: 'METERING'
                }
            }
            else if (isUserSubscriber()) {
                return {
                    id: getUserID(),
                    registrationTimestamp: getUserRegistrationTime(),
                    subscriptionTimestamp: getUserRegistrationTime(),
                    granted: true,
                    grantReason: 'SUBSCRIBER'
                }
            }
            else{
                return {
                    id: getUserID(),
                    registrationTimestamp: getUserRegistrationTime(),
                    granted: false
                }
            }
        }
        else if(isArticleFree() || hasMeterAccess()){
            return {
                granted: true,
                grantReason: 'METERING'
            }
        }
        else{
            return {
                granted: false
            }
        }
    }

    /**
     * Checks if the user is currently logged in
     * @returns {boolean}
     */
    function isUserLoggedIn() {
        return Connext.Storage.GetUserState() !== 'Logged Out';
    }

    /**
     * Gets the user ID from the Connext object
     * @returns {string|*}
     */
    function getUserID() {
        return 'user' + Connext.Storage.GetUserData().MasterId.split('|')[1];
    }

    /**
     * Return the time the user account was created at in the form of a timestamp.
     * @returns {number}
     */
    function getUserRegistrationTime() {
        let user = Connext.Storage.GetUserProfile();
        if ( user !== undefined ) {
            return Math.floor(new Date(user['https://example.io/claims/created_at']).getTime() / 1000);
        }
    }

    /**
     * Checks if the article has the paywall enabled
     * @returns {boolean}
     */
    function isArticleFree() {
        return !IE.isPaywall
    }

    /**
     * Checks if the user has remaining articles to read according to the meter
     * @returns {boolean}
     */
    function hasMeterAccess() {
        return Connext.Storage.GetArticlesLeft() !== 0;
    }

    /**
     * Checks if the user has access through their subscription
     * @returns {boolean}
     */
    function isUserSubscriber() {
        return Connext.Storage.GetUserState() === 'Subscribed'
    }

    /**
     * Disables the paywall
     */
    function unlockArticle() {
        window.IE = {isPaywall: false};
        Connext.Run();
    }

    function showPaywall() {
        console.log("Show paywall");
    }

    handleLoginPromise = new Promise(() => {
        GaaMetering.getLoginPromise().then(() => {
            document.getElementById('MG2login').click();
        });
    });

    // return the userState for the current user.
    publisherEntitlementPromise = new Promise((resolve) => {
        resolve(getUserState());
    });

    GaaMetering.init({
        authorizationUrl: authURL,
        allowedReferrers: allowedReferrers,
        userState: getUserState(),
        unlockArticle: unlockArticle,
        showPaywall: showPaywall,
        handleLoginPromise: handleLoginPromise,
        publisherEntitlementPromise: publisherEntitlementPromise
    });
}