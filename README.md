# zepto_cutphoto
基于zepto的图片裁剪工具

### 使用方法：

在 html 文件中引入 zepto.cutphoto.js 文件并添加 [id=container_node] 标签

    <script type="text/javascript" src="zepto.cutphoto.min.js" charset="utf-8"></script>

    <div id="container_node"></div>

    <script>
        $.cutPhoto(
            {
                container         : "container_node",
                browse_button     : "browseFile",
                save_button       : "saveimg",
                filters_background: "<%= locals.userInfo.photo_url %>"
            },
            function (cutPhotoCacheData, initStatus) {
                var imgData   = cutPhotoCacheData();
                //todo
            }
        );
    </script>