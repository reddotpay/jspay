# Red Dot Payment Javascript Pay [Modal]

Allows the Red Dot Payment (RDP) hosted payment and card capture page to be embedded to an HTML page.

## Limitation

- Supports ONLY modern browsers (Google Chrome, Firefox, Microsoft Edge, Safari, Opera). To validate the end-users browsers, [outdatedbrowser.com](http://outdatedbrowser.com/en/how) offers a library.
- The domain has to be registered in by the merchant to Red Dot Payment (Content Security Policy)[https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP].

## Example

- [Modal Example](https://reddotpay.github.io/jspay/example-modal.html)
- [Always-open Example](https://reddotpay.github.io/jspay/example-persistent.html)

## Usage

### Modal

Enables the payment page to be loaded into the same webpage for a more seemless experience.

index.html
~~~HTML
<!doctype html>
<html lang="en">
  <head>
    ...
    <!-- Specify a spinner (preloader) style -->
    <link rel="stylesheet" type="text/css" media="screen,print" href="https://reddotpay.github.io/jspay/modal.loader2.css3.css">
  </head>
  <body>
    <button type="button" id="pay">Pay</button> 

    <script src="https://reddotpay.github.io/jspay/src/jspay.js"></script>
    <script type="text/javascript">
      // You can overwrite the base CSS file:
      // RDP.modal.init('https://myowndomain.com/assets/modal.css3.css');
      let modal = RDP.modal.init();
      
      // To switch to PRODUCTION:
      // RDP.domain = 'https://connect2.api.reddotpay.com';

      // Adding events 
      RDP.initMessageEvent({
          'closemessage': () => {
            // will be triggered when the close button is clicked
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
    </script>
  </body>
</html>
~~~

### Promises

Attach callbacks to various events when doing a payment

~~~Javascript
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
~~~

### Build-your-own

Create your own payment flow

~~~HTML
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
~~~
## Open-source

1. Support only modern browsers
2. Do not add any library dependencies
3. Use only vanilla codes
4. Do not do any post processing (obfuscation, minimizing, etc.)
5. Have fun with the preloaders

