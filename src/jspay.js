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
            this.closeEnabled = true;

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

        closeOn() {
            this.closeEnabled = true;
            if (this.closeButton.classList.contains(this.cssHidden)) {
                this.closeButton.classList.remove(this.cssHidden);
            }
        }

        closeOff() {
            this.closeEnabled = false;
            if (!this.closeButton.classList.contains(this.cssHidden)) {
                this.closeButton.classList.add(this.cssHidden);
            }
        }
        
        attachBasicBehaviours() {
            const modal = this.modal;
            const frame = this.frame;
            const spinner = this.spinner;
            const closeButton = this.closeButton;
            const close = this.close.bind(this);
            const hidden = this.cssHidden;
            const displayNone = this.cssDisplayNone;

            modal.addEventListener('click', (e => {
                if (e.target === modal && this.closeEnabled) {
                    close();
                    return false;
                }
            }).bind(this));
        
            closeButton.addEventListener('click', (e => {
                e.stopPropagation();
                e.preventDefault();
                if (this.closeEnabled) {
                    close();
                }
                
                return false;
            }).bind(this));
            
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

        do(id, amount, currency, clientKey, clientSecret) {
            let options = {
                clientKey,
                clientSecret
            };
            options['orderId'] = id;
            options['amount'] = amount;
            options['currency'] = currency;

            return fetch(this.domain + '/v1/payments/token/' + this.merchant, {
                method: 'POST',
                credentials: 'same-origin',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
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
        domain: ('https://connect3.api.reddotpay.dev' || 'https://connect2.api.reddotpay.sg'),

        auth: (client, secret) => {
            return fetch(lib.domain + '/v1/authenticate', {
                method: 'POST',
                credentials: 'same-origin',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: JSON.stringify({
                    'clientKey': client,
                    'clientSecret': secret
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
                return modal;
            },

            pay: (id, merchant, amount, currency, clientKey, clientSecret) => {
                modal.open();
                return lib
                    .pay(id, merchant, amount, currency, clientKey, clientSecret)
                    .then(auth => {
                        let requestPathArr = auth.pageURI.split('https://connect3.reddotpay.dev');
                        let requestPath = requestPathArr[1];
                        let requestUrl = 'https://connect3.reddotpay.dev' + requestPath;
                        console.log('auth : ', auth);
                        modal.frame.setAttribute('src', auth.pageURI);
                        return auth;
                    })
                    .catch(e => { 
                        modal.close();
                        throw e;
                    });
            },

            closeOff: () => {
                modal.closeOff();
            },

            closeOn: () => {
                modal.closeOn();
            }            
        },

        pay: (id, merchant, amount, currency, clientKey, clientSecret) => {
            const pay = new Pay(merchant, lib.domain);
            return pay
                .do(id, amount, currency, clientKey, clientSecret)
                .then(auth => {
                    if (!auth || !auth.token) {
                        throw Error("0: auth token is empty");
                    }
                    console.log(auth);
                    return auth;
                });
        },

        initMessageEvent: (actions) => {
            const RDP_CMD_NS = 'rdp-msg';
            const CMD_MODAL_CLOSE = 'modal-close';
            const CMD_MODAL_STATUS = "status";
            const CMD_MODAL_REDIRECT = "redirect";
        
            const IDX_CLOSE = 'closemessage';
            const IDX_STATUS = 'statusmessage';
            const IDX_REDIRECT = 'redirectmessage';
            const CLOSE_ENABLE = 'close-enable';
            const CLOSE_DISABLE = 'close-disable';

            window.addEventListener('message', (message) => {
                if (!message || !message.data) return;
                
                var msg = message.data.split(' ');
                if (msg.length === 0 || RDP_CMD_NS != msg[0]) return;
                
                switch(msg[1]) {
                    case CLOSE_ENABLE:
                        modal.closeOn();
                        break;
                    case CLOSE_DISABLE:
                        modal.closeOff();
                        break;
                    case CMD_MODAL_STATUS: case CMD_MODAL_REDIRECT:
                        const idx = msg[1] == CMD_MODAL_STATUS ? IDX_STATUS: IDX_REDIRECT;
                        if (msg.length >= 3 && actions[idx]) actions[idx](msg[2]);
                        break;
                    
                    case CMD_MODAL_CLOSE: default:
                        if (actions[IDX_CLOSE]) actions[IDX_CLOSE]();
                        else if (modal) modal.close();
                }                
            });
        }
    };

    return lib;
})();
