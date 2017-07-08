// ==UserScript==
// @name         Comment Review Queue
// @namespace    http://tampermonkey.net/
// @version      0.1.3
// @description  Review recent comments posted on the site.
// @author       Aurora0001
// @match        https://*.stackexchange.com/review
// @match        https://stackoverflow.com/review
// @match        https://meta.stackoverflow.com/review
// @match        https://*.superuser.com/review
// @match        https://*.serverfault.com/review
// @match        https://*.askubuntu.com/review
// @match        https://*.stackapps.com/review
// @match        https://*.mathoverflow.net/review
// @downloadURL  https://github.com/TheIoTCrowd/CommentReviewQueue/raw/master/commentreview.user.js
// @updateURL    https://github.com/TheIoTCrowd/CommentReviewQueue/raw/master/commentreview.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var COMMENT_COUNT = 50;

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

    if (document.location.href.indexOf("#/new-comments") !== -1) {
        // Add help in the sidebar
        $(".module.newuser").html("<h4>Review new comments</h4><p>Read recent comments to ensure they are constructive. If no action is needed from you, click 'no further action'.</p><p>Click the username link to view the comment directly.</p>");
        // Remove review items we don't want
        $(".dashboard-item").remove();
        // Add our own review items in
        var recentCommentsList = document.createElement("div");
        // Gets sitename (e.g. cseducators, iot, etc.)
        var siteName = location.host.match(/([a-z]*)(\.meta|\.stackoverflow|\.superuser|\.serverfault|\.askubuntu|\.mathoverflow|\.stackapps)?/)[0];
        $.get("https://api.stackexchange.com/2.2/comments?pagesize="+COMMENT_COUNT+"&order=desc&sort=creation&site="+siteName+"&filter=!40nvjI4KbrMGSBJNR", function(data) {
            var ignoredComments = loadIgnoredComments();
            data.items.forEach(function(item) {
                // If ignored, skip this comment
                if (ignoredComments.indexOf(item.comment_id.toString()) !== -1) {
                    return;
                }

                var commentBlock = document.createElement("div");
                commentBlock.classList += "dashboard-item";

                var commentInner = document.createElement("div");
                commentInner.innerHTML = item.body + " — <a href=" + item.link + ">" + item.owner.display_name + "</a>";
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
    } else {
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
    }
})();
