# CigarPage Multi-Filter

A userscript that adds a floating filter panel to [cigarpage.com](https://www.cigarpage.com).

## Features

- Filter products by **price**, **gauge**, **length**, **brand**, and **packaging**
- Toggle to **hide sold-out** items
- **Alphabetize** products by brand, then title
- **One-click expand** of product details
- **Cart-discounted prices** swaps the listed prices for the real cart prices
  (original struck through, cart price in bold purple)
- Sub-brands fold into their parent houses (e.g. ACID, Deadwood → Drew Estate)
- Right-click a brand to **focus** (preview) or **purge** it permanently
- Settings persist between visits

## Install

1. Install [Violentmonkey](https://violentmonkey.github.io/), [Tampermonkey](https://www.tampermonkey.net/), or other userscript manager of your preference.
2. Open the [raw userscript](https://github.com/shmshka/cigarpage-multifilter-userscript/raw/main/cigarpage-filter.user.js) and click **Install**.

## Usage

A floating panel now appears in the
bottom-right corner of any cigarpage.com listing. Drag it, resize the panel
font, and toggle filters to taste.


## Secret-sale prices (decoded)

CigarPage's "secret sales" only reveal the real discount once an item is in the
cart. The panel shows
a **"Replace prices with cart-discounted prices."** button. Clicking it strikes
through the listed price and inserts the real cart price in bold purple;
clicking again restores the page.

The button appears only when the current has been decoded and saved in this Github repo.
You don't have to do anything for this to work; it just works.
Each `decoded/<page>.txt` file is plain, tab-delimited
text — `Name | Pack | Page $ | Discount % | Cart $` — with the source URL and
capture date in `#` header comments.


## Walkthrough Infographics
<details>
<summary>Click to Expand...</summary>
    
1. **Introduction** — the floating panel appears in the corner.

   ![Introduction](infographic/01-intro.png)

2. **Filtering** — the **Brand** and **General** tabs narrow the list to what you want.

   ![Filtering](infographic/02-filtering.png)

3. **Before & after** — uncheck a brand and the list updates instantly.

   ![Before and after](infographic/03-before-after.png)

4. **Extras** — right-click a brand to focus or hide it, and expand details in place.

   ![Extras](infographic/04-extras.png)

</details>
   
## Buy Me A ~~Coffee~~ <bold>Smoke</bold> *<sup>(only if you feel like it)</sup>*
[![Donate](https://img.shields.io/badge/Donate-PayPal-00457C?logo=paypal&logoColor=white&style=for-the-badge)](https://www.paypal.me/shmshka)  
<sub>*[paypal.me/shmshka](https://www.paypal.me/shmshka)*</sub>
