ko.bindingHandlers.datepicker = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var $el = $(element);
        var options = allBindingsAccessor().datepickerOptions || {};

        //initialize datepicker with some optional options
        $el.datepicker(options);
        $el.datepicker('setDate', new Date());

        //handle the field changing
        ko.utils.registerEventHandler(element, "change", function () {
            var observable = valueAccessor();
            observable($.datepicker.formatDate('yy-mm-dd', $el.datepicker("getDate")));
            ko.dataFor(element).updateLogs();
        });


        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $el.datepicker("destroy");
        });
    }
};

var ToyotaConnect = ToyotaConnect || {};
ToyotaConnect.Nlog = ToyotaConnect.Nlog || {};

ToyotaConnect.Nlog.LogViewModel = function ViewModel() {
    var self = this,
        timeout;
    var requestDelay = 1000;
    function defaultOnError(message) {
        console.error("Error: " + message);
    }

    function defaultOnSuccess() { }

    var mom = new moment(new Date());
    self.selectedDate = ko.observable(mom.format('YYYY-MM-DD'));

    self.updateLogs = function () {
        var selectedJob = $("#selectedJob").val();
        if ((typeof selectedJob === 'undefined') || (selectedJob === null))
            return;

        self.gridViewModel.currentPageIndex(1);
        self.getLatestLogs(1);
    }

    self.items = ko.observableArray([]);
    self.selectJobs = ko.observableArray([{
        "text": "Select a job:",
        "value": "0"
    }]);

    self.pageSize = 50;
    self.allItems = 0;
    self.needPager = ko.observable(false);
    self.needAdditionalInfo = ko.observable(false);
    self.additionalInfo = ko.observable("");

    self.gridViewModel = new ko.dataGrid.viewModel({
        father:self,
        data: self.items,
        columns: [
            { rowCss: "col-md-2",  headerText: "Timestamp", rowText: "Date" },
            { rowCss: "col-md-2", headerText: "Server Name", rowText: "ServerName" },
            { rowCss: "col-md-2", headerText: "Service Account", rowText: "ServiceAccount" },
            { rowCss: "col-md-1", headerText: "Level", rowText: "Level" },
            { rowCss: "col-md-1", headerText: "Logger", rowText: "Logger" , },
            { rowCss: "col-md-4", headerText: "Message", rowText: "Message" }
        ],
        pageSize: self.pageSize,
        totalPages:ko.observable(0)
    });

    self.getJobsInfo = function () {

        var uri = 'api/job/getJobs';
        $.getJSON(uri)
            .done(function (data) {
                if (data) {
                    self.selectJobs.removeAll();
                    $.each(data, function (key, value) {
                        self.selectJobs.push({
                            "text": value.Name,
                            "value": value.Path
                        });
                    });
                }
            });
    }

    self.getTotalPages = function () {
        var logUri = 'api/job/getTotalPages?date=' + self.selectedDate() + '&path=' + $("#selectedJob").val() + '&pageSize=' + self.gridViewModel.pageSize;
        $.getJSON(logUri)
            .done(function (data) {
                if (data !== null) {
                    if (data.hasError) {
                        self.needAdditionalInfo(true);
                        self.additionalInfo(data.errorMessage);
                    }
                    else {
                        self.needAdditionalInfo(false);
                        self.additionalInfo("")
                        var total = parseInt(data.Pages);
                        self.allItems = parseInt(data.Items);
                        self.needPager(total > 1 ? true : false);
                        self.gridViewModel.maxPageIndex(total);
                    }
                }
            })
    }

    self.getLatestLogs = function(pg) {

        self.getTotalPages();
        $('#logDataGrid').loading();
        var path = $("#selectedJob").val();
        if (path === null || path ==="null")
            return;

        var uri = 'api/log/get?date=' + self.selectedDate() + '&path=' + path + '&pageSize=' + self.gridViewModel.pageSize+"&page="+pg;
        $.getJSON(uri)
                .done(function (data) {
                    if (data) {
                        if (data.hasError) {
                            self.needAdditionalInfo(true);
                            self.additionalInfo(data.errorMessage);
                        }
                        else {
                            self.needAdditionalInfo(false);
                            self.additionalInfo("")

                            self.items.removeAll();
                            if (data.items.length === 0) {
                                self.needAdditionalInfo(true);
                                self.additionalInfo("No logs found.")
                            }
                            else {
                                $.each(data.items, function (key, item) {
                                    if (item !== null) {
                                        item['Class'] = item.Level;
                                        self.items.push(item);
                                    }
                                });
                            }
                        }
                    }

                    $('#logDataGrid').loading('stop');
                });
        
    }

}
