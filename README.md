# CM Integration
This is a plugin implementation for [the `bot-builder`](https://github.com/bensbigolbeard/bot-builder). These are the current exported commands:

 - `/wtfaq` - returns answers for FAQ. includes discord autocomplete integration to handle large numbers of faqs
 - `/swipe_mugshot` - retrieves images and metadata by token ID
 - `/did_ricardo_drink_my_wine` - returns redemption status of ToiletWine tokens

## Adding additional FAQ entries
All that's required to add an entry to the FAQ is to add an object to the array in `faq-questions.js` in this format:
```js
  {
    name: "Some Question",
    category: "Some FAQ grouping",
    value: "Some answer."
  }
```
While the `category` field can be populated with any string, there is a `CATEGORIES` mapping in `faq-questions.js` to help keep the values consistent and easy to maintain.

