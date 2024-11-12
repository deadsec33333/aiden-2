scriptLoadedNaviga.then(function(){
    window.MG2Loader = {}

    var loginButton = $("#MG2login");
    var logoutButton = $("#MG2logout");
    var myAccountButton = $("#MG2MyAccount");
    var subscribeButton = $("#MG2Subscribe");
    var myAccountButtonMobile = $(".MG2MyAccount");
    var subscribeButtonMobile = $(".MG2Subscribe");
    var subscribeButtonMobileNav = $(".MG2SubscribeMobile");
    var emailName = $("a.navbar-email");
    var emailNameMobile = $("a.navbar-email-mobile");

    //Generate GUID for session id. Used for troubleshooting
    var sessionId = (function() {
        var generatePart = function() {
            return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1)
        }
        return generatePart() + generatePart() + generatePart() + generatePart() + generatePart() + generatePart() + generatePart() + generatePart();
    })();

    //Function wrapping plugin initalization. Accepts plugin name(string) and initialization settings object. Returns promise
    var initializePlugin = function (pluginName, initSettings) {
        try {
            var plugin = window[pluginName];
            if(!plugin) {
                throw new Error(pluginName + " object not found");
            }
            var initResult = plugin.init(initSettings);
            return initResult && initResult.then ? initResult : Promise.resolve(true);
        } catch(e) {
            return Promise.reject(e.message);
        }
    };

    //Initialization of the plugins in the right order. Init settings from original init script splitted between plugins
    initializePlugin("Fingerprint", {
        version: "itex",
        siteCode: "IE",
        environment: "prod",
        resourceUrl: window.location.origin,
        sessionId: sessionId
    })
        .then(function() {
            return initializePlugin("G2Insights", {
                environment: "prod",
                version: "itex",
                collectors: ["connext"],
                tagManager: "GTM",
                containerId: "GTM-MZXX4DD",
                layoutCode: "IE",
                siteCode: "IE",
                resourceUrl: window.location.origin,
                sessionId: sessionId
            });
        })
        .then(function() {
            return initializePlugin("Connext", {
                clientCode: "itex",
                environment: "prod",
                siteCode: "IE",
                configCode: "IEConfig",
                debug: false,
                silentmode: false,
                resourceUrl: window.location.origin,
                sessionId: sessionId,
                authSettings: {
                    domain: "login.irishexaminer.com",
                    client_id: "c2qxCJJgybC9yXH1bbw2xSDzZyCPtcQU",
                    redirect_uri: window.location.origin + "/login-redirect/"
                },
                publicEventHandlers: {}
            });
        })
        .catch(function(err) {
            console.error(err);
        });


    // Update buttons after user login/logout events (without page reload)
    document.addEventListener("onNotAuthorized", function () {
        loginButton.show();
        subscribeButton.show();
        myAccountButton.hide();
        subscribeButtonMobile.show();
        subscribeButtonMobileNav.show();
        myAccountButtonMobile.hide();
        logoutButton.hide();
        emailName.hide();
        emailNameMobile.hide();
    });

    document.addEventListener("onAuthorized", function () {
        loginButton.hide();
        subscribeButton.show();
        myAccountButton.hide();
        subscribeButtonMobile.show();
        subscribeButtonMobileNav.show();
        myAccountButtonMobile.hide();
        logoutButton.show();
        emailName.show();
        emailNameMobile.show();
    });

    document.addEventListener("onHasNoActiveSubscription", function () {
        loginButton.hide();
        subscribeButton.show();
        myAccountButton.hide();
        subscribeButtonMobile.show();
        subscribeButtonMobileNav.show();
        myAccountButtonMobile.hide();
        logoutButton.show();
        emailName.show();
        emailNameMobile.show();
    });

    document.addEventListener("onHasAccessNotEntitled", function () {
        loginButton.hide();
        subscribeButton.hide();
        myAccountButton.show();
        subscribeButtonMobile.hide();
        subscribeButtonMobileNav.hide();
        myAccountButtonMobile.show();
        logoutButton.show();
        emailName.show();
        emailNameMobile.show();
    });

    document.addEventListener("onHasAccess", function () {
        loginButton.hide();
        subscribeButton.hide();
        myAccountButton.show();
        subscribeButtonMobile.hide();
        subscribeButtonMobileNav.hide();
        myAccountButtonMobile.show();
        logoutButton.show();
        emailName.show();
        emailNameMobile.show();
    });

    document.addEventListener("onFinish", function () {
        if (window.location.pathname == "/resetpassword") {
            Connext.OpenResetPasswordForm();
        }

        var emailNaviga = Connext.Storage.GetUserData().Email;

        if (typeof emailNaviga !== 'undefined') {
            var emailDisplay = document.getElementsByClassName("navbar-email")[0];
            var emailDisplayMobile = document.getElementsByClassName("navbar-email-mobile")[0];
            emailDisplay.innerHTML = emailNaviga;
            emailDisplayMobile.innerHTML = emailNaviga;
        }

        if (window.location.pathname.includes('gaa/') && Connext.Storage.GetUserState() !== 'Subscribed') {
            new Image().src = 'https://pubads.g.doubleclick.net/activity;dc_iu=/2695176/DFPAudiencePixel;ord=' + Math.floor(Math.random() * 10000000000000000) + ';dc_seg=6828871329?';
        }
    });
});