
![[::start]]
# Implementation
## Chosing your cookie types

First, you'll need to decide what types of cookies your site will ask the user to approve of.
If you like, you can just make one cookie type called "All". This is the simplest and quickest,
but users may opt out cookies important for the function of the site because they don't want
the tracking cookies.

Ideally you may want to use the three types: Functionality, Performance, and Marketing.

1. Add Google Tag Manager to site.
```js
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-xxxxxxxx');</script>
```
2. Determine which scripts will cause cookies to be set
3. Categorize the scripts into functional, performance, and marketing, or whatever categories you've chosen.
4. Move scripts which use cookies to GTM
An example would be html which includes the power reviews script.

```html
<script type="text/javascript" src="https://spam.hormelstaging.com/wp-content/themes/spam-theme/inc/assets/js/custom/power-reviews.js?ver=6.5.4" id="custom-power-reviews-js-js"></script>
```

In some cases, scripts will be added to the site by plugins which can not be directly altered. In these cases, at least for WordPress, 
these scripts can be remove from the page before it is rendered by adding code like the following to the theme's `functions.php` file.

```php
function remove_cookie_producing_scripts() {
        wp_dequeue_script( 'ssba-sharethis' );
}
add_action( 'wp_print_scripts', 'remove_cookie_producing_scripts', 100 );
```

The above code is hooking into the script addition process at the very end (thus the place 100), and dequeueing a script which
had been added by an earlier code.


5. Move any initialization code for those scripts into GTM.

And exmpale of this might be the power reviews initialization code:

```js
PowerReviewsCustom.init();
```

6. (optional) Move css which is only useful when the scripts run to GTM.
An example would be:

```html
<link rel='stylesheet' id='custom-power-reviews-css-css' href='https://spam.hormelstaging.com/wp-content/themes/spam-theme/inc/assets/css/custom/reviews.css?ver=6.5.4' type='text/css' media='all' />
```


7. Add styles which disable visual components which should not be displayed until a certain type of cookie is accpeted.


Accepting cookies will cause classes to be added to the `body` element. Each class will have a name in the format
`allowed-cookies-${cookieType}` like `allowed-cookies-functional`.

An example of the changes needed might be for power reviews, the "write a review" link, which shouldn't
be shown unless power reviews is enabled. CSS should be added like:

```css
.write-review-btn {
	display: none;
}

.allowed-cookies-functional {
	.write-review-btn {
		display: inline-block;
	}
}
```

8. Alternative method of cookie causing script inclusion

If moving the styles and scripts directly to GTM is impossible or just unpalatable, it's possible to include elements directly
on the page which have their effects deferred until the user has accepted a certain type of cookie.


```html
        <!-- Contents of this template are only added to the page if the user has accepted the type of cookie specified in the attribute data-allowed-cookie-type. -->
	<template data-allowed-cookie-type="marketing">
		<link rel="stylesheet" href="/css/test2.css" />
	</template>
```

In this setup, the code to be included in the page must be in a template element and the value of the `data-allowed-cookies` attribute
must be the type of cookie the user must accept. The content in the template will be added to the parent of the template element.

Templates are great because you can but any valid HTML you want in there and the page won't include it automatically. That allows
for substantial cookie causing code to be included.

```html
	<style>
		.thing-that-should-only-display-if-a-particular-cookie-type-is-accepted {
			display: none;
		}
	</style>
        <!-- Contents of this template are only added to the page if the user has accepted the type of cookie specified in the attribute data-allowed-cookie-type. -->
	<template data-allowed-cookie-type="marketing">
		<link rel="stylesheet" href="/css/test2.css" />
		<script src="/js/marketing-tracker.js"></script>
		<script>
			// do something there which would produce a cookie
		</script>
		<style>
			.thing-that-should-only-display-if-a-particular-cookie-type-is-accepted {
				display: block;
			}
		</style>
	</template>
```

## GTM Implementation

