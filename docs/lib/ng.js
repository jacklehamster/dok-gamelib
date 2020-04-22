class NewgroundsWrapper {

    constructor({id, key}) {
        this.ngio = new Newgrounds.io.core(id, key);
        this.medals = null;
        this.medalCallbacks = null;
        this.username = null;
        this.loginListeners = [];
        this.logoutListeners = [];
        this.initSession();
    }

    addEventListener(type, callback) {
        switch(type) {
            case "login":
                if (this.loginListeners.indexOf(callback) < 0) {
                    this.loginListeners.push(callback);
                }
                break;
            case "logout":
                if (this.logoutListeners.indexOf(callback) < 0) {
                    this.logoutListeners.push(callback);
                }
                break;
        }
    }

    onLoggedIn() {
        this.username = this.ngio.user.name;
        console.log(`Logged in newgrounds as ${this.username}`);
        this.loginListeners.forEach(callback => callback(this.username));
        this.fetchMedals(() => {});
    }

    onLoginFailed() {
        console.log("There was a problem logging in: " + this.ngio.login_error.message );
    }

    onLoginCancelled() {
        console.log("The user cancelled the login.");
    }

    /*
     * Before we do anything, we need to get a valid Passport session.  If the player
     * has previously logged in and selected 'remember me', we may have a valid session
     * already saved locally.
     */
    initSession() {
        this.ngio.getValidSession(() => {
            if (this.ngio.user) {
                this.onLoggedIn();
            } else {
                console.log(`To login, call game.engine.newgrounds.requestLogin()`);
            }

        });
    }

    /* 
     * Call this when the user clicks a 'sign in' button from your game.  It MUST be called from
     * a mouse-click event or pop-up blockers will prevent the Newgrounds Passport page from loading.
     */
    requestLogin() {
        this.ngio.requestLogin(() => this.onLoggedIn, () => this.onLoginFailed, () => this.onLoginCancelled);
        /* you should also draw a 'cancel login' buton here */
    }

    /*
     * Call this when the user clicks a 'cancel login' button from your game.
     */
    cancelLogin() {
        /*
         * This cancels the login request made in the previous function. 
         * This will also trigger your onLoginCancelled callback.
         */
        this.ngio.cancelLoginRequest();
    }

    /*
     * If your user is logged in, you should also draw a 'sign out' button for them
     * and have it call this.
     */
    logOut() {
        this.ngio.logOut(() => {
            this.username = null;
            this.logoutListeners.forEach(callback => callback());
        });
    }

    fetchMedals(callback) {
        if(this.medals) {
            callback(this.medals);
        } else if(this.medalCallbacks) {
            this.medalCallbacks.push(callback);
        } else {
            this.medalCallbacks = [callback];
            this.ngio.callComponent('Medal.getList', {}, result => {
                if(result.success) {
                    this.medals = result.medals;
                    this.medals.forEach(medal => console.log(medal.name, medal.unlocked));
                    this.medalCallbacks.forEach(callback => {
                        callback(this.medals);
                    });
                    this.medalCallbacks = null;
                }
            });
        }
    } 

    unlockMedal(medal_name, callback) {
        console.log("unlocking", medal_name);
        /* If there is no user attached to our ngio object, it means the user isn't logged in and we can't unlock anything */
        if (!this.ngio.user) return;
        this.fetchMedals(medals => {
            const medal = medals.filter(medal => medal.name === medal_name)[0];
            if(medal) {
                if(!medal.unlocked) {
                    this.ngio.callComponent('Medal.unlock', {id:medal.id}, result => {
                        if(callback)
                            callback(result.medal);
                    });
                } else {
                    if(callback)
                        callback(medal);
                }
            }
        });
    }

    postScore(score) {
        this.ngio.callComponent("ScoreBoard.getBoards", {}, ({scoreboards: [board] }) => {
            this.ngio.callComponent("ScoreBoard.postScore", { id: board.id, value: score }, ({score}) => {
                console.log("Score posted: ", score.value);
            });
        });
    }

    loadScores() {
        this.ngio.callComponent("ScoreBoard.getBoards", {}, ({scoreboards: [board] }) => {
            this.ngio.callComponent("ScoreBoard.getScores", { id: board.id }, ({scores}) => {
                console.log("Scores: ", scores.map(({user, value}) => `${user.name}: ${value}`));
            });
        });        
    }

    getVersion(callback) {
        this.ngio.callComponent("Gateway.getVersion", {}, ({version}) => callback(version));
    }

}
