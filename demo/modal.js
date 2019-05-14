const modal = RDP.modal.init('modal.css3.css');

RDP.initMessageEvent({
    'closemessage': () => { modal.close(); },
    'statusmessage': (status) => { 
        let parseJWT = (token) => {
            // Warning! This function is only for DEMO PURPOSES. In parsing JWT tokens, you need to
            // verify the digital signature.
            var base64Url = token.split('.')[1];
            var base64 = decodeURIComponent(atob(base64Url).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
         
            return JSON.parse(base64);
         };

        let result = parseJWT(status);
        console.log(result);
        modal.close();
        
        alert(result.status == "success" ?
            'Payment successful for order #' + result.orderId:
            'Payment failed. Error: ' + result.errormsg);
    }
});

el('pay').addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    el('pay').innerText = 'Processing...';
    el('pay').classList.remove('btn-success');
    el('pay').classList.add('btn-light');
    el('pay').disabled = true;

    RDP.domain = 'https://connect2.api.reddotpay' + (el('isProduction').checked ? '.com': '.sg');

    if (el('amount').value != '') {
        el('totalAmount').innerText = el('amount').value;
    }

    if (el('currency').value != '') {
        el('totalCcy').innerText = el('currency').value;
    }

    RDP.auth(el('clientKey').value, el('clientSercret').value)
    .then(res => {
        console.log(res);
        RDP.modal.pay(
            res.accessToken,
            el('paymentRef').innerText,
            el('merchant').value, 
            el('totalAmount').innerText,
            el('totalCcy').innerText
        )
        .catch(e => {
            console.log(e);
        })
        .finally(() => {
            const oid = "OID" + (new Date()).getTime();
            console.log("setting oid: " + oid);
            el('paymentRef').innerText = oid;
        });
    })
    .catch(e => {
        console.log(e);
    })
    .finally(() => {
        el('pay').innerText = 'Pay';
        el('pay').classList.add('btn-success');
        el('pay').classList.remove('btn-light');
        el('pay').disabled = false;
    });

    return false;    
});
