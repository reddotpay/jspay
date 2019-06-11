const modal = RDP.modal.init('modal.css3.css');

RDP.initMessageEvent({
    'redirectmessage': (url) => { 
        let parseJWT = (token) => {
            let defaultResponse = {
                status: 'unknown',
                orderId: 'unknown'
            };
            
            if (!token) {
                defaultResponse.errormsg = 'Did not receive any jwt token from modal';
                return defaultResponse;
            }

            token = token.split('.');

            if (2 > token.length) {
                defaultResponse.errormsg = 'Invalid JWT format';
                return defaultResponse;
            }

            // Warning! This function is only for DEMO PURPOSES. In parsing JWT tokens, you need to
            // verify the digital signature.
            var base64Url = token.split('.')[1];
            var base64 = decodeURIComponent(atob(base64Url).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
         
            return JSON.parse(base64);
         };

        const result = parseJWT(url);
        console.log(result);
        modal.close();
        
        setTimeout(() => {
            alert(result.status == "success" ?
                'Payment successful for order #' + result.orderId:
                'Payment failed. Error: ' + result.errormsg);
        }, 300);
    }
});

RDP.domain = 'https://connect2.api.reddotpay' + (el('isProduction').checked ? '.com': '.sg');

RDP.auth(el('clientKey').value, el('clientSercret').value)
    .then(res => {
        RDP.pay(
            res.accessToken,
            el('paymentRef').innerText,
            el('merchant').value, 
            el('totalAmount').innerText,
            el('totalCcy').innerText
        )
        .then(auth => {
            el('payframe').src = auth.pageURI;
            el('payframe').classList.remove('d-none');
            el('loading').classList.add('d-none');
        })
        .catch(e => {
            console.log(e);
            el('loading').innerText = "Something went wrong. Please refresh";
        })
        .finally(() => {
            const oid = "OID" + (new Date()).getTime();
            console.log("setting oid: " + oid);
            el('paymentRef').innerText = oid;
        });
    })
    .catch(e => {
        console.log(e);
    });