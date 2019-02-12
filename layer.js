(function ($, w) {
    function Layer(config) {
        return new Layer.prototype.init(config);
    }

    Layer.config = {
        //弹窗类型
        type: 1,
        //区域大小
        area: 'auto',
        //内容 如果是frame即添url
        content: null,
        //标题
        title: "",
        //自定义className
        className: "monster",
        //是否显示右上角的关闭按钮，关闭后 Esc 按键也将关闭
        closable: true,
        //是否允许点击遮罩层关闭
        maskClosable: true,
        //点击确定按钮时，确定按钮是否显示 loading 状态，开启则需手动设置value来关闭对话框
        loading: false,
        //是否全屏显示
        fullScreen: false,
        //是否显示遮罩层
        mask: true,
    };

    Layer.foundation = {
        //弹窗类型
        type: {
            frame: 1,
            dialog: 2,
            tips: 3
        },
        //索引 标识当前构建第几个
        index: 0,
        //根
        modal: function () {
            return '<div class="' + this.config.className + '-modal ' + this.config.className + '-modal-fade ' + this.config.className + '-modal-fade-in">';
        },
        //dialog
        dialog: function () {
            return '<div class="' + this.config.className + '-modal-dialog">';
        },
        //内容区域
        content: function () {
            return '<div class="' + this.config.className + '-modal-content">';
        },
        //头部区域
        header: function (arg) {
            let header = '<div class="' + this.config.className + '-modal-header">';
            if (arg[1]) {
                header += '<p class="' + this.config.className + '-modal-header-title">' + this.config.title + '</p>';
            }
            if (arg[2]) {
                header += '<button type="button" class="' + this.config.className + '-modal-header-close"><i class="iconfont icon_guanbi icon-close"></i></button>'
            }
            return header + "</div>";
        },
        //内容区域
        body: function () {
            return '<div class="'+this.config.className+'-modal-body">' + this.config.content + '</div>'
        },
        //地脚
        footer: function (arg) {
            let footer = '<div class="'+this.config.className+'-modal-footer">';
            if (arg[1]) {
                footer += '<button type="button" class="'+this.config.className+'-modal-btn '+this.config.className+'-modal-btn-default">关闭</button> ';
            }
            if (arg[2]) {
                footer += ' <button type="button" class="'+this.config.className+'-modal-btn '+this.config.className+'-modal-btn-primary">提交更改</button>';
            }
            return footer + '</div>';
        },
        //构建frame
        frame: function () {
            let name = this.config.className + 'layer-frame' + this.index,
                frame = $('<iframe scrolling="auto" width="100%" height="100%" allowtransparency="true" ' + 'name="' + name + '"' +
                    'class="' + this.config.className + '-layer-load" ' +
                    'frameborder="0" src="' + this.config.content + '"></iframe>');
            return {frame, name}
        }
    };

    Layer.prototype = {
        construct: Layer,
        init: function (config) {
            this.config = $.extend({}, Layer.config, config);
            //设置区域大小
            if(typeof this.config.area==="string"){
                //##如果是字符串格式的转换为数组 数组的好处是如果没填也不会报错
                this.config.area=(this.config.area==="auto")?['','']:[this.config.area,''];
            }
            this.monster = {
                //当前弹窗索引
                index: ++Layer.foundation.index,
                //frame的name属性
                frameName: null,
                //弹窗对象
                modal: null,
                //dialog
                dialog: null,
                //面板
                content: null,
                //头部
                header: null,
                //内容区域
                body: null,
                //底部区域
                footer:null
            };

            this.builder();
        },
        //代理对象
        proxy: function (func) {
            let that = this;
            return (function (arg) {
                return func.call(that, arg);
            })(arguments);
        },
        builder: function () {
            //弹窗类型
            switch (this.config.type) {
                //frame
                case Layer.foundation.type.frame:
                    if (!this.config.content) {
                        throw new Error("content missing...")
                    }
                    this.create();
                    this.createFrame();
                    break;
                default:
                    console.log(2222)
            }
        },
        create: function () {
            this.monster.modal = $(this.proxy(Layer.foundation.modal));
            this.monster.modal.width(this.config.area[0]).height(this.config.area[1]);
            this.monster.dialog = $(this.proxy(Layer.foundation.dialog));
            this.monster.content = $(this.proxy(Layer.foundation.content));
            this.monster.header = $(this.proxy(Layer.foundation.header, true, true));
            this.monster.body = $(this.proxy(Layer.foundation.body));
            this.monster.footer=$(this.proxy(Layer.foundation.footer,true,true));


            this.monster.content.append(this.monster.header);
            this.monster.content.append(this.monster.body);
            this.monster.content.append(this.monster.footer);
            this.monster.dialog.append(this.monster.content);
            this.monster.modal.append(this.monster.dialog);
            $("body").append(this.monster.modal);
        },
        //创建frame
        createFrame: function () {
            let frameObj = this.proxy(Layer.foundation.frame);

            this.monster.frameName = frameObj.name;

            this.monster.body.html(frameObj.frame)
        },
        //获取frame的name
        getFrameName: function () {
            return this.monster.frameName;
        }
    };

    Layer.prototype.init.prototype = Layer.prototype;
    if (!w.layer) {
        w.layer = Layer;
    }
})($, window);
