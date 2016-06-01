+function ($) {
    'use strict';
    var cutPhoto         = function (data, callback) {

        var options = cutPhoto_options.defaults;

        $("#" + data.browse_button).bind("change", function (event) {
            //通过 this.files 取到 FileList ，这里只有一个
            //通过file.size可以取得图片大小
            $.showPreloader('加载中，请稍候');
            var reader = new FileReader();
            $(imgCutPreview).css({"width": "", "height": ""});

            reader.onload      = function (evt) {
                document.getElementById(imgCutPreview.attr('id')).src = evt.target.result;
                $.hidePreloader();
            };
            options.cutImgData = reader.readAsDataURL(this.files[0]);
        });
        var containerNode         = $('#' + data.container),
            wrapper               = $("<div />", {
                id : "wrapper",
                css: {
                    padding: ".5rem"
                }
            }),
            componentNode         = $("<div />", {
                id : "component_node",
                css: {
                    position  : "relative",
                    margin    : "0 auto",
                    border    : "1px green solid",
                    width     : "302px",
                    height    : "302px",
                    background: "#eee",
                    overflow  : "hidden"
                }
            }),
            cutWrapperNode        = $("<div />", {
                id : "cut_wrapper_node",
                css: {
                    overflow : "hidden",
                    display  : "none",
                    position : "absolute",
                    top      : "0",
                    left     : "0",
                    "z-index": "15"
                }
            }),
            imgCutPreview         = $("<img />", {
                id : "img_cut_preview",
                css: {
                    border: "0"
                }
            }).on("load", function () {
                options.cutImgWidth  = document.getElementById(imgCutPreview.attr('id')).width;
                options.cutImgHeight = document.getElementById(imgCutPreview.attr('id')).height;
                imgCutPreviewWidthAndHeightInit();
                imgCutPreviewWidthAndHeight();
                mainCutterWidthAndHeight();
                cutBoxWidthAndHeightInit();
                cutBoxWidthAndHeight();
                options.initStatus        = true;
                options.processInitStatus = true;
                options.processPercent    = 100;
                options.processPointX     = options.processBarWidth;
                processPoint.css("left", options.processPointX + "px");
            }),
            cutBox                = $("<div />", {
                id : "cut_box",
                css: {
                    position  : "absolute",
                    width     : "200px",
                    height    : "200px",
                    opacity   : ".5",
                    background: "gray"
                }
            }).bind("touchstart", function (event) {
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
            }),
            imgBackground         = $("<div />", {
                id : "img_background",
                css: {
                    position         : "relative",
                    width            : "100%",
                    height           : "100%",
                    "background"     : "url('" + data.filters_background + "')",
                    "background-size": "100%",
                    "z-index"        : "10",
                    opacity          : ".1"
                }
            }),
            cropper               = $("<canvas />", {
                id : "cropper",
                css: {
                    display: "none",
                    border : "1px solid red",
                    width  : "300px",
                    height : "300px"
                }
            }),
            wrapperFooter         = $("<div />", {
                id : "wrapper_footer",
                css: {
                    "margin-left": "0",
                    "overflow"   : "hidden"
                }
            }),
            spanTitleNode         = $("<span />", {
                text: "图片裁剪",
                css : {
                    "font-size"  : "12px",
                    "height"     : "20px",
                    "line-height": "20px",
                    "text-align" : "center",
                    "background" : "#F88103",
                    "color"      : "#fff",
                    "width"      : "20%",
                    "margin"     : "0",
                    "box-sizing" : "border-box",
                    "float"      : "left"
                }
            }),
            wrapperFooterRightBox = $("<div />", {
                css: {
                    "background": "#F88103",
                    "width"     : "80%",
                    "margin"    : "0",
                    "box-sizing": "border-box",
                    "float"     : "left"
                }
            }),
            processBar            = $("<div />", {
                id : "process_bar",
                css: {
                    "margin"            : "0 auto",
                    "position"          : "relative",
                    "width"             : "220px",
                    "height"            : "20px",
                    "background"        : "#e7e7e7",
                    "border-radius"     : "3px",
                    "border"            : "1px solid #f60",
                    "-moz-box-shadow"   : "1px 1px 1px rgba(153,153,153,.15) inset",
                    "-webkit-box-shadow": "1px 1px 1px rgba(153,153,153,.15) inset",
                    "box-shadow"        : "1px 1px 1px rgba(153,153,153,.15) inset"
                }
            }).bind("touchstart", function (event) {
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
                processPoint.css("left", options.processPointX + "px");
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
            }),
            processPoint          = $("<div />", {
                id : "process_point",
                css: {
                    "background"   : "#F88103",
                    "width"        : "18px",
                    "height"       : "18px",
                    "position"     : "absolute",
                    "border-radius": "50%",
                    "left"         : "0",
                    "top"          : "0"
                }
            });


        function imgCutPreviewWidthAndHeightInit() {
            var scale = Math.max(options.cutImgWidth / options.width, options.cutImgHeight / options.height);
            if (scale > 1) {
                options.cropViewInitWidth = options.cropViewWidth = parseInt(Math.floor(options.cutImgWidth / scale));
                options.cropViewInitHeight = options.cropViewHeight = parseInt(Math.floor(options.cutImgHeight / scale));
            } else {
                options.cropViewInitWidth = options.cropViewWidth = options.cutImgWidth;
                options.cropViewInitHeight = options.cropViewHeight = options.cutImgHeight;
            }
            options.cropLeft = parseInt((options.width - options.cropViewWidth) / 2);
            options.cropTop  = parseInt((options.height - options.cropViewHeight) / 2);
        }

        function imgCutPreviewWidthAndHeight() {
            if (options.cropViewHeight > options.cropViewWidth) {
                options.cropViewWidth  = parseInt(Math.floor(options.width * (options.cropViewInitWidth / options.height)));
                options.cropViewHeight = options.height;
            } else if (options.cropViewHeight < options.cropViewWidth) {
                options.cropViewHeight = parseInt(Math.floor(options.height * (options.cropViewInitHeight / options.width)));
                options.cropViewWidth  = options.width;
            } else {
                options.cropViewWidth = options.cropViewHeight = options.height;
            }
            imgCutPreview.css({
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
            cutWrapperNode.css({
                "display": "block",
                "width"  : options.cropViewWidth + "px",
                "height" : options.cropViewHeight + "px",
                "left"   : options.cropLeft + "px",
                "top"    : options.cropTop + "px"
            });
        }

        function cutBoxWidthAndHeightInit() {
            var scale = Math.max(options.cutWidth / options.cropViewWidth, options.cutHeight / options.cropViewHeight);
            if (scale > 1) {
                options.cutViewWidth  = parseInt(Math.floor(options.cutWidth / scale));
                options.cutViewHeight = parseInt(Math.floor(options.cutHeight / scale));
            } else {
                options.cutViewHeight = options.cutHeight;
                options.cutViewWidth  = options.cutWidth;
            }
            options.cutMaxWidth   = options.cutViewWidth;
            options.cutMaxHeight  = options.cutViewHeight;
            options.cutLeft       = parseInt(Math.floor((options.cropViewWidth - options.cutViewWidth)) / 2);
            options.cutTop        = parseInt(Math.floor((options.cropViewHeight - options.cutViewHeight)) / 2);
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
            cutBox.css({
                "display": "block",
                "width"  : options.cutViewWidth + "px",
                "height" : options.cutViewHeight + "px",
                "left"   : options.cutLeft + "px",
                "top"    : options.cutTop + "px"
            });
        }

        cutWrapperNode.append(imgCutPreview, cutBox);
        componentNode.append(cutWrapperNode, imgBackground);
        wrapper.append(componentNode, cropper);
        processBar.append(processPoint);
        wrapperFooterRightBox.append(processBar);
        wrapperFooter.append(spanTitleNode, wrapperFooterRightBox);
        containerNode.append(wrapper, wrapperFooter);


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
            output.getContext("2d").drawImage(document.getElementById(imgCutPreview.attr("id")), _o_x, _o_y, _o_width, _o_height, 0, 0, output.width, output.height);
            return output.toDataURL("image/jpeg");
        }, true)
    };
    var cutPhoto_options = {
        defaults: {
            width             : 300,
            height            : 300,
            cutWidth          : 300,
            cutHeight         : 300,
            cutMinSize        : 50,//裁剪框最小尺寸，即最小可以缩放到这个size，width及height任意一个都无法小于这个值。
            //--系统自带，运行时自动运算，请不要修改。
            cropViewWidth     : 0,//在画布里面显示的最大宽度
            cropViewHeight    : 0,//在画布里面显示的最大高度
            cropViewInitWidth : 0,
            cropViewInitHeight: 0,
            cropLeft          : 0,
            cropTop           : 0,
            //--裁剪框
            cutViewWidth      : 0,   //当前宽度，
            cutViewHeight     : 0,//当前高度
            cutMaxWidth       : 0,   //裁剪框最大宽度。
            cutMaxHeight      : 0,//裁剪框最大高度。
            //--四象限。用于判断距离。
            cutBoxLimitX1     : 0,
            cutBoxLimitX2     : 0,
            cutBoxLimitY1     : 0,
            cutBoxLimitY2     : 0,
            cutLeft           : 0,//裁剪框绝对定位，左侧距离。
            cutTop            : 0,//裁剪框绝对定位，离顶部距离。
            initStatus        : false,//当前组件是否已经初始化了。
            cutImgWidth       : 0,
            cutImgHeight      : 0,
            cutImgData        : "",
            processBeginX     : 0,//触摸时候起始点
            processBeginY     : 0,//触摸时候起始点
            processEndX       : 0,//触摸时候终点
            processEndY       : 0,//触摸时候终点
            processBarWidth   : 200,//进度条长度
            processPointX     : 0,//当前指示点位置
            processPointY     : 0,
            processPercent    : 0,//百分比值。
            processInitStatus : false
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