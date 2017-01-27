/* Uthgard Players Lookup Tool
 * By Sherab Sangpo Dorje ( po@poism.com )
 *  
*/

window.onload = function () {
    var uthgardPlayers = new Vue({
        el: '#uthgard-players',
        data: {
            settings: {
                debug: false,
                fakeApi: false,
                apiURL: 'api.php?names='
            },
            names: {
                default: '',
                input: '',
                sanitized: '',
                nameArray: [],
                notFound: [],
                saved: []
            },
            status: {
                inProgress: false,
                hasResults: false,
                localStorageEnabled: false
            },
            users: []
        },
        computed: {
            statusMessage: function () {
                if ( this.status.inProgress ) {
                    status = "Fetching data (" + this.names.sanitized + "), please wait..."
                }
                else {
                    status = ""
                }
                if ( this.names.notFound.length > 0 ) {
                    status += "Not found: " + ( this.names.notFound.join(', ') )
                }
                return status
            },
            savedNames: function () {
                var self = this
                var str = ""
                if (self.names.saved.length > 0) {
                    str = "Saved names: " + self.names.saved.join(',')
                }
                else {
                    str = "No saved names."
                } 
                return str
            }
        },
        filters: {
            formatTimestamp: function (timestamp) {
                var date = new Date(timestamp * 1000)
                /*var dateval = [
                   date.getFullYear(),
                   date.getMonth()+1,
                   date.getDate(),
                   date.getHours(),
                   date.getMinutes(),
                   date.getSeconds(),
                ]*/
                return (date.toUTCString())
            }
        },
        methods: {
            init: function () {
                var self = this
                if ('localStorage' in window && window['localStorage'] !== null) {
				    self.status.localStorageEnabled = true
                    self.localStorageGet()
                }
            },
            localStorageGet: function () {
                var self = this
                if ( self.status.localStorageEnabled ){
                    var storage = window['localStorage']
                    if (storage.getItem('savedNames')){
                        var res = storage.getItem('savedNames')
                        if (self.status.hasResults == false) {
                            self.names.default = res
                        }
                        self.names.saved = res.split(',')
                    }
                }
            },
            localStorageUpdate: function () {
                var self = this
                if ( self.status.localStorageEnabled ){
                    var storage = window['localStorage']
                    storage.setItem( "savedNames", self.names.saved.join(',') )
                    self.names.default = self.names.saved.join(',')
                }
            },
            localStorageClear: function () {
                var self = this
                if ( self.status.localStorageEnabled ){
                    var storage = window['localStorage']
                    storage.setItem( "savedNames", "")
                }
            },
            removeUser: function (userName) {
                var self = this
                console.log('removeData:'+userName)
                for (var i = 0, len = self.users.length; i < len; i++) {
                    if (self.users[i].FullName == userName){
                        console.log('Deleting "' + userName + '".')
                        self.users.splice(i, 1)
                        len = len - 1
                        i = i - 1
                        continue
                    }
                }
                for (i = 0, len = self.names.saved.length; i < len; i++) {
                    if (self.names.saved[i] == userName){
                        console.log('Deleting saved "' + userName + '".')
                        self.names.saved.splice(i, 1)
                        len = len - 1
                        i = i - 1
                        continue
                    }
                }
                self.localStorageUpdate()
            },
            refreshData: function (){
                this.users = []
                this.fetchData()
            },
            sortByExperience: function () {
                var self = this
                return _.orderBy(self.users, ['Raw.XP', 'RealmRank', 'RP_Percent'],['desc', 'desc', 'desc'])
            },
            toggleDebug: function () {
                this.settings.debug = !this.settings.debug
            },
            displayLevel: function (level, pct) {
                var level = level + pct
                if ( level < 50 ){
                     level = Math.ceil(level * 10) / 10
                }
                else {
                    level = 50
                }
                return level
            },
            displayRealmRank: function (rr, rrpct) {
                var rrStr = ""
                rr = Math.round( rr * 10) / 10
                rr = rr.toString().split(".")
                if ( !rr[1] ) {
                    rr[1] = "0"
                } 
                rrStr = 'R' + rr[0] + 'L' + rr[1]
                
                rrpct = Math.round(rrpct * 10) / 10
                rrpct = rrpct > 0 ? rrpct.toString().substring(1) : ""
                
                return rrStr + rrpct
                
            },
            displayProgress: function (level, pct){
                level = this.displayLevel(level,pct)
                
                if ( level === "50" ) {
                    level = "100"
                }
                else {
                    level = level.toString().split(".")
                    level = level[1] * 10
                }
                return level
            },
            displayTotalProgress: function (level, pct) {
                return ((this.displayLevel(level,pct) / 50) * 100)
            },
            clearData: function () {
                var self = this
                self.users = []
                self.names.saved = []
                self.names.input = ""
                self.names.default = ""
                self.localStorageClear()
            },
            fetchData: function () {
                var self = this
                self.sanitizeInput()
                
                if ( self.names.nameArray.length > 0 ) {
                    var xhr = new XMLHttpRequest()
                    self.status.inProgress = true
                    
                    console.log('Fetching: ' + self.names.sanitized )
                    xhr.open('GET', encodeURI(self.settings.apiURL + self.names.sanitized + (self.settings.fakeApi ? '&fakeapi' : '')) )
                    xhr.onload = function () {
                        if (xhr.readyState === 4) {
                            if (xhr.status === 200) {
                                var results = JSON.parse(xhr.responseText)
                                for (var i = 0, len = results.length; i < len; i++) {
                                    if ( results[i] === null || results[i] === undefined ){
                                        self.names.notFound.push( self.names.nameArray[i] )
                                        console.log('User [ ' + self.names.nameArray[i] + ' ] NOT found!')
                                    }
                                    else {
                                        if ( self.names.saved.indexOf( self.names.nameArray[i] ) < 0 ) {
                                            self.names.saved.push( self.names.nameArray[i] )
                                        }
                                        self.users.push( results[i] )
                                        console.log('User [ ' + self.names.nameArray[i] + ' ] data found!')
                                    }
                                }
                                self.users = self.sortByExperience()
                                self.localStorageUpdate()
                                self.status.inProgress = false
                                self.status.hasResults = true
                                self.names.nameArray = []
                                self.names.sanitized = ''
                                self.names.input = ''
                            } else {
                                console.error(xhr.statusText);
                            }
                        }

                    }
                    xhr.send()
                }
              
            },
            sanitizeInput: function () {
                    var self = this
                    if ( self.names.input == '' ) {
                        self.names.input = self.names.default
                    }
                    self.names.sanitized = self.names.input.replace(/\s/g, ",")
                    self.names.sanitized = self.names.sanitized.replace(/,{2,}/g, ",")
                    if (self.names.sanitized == "" || self.names.sanitized == ",") {
                        self.names.nameArray = []
                    }
                    else {
                        self.names.nameArray = self.names.sanitized.split(',')
                        for (var i = 0, len = self.names.nameArray.length; i < len; i++) {
                            self.names.nameArray[i] = self.names.nameArray[i].trim()
                            self.names.nameArray[i] = self.names.nameArray[i].replace(/[^a-zA-Z]/g, "")
                            self.names.nameArray[i] = self.names.nameArray[i].charAt(0).toUpperCase() + self.names.nameArray[i].substr(1).toLowerCase()
                            console.log('sanitizeInput: ' + self.names.nameArray[i])
                            // Check if input name already fetched
                            for (var r = 0, rlen = self.users.length; r < rlen; r++) {
                                if ( self.users[r].Raw.Name == self.names.nameArray[i] ) {
                                    console.log('Omitting "' + self.names.nameArray[i] + '" from query since it already exists.')
                                    self.names.nameArray.splice(i, 1)
                                    len = len - 1
                                    i = i - 1
                                }
                            }
                            // Check if input name already not found
                            for (var n = 0, nlen = self.names.notFound.length; n < nlen; n++) {
                                if ( self.names.notFound[n] == self.names.nameArray[i] ) {
                                    console.log('Omitting "' + self.names.nameArray[i] + '" from query since it already failed to fetch.')
                                    self.names.nameArray.splice(i, 1)
                                    len = len - 1
                                    i = i - 1
                                }
                            }
                        }
                    }

                    self.names.sanitized = self.names.nameArray.join(',')
                    self.names.input = self.names.sanitized
            }
        }
    });
    
    uthgardPlayers.init();
}