1. Create a tag which loads the GDPR code. This will fire on all page loads.


```html
<script type="module" src="https://gdpr.hormel.com/js/gdpr-2026.js" ></script>
```

Alternatively, if you want to specify different cookie types:

```html
<script>
	window.gdprOptions = {

		// A list of the cookies the user will be asked to accept or decline
		cookieTypes: [
			{
				name: "all",
				label: "All Cookies"
			}
		]
	}
</script>
<script type="module" src="https://gdpr.hormel.com/js/gdpr-2026.js" ></script>
```

If you want to specify more of the text which is used, the full set of options is:

```html
<script>
	// The text used to populate the covering bar at the bottom which is shown until a user accepts or declines 
	var cookieText = '<div class="msg"><span class="softwrap">We use cookies to ensure that we give you the best experience on our website. This includes cookies from third party entities such as social media and advertisers. Such third party cookies may be used to track your website use. By continuing to use the site, you agree to the use of cookies as described in our <a href="/privacy-policy">Cookie Policy</a>. If you wish to know more about cookie use and removing cookies, please visit our Privacy Information page. Please note that parts of this site may not function correctly if you disable all cookies.</span></div>' 

	window.gdprOptions = {

		// A list of the cookies the user will be asked to accept or decline
		cookieTypes: [
			{
				name: "all",
				label: "All Cookies"
			}
		]
	
		// If true, the code will add some basic styles to locate the gdpr prompt, dialog, and icons.
		, addStyles: true
		// The URL of the privacy policy
		, cookiePolicyUrl: '/privacy-policy'
		
		// The text used to populate the covering bar at the bottom which is shown until a user accepts or declines
		, cookieText: cookieText
		
		// html for the cookie indicator, the little icon in the lower righthand cornder. It is probably not necessary to change this.
		, cookieIndicator: '<div class="cookie-indicator">' +	'<img class="accepted" src="https://gdpr.hormel.com/img/cookies-accepted.png" title="You are opted in to our cookies - click to change"/><img title="You are opted out of our cookies - click to change" class="declined" src="https://gdpr.hormel.com/img/cookies-declined.png" />' + '</div>'
		
		// html which is used to populate the description in the dialog allowing users to select cookie types
		, dialogText: '<p>Choose the types of cookies to select below:</p>'
		
		, globalPrivacyDialogText: `<p>You've got your global privacy permissions set to disallow all cookies.</p>`
		
	}
</script>
<script type="module" src="https://gdpr.hormel.com/js/gdpr-2026.js" ></script>
```

2. Create Google Tag Manager (GTM) Variables



3. Create triggers for each of the cookie types. 

The prefix for event names will always be `accept-cookies-`. The event names will always be of the pattern
`accept-cookies-{cookie-types-name}`. These are based on the names of the window.gdprOptions.cookieTypes types configured (as above). So, if a functional cookie
has the name `functional`, like in
```js
			{
				name: "functional",
				label: "Functional Cookies"
			}
```
the event name will be `accept-cookies-functional`.

This will look like:

Name - User Accepts Functional Cookies
Event Name - accept-cookies-functional
Trigger fires on - All Custom Events

Name - User Accepts Performance Cookies
Event Name - accept-cookies-performance
Trigger fires on - All Custom Events

Name - User Accepts Marketing Cookies
Event Name - accept-cookies-marketing
Trigger fires on - All Custom Events

Additionally, each event sets a data layer variable which is usable by GTM triggers and tags. Each variable has
the same name Data Layer Variable Name as the event name like `accept-cookies-{cookie-types-name}` that is `accept-cookies-functional`.
To use this in GTM, you will have to go to the Variables tab in the GTM console and create a new data variable of the Data Layer Variable type
with the Data Layer Variable Name set to something like `accept-cookies-functional`.

These variables can now be used in triggers that are based on user triggered events like clicks which should only be run
if the user has accepted a certain type of cookie.




![[::end]]