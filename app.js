/* Uthgard Players Lookup Tool
 * By Sherab Sangpo Dorje ( po@poism.com )
 *  
*/

window.onload = function () {
    var uthgardPlayers = new Vue({
        el: '#uthgard-players',
        data: {
            debug: false,
            fakeapi: false,
            apiURL: 'api.php?names=',
            defaultNames: 'Mistar,Bruno,Ascerian,Felrith',
            namesInput: '',
            namesInputSanitized: '',
            namesInputArray: [],
            namesNotFound: [],
            inProgress: false,
            hasResults: false,
            users: []
        },
        computed: {
            statusMessage: function() {
                if ( this.inProgress ) {
                    status = "Fetching data (" + this.namesInputSanitized + "), please wait..."
                }
                else {
                    status = ""
                }
                if ( this.namesNotFound.length > 0 ) {
                    status += "Not found: " + ( this.namesNotFound.join(', ') )
                }
                return status
            }/*,
            xpProgress: function() {
                return Math.ceil(this.XP_Percent) * 100
            },
            xpTotalProgress: function() {
                var level = Vue.filter('formatLevel')(this.Level + this.XP_Percent)
                return ( level/50 )*100 
            }*/
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
        },/*//disabling sanitize while typing watch
        watch: {
            namesInput: function () {
                if ( this.namesInput !== this.namesInputSanitized ){
                    this.sanitizeInputOnChange()
                }
            }
        },*/
        methods: {
            sortByExperience: function() {
                var self = this
                return _.orderBy(self.users, ['Raw.XP', 'RealmRank', 'RP_Percent'],['desc', 'desc', 'desc'])
            },
            toggleDebug: function() {
                this.debug = !this.debug
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
            displayRealmRank: function(rr, rrpct) {
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
            displayProgress: function(level, pct){
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
            displayTotalProgress: function(level, pct) {
                return ((this.displayLevel(level,pct) / 50) * 100)
            },
            fetchData: function () {
                var self = this
                self.sanitizeInput()
                var queryLength = self.namesInputArray.length
                
                if ( queryLength > 0 ) {
                    var xhr = new XMLHttpRequest()
                    self.inProgress = true
                    
                    console.log('Fetching: ' + self.namesInputSanitized )
                    xhr.open('GET', encodeURI(self.apiURL + self.namesInputSanitized + (self.fakeapi ? '&fakeapi' : '')) )
                    xhr.onload = function () {
                        if (xhr.readyState === 4) {
                            if (xhr.status === 200) {
                                var results = JSON.parse(xhr.responseText)
                                for (var i = 0, len = results.length; i < len; i++) {
                                    if ( results[i] === null || results[i] === undefined ){
                                        self.namesNotFound.push( self.namesInputArray[i] )
                                        console.log('User [ ' + self.namesInputArray[i] + ' ] NOT found!')
                                    }
                                    else {
                                        self.users.push( results[i] )
                                        console.log('User [ ' + self.namesInputArray[i] + ' ] data found!')
                                    }
                                }
                                self.users = self.sortByExperience()
                                self.inProgress = false
                                self.hasResults = true
                                self.namesInputArray = []
                                self.namesInputSanitized = ''
                                self.namesInput = ''
                            } else {
                                console.error(xhr.statusText);
                            }
                        }

                    }
                    xhr.send()
                }
              
            },
            sanitizeInput: function() {
                    var self = this
                    if ( self.namesInput == '' ) {
                        self.namesInput = self.defaultNames
                    }
                    self.namesInputSanitized = self.namesInput.replace(/\s/g, ",")
                    self.namesInputSanitized = self.namesInputSanitized.replace(/,{2,}/g, ",")
                    self.namesInputArray = self.namesInputSanitized.split(',')
                    for (var i = 0, len = self.namesInputArray.length; i < len; i++) {
                        self.namesInputArray[i] = self.namesInputArray[i].trim()
                        self.namesInputArray[i] = self.namesInputArray[i].replace(/[^a-zA-Z]/g, "")
                        self.namesInputArray[i] = self.namesInputArray[i].charAt(0).toUpperCase() + self.namesInputArray[i].substr(1).toLowerCase()
                        console.log('sanitizeInput: ' + self.namesInputArray[i])
                        // Check if input name already fetched
                        for (var r = 0, rlen = self.users.length; r < rlen; r++) {
                            if ( self.users[r].Raw.Name == self.namesInputArray[i] ) {
                                console.log('Omitting "' + self.namesInputArray[i] + '" from query since it already exists.')
                                self.namesInputArray.splice(i, 1)
                                len = len - 1
                                i = i - 1
                            }
                        }
                        // Check if input name already not found
                        for (var n = 0, nlen = self.namesNotFound.length; n < nlen; n++) {
                            if ( self.namesNotFound[n] == self.namesInputArray[i] ) {
                                console.log('Omitting "' + self.namesInputArray[i] + '" from query since it already failed to fetch.')
                                self.namesInputArray.splice(i, 1)
                                len = len - 1
                                i = i - 1
                            }
                        }
                    }
                    self.namesInputSanitized = self.namesInputArray.join(',')
                    self.namesInput = self.namesInputSanitized
            }
        }
    });
}