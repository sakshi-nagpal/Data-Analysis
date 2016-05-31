function MainService($http) {
    return {
        getAllData : function() {

            var monthMapper = {
                'Jan' : 1,
                'Feb' : 2,
                'Mar' : 3,
                'Apr' : 4,
                'May' : 5,
                'Jun' :6,
                'Jul':7,
                'Aug': 8,
                'Sep':9,
                'Oct':10,
                'Nov':11,
                'Dec':12
            };
            var yearMapper = {
                '1986':1,
                '1987':1,
                '1988':1,
                '1989':1,
                '1990':1,
                '1991':2,
                '1992':2,
                '1993':2,
                '1994':2,
                '1995':2,
                '1996':3,
                '1997':3,
                '1998':3,
                '1999':3,
                '2000':3,
                '2001':4,
                '2002':4,
                '2003':4,
                '2004':4,
                '2005':4,
                '2006':5,
                '2007':5,
                '2008':5,
                '2009':5,
                '2010':5,
                '2011':6,
                '2012':6

            };
            function csvJSON(csv){
                var gridData = [], barChartMapper={},pieChartMapper={};

                csv = csv.data;    // csv data
                var lines=csv.split('\n');
                var headers=lines[0].split(',');

                for(var i=1;i<lines.length-1;i++){
                    var obj = {};
                    var current_score = 0;
                    var currentline=lines[i].split(',');

                    for(var j=0;j<= headers.length-1;j++){
                        var text = '';
                        if(headers[j] == 'opposition'){
                            // removing 'v ' from data
                            text = currentline[j].split(' ');
                            text.shift();
                            text = text.join(' ');
                            if(!pieChartMapper[text]){
                                pieChartMapper[text] = 1
                            }else{
                                pieChartMapper[text]++;
                            }
                        }else if(headers[j] == 'batting_score'){
                            text = currentline[j].split('*');
                            current_score = parseInt(text[0]);
                            if(text[1] == ''){
                                text = text[0]+ ' (not out)'
                            }else{
                                text =text[0]
                            }
                        }else if(headers[j] =='catches' || headers[j] =='stumps'){
                            text = currentline[j] || '-'
                        }else if(headers[j] =='toss'){
                            text = currentline[j].charAt(0).toUpperCase() + currentline[j].slice(1);
                        }else if(headers[j] == 'result_margin'){
                            text = currentline[j].split(' ');
                            if(!text[1]){
                                text = text[0];
                            }else{
                                text[1] = text[1] == 'runs'? 'R':'W';
                                text = text.join(' ');
                            }
                        }else if(headers[j] == 'date'){
                            currentline[j] = currentline[j].split(' ');
                            currentline[j][1] = monthMapper[currentline[j][1]];

                            // for barChartMapper
                            if(!barChartMapper[yearMapper[currentline[j][2]]] && !isNaN(current_score)){

                                barChartMapper[yearMapper[currentline[j][2]]] = { run: current_score, count :1, max: current_score};   //yearChart
                            }else if(!isNaN(current_score)){
                                if(barChartMapper[yearMapper[currentline[j][2]]].max < current_score){
                                    barChartMapper[yearMapper[currentline[j][2]]].max = current_score
                                }
                                barChartMapper[yearMapper[currentline[j][2]]].count++;
                                barChartMapper[yearMapper[currentline[j][2]]].run += current_score;
                            }
                            text = currentline[j].reverse().join('/');
                        }
                        obj[headers[j]] = text || currentline[j];
                    }
                    gridData.push(obj);
                }
                //return gridData;
                return {gridData: gridData, barChartMapper: barChartMapper, pieChartMapper :pieChartMapper}; //JSON
            }

            return $http.get('./sachin.csv').then(function(csv) {
                return csvJSON(csv);
            });
        }
    }
}

function MainController($scope, mainService) {
    'use strict';

    mainService.getAllData().then(function(data){

        $scope.gridConfig.data = data.gridData;
        var barChartMapper = data.barChartMapper;
        var pieChartMapper = data.pieChartMapper;
        var i, max_score=[], avg_score=[], pieSeriesData =[];
        var getColor = {
            'Pakistan': 'rgb(124, 181,236)',
            'Australia': 'rgb(43,144,143)',
            'Bangladesh': 'rgb(128,133,233)',
            'Bermuda': 'rgb(110, 171,70)',
            'England': 'rgb(233,124,48)',
            'Ireland': 'rgb(66,112,193)',
            'Kenya': 'rgb(151,144,0)',
            'Namibia': 'rgb(114,197,2)',
            'Netherlands': 'rgb(247,163,92)',
            'New Zealand': 'rgb(98,98,98)',
            'South Africa': 'rgb(228,211,84)',
            'Sri Lanka': 'rgb(144, 237,125)',
            'U.A.E': 'rgb(36,92,143)',
            'Zimbabwe': 'rgb(163,163,163)',
            'West Indies': 'rgb(155,70,12)'
        };

        // data for combined bar nas spline chart
        for(var key in barChartMapper){
            max_score.push(barChartMapper[key].max);
            avg_score.push(Math.round(barChartMapper[key].run/barChartMapper[key].count));
        }
        $scope.barChartData.series[0].data = max_score;
        $scope.barChartData.series[1].data = avg_score;

        // data for pie chart
        for(var key in pieChartMapper){
            pieSeriesData.push({
                name : key,
                y : pieChartMapper[key],
                color: getColor[key]
            });

        }
        $scope.pieChartData.series[0].data = pieSeriesData;

        // to show selected data
        $scope.pieChartData.series[0].data[6].selected = true;
        $scope.pieChartData.series[0].data[6].sliced = true;
    });

    $scope.gridConfig =
    {
        title : '',
        rowHeight: 30,
        searchConfig :{
            searchTitle : 'History of all matches ',
           placeholderText : 'Search with Column Data'
        },
        showCount : true,
        data : '',
        columns : [
            {
                field: 'date',
                displayName: 'Match Date',
                width: '10%'
            },
            {
                field: 'opposition',
                displayName: 'Opposition',
                width: '11%'
            },
            {
                field: 'ground',
                displayName: 'Ground',
                width: '10%'
            },
            {
                field: 'batting_innings',
                displayName: 'Innings',
                width: '8%'
            },
            {
                field: 'toss',
                displayName: 'Toss',
                width: '8%'
            },
            {
                field: 'batting_score',
                displayName: 'Score',
                width: '7%'
            },
            {
                field: 'runs_conceded',
                displayName: 'Runs Conceded',
                width: '13%'
            },{
                field: 'catches',
                displayName: 'Catches',
                width: '8%'
            },
            {
                field: 'wickets',
                displayName: 'Wickets',
                width: '8%'
            },
            {
                field: 'stumps',
                displayName: 'Stumps',
                width: '8%'
            },
            {
                field: ' ',
                displayName: 'Result',
                enableSorting :false,
                cellTemplate :[{
                    type : 'button',
                    field : 'result_margin',
                    attr : 'ng-class="{\'green\':(row.entity.match_result == \'won\'),\'red\':(row.entity.match_result  == \'lost\'),\'yellow\':(row.entity.result_margin  == \'-\' )}"'

                }]
            }

        ]
    };


    $scope.barChartData = {
        xAxis: {
            categories: ['1985-1990', '1991-1995', '1996-2000', '2000-2005', '2005-2010', '2010-2015']
        },
        title: {
            text: 'Year by Year'
        },
        yAxis: {
            min: 0,
            max: 220,
            tickInterval: 20,
            lineColor: '#FF0000',
            lineWidth: 1,
            title: {
                text: 'Max Score'

            },
            plotLines: [{
                value: 0,
                width: 10,
                color: '#808080'
            }]

        },
        labels: {
            items: [{
                style: {
                    left: '50px',
                    top: '18px',
                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
                }
            }]
        },
        series: [
            {
                type: 'column',
                name: 'Max Score',
                data: ''  // max score
            },
            {
                type: 'spline',
                name: 'Average Score',
                data: '', // av score



                color:'#F7A35C',
                marker: {
                    lineWidth: 2,
                    lineColor: '#F7A35C',
                    fillColor: 'white'
                }
            }
        ]
    };
    $scope.pieChartData = {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
            options3d: {
                enabled: true,
                alpha: 45,
                beta: 0
            }
        },
        title: {
            text: 'Againist all Teams'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                depth: 45,
                dataLabels: {
                    enabled: false
                },
                showInLegend: true
            }
        },
        series: [{
            name: 'Brands',
            colorByPoint: true,
            data: ''
        }]
    };
}

var mainApp = angular.module('mainApp', [ 'ui.grid', 'ngTouch']);
mainApp.controller('MainController', MainController);
mainApp.factory('mainService', MainService);



