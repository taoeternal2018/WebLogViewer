(function () {
    // Private function
    function getColumnsForScaffolding(data) {
        if ((typeof data.length !== 'number') || data.length === 0) {
            return [];
        }
        var columns = [];
        for (var propertyName in data[0]) {
            columns.push({ headerText: propertyName, rowText: propertyName });
        }
        return columns;
    }

    ko.dataGrid = {
        // Defines a view model class you can use to populate a grid
        viewModel: function (configuration) {
            var self = this;
            self.father = configuration.father;
            self.data = configuration.data;
            self.currentPageIndex = ko.observable(1);
            self.isNum = function(s) {
                if (s !== null && s !== "") {
                    return !isNaN(s);
                }
                return false;
            }
            self.currentPageIndex.subscribe(function (newValue) {
                if(!self.isNum(newValue))
                    self.currentPageIndex(1);
                if (newValue < 1)
                    self.currentPageIndex(1);
                if (self.currentPageIndex() > self.maxPageIndex())
                    self.currentPageIndex(self.maxPageIndex());
                //self.getPageItems(self.currentPageIndex());
            });
            self.pageSize = configuration.pageSize || 50;
            
            self.columns = configuration.columns || getColumnsForScaffolding(ko.unwrap(self.data));

            self.maxPageIndex = ko.observable(0);

            self.hasPrevious = ko.computed(function () {
                return self.currentPageIndex() !== 0;
            });
            self.hasNext = ko.computed(function () {
                return self.currentPageIndex() !== self.maxPageIndex;
            });
            self.next = function () {
                if (self.currentPageIndex() < self.maxPageIndex()) {
                    //use parseInt to avoid ambiguity of "+"
                    self.currentPageIndex(parseInt(self.currentPageIndex()) + 1);
                }
                self.getPageItems(self.currentPageIndex());
            }

            self.previous = function () {
                if (self.currentPageIndex() >1) {
                    self.currentPageIndex(self.currentPageIndex() - 1);
                }
                self.getPageItems(self.currentPageIndex());
            }
            self.first = function () {
                self.currentPageIndex(1);
                self.getPageItems(self.currentPageIndex());
            }
            self.last = function () {
                self.currentPageIndex(self.maxPageIndex());
                self.getPageItems(self.currentPageIndex());
            }
            self.refresh = function ()
            {
                self.father.getLatestLogs(self.currentPageIndex());
            }
            self.keyPress = function (data, event)
            {
                if (event.keyCode === 13) {
                    $(event.target).blur();
                }
                return true;
            }
            self.getPageItems = function (page) {
                self.father.getLatestLogs(page)
            }

        }
    };

    // Templates used to render the grid
    var templateEngine = new ko.nativeTemplateEngine();

    templateEngine.addTemplate = function (templateName, templateMarkup) {
        document.write("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "<" + "/script>");
    };

    templateEngine.addTemplate("ko_dataGrid_grid", "\
                    <table class=\"table table-responsive table-condensed logs\" cellspacing=\"0\">\
                        <thead>\
                            <tr data-bind=\"foreach: columns\">\
                               <th data-bind=\"text: headerText,css:rowCss\"></th>\
                            </tr>\
                        </thead>\
                        <tbody id=\"log-content\" data-bind=\"foreach: data\">\
                           <tr data-bind=\"foreach: $parent.columns, css:Class\">\
                               <td data-bind=\"text: typeof rowText == 'function' ? rowText($parent) : $parent[rowText] \"></td>\
                            </tr>\
                        </tbody>\
                    </table>");

    // The "dataGrid" binding
    ko.bindingHandlers.dataGrid = {
        init: function () {
            return { 'controlsDescendantBindings': true };
        },
        // This method is called to initialize the node, and will also be called again if you change what the grid is bound to
        update: function (element, viewModelAccessor, allBindings) {
            var viewModel = viewModelAccessor();

            // Empty the element
            while (element.firstChild)
                ko.removeNode(element.firstChild);

            // Allow the default templates to be overridden
            var gridTemplateName = allBindings.get('dataGridTemplate') || "ko_dataGrid_grid",
                pageLinksTemplateName = allBindings.get('dataGridPagerTemplate') || "ko_dataGrid_pageLinks";

            // Render the main grid
            var gridContainer = element.appendChild(document.createElement("DIV"));
            ko.renderTemplate(gridTemplateName, viewModel, { templateEngine: templateEngine }, gridContainer, "replaceNode");

        }
    };
})();