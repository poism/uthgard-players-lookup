<?php
    error_reporting(E_ALL);
    function fake_api($name) {
        $names = array(
            'Mistar'=>'
    {
      "Raw": {
        "Name": "Mistar",
        "LastUpdated": 1484499538,
        "XP": 234763,
        "Realm": 2,
        "Class": 24,
        "Race": 8,
        "GuildName": "South Midgard Association"
      },
      "FullName": "Mistar",
      "RaceName": "Kobold",
      "ClassName": "Skald",
      "Level": 10,
      "XP_Percent": 0.12016796875,
      "RP_Percent": 0,
      "RealmRank": 1
    }',
            'Bruno'=>'
    {
      "Raw": {
        "Name": "Bruno",
        "LastUpdated": 1484499538,
        "XP": 151805,
        "Realm": 2,
        "Class": 26,
        "Race": 7,
        "GuildName": "Svealand Explorers"
      },
      "FullName": "Bruno",
      "RaceName": "Dwarf",
      "ClassName": "Healer",
      "Level": 9,
      "XP_Percent": 0.54613043478261,
      "RP_Percent": 0,
      "RealmRank": 1
    }',
            'Ascerian'=>'
    {
      "Raw": {
        "Name": "Ascerian",
        "LastUpdated": 1484499538,
        "XP": 906213,
        "Realm": 2,
        "Class": 28,
        "Race": 8,
        "GuildName": "Mularn Protectors"
      },
      "FullName": "Ascerian",
      "RaceName": "Kobold",
      "ClassName": "Shaman",
      "Level": 12,
      "XP_Percent": 0.13012712574807,
      "RP_Percent": 0,
      "RealmRank": 1
    }',
            'Felrith'=>'
    {
      "Raw": {
        "Name": "Felrith",
        "LastUpdated": 1484499538,
        "XP": 19257560,
        "Realm": 2,
        "Class": 31,
        "Race": 6,
        "GuildName": "South Midgard Association"
      },
      "FullName": "Felrith",
      "RaceName": "Troll",
      "ClassName": "Berserker",
      "Level": 19,
      "XP_Percent": 0.32283265750034,
      "RP_Percent": 0,
      "RealmRank": 1
    }'
        );
        return $names[$name];
        
    }

    function get_data($url) {
        $ch = curl_init();
        $timeout = 5;
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
        $data = curl_exec($ch);
        curl_close($ch);

        return $data;
    }

    function fetch_player($name) {
        if ( isset( $_GET["fakeapi"] ) ){
            return json_decode( fake_api($name) );
        }
        else {
            $apiUrl = "https://uthgard.org/herald/api/player/" . $name;
            $apiResults = get_data($apiUrl);
            return json_decode( $apiResults );   
        }
    }
    if ( $_GET["names"] ) {
        $playerNames = preg_replace('~[^,a-zA-Z0-9]+~', '', $_GET["names"]);
        $names = explode(',', $playerNames);
        foreach($names as $name) {
            $result_arr[] = fetch_player($name);
        }
        echo json_encode( $result_arr );
    }
?>