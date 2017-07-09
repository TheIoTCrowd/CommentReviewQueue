// ==UserScript==
// @name         Comment Review Queue
// @namespace    https://github.com/TheIoTCrowd/CommentReviewQueue
// @homepage     https://github.com/TheIoTCrowd/CommentReviewQueue
// @version      0.2.2
// @description  Review recent comments posted on the site.
// @author       Aurora0001
// @match        https://*.stackexchange.com/*
// @match        https://stackoverflow.com/*
// @match        https://meta.stackoverflow.com/*
// @match        https://*.superuser.com/*
// @match        https://*.serverfault.com/*
// @match        https://*.askubuntu.com/*
// @match        https://*.stackapps.com/*
// @match        https://*.mathoverflow.net/*
// @downloadURL  https://github.com/TheIoTCrowd/CommentReviewQueue/raw/master/commentreview.user.js
// @updateURL    https://github.com/TheIoTCrowd/CommentReviewQueue/raw/master/commentreview.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var COMMENT_COUNT = 50;
    // Gets sitename (e.g. cseducators, iot, etc.)
    var siteName = location.host.match(/([a-z]*)(\.meta|\.stackoverflow|\.superuser|\.serverfault|\.askubuntu|\.mathoverflow|\.stackapps)?/)[0];

    function storeIgnoredComment(id) {
        var items = localStorage.getItem("ignoredComments") || "";
        var commentIds = items.split(",");
        if (commentIds.length >= 100) {
            // Only store the last 100 comments to save space
            commentIds.sort(function(a, b){return b-a;});
            commentIds.pop();
        }
        commentIds.push(id);
        localStorage.setItem("ignoredComments", commentIds.join(","));
    }

    function loadIgnoredComments() {
        var items = localStorage.getItem("ignoredComments") || "";
        return items.split(",");
    }

    function updateNewCommentsCounter() {
        if (localStorage.getItem("shouldCheck") !== "true") {
            return;
        }
        var UPDATE_TIME = 60 * 45 * 1000; // 45 minutes
        var lastFetch = new Date(localStorage.getItem("lastCommentFetch"));
        if (new Date() > new Date(lastFetch.getTime() + UPDATE_TIME)) {
            $.get("https://api.stackexchange.com/2.2/comments?pagesize=1&order=desc&sort=creation&site="+siteName+"&filter=!9jPV9tT2s", function(data) {
                console.log("Quota Remaining for API Requests: " + data.quota_remaining);
                localStorage.setItem("lastCommentFetch", new Date().toString());
                if (data.items[0].comment_id > parseInt(localStorage.getItem("lastCommentId") || 0)) {
                    localStorage.setItem("commentsNotSeen", "true");
                    localStorage.setItem("lastCommentId", data.items[0].comment_id);
                }
            });
        }
    }

    if (document.location.href.indexOf("/review#/new-comments") !== -1) {
        localStorage.setItem("commentsNotSeen", "false");
        // Add help in the sidebar
        $(".module.newuser").html("<h4>Review new comments</h4><p>Read recent comments to ensure they are constructive. If no action is needed from you, click 'no further action'.</p><p>Click the username link to view the comment directly.</p>");
        // Remove review items we don't want
        $(".dashboard-item").remove();
        // Add our own review items in
        var recentCommentsList = document.createElement("div");
        $.get("https://api.stackexchange.com/2.2/comments?pagesize="+COMMENT_COUNT+"&order=desc&sort=creation&site="+siteName+"&filter=!40nvjI4KbrMGSBJNR", function(data) {
            var ignoredComments = loadIgnoredComments();
            data.items.forEach(function(item) {
                // If ignored, skip this comment
                if (item.owner.user_type === "moderator" || item.owner.user_id === StackExchange.options.user.userId || ignoredComments.indexOf(item.comment_id.toString()) !== -1) {
                    return;
                }

                var commentBlock = document.createElement("div");
                commentBlock.classList += "dashboard-item";

                var commentInner = document.createElement("div");
                commentInner.innerHTML = item.body + " — <a href=" + item.link + ">" + item.owner.display_name + '</a>&nbsp;<span class="reputation-score" title="reputation score " dir="ltr">'+item.owner.reputation+'</span>';
                $(commentBlock).append(commentInner);
                var commentOpts = document.createElement("button");
                commentOpts.innerText = "no further action";
                commentOpts.onclick = function() {
                    storeIgnoredComment(item.comment_id);
                    $(commentBlock).fadeOut();
                };
                $(commentBlock).append(commentOpts);
                $(recentCommentsList).append(commentBlock);
            });
            $("#mainbar").append(recentCommentsList);
            $("#mainbar").append('<br /><span class="vote-accepted-on fl">accept</span><h1>&nbsp;No more comments to review!</h1>');
        });
    } else if (document.location.href.endsWith("/review")) {
        var commentReview = document.createElement("div");
        commentReview.classList += "dashboard-item";
        commentReview.innerHTML = `<div class="dashboard-count">
</div>
<div class="dashboard-summary">
<div class="dashboard-title">
<a onclick="window.location.href='#/new-comments'; window.location.reload()">New Comments</a>
</div>
<div class="dashboard-description">
Review, flag or delete recent comments
</div>
</div>


<div class="dashboard-activity">
</div>
<br class="cbt">`
        $("#mainbar").append(commentReview);
        var checkBox = document.createElement("input");
        checkBox.setAttribute("type", "checkbox");
        checkBox.onclick = function(data) {
            localStorage.setItem("shouldCheck", document.getElementById("checkBox").checked.toString());
        };
        checkBox.checked = localStorage.getItem("shouldCheck") === "true" || false;
        checkBox.id = "checkBox";
        $("#mainbar").append(checkBox);
        $("#mainbar").append("<span>Check for new comments and modify review icon</span>");
    }

    updateNewCommentsCounter();
    if (localStorage.getItem("commentsNotSeen") == "true") {
        $('a[title="Review queues - help improve the site"]').text("review (comments)");
    }
    
    
})();
