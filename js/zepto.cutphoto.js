+function ($) {
    'use strict';
    var cutPhoto         = function (browseFile, imgCutPreview, cutBox, mainCutter, processBar, processPoint, callback) {
        var options = cutPhoto_options.defaults;

        function imgCutPreviewWidthAndHeightInit() {
            //--计算比例，将其放到canvas里面。
            var scale = Math.max(options.cutImgWidth / options.width, options.cutImgHeight / options.height);
            if (scale > 1) {
                options.cropViewWidth  = parseInt(Math.floor(options.cutImgWidth / scale));
                options.cropViewHeight = parseInt(Math.floor(options.cutImgHeight / scale));
            } else {
                options.cropViewWidth  = options.cutImgWidth;
                options.cropViewHeight = options.cutImgHeight;
            }
            //--计算画布里面的图像的位置。
            options.cropLeft = parseInt((options.width - options.cropViewWidth) / 2);
            options.cropTop  = parseInt((options.height - options.cropViewHeight) / 2);
        }

        function imgCutPreviewWidthAndHeight() {

            if (options.cropViewHeight > options.cropViewWidth) {
                options.cropViewWidth  = parseInt(Math.floor(options.width * (options.cropViewHeight / options.height)));
                options.cropViewHeight = options.height;
            } else if (options.cropViewHeight < options.cropViewWidth) {
                options.cropViewHeight = parseInt(Math.floor(options.height * (options.cropViewWidth / options.width)));
                options.cropViewWidth  = options.width;
            } else {
                options.cropViewWidth = options.cropViewHeight = options.height;
            }
            $(imgCutPreview).css({
                "width" : options.cropViewWidth + "px",
                "height": options.cropViewHeight + "px"
            });
        }

        function mainCutterWidthAndHeight() {
            if (options.cropViewHeight > options.cropViewWidth) {
                options.cropTop  = 0;
                options.cropLeft = parseInt(Math.floor((options.width - options.cropViewWidth) / 2));
            } else if (options.cropViewHeight < options.cropViewWidth) {
                options.cropLeft = 0;
                options.cropTop  = parseInt(Math.floor((options.height - options.cropViewHeight) / 2));
            } else {
                options.cropLeft = options.cropTop = 0;
            }
            $(mainCutter).css({
                "display": "block",
                "width"  : options.cropViewWidth + "px",
                "height" : options.cropViewHeight + "px",
                "left"   : options.cropLeft + "px",
                "top"    : options.cropTop + "px"
            });
        }

        function cutBoxWidthAndHeightInit() {
            //--计算裁剪框实际大小及实际位置。
            //计算裁剪框的位置。
            var scale = Math.max(options.cutWidth / options.cropViewWidth, options.cutHeight / options.cropViewHeight);
            if (scale > 1) {
                options.cutViewWidth  = parseInt(Math.floor(options.cutWidth / scale));
                options.cutViewHeight = parseInt(Math.floor(options.cutHeight / scale));
            }
            else {
                options.cutViewHeight = options.cutHeight;
                options.cutViewWidth  = options.cutWidth;
            }
            options.cutMaxWidth  = options.cutViewWidth;
            options.cutMaxHeight = options.cutViewHeight;

            options.cutLeft       = parseInt(Math.floor((options.cropViewWidth - options.cutViewWidth)) / 2);
            options.cutTop        = parseInt(Math.floor((options.cropViewHeight - options.cutViewHeight)) / 2);
            //-四象限。
            options.cutBoxLimitX1 = 0;
            options.cutBoxLimitX2 = options.cropViewWidth;
            options.cutBoxLimitY1 = 0;
            options.cutBoxLimitY2 = options.cropViewHeight;
        }

        function cutBoxWidthAndHeight(move) {
            if (!move) {
                if (options.cropViewHeight > options.cropViewWidth) {
                    options.cutLeft       = 0;
                    options.cutViewHeight = options.cutViewWidth = options.cropViewWidth;
                } else if (options.cropViewHeight < options.cropViewWidth) {
                    options.cutTop       = 0;
                    options.cutViewWidth = options.cutViewHeight = options.cropViewHeight;
                } else {
                    options.cutLeft = options.cutTop = 0;
                    options.cutViewWidth = options.cutViewHeight = options.cropViewHeight;
                }
            }
            $(cutBox).css({
                "display": "block",
                "width"  : options.cutViewWidth + "px",
                "height" : options.cutViewHeight + "px",
                "left"   : options.cutLeft + "px",
                "top"    : options.cutTop + "px"
            });
        }

        //--逻辑，点击图片上传选择后将加载预览图片
        $(imgCutPreview).on("load", function () {
            options.cutImgWidth  = document.getElementById(imgCutPreview.substring(1)).width;
            options.cutImgHeight = document.getElementById(imgCutPreview.substring(1)).height;
            imgCutPreviewWidthAndHeightInit();
            imgCutPreviewWidthAndHeight();
            mainCutterWidthAndHeight();
            cutBoxWidthAndHeightInit();
            cutBoxWidthAndHeight();
            options.initStatus        = true;
            options.processInitStatus = true;
            options.processPercent    = 100;
            options.processPointX     = options.processBarWidth;
            $(processPoint).css("left", options.processPointX + "px");
        });
        $(browseFile).bind("change", function (event) {
            //通过 this.files 取到 FileList ，这里只有一个
            //通过file.size可以取得图片大小
            $.showPreloader('加载中，请稍候');
            var reader = new FileReader();
            $(imgCutPreview).css({"width": "", "height": ""});

            reader.onload      = function (evt) {
                document.getElementById(imgCutPreview.substring(1)).src = evt.target.result;
                $.hidePreloader();
            };
            options.cutImgData = reader.readAsDataURL(this.files[0]);
        });
        /**
         * 拖动裁剪框的逻辑处理。
         * */
        $(cutBox).bind("touchstart", function (event) {
            event.preventDefault() && event.stopPropagation();
            options.moveBeginX1 = event.changedTouches[0].pageX;
            options.moveBeginY1 = event.changedTouches[0].pageY;
        }).bind("touchmove", function (event) {
            event.preventDefault() && event.stopPropagation();
            options.moveEndX1 = event.changedTouches[0].pageX;
            options.moveEndY1 = event.changedTouches[0].pageY;
            //--计算是否发生位移，根据位移来定位裁剪框位置。
            //位移量。
            //--当前裁剪框原始位置。
            options.cutLeft += (options.moveEndX1 - options.moveBeginX1);
            options.cutTop += (options.moveEndY1 - options.moveBeginY1);
            //--判断是否在矩形边框，假如超出去，那么就取最终点。
            //--注意，判断相关点的范围。
            if (options.cutLeft < options.cutBoxLimitX1) {
                options.cutLeft = options.cutBoxLimitX1;
            } else if (options.cutLeft > options.cutBoxLimitX2) {
                options.cutLeft = options.cutBoxLimitX2;
            }
            //--顺便判断，加上宽度后，是否超过了范围。
            if ((options.cutLeft + options.cutViewWidth) > options.cutBoxLimitX2) {
                options.cutLeft = options.cutBoxLimitX2 - options.cutViewWidth;
            }
            if (options.cutTop < options.cutBoxLimitY1) {
                options.cutTop = options.cutBoxLimitY1;
            } else if (options.cutTop > options.cutBoxLimitY2) {
                options.cutTop = options.cutBoxLimitY2;
            }
            //--顺便判断，加上裁剪框高度后，是否超过下限。
            if ((options.cutTop + options.cutViewHeight) > options.cutBoxLimitY2) {
                options.cutTop = options.cutBoxLimitY2 - options.cutViewHeight;
            }
            cutBoxWidthAndHeight(true);
            //---将这一点的放回前一点。
            options.moveBeginX1 = options.moveEndX1;
            options.moveBeginY1 = options.moveEndY1;
        }).bind("touchend", function (event) {
            event.preventDefault() && event.stopPropagation();
            return false;
        });
        //--添加触屏事件，监控相关动作。
        //开始触摸
        $(processBar).bind("touchstart", function (event) {
            event.preventDefault() && event.stopPropagation();
            if (!options.processInitStatus) {
                return false;
            }
            options.processBeginX = event.changedTouches[0].pageX;
            options.processBeginY = event.changedTouches[0].pageY;
        }).bind("touchmove", function (event) {
            event.preventDefault() && event.stopPropagation();
            if (!options.processInitStatus) {
                return;
            }
            options.processEndX = event.changedTouches[0].pageX;
            options.processEndY = event.changedTouches[0].pageY;
            //--计算比分比。
            options.processPercent += parseInt((options.processEndX - options.processBeginX) * 100 / options.processBarWidth);
            if (options.processPercent < 0) {
                options.processPercent = 0;
            }
            else if (options.processPercent > 100) {
                options.processPercent = 100;
            }
            //--计算那个指示点位置。
            options.processPointX = parseInt(options.processBarWidth * (options.processPercent / 100));
            $(processPoint).css("left", options.processPointX + "px");
            //--根据百分比，设置裁剪框大小。
            var _new_cut_width  = parseInt(options.cutMaxWidth * (options.processPercent / 100)),
                _new_cut_height = parseInt(options.cutMaxHeight * (options.processPercent / 100));
            if (_new_cut_width > options.cutViewWidth) {
                //--扩大了。
                //--计算当前坐标
                options.cutLeft       = options.cutLeft - parseInt((_new_cut_width - options.cutViewWidth) / 2);
                options.cutTop        = options.cutTop - parseInt((_new_cut_height - options.cutViewHeight) / 2);
                options.cutViewWidth  = _new_cut_width;
                options.cutViewHeight = _new_cut_height;
                cutBoxWidthAndHeight(true);
            } else if (_new_cut_width < options.cutViewWidth) {
                //--缩小了。
                options.cutLeft       = options.cutLeft + parseInt((options.cutViewWidth - _new_cut_width) / 2);
                options.cutTop        = options.cutTop + parseInt((options.cutViewHeight - _new_cut_height) / 2);
                options.cutViewWidth  = _new_cut_width;
                options.cutViewHeight = _new_cut_height;
                cutBoxWidthAndHeight(true);
            }
            //--后续处理。
            options.processBeginX = options.processEndX;
            options.processBeginY = options.processEndY;
        }).bind("touchend", function (event) {
            event.preventDefault() && event.stopPropagation();
            if (!options.processInitStatus) {
                return false;
            }
        });
        callback(function () {
            var output    = document.createElement("canvas"),
                //--坐标换算。
                scale_x   = options.cutImgWidth / options.cropViewWidth,
                scale_y   = options.cutImgHeight / options.cropViewHeight,
                _o_x      = parseInt((scale_x) * options.cutLeft),
                _o_y      = parseInt((scale_y) * options.cutTop),
                //--长度换算
                _o_width  = parseInt(scale_x * options.cutViewWidth),
                _o_height = parseInt(scale_y * options.cutViewHeight);

            output.width  = options.cutWidth;
            output.height = options.cutHeight;
            output.getContext("2d").drawImage(document.getElementById(imgCutPreview.substring(1)), _o_x, _o_y, _o_width, _o_height, 0, 0, output.width, output.height);
            return output.toDataURL("image/jpeg");
        }, true)
    };
    var cutPhoto_options = {
        defaults: {
            width            : 300,
            height           : 300,
            cutWidth         : 300,
            cutHeight        : 300,
            cutMinSize       : 50,//裁剪框最小尺寸，即最小可以缩放到这个size，width及height任意一个都无法小于这个值。
            //--系统自带，运行时自动运算，请不要修改。
            cropViewWidth    : 0,//在画布里面显示的最大宽度
            cropViewHeight   : 0,//在画布里面显示的最大高度
            cropLeft         : 0,
            cropTop          : 0,
            //--裁剪框
            cutViewWidth     : 0,   //当前宽度，
            cutViewHeight    : 0,//当前高度
            cutMaxWidth      : 0,   //裁剪框最大宽度。
            cutMaxHeight     : 0,//裁剪框最大高度。
            //--四象限。用于判断距离。
            cutBoxLimitX1    : 0,
            cutBoxLimitX2    : 0,
            cutBoxLimitY1    : 0,
            cutBoxLimitY2    : 0,
            cutLeft          : 0,//裁剪框绝对定位，左侧距离。
            cutTop           : 0,//裁剪框绝对定位，离顶部距离。
            initStatus       : false,//当前组件是否已经初始化了。
            cutImgWidth      : 0,
            cutImgHeight     : 0,
            cutImgData       : "",
            moveImgBeginX1   : 0,
            moveImgBeginY1   : 0,
            moveImgEndX1     : 0,
            moveImgEndY1     : 0,
            processBeginX    : 0,//触摸时候起始点
            processBeginY    : 0,//触摸时候起始点
            processEndX      : 0,//触摸时候终点
            processEndY      : 0,//触摸时候终点
            processBarWidth  : 200,//进度条长度
            processPointX    : 0,//当前指示点位置
            processPointY    : 0,
            processPercent   : 0,//百分比值。
            processInitStatus: false
        }
    };
    $.cutPhoto           = cutPhoto;
    /*$.cutPhoto                 = function (params) {
     $.extend(params, $.cutPhoto.prototype.defaults);
     return new PhotoBrowser(params);
     };

     $.cutPhoto.prototype = {
     defaults: {}
     };*/
}(Zepto);

$.cutPhoto(
    "#browseFile",
    "#imgCutPreview",
    "#cutBox",
    "#mainCutter",
    "#processBar",
    "#processPoint",
    function (cutPhotoCacheData, initStatus) {
        var imgData   = cutPhotoCacheData();

        $("#saveimg").click(function () {
            if (initStatus == false) {
                alert("请先选择图片！");
                return;
            }
            uploader.start();
        });
    });