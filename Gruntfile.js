/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg   : grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'//添加banner
            },
            build_1: {//任务一：压缩a.js，不混淆变量名，保留注释，添加banner和footer
                options: {
                    mangle          : true, //混淆变量名
                    preserveComments: false, //'all'不删除注释，还可以为 false（删除全部注释），some（保留@preserve @license @cc_on等注释）
                    footer          : '\n/*! <%= pkg.name %> 最后修改于： <%= grunt.template.today("yyyy-mm-dd") %> */'//添加footer
                },
                files  : {
                    'zepto.cutphoto.min.js': ['js/zepto.cutphoto.js']
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    // 加载提供"uglify"任务的插件
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // 默认任务
    grunt.registerTask('defaultrelease', ['uglify:release']);
    grunt.registerTask('min1', ['uglify:build_1']);
    grunt.registerTask('min2', ['uglify:build_2']);
    grunt.registerTask('min3', ['cssmin:build_3']);
    grunt.registerTask('min4', ['cssmin:build_4']);
    grunt.registerTask('default', ['concat']);
}
