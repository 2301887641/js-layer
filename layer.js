(function ($, w) {
    function Layer(config) {
        return new Layer.prototype.init(config);
    }

    Layer.config = {
        //弹窗类型
        type: 1,
        //宽度设置
        width: "600px",
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
        //构建frame
        frame: function () {
            let name = this.config.className + 'layer-frame' + this.index,
                frame = '<iframe scrolling="auto" allowtransparency="true" ' + 'name="' + name + '"' +
            'class="' + this.config.className + '-layer-load" ' +
            'frameborder="0" src="' + this.config.content + '"></iframe>';
            return {
                frame,
                name
            }
        }
    };

    Layer.prototype = {
        construct: Layer,
        init: function (config) {
            this.config = $.extend({}, Layer.config, config);
            this.index = ++Layer.foundation.index;
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
                    this.createFrame();
                    break;
                default:
                    console.log(2222)
            }
        },
        createFrame: function () {
            console.log(this.proxy(Layer.foundation.frame))
        }


    };

    Layer.prototype.init.prototype = Layer.prototype;
    if (!w.layer) {
        w.layer = Layer;
    }
})($, window);
