# CommentReviewQueue
A review queue for comments on Stack Exchange sites
## Usage

- A new review task will be added to `/review` on all Stack Exchange sites called "New Comments". Click this to review new comments.
- For new comments, you may choose to either **dismiss** the comment by clicking 'no further action', or take further action by clicking the comment link.
- Recently dismissed comments will not be shown to you again.
- If you click 'Check for new comments and modify review icon' at the bottom of `/review`, the script will poll for new comments (by default every 45 minutes) and modify the review icon if there are comments waiting for review.

## Notes
- The last 50 comments will be fetched from the API. The `COMMENT_COUNT` variable can be changed if a larger page size is needed.
- Moderator comments will not be shown in the review queue (they're trusted to post appropriate comments only!)
