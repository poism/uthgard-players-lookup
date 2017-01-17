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
            results: [],
            users: []
        },
        computed: {
            statusMessage: function() {
                if ( this.inProgress ) {
                    status = "Fetching data, please wait..."
                }
                else {
                    status = ""
                }
                if ( this.namesNotFound.length > 0 ) {
                    status += "Not found: " + ( this.namesNotFound.join(', ') )
                }
                return status
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
        },/*//disabling sanitize while typing watch
        watch: {
            namesInput: function () {
                if ( this.namesInput !== this.namesInputSanitized ){
                    this.sanitizeInputOnChange()
                }
            }
        },*/
        methods: {
             sortByExperience: function () {
                var self = this
                return _.orderBy(self.users, ['Raw.XP', 'RealmRank', 'RP_Percent'],['desc', 'desc', 'desc'])
            },
            toggleDebug: function () {
                this.debug = !this.debug
            },
            fetchAllNames: function () {
                var self = this
                /*//disabling sanitize while typing watch
                if ( self.namesInputSanitized == '' ) {
                    self.namesInput = self.defaultNames
                }*/
                self.namesInputArray = []
                self.namesInputSanitized = ''
                self.results = []
                self.fetchData()
            },
            fetchData: function (name) {
              var self = this
              self.sanitizeInput()
              if ( self.namesInputArray.length > 0 ) {
                var xhr = new XMLHttpRequest()
                  self.inProgress = true

                  console.log('Fetching: ' + self.namesInput)
                  xhr.open('GET', encodeURI(self.apiURL + self.namesInput + (self.fakeapi ? '&fakeapi' : '')) )
                  xhr.onload = function () {
                    self.results = JSON.parse(xhr.responseText)
                    for (var i = 0, len = self.results.length; i < len; i++) {
                        if ( self.results[i] === null ) {
                            self.namesNotFound.push( self.namesInputArray[i] )
                            console.log('Fetching: '+ self.namesInputArray[i] + ' not found')
                        }
                        else {
                            self.users.push( self.results[i] )
                            console.log('Fetching: ' + self.namesInputArray[i] + ' found')
                        }
                    }
                    console.log(self.users)
                    console.log('Names not found: ' + self.namesNotFound.join(','))
                    self.inProgress = false
                    self.hasResults = true
                    self.users = self.sortByExperience()
                  }
                xhr.send()
              }
                self.namesInput = ''
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
            }/*//disabling sanitize while typing watch,
            sanitizeInputOnChange: _.debounce(function () {
                    this.sanitizeInput()
                }, 500)*/
        }
    });
}