RDP.modal.init('modal.css3.css');
RDP.domain = 'https://connect2.api.reddotpay' + (el('isProduction').checked ? '.com': '.sg');

RDP.auth(el('clientKey').value, el('clientSercret').value)
.then(res => {
    RDP.pay(
        res.accessToken,
        el('paymentRef').innerText,
        el('merchant').value, 
        el('totalAmount').innerText,
        el('totalCcy').innerText,
        {
            redirectUrl: 'https://reddotpay.github.io/jspay/example-status.html'
        }
    )
    .then(auth => {
        el('payframe').src = auth.payURI;
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