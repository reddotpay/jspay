# Red Dot Payment Javascript Pay [Modal]

Allows the Red Dot Payment (RDP) hosted payment and card capture page to be embedded to an HTML page.

## Limitation

- Supports ONLY modern browsers (Google Chrome, Firefox, Microsoft Edge, Safari, Opera). To validate the end-users browsers, [outdatedbrowser.com](http://outdatedbrowser.com/en/how) offers a library.
- The domain has to be registered in by the merchant to Red Dot Payment (Content Security Policy)[https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP].

## Demo

- [Modal Example](https://reddotpay.github.io/jspay/example-modal.html)
- [Always-open Example](https://reddotpay.github.io/jspay/example-persistent.html)

## Usage

### RDP.domain

Default: _https://connect2.api.reddotpay.sg_

Defines the Red Dot Payment's Connect2 API domain name. To switch to production, set to `https://connect2.api.reddotpay.com`

### RDP.auth(clientKey, clientSecret)

API: _POST /v1/authenticate_

(Async) Authenticates the requester.

#### Request

Parameter    | Type   | Description
---          | ---    | ---
__clientKey__    | string | _client key_ issued by _connect2_
__clientSecret__ | string | _client secret_ issued by _connect2_ associated to the _client key_

#### Response

Parameter        | Description
---              | ---
__accessToken__  | used in authenticating payment transaction

### RDP.pay(accessToken, orderID, merchantID, amount, currency, options)

API: _POST /v1/payments/token/{merchantID}_

(Async) Generates a payment page URL.

#### Request

Parameter              | Type          | Description
---                    | ---           | ---
__accessToken__        | string        | `accessToken` aquired from __RDP.auth()__
__orderID__            | string        | merchant reference ID. must be `[A-Za-z0-9\-]{16,100}`
__merchantID__         | string        | _merchant ID_ acquired from _connect2_
__amount__             | number,double | item's cost
__currency__           | string        | currency of the item's cost
__options__            | object        | other details to be saved as part of the transaction
__options[returnUrl]__ | string        | URL to be triggered when the `cancel` or `return to merchant` button is clicked

#### Response

Parameter     | Description
---           | ---
__pageId__    | unique ID for the payment page template
__pageURI__   | hosted payment page URL
__token__     | JWT token for the payment page. The format will be _/m/{merchantID}#/pay/{token}_. This is not normally used as `pageURI` is good enough.

### RDP.modal.init([cssPath])

Initializes the modal window. `cssPath` will be used in for the window. Default is `modal.css3.css`.

### RDP.initMessageEvent({"closemessage": fn(), "statusmessage": fn(), "redirectmessage": fn()})

Attaches an message event listener to the modal

Function            | Description
---                 | ---
__closemessage__    | triggers when the `close` or `cancel` button in the modal is clicked
__statusmessage__   | triggers when the `back to merchant` button in the modal is clicked
__redirectmessage__ | when the `options[returnUrl]` is provided, triggers when the `back to merchant` button in the modal is clicked

### RDP.modal.pay(accessToken, orderID, merchantID, amount, currency, options)

(Async) Same parameters as __RDP.pay__. This loads the `pageURI` in the modal.

## Examples

### Modal

Enables the payment page to be loaded into the same webpage for a more seemless experience.

CSS for spinners
```html
    <!-- Specify a spinner (preloader) style -->
    <link rel="stylesheet" type="text/css" media="screen,print" href="https://reddotpay.github.io/jspay/modal.loader2.css3.css">
```

Payment button will be;
```html
    <button type="button" id="pay">Pay</button>
```

And, don't forget the library
```html
    <script src="https://reddotpay.github.io/jspay/src/jspay.js"></script>
```

Basic browser-to-server installation usage
```javascript
  // You can overwrite the base CSS file:
  // RDP.modal.init('https://myowndomain.com/assets/modal.css3.css');
  let modal = RDP.modal.init();
  
  // To switch to PRODUCTION:
  // RDP.domain = 'https://connect2.api.reddotpay.com';

  // Adding events 
  RDP.initMessageEvent({
      'closemessage': () => {
        // will be triggered when the close/cancel button is clicked
        // when omitted, `modal.close()` is executed
        modal.close();
      },
      'statusmessage': (status) => {
        // trigged when the payment gateway to receive a transaction status and the `returnUrl` is empty
        // alternatively, RDP.domain + '/v1/payments/token/{merchantId}/status/{orderId}' to pull the
        // payment status
      },
      'redirectmessage': (status) => {
        // trigged when the payment gateway to receive a transaction status and the `returnUrl` is provided
        // alternatively, RDP.domain + '/v1/payments/token/{merchantId}/status/{orderId}' to pull the
        // payment status
      },
  });


  let el = id => { return document.getElementById(id) };
  
  el('pay').addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    RDP.auth(':client-key', ':client-secret')
    .then(res => {
      RDP.modal.pay(
        res.accessToken,
        'OID' + (new Date()).getTime(), // Order ID
        '00000000-0000-0000-0000-000000000000', // Merchant ID
        37.76, // Amount
        'SGD', // SGD
        { // Other details
          // When `returnUrl` is provided in modal, the
          returnUrl: 'https://domain.com/my/status/page?foo=bar',
          msg: 'HAPPYNEWYEAR19' // Other details
        }
      )
      .catch(e => {
        console.log(e); // handle error
      })
      .finally(res => {
        // everything done! do something...
      });
    })
    .catch(e => {
      console.log(e); // handle error
    });

    return false;    
  });
```

Basic server-to-server installation usage

```javascript
// After calling POST https://connect2.reddotpay.com/v1/authenticate
// and https://connect2.reddotpay.com/v1/payments/token/MERCHANT_ID, 
// this should yield the pageURI. This is will be your payment page.

// RDP.modal.init('https://myowndomain.com/assets/modal.css3.css');
let modal = RDP.modal.init();
  
// Since we use production in getting the pageURI, we need to switch the library to have the same host
RDP.domain = 'https://connect2.api.reddotpay.com';

// Adding events 
RDP.initMessageEvent({
    'closemessage': () => {
      // will be triggered when the close/cancel button is clicked
      // when omitted, `modal.close()` is executed
      modal.close();
    },
    'statusmessage': (status) => {
      // trigged when the payment gateway to receive a transaction status and the `returnUrl` is empty
      // alternatively, RDP.domain + '/v1/payments/token/{merchantId}/status/{orderId}' to pull the
      // payment status
    },
    'redirectmessage': (status) => {
      // trigged when the payment gateway to receive a transaction status and the `returnUrl` is provided
      // alternatively, RDP.domain + '/v1/payments/token/{merchantId}/status/{orderId}' to pull the
      // payment status
    },
});

let el = id => { return document.getElementById(id) };

// Open the preloader
modal.open();

// Load the pageURI
modal.frame.setAttribute('src', pageURI);

// To close the modal
// modal.close();
```

### Promises

Attach callbacks to various events when doing a payment

```javascript
  RDP.auth(':client-key', ':client-secret')
  .then(res => {
    RDP.pay(
      res.accessToken,
      'OID' + (new Date()).getTime(), // Order ID
      '00000000-0000-0000-0000-000000000000', // Merchant ID
      37.76, // Amount
      'SGD', // SGD
      { msg: 'HAPPYNEWYEAR19' } // Other details
    )
    .then(auth => {
      console.log('Auth response:');
      console.log(auth);
      console.log('Display full payment URL:');
      console.log(auth.payURI);
    })
    .catch(e => {
      console.log(e.message);
    })
    .finally(() => {
      console.log('End of request!');
    });
  })
  .catch(e => {
    console.log(e); // handle error
  });
```

### Build-your-own

Create your own payment flow

```html
<!doctype html>
<html lang="en">
  <head>
    ...
  </head>
  <body>
    <h1>Payment</h1>
    <iframe id="paymentForm"></iframe>
    <script src="https://reddotpay.github.io/jspay/src/jspay.js"></script>
    <script type="text/javascript">
      RDP.auth(':client-key', ':client-secret')
      .then(res => {
        RDP.pay(
          res.accessToken,
          'OID' + (new Date()).getTime(), // Order ID
          '00000000-0000-0000-0000-000000000000', // Merchant ID
          37.76, // Amount
          'SGD', // SGD
          { msg: 'HAPPYNEWYEAR19' } // Other details
        )
        .then(auth => {
          document.getElementById('paymentForm').src = auth.payUrl;
        })
        .catch(e => {
          console.log(e.message);
        })
        .finally(() => {
          console.log('End of request!');
        });
      })
      .catch(e => {
        console.log(e); // handle error
      });
    </script>
  </body>
</html>
```

## Open-source

Main repository:
https://github.com/reddotpay/jspay

1. Support only modern browsers
2. Do not add any library dependencies
3. Use only vanilla codes
4. Do not do any post processing (obfuscation, minimizing, etc.)
5. Have fun with the preloaders

