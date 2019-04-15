RDP.modal.init('modal.css3.css');
let el = id => { return document.getElementById(id) };
let getDomain = () => { return window.location.protocol + '//' + window.location.host };

el('domainName').innerText = getDomain();
el('paymentRef').innerText = "OID" + (new Date()).getTime();

const qs = new URLSearchParams(window.location.search);

if (qs) {
    var qsc = qs.get('client');
    var qsm = qs.get('merchant');
    var qsp = qs.get('production');
    var qsccy = qs.get('ccy');
    var qsamt = qs.get('amt');
    
    if (qsc) {
        qsc = qsc.split(':');
        el('clientKey').value = qsc[0];
        if (1 < qsc.length) el('clientSercret').value = qsc[1];
    }

    if (qsm) {
        el('merchant').value = qsm;
    }

    if (qsp) {
        el('isProduction').checked = qsp == 'Y';
    }

    if (qsccy) {
        el('currency').value = qsccy;
    }

    if (qsamt) {
        el('amount').value = qsamt;
    }
}

el('pay').addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    el('pay').innerText = 'Processing...';
    el('pay').classList.remove('btn-success');
    el('pay').classList.add('btn-light');
    el('pay').disabled = true;

    RDP.domain = 'https://connect.api.reddotpay' + (el('isProduction').checked ? '.com': '.sg');

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
            el('totalCcy').innerText,
            {}
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
$('#configForm').on('submit', e => {
    e.stopPropagation();
    e.preventDefault();

    window.location.href = '?client=' + el('clientKey').value + ':' + el('clientSercret').value +
        '&merchant=' + el('merchant').value + 
        '&production=' + (el('isProduction').checked? 'Y': 'N') +
        '&ccy=' + el('currency').value +
        '&amt=' + el('amount').value;

    false;
});

RDP.modal.init('modal.css3.css');
        el('paymentRef').innerText = "OID" + (new Date()).getTime();
        el('pay').addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            el('pay').innerText = 'Processing...';
            el('pay').classList.remove('btn-success');
            el('pay').classList.add('btn-light');
            el('pay').disabled = true;
            RDP.auth('16q6glucb2o812mj6incf7vv8r', '1p9q99bp8nmdo839843n3jo43vkeg4s1cqkjtvk0jskh5kmae6bm')
                .then(res => {
                    console.log(res);
                    RDP.modal.pay(
                            res.accessToken,
                            el('paymentRef').innerText,
                            '7a0cb443-157d-440a-8219-017951e8cf7c',
                            el('totalAmount').innerText.substring(1),
                            'USD', {}
                        )
                        .catch(e => {
                            console.log(e);
                        })
                        .finally(res => {
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
                })
            return false;
        });

        //Future Date
        const now = new Date();
        let year = now.getFullYear() + 2;
        let date = now.getDate()+1;
        
        let futureDates = document.getElementsByClassName('futureDates');
        for(let i = 0; i < futureDates.length; i++){
            futureDates[i].innerText = `${date}/${year.toString().slice(2)}`
        }

        el('visa-success').addEventListener("click",function(){copyFunc('visa-success')});
        el('visa-fail').addEventListener("click",function(){copyFunc('visa-fail')});
        el('mastercard-success').addEventListener("click",function(){copyFunc('mastercard-success')});
        el('mastercard-fail').addEventListener("click",function(){copyFunc('mastercard-fail')});
        el('alipay-email').addEventListener("click",function(){copyFunc('alipay-email')});
        
        function copyFunc(element) {
            //Select the text
            var txt = document.getElementById(element).innerText

            //Create a textarea to allow population of text
            var ta = document.createElement('textarea');
            ta.setAttribute('readonly', '');
            ta.value = txt;
            document.body.appendChild(ta)
            ta.select()

            //Copy the text inside the text field 
            document.execCommand("copy");

            //Remove the textarea created
            document.body.removeChild(ta)

            //Alert the copied text 
            document.getElementById(element).innerText = "Copied!"
            setTimeout(() => {
                document.getElementById(element).innerText = txt
            }, 1000);
        }