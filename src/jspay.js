"use strict";

const RDP = (() => {
    const closeSVG = '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 212.982 212.982" width="12" height="12" style="enable-background:new 0 0 212.982 212.982;" xml:space="preserve">' +
        '<path style="fill-rule:evenodd;clip-rule:evenodd;" d="M131.804,106.491l75.936-75.936c6.99-6.99,6.99-18.323,0-25.312c-6.99-6.99-18.322-6.99-25.312,0l-75.937,75.937L30.554,5.242c-6.99-6.99-18.322-6.99-25.312,0c-6.989,6.99-6.989,18.323,0,25.312l75.937,75.936L5.242,182.427c-6.989,6.99-6.989,18.323,0,25.312c6.99,6.99,18.322,6.99,25.312,0l75.937-75.937l75.937,75.937c6.989,6.99,18.322,6.99,25.312,0c6.99-6.99,6.99-18.322,0-25.312L131.804,106.491z"/>' +
        '</svg>';
    const Modal = class {
        // modal;
        // closeButton;
        // spinner;
        // frame;
        
        // cssHidden;
        // cssDisplayNone;
        // opening;

        constructor(id, css) {
            this.cssHidden = 'hidden';
            this.cssDisplayNone = 'displaynone';
            this.opening = false;
            this.id = id;

            this.installCSS(css);
        }

        init() {
            const modal = !this.modal ? this.createElement(this.id): document.getElementById(this.id);
            this.modal = modal;
            

            this.closeButton = modal.querySelector('.close');
            this.spinner = modal.querySelector('.loader');
            this.frame = modal.getElementsByTagName('iframe')[0];
            this.attachBasicBehaviours();
        }

        installCSS(css) {
            const link = document.createElement('LINK');
                link.setAttribute('href', css);
                link.setAttribute('type', 'text/css');
                link.setAttribute('rel', 'stylesheet');
                link.setAttribute('media', 'screen,print');
            
            document.getElementsByTagName('head')[0].appendChild(link);
        }

        createElement(id) {
            const modal = document.createElement('DIV');
            modal.setAttribute('id', id);
            modal.classList.add(this.cssHidden);
            modal.innerHTML = '<div class="content"><span class="close hidden">' + closeSVG +
                '</span><div class="frame"><div class="loader"></div>' +
                '<div class="frame-cont"><iframe class="hidden"></iframe></div></div></div>';
            document.getElementsByTagName('body')[0].appendChild(modal);

            return modal;
        }
        
        attachBasicBehaviours() {
            const modal = this.modal;
            const frame = this.frame;
            const spinner = this.spinner;
            const closeButton = this.closeButton;
            const close = this.close.bind(this);
            const hidden = this.cssHidden;
            const displayNone = this.cssDisplayNone;

            modal.addEventListener('click', e => {
                if (e.target === modal) {
                    close();
                    return false;
                }
            });
        
            closeButton.addEventListener('click', e => {
                e.stopPropagation();
                e.preventDefault();
                close();
                return false;
            });
            
            modal.addEventListener(this.getTransitionEvents().end, e => {
                const cl = modal.classList;
                if (cl.contains(hidden) && !cl.contains(displayNone)) cl.add(displayNone);
            });
        
            frame.addEventListener('load', e => {
                if (!e.target.src || spinner.classList.contains(hidden)) return;
                frame.classList.remove(hidden);
                closeButton.classList.remove(hidden);
                spinner.classList.add(hidden);
            });
            
            window.addEventListener("message", function (message) {
                if (message.data === "RDP.modal.close") {
                    close();
                }
            });
        }

        close() {
            const hidden = this.cssHidden;
            if (!this.modal.classList.contains(hidden)) this.modal.classList.add(hidden);
            this.frame.src = "";
        }

        open() {
            if (!this.modal) this.init();
            const cl = this.modal.classList;
            const hidden = this.cssHidden;
            const displayNone = this.cssDisplayNone;

            if (!this.opening && cl.contains(hidden)) {
                this.opening = true;
                cl.remove(displayNone);
                this.spinner.classList.remove(hidden);
                this.frame.classList.add(hidden);
                this.closeButton.classList.add(hidden);

                setTimeout(() => {
                    // delay hack for smoother transition while removing display:none
                    cl.remove(hidden);
                    this.opening = false;
                }, 1);
            }
        }

        toggle() {
            this.modal.classList.toggle(this.cssHidden);
        }

        getTransitionEvents() {
            const el = document.createElement('DIV');
            const transitions = {
                    'transition': ['transitionstart', 'transitionend'],
                    'OTransition': ['otransitionstart', 'otransitionend'], // oTransitionEnd in very old Opera
                    'MozTransition': ['transitionstart', 'transitionend'],
                    'WebkitTransition': ['webkitTransitionStart', 'webkitTransitionEnd']
                };
            
            let i;
            for (i in transitions) {
                if (el.hasOwnProperty(i) || el.style.hasOwnProperty(i) || i in el.style) {
                    return {'start': transitions[i][0], 'end': transitions[i][1]};
                }
            }
            
            return console.error('transitionend event not supported. browser update required');
        }
    }

    const Pay = class {
        // merchant;
        // domain;

        constructor(merchant, domain) {
            this.domain = domain;
            this.merchant = merchant;
        }

        do(accessToken, id, amount, currency, options) {
            if ('object' != options) options = {};
            options['orderId'] = id;
            options['amount'] = amount;
            options['currency'] = currency;

            return fetch(this.domain + '/v1/payments/token/' + this.merchant, {
                method: 'POST',
                credentials: 'same-origin',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': accessToken
                },
                body: JSON.stringify(options)
            })
            .then(res => {
                if (!res.ok) {
                    throw Error(res.status + ':' +res.statusText);
                }
                return res.json();
            });
        }
    }

    let modal;

    const lib = {
        domain: 'https://connect2.api.reddotpay.sg',

        auth: (client, secret) => {
            return fetch(lib.domain + '/v1/authenticate', {
                method: 'POST',
                credentials: 'same-origin',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: JSON.stringify({
                    'clientId': client,
                    'secret': secret
                })
            }).then(res => {
                if (!res.ok) {
                    throw Error(res.status + ':' + res.statusText);
                }

                return res.json();
            })
        },

        modal: {
            init: (css) => {
                modal = new Modal('rdp-modal', css ? css: 'https://reddotpay.github.io/jspay/modal.css3.css');
            },

            pay: (accessToken, id, merchant, amount, currency, options) => {
                modal.open();
                return lib
                    .pay(accessToken, id, merchant, amount, currency, options)
                    .then(auth => {
                        modal.frame.setAttribute('src', auth.payUrl);
                        return auth;
                    })
                    .catch(e => { 
                        modal.close();
                        throw e;
                    });
            },
        },

        pay: (accessToken, id, merchant, amount, currency, options) => {
            const pay = new Pay(merchant, lib.domain);
            return pay
                .do(accessToken, id, amount, currency, options)
                .then(auth => {
                    if (!auth || !auth.token) {
                        throw Error("0: auth token is empty");
                    }
                    auth.payUrl = auth.payURI;
                    return auth;
                });
        }
    };

    return lib;
})();
