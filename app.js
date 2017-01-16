/* Uthgard Players Lookup Tool
 * By Sherab Sangpo Dorje ( po@poism.com )
 * 
*/

window.onload = function () {
    var uthgardPlayers = new Vue({
        el: '#uthgard-players',
        data: {
            debug: false,
            fakeapi: true,
            apiURL: 'api.php?names=',
            defaultNames: 'Mistar,Bruno,Ascerian,Felrith',
            namesInput: '',
            namesInputSanitized: '',
            namesInputArray: [],
            inProgress: false,
            hasResults: false,
            users: []
        },
        watch: {
            namesInput: function () {
                if ( this.namesInput !== this.namesInputSanitized ){
                    this.sanitizeInput()
                }
            }
        },
        methods: {
            toggleDebug: function () {
                this.debug = !this.debug
            },
            fetchAllNames: function () {
                if ( this.namesInputSanitized == '' ) {
                    this.namesInput = this.defaultNames
                }
                this.sanitizeInput()
                this.fetchData()
            },
            fetchData: function (name) {
              var xhr = new XMLHttpRequest()
              var self = this
              self.inProgress = true
              xhr.open('GET', encodeURI(self.apiURL + self.namesInput + (self.fakeapi ? '&fakeapi' : '')) )
              xhr.onload = function () {
                self.users = JSON.parse(xhr.responseText)
                self.inProgress = false
                self.hasResults = true
                console.log(self.users)
              }
              xhr.send()
            },
            sanitizeInput: _.debounce(
                function () {
                    this.namesInputSanitized = this.namesInput.replace(/,{2,}/g, ",")
                    this.namesInputArray = this.namesInputSanitized.split(',')
                    for (var i = 0, len = this.namesInputArray.length; i < len; i++) {
                        this.namesInputArray[i] = this.namesInputArray[i].trim()
                        this.namesInputArray[i] = this.namesInputArray[i].replace(/[^a-zA-Z ]/g, "")
                        this.namesInputArray[i] = this.namesInputArray[i].charAt(0).toUpperCase() + this.namesInputArray[i].substr(1).toLowerCase()
                    }
                    this.namesInputSanitized = this.namesInputArray.join(',')
                    this.namesInput = this.namesInputSanitized
                    return
                }, 500
                )
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
        computed: {
            usersByExperience: function () {
                var self = this
                return _.orderBy(self.users, ['Raw.XP', 'RealmRank', 'RP_Percent'],['desc', 'desc', 'desc'])
            }
        }
    });
}