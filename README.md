# CM Integration
This is a plugin implementation for [the `bot-builder`](https://github.com/bensbigolbeard/bot-builder). These are the current exported commands:

 - `/wtfaq` - returns answers for FAQ. includes discord autocomplete integration to handle large numbers of faqs
 - `/add_wtfaq_entry` - allows for adding new FAQ questions without the need for a redeploy
 - `/swipe_mugshot` - retrieves images and metadata by token ID
 - `/did_ricardo_drink_my_wine` - returns redemption status of ToiletWine tokens
 - `/hang_most_wanted_poster` - upload new burn chances image
 - `/read_most_wanted_poster` - pull latest burn chances image

## Retrieving current list of FAQ entries
Since the storage of FAQ entries is fairly naive right now (simply updating a local file), installing a new version of this package would revert the FAQ to the original set of questions, wiping out any questions added through the command.

For now, there is an api endpoint (`/api/wtfaqs`) to retrieve the current contents of the FAQ file, so that the contents are not lost and can be included in the next publish of the module. A workflow will be set up to fetch this file and commit any changes, then trigger a publish.


