(function() {
    'use strict';

    angular.module('mainApp')
        .directive('uiDataGrid', function(){
            function link($scope) {
                var error = {
                    noData:'No Data Available',
                    noResults:'No Search Results Found'
                };
                $scope.gridData = {};
                $scope.gridData = JSON.parse(JSON.stringify($scope.gridConfig));
                $scope.errorMessage = '';
                $scope.gridTitle= $scope.gridData.title;
                var fieldNameArr = [];
                $scope.data = {
                    filterValue :''
                };
                $scope.onElementClick = function(event, data){
                    var callback = $(event.currentTarget).data('callback');
                    if(callback === 'undefined'){
                        return;
                    }
                    $scope[callback]({data: data, event :event});
                };
                $scope.searchEnabled = $scope.gridData.searchConfig;
                if($scope.searchEnabled){
                    $scope.placeholderText = $scope.gridData.searchConfig.placeholderText;
                    $scope.searchTitle = $scope.gridData.searchConfig.searchTitle || 'Enter the Search Term';
                }
                $scope.gridData.columns.forEach(function(column, index){
                    var template = '';
                    if(column.hasOwnProperty('showCount')){
                        column.showCount = true;
                    }
                    if(column.field && column.field.trim() !== ''){
                        fieldNameArr.push(column.field);
                        template = '<span class="mll text-base show-ellipsis" ellipsis-tooltip="COL_FIELD">{{COL_FIELD}}</span>';
                    }
                    if(column.hasOwnProperty('cellTemplate')){
                        var cellTemplateattr = column.cellTemplate;
                        cellTemplateattr.forEach(function(cell){
                            if(cell.field){
                                cell.displayName = '{{row.entity.'+cell.field+'}}';
                            }else{
                                cell.displayName = cell.staticDisplayName;
                            }
                            if(cell.type === 'button'){
                                template += '<button class="'+cell.className+'" ' +
                                    'ng-click="grid.appScope.onElementClick($event, row.entity)" '+cell.attr+'' +
                                    ' data-callback='+cell.callback+'>'+cell.displayName+'</button>&nbsp;';
                            }
                            else if(cell.type === 'link'){
                                cell.href = cell.href || 'javascript:void(0)';
                                template  += '<a class="'+cell.className+'" href="'+cell.href+'"' +
                                    ' ng-click="grid.appScope.onElementClick($event, row.entity)"'+cell.attr+ '' +
                                    ' data-callback='+cell.callback+'>'+cell.displayName+'</a>&nbsp;';
                            }
                            else if(cell.type === 'html'){
                                var cellTemplate = $compile(cell.template)($scope);
                                if(cell.callback){
                                    $(cellTemplate).attr('ng-click','grid.appScope.'+cell.callback+ '()');
                                }
                                template += cellTemplate[0].outerHTML;
                            } else if(cell.type === 'ng-repeat') {
                                template += cell.template;
                            }
                        });
                    }
                    column.cellTemplate = template;

                });

                $scope.gridOptions = {
                    data: $scope.gridData.data,
                    columnDefs: $scope.gridData.columns,
                    rowHeight: ($scope.gridData.rowHeight) ? ($scope.gridData.rowHeight) : 40,
                    enableColumnMenus: false,
                    enableRowHeaderSelection: false,
                    onRegisterApi: function(gridApi){
                        $scope.gridApi = gridApi;
                        if(data && data.length) {
                            $scope.gridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
                        }
                    }
                };
                var data = $scope.gridOptions.data;
                if(data && data.length){
                    if($scope.searchEnabled){
                        $scope.errorMessage = error.noResults;
                    }
                }else{
                    $scope.errorMessage = error.noData;
                }
                $scope.clearText = function(){
                    $scope.data.filterValue = '';
                    $scope.filterRows();
                };

                $scope.filterRows = function(filterValue){
                    $scope.gridApi.grid.refresh();
                };

                $scope.singleFilter = function( renderableRows ){
                    var count = 0;
                    var matcher = new RegExp($scope.data.filterValue, 'i');
                    renderableRows.forEach( function( row ) {
                        var match = false;
                        fieldNameArr.forEach(function( field ){
                            if ( row.entity[field].match(matcher) ){
                                match = true;
                            }
                        });
                        if ( !match ){
                            row.visible = false;
                            count++;

                        }
                    });
                    $scope.resultCount = renderableRows.length-count;
                    if(!$scope.resultCount){
                        $scope.errorMessage = error.noResults;
                    } else {
                        $scope.errorMessage = null;

                    }
                    return renderableRows;
                };
            }
            return {
                restrict: 'E',
                scope : {
                    buttonCallback :'&',
                    onRowSelect: '&',
                    linkCallback :'&',
                    gridConfig : '=',
                    onColumnFilter : '&'
                },
                templateUrl: './directives/uiDataGrid/uiDataGrid.directive.html',
                link:link
            }
        });
})();

