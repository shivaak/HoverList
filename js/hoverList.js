/**
 *
 * Author : Shiva Krishnan
 * Date :  30-01-2017.
 *
 */


(function($){
    "use strict";

    var HoverListConfig = function(container,options){
        this.$element = $(container);
        this.settings = $.extend({}, $.fn.hoverList.defaults,options);

        this.validateSettings();
        this.init();
    }

    HoverListConfig.prototype= {
        constructor: HoverListConfig,

        validateSettings: function () {
            //validate settings
            this.settings.itemSelectCallBack = typeof this.settings.itemSelectCallBack === "function" ?
                this.settings.itemSelectCallBack : function(){};

        },

        init: function () {
            this.setupList();
            this.createLoadingIcon();
            this.$element.find('div.hoverList.loadingIconDiv').show();
            this.fillList();
            this.$element.find('div.hoverList.loadingIconDiv').hide();

            this.$element.data('hoverList_storedData',this.settings.storedData);
        },

        setupList: function () {
            this.$element.empty();
            this.$element.addClass('hoverList cover').css({
                'width': this.settings.width
            });

            var prev = $("<div></div>").addClass("hoverList prev noscroll");
            var listWrapper = $("<div></div>").addClass("hoverList listWrapper");
            listWrapper.css({
                'height': this.settings.height
            })

            this.$element.addClass('hoverList cover').css({
                'height': listWrapper.height() + 20 + 58 + 12 //20 for padding top and bottom; 58 for up and down button height; 12 is some unknown;
            });

            var next = $("<div></div>").addClass("hoverList next noscroll");

            this.$element.append(prev);
            this.$element.append(listWrapper);
            this.$element.append(next);

            this.registerEvents();

        },

        createLoadingIcon : function(){
            this.$element.find('div.hoverList.loadingIconDiv').remove();

            var loadDiv = $('<div/>').addClass("hoverList loadingIconDiv");

            if(this.settings.loadIconImage!=undefined && this.settings.loadIconImage!=null && this.settings.loadIconImage!='') {
                 $("<img src='" + this.settings.loadIconImage + "' />").appendTo(loadDiv);
            }
            this.$element.append(loadDiv);
        },

        fillList: function () {
            this.$element.find('div.hoverList.listWrapper>ul.hoverList.dynamicList').remove();

            var uList = $('<ul/>').addClass("hoverList dynamicList");
            var thisObj = this;
            $.each(this.settings.listData, function (i) {
                var li = $('<li/>').addClass('ui-menu-item');

                var content = "";
                var hiddenData = "";
                var triggerID = null;
                if($.isPlainObject(thisObj.settings.listData[i])){
                    content = thisObj.settings.listData[i].content;
                    hiddenData = thisObj.settings.listData[i].storedData !== undefined ? thisObj.settings.listData[i].storedData : "";
                    triggerID = thisObj.settings.listData[i].triggerID !== undefined ? thisObj.settings.listData[i].triggerID : null;
                }else{
                    content = thisObj.settings.listData[i];
                }

                var link = $('<a/>')
                    .addClass('ui-link')
                    .text(content)
                    .appendTo(li)
                    .data('hoverList_triggerID',triggerID);

                li.data('hoverList_storedData',hiddenData);

                link.on('click',function(){
                    thisObj.clearSelection();
                    $(this).addClass('list_selected_item');
                    thisObj.settings.itemSelectCallBack.apply(null,$(this));
                });

                uList.append(li);
            });
            this.$element.find('.hoverList.listWrapper').append(uList);
            this.configNextPrevButton();
        },

        registerEvents: function () {
            var scrollSpeed = this.settings.scrollSpeed;
            var thisObj=this;
            var timer;

            this.$element.find("div.hoverList.prev").on('click', function () {
                if ($(this).hasClass('noscroll')) {
                    return;
                }
                //dont execute click event long press is already executed
                thisObj.scrollUp(scrollSpeed);
            });

            this.$element.find("div.hoverList.next").on('click', function () {
                if ($(this).hasClass('noscroll')) {
                    return;
                }
                //dont execute click event long press is already executed
                thisObj.scrollDown(scrollSpeed);
            });


            this.$element.find("div.hoverList.prev").on('mousedown', function () {
                if ($(this).hasClass('noscroll')) {
                    return;
                }

                timer = setInterval(function(){
                    thisObj.scrollUp(scrollSpeed);
                }, 100);
            }).on('mouseup mouseleave',function(){
                clearInterval(timer);
            });

            this.$element.find("div.hoverList.next").on('mousedown', function () {
                if ($(this).hasClass('noscroll')) {
                    return;
                }

                timer = setInterval(function(){
                    thisObj.scrollDown(scrollSpeed);
                }, 100);
            }).on('mouseup mouseleave',function(){
                clearInterval(timer);
            });
        },

        scrollUp: function (scrollSpeed) {
            var thisObj=this;
            this.$element.find("div.hoverList.listWrapper").stop().animate(
             {
                scrollTop:  this.$element.find('div.hoverList.listWrapper').scrollTop()-scrollSpeed
            },{
                    complete:function(){
                        thisObj.configNextPrevButton();
                    }

             });
        },

        scrollDown: function(scrollSpeed){
            var thisObj=this;
            this.$element.find("div.hoverList.listWrapper").stop().animate({
                scrollTop: this.$element.find('div.hoverList.listWrapper').scrollTop() + scrollSpeed
            },{
                complete:function(){
                    thisObj.configNextPrevButton();
                }
            });

        },

        clearSelection: function(){
            this.$element.find("li.ui-menu-item>a.ui-link").removeClass('list_selected_item');
        },

        isElementInView: function (element) {
            if(element==undefined || element==null || element.length<=0){
                return;
            }
            var wrapper = this.$element.find("div.hoverList.listWrapper");
            var pageTop = wrapper.offset().top;
            var pageBottom = pageTop + wrapper.height();
            var elementTop = $(element).offset().top;
            var elementBottom = elementTop + $(element).height();

            return ((pageTop <= elementTop) && (pageBottom >= elementBottom));
        },

        configNextPrevButton: function(element){
            this.$element.find("div.hoverList.prev").removeClass('noscroll');
            this.$element.find("div.hoverList.next").removeClass('noscroll');
            var isElementInView = this.isElementInView(this.$element.find('div.hoverList.listWrapper').find("li:first-child"));
            if (isElementInView) {
                this.$element.find("div.hoverList.prev").addClass('noscroll');
            }

            var isElementInView = this.isElementInView(this.$element.find('div.hoverList.listWrapper').find("li:last-child"));
            if (isElementInView) {
                this.$element.find("div.hoverList.next").addClass('noscroll');
            }
        },

        callActionOnEachItem:function(options){
            var ul = this.$element.find("div.hoverList.listWrapper>ul.hoverList.dynamicList");

            var actionMethods = [];

            //not array -> push into an array
            if(Object.prototype.toString.call(options.actionMethod) === '[object Array]'){
                actionMethods = options.actionMethod;
            }else{
                actionMethods.push(options.actionMethod);
            }

            for(var i=0;i<actionMethods.length;i++) {
                var callBack = typeof actionMethods[i] === "function" ?
                    actionMethods[i] : function () {};

                $(ul).find('li').each(function () {
                    var argumentArr = [this];
                    argumentArr = argumentArr.concat(options.callBackParams);
                    callBack.apply(null, argumentArr);
                });
            }

        },

        triggerClick:function(options){
            var ul = this.$element.find("div.hoverList.listWrapper>ul.hoverList.dynamicList");

            $(ul).find('li a').filter(function(){
                return $(this).data('hoverList_triggerID')== options.triggerBy;
            }).trigger('click');

        },

        reloadData:function(options){
            this.settings.listData = options.listData;
            this.fillList();
        }

    }


    $.fn.hoverList = function(option){
        var $this = $(this);

        try{
            //if option is object then assign it to options variable
            var options = typeof option === 'object' && option;

            //get data from the container
            var data = $this.data('hoverList');

            if(!data){
                if(option==='isHoverListInitialized'){
                    return false;
                }
            }

            //if container is not initialized and option is not an object
            if (!data && typeof option !== 'object') {
                //only destroy command is possible for a uninitialized container

                if(option!=='destroy') {
                    throw new Error('HoverList is not initialized');
                }
                return $this;
            }

            //initializing
            if (!data) {
                $this.data('hoverList', (data = new HoverListConfig(this, options)));
            }

            if(typeof option == 'string') {
                // get option argument.
                var args = Array.prototype.slice.call(arguments, 1);
                if (args === undefined || args.length <= 0) {
                    args = [
                        {}
                    ];
                }
                switch (option) {
                    case "clear_selection":
                        $this.data("hoverList", data.clearSelection());
                        break;
                    case "storedData":
                        var storeData = "";
                        var opt = args.pop();
                        if(opt.element!=undefined || opt.element!=null ) {
                            var element = opt.element;
                            storeData =data.$element.find(element).data('hoverList_storedData');
                        }else{
                            storeData = data.$element.data('hoverList_storedData');
                        }
                        return storeData;
                        break;
                    case "updateStoredData":
                        var storeData = "";
                        var opt = args.pop();
                        if(opt.element!=undefined || opt.element!=null ) {
                            var element = opt.element;
                            data.$element.find(element).removeData('hoverList_storedData');
                            data.$element.find(element).data('hoverList_storedData',opt.storedData);
                            return data.$element.find(element);
                        }else{
                            data.$element.data('hoverList_storedData',this.settings.storedData);
                            return data.$element;
                        }

                        break;
                    case "callActionOnEachItem":
                        $this.data("hoverList", data.callActionOnEachItem(args.pop()));
                        break;
                    case "reloadData":
                        $this.data("hoverList", data.reloadData(args.pop()));
                        break;
                    case "triggerClick":
                        $this.data("hoverList", data.triggerClick(args.pop()));
                        break;
                    case "get_selection_element":
                        var selectedElement="";
                        data.$element.find("ul.hoverList.dynamicList li.ui-menu-item>a.ui-link").each(function(i,val){
                             if($(this).hasClass('list_selected_item')){
                                 selectedElement = val;
                                 return false;
                             }
                        });
                        return selectedElement;
                        break;
                    case "get_selection_triggerId":
                        var selectedElement_triggerId="";
                        data.$element.find("ul.hoverList.dynamicList li.ui-menu-item>a.ui-link").each(function(i,val){
                            if($(this).hasClass('list_selected_item')){
                                selectedElement_triggerId = $(val).data('hoverList_triggerID');
                                return false;
                            }
                        });
                        return selectedElement_triggerId;
                        break;
                    case "destroy":
                       // $this.data('hoverList', data.clearAll());
                        $this.removeData("hoverList");
                        $this.empty();
                        break;
                }
            }


        }catch(e){
            alert(e.message);
        }
        return $this;

    }

    $.fn.hoverList.defaults={
        height : '100%',
        width : '100%',
        scrollSpeed : 150,
        listData : [], // array of data to be populated
        loadIconImage : '',
        itemSelectCallBack : null, // On Click call back for each item
        storedData : null // this will be the stored information for the entire hoverList container
    }


})(jQuery);