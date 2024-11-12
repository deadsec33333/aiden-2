const tag_defaults = {
    'user.category.first_to_know': {
        accept: 'YES',
        reject: 'NO'
    },
    'user.category.sport_news': {
        accept: 'YES',
        reject: 'NO'
    }
}

// makes sure the tags object is configured
function initData() {
    // if tags object doesn't exist, create it using what we know already
    if (localStorage.getItem('xtremepush.tags') === null) {
        let category = 'user.category.first_to_know';
        let value = Notification.permission === "granted" ? tag_defaults[category].accept : tag_defaults[category].reject;
        let last_updated = localStorage.getItem('xp_prompt_dismissal') ?? 0;

        updateData(category, value, last_updated);
    }
}

// updates tags & attributes
function updateData(category, value, time = Date.now()) {
    updateTag(category, value, time);
    updateSegment(category, value);
}

// updates the value of a given tag
function updateTag(key, value, time) {
    let tags = getTags() ?? {};

    tags[key] = {
        value: value, 
        last_updated: time
    };

    setTags(tags);
}

// returns a JSON object containing xtremepush tag data 
function getTags() {    
    return JSON.parse(localStorage.getItem('xtremepush.tags'));
}

// sets a JSON object in local storage containing xtremepush tag data
function setTags(tags) {
    localStorage.setItem('xtremepush.tags', JSON.stringify(tags));
}

// sends tag to xtremepush updating user attribute for use in audience segments
function updateSegment(key, value){
    xtremepush('tag', key, value);
}

// determine if the popup prompt should be shown to the user
function triggerPopupPrompt() {
    let xp = JSON.parse(localStorage.getItem('xtremepush.data'));
    let tags = getTags();
    let category = "user.category.first_to_know";

    // users on their 10th pageview or every 50th pageview thereafter
    if (xp.page_views === 10 || xp.page_views % 50 === 0) {
        
        // prompt users if they haven't granted permission before or rejected more than 30 days ago
        if (typeof tags[category] === "undefined" || (tags[category].value !== tag_defaults[category].accept && 
            tags[category].last_updated < (Date.now() - (30 * 24 * 60 * 60 * 1000)))) {
            displayPopupPrompt(category);
        }
    }
}

// displays a popup prompt with specific styling for different categories
function displayPopupPrompt(category) {
    let title = '<span style="background-image:url(https://www.irishexaminer.com/pu_examiner/images/Irish_Examiner_logo.png);margin:10px auto 5px;background-size:contain;background-repeat:no-repeat;background-position:50%;min-height:25px;width:200px;display: block;"></span>';
    let html = '<style>.webpush-swal2-popup .webpush-swal2-styled.webpush-swal2-confirm,.webpush-swal2-popup .webpush-swal2-styled.webpush-swal2-cancel{padding:.25rem 1rem;line-height:1.5;border-radius:.2rem;color:#fff;margin:0 5px 8px;width:180px}.webpush-swal2-popup .webpush-swal2-styled.webpush-swal2-cancel{background:#6c757d!important;border-color:#6c757d!important;}@media (max-width: 575px){.webpush-swal2-popup .webpush-swal2-styled.webpush-swal2-confirm,.webpush-swal2-popup .webpush-swal2-styled.webpush-swal2-cancel{max-width: 120px;}}</style></style><span style="color: #111; font-size: 18px;">Sign up to notifications and be the first to know about unique Irish Examiner journalism and initiatives</span>';
    let confirmButtonColor = "#d93b0d";
    
    webpushSwal({
        title: title,
        html: html,
        allowOutsideClick: true,
        showCancelButton: true,
        reverseButtons: true,
        cancelButtonText: '<span style="font-size: .875rem; color: #fff;">Not now</span>',
        confirmButtonText: '<span style="font-size: .875rem; color: #fff;">Count me in</span>',
        confirmButtonColor: confirmButtonColor,
        showCloseButton: true,
        width: 400,
        padding: 7,
    }).then(function(result) { 
        handlePromptResponse(category, result.value);
    });
}

// handles the prompt response
function handlePromptResponse(category, response){    
    // user accepted prompt
    if (response){
        // check first that browser settings allow notifications
        if (Notification.permission !== "granted"){
            // if they don't, display a 2nd prompt for browser settings change
            xtremepush('push', 'prompt', {
                // if 2nd prompted is accepted, record result and add user to segment
                allowCallback: function() {
                    updateData(category, tag_defaults[category].accept);
                },
                denyCallback: function () {
                    updateData(category, tag_defaults[category].reject);
                },
                dismissCallback: function () {
                    updateData(category, tag_defaults[category].reject);
                }
            });
        }
        else {
            updateData(category, tag_defaults[category].accept);
        }
    }
    else{
        updateData(category, tag_defaults[category].reject);
    }
}

// sets preferences 
function loadPreferences(){
    if (window.location.pathname.includes("push-preferences")) {
        const preferences = document.getElementById("push-preferences");

        Object.entries(getTags()).forEach(([key,value]) => {
            preferences.elements[key].checked = (tag_defaults[key].accept === value.value);
        });
    }
}