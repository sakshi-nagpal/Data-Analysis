(function() {
    'use strict';

    angular.module('mainApp')
        .directive('graphPlugin', function(){
            function link(scope,element){

                scope.$watch('graphData',function(newData,oldData){
                    if(newData) {
                        element.find('.graph-container').highcharts(newData);
                    }
                });
                scope.$watch('graphData.series[0].data',function(newData,oldData) {
                    if(oldData) {
                        var chart = element.find('.graph-container').highcharts();
                        chart.series[0].setData(newData);
                    }
                });
                scope.$watch('graphData.series[1].data',function(newData,oldData) {
                    if(oldData) {
                        var chart = element.find('.graph-container').highcharts();
                        chart.series[1].setData(newData);
                    }
                });
            }
            return {
                restrict: 'E',
                scope : {
                    graphData: '='
                },
                template: "<div class='graph-container'></div>",
                link:link
            }
        })
})();

