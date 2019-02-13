(function ($, w) {
    function Layer(config) {
        return new Layer.prototype.init(config);
    }

    Layer.config = {
        //弹窗类型
        type: 1,
        //偏移
        offset: 'auto',
        //区域大小
        area: 'auto',
        //内容 如果是frame即为url
        content: null,
        //标题
        title: "",
        //自定义className
        className: "monster",
        //插入的目标对象
        element: "body",
        //按钮
        btn: [{
            title: '&#x786E;&#x5B9A;',
            color: '#fff',
            bgColor: '#1E9FFF',
            borderColor: "#1E9FFF"
        }, {
            title: '&#x53D6;&#x6D88;',
            color: "#333",
            bgColor: '#fff',
            borderColor: "#dedede",
            autoClose: true
        }]
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
        //弹窗层的zindex
        zIndex: 9999,
        //根
        modal: function () {
            return $('<div class="' + this.config.className + '-modal ' + this.config.className + '-modal-fade ' + this.config.className + '-modal-fade-in">');
        },
        //头部区域
        header: function (arg) {
            return $('<div class="' + this.config.className + '-modal-header">');
        },
        //内容区域
        body: function () {
            return $('<div class="' + this.config.className + '-modal-body">' + this.config.content + '</div>');
        },
        //发布订阅模式
        observer: {
            //缓存列表
            clientList: [],
            //订阅函数
            listen: function (key, fn) {
                if (!this.clientList[key])
                    this.clientList[key] = [];
                this.clientList[key].push(fn);
            },
            //发布函数
            trigger: function () {
                let key = Array.prototype.shift.call(arguments);
                let fns = this.clientList[key];
                if (!fns || fns.length === 0)
                    return false;
                for (let i = 0, fn; fn = fns[i++];) {
                    fn.apply(this, arguments);
                }
            },
            //删除函数
            remove: function (key, fn) {
                let fns = this.clientList[key];
                if (!fns || fns.length === 0)
                    return false;
                if (!fn) {
                    fns && (fns.length = 0);
                } else {
                    for (let i = fns.length - 1; i >= 0; i--) {
                        let _fn = fns[i];
                        if (_fn === fn) {
                            fns.splice(i, 1);
                        }
                    }
                }
            }
        },
        //事件名称
        eventName: "btn",
        //btn事件存放
        btnEvent: [],
        //页脚按钮
        footer: function (arg) {
            return $('<div class="' + this.config.className + '-modal-footer">');
        },
        //构建frame
        frame: function () {
            let name = this.config.className + 'layer-frame' + (Layer.foundation.index++),
                frame = $('<iframe scrolling="auto" width="100%" allowtransparency="true" ' + 'name="' + name + '"' +
                    'class="monster-modal-loading" onload="this.className=\'\'"' +
                    'frameborder="0" src="' + this.config.content + '"></iframe>');
            return {frame, name}
        },
        //遮罩
        mast:function(index){
            let div=$('<div>');
            div.css({
                "zIndex":index,
                "backgroundColor":"#000",
                "opacity":0.6,
                "height":"100%",
                "width":"100%",
                "position":"fixed",
                "left":0,
                "top":0
            });
            return div;
        }
    };

    Layer.prototype = {
        construct: Layer,
        init: function (config) {
            this.config = $.extend({}, Layer.config, config);
            //设置区域大小
            if (typeof this.config.area === "string") {
                //##如果是字符串格式的转换为数组 数组的好处是如果没填也不会报错
                this.config.area = (this.config.area === "auto") ? ['', ''] : [this.config.area, ''];
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
                footer: null,
                //frame区域
                frame: null,
                //遮罩
                mask:null,
            };
            this.builder();
        },
        //绑定事件
        on: function (type, handler) {
            let that = this;
            Layer.foundation.observer.listen(type, function (arg) {
                handler(arg);
            });
            return this;
        },
        //代理对象
        proxy: function (func) {
            let that = this;
            return (function (arg) {
                return func.call(that, arg);
            })(arguments);
        },
        //构建
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
                    break;
            }
        },
        //构建头部
        buildHeader: function (hasTitle, canClose) {
            this.monster.header = this.proxy(Layer.foundation.header);
            if (hasTitle) {
                this.monster.header.append('<div class="' + this.config.className + '-modal-header-title">' + this.config.title + '</div>');
            }
            let that = this,
                button = $('<button type="button" class="' + this.config.className + '-modal-header-close">&times;</button>');
            if (canClose) {
                button.click(function () {
                    that.remove();
                });
            }
            this.monster.header.append(button);
        },
        //创建基本骨架
        create: function () {
            this.monster.modal = this.proxy(Layer.foundation.modal);
            this.monster.mask=Layer.foundation.mast(Layer.foundation.zIndex);
            this.monster.modal.width(this.config.area[0]).height(this.config.area[1]).css("zIndex", Layer.foundation.zIndex++);
            this.buildHeader(true, true);
            this.monster.body = this.proxy(Layer.foundation.body);
            this.monster.footer = this.proxy(Layer.foundation.footer, true, true);
            this.bottomBtnEvent();

            this.monster.modal.append(this.monster.header);
            this.monster.modal.append(this.monster.body);
            this.monster.modal.append(this.monster.footer);

            $(this.config.element).append(this.monster.mask).append(this.monster.modal);
        },
        //给按钮绑定事件
        bottomBtnEvent: function () {
            let button, that = this;
            for (let i = 0; i < this.config.btn.length; i++) {
                Layer.foundation.btnEvent[i] = Layer.foundation.eventName + i;
                button = $('<button type="button" class="' + this.config.className + '-modal-btn">' + this.config.btn[i].title + '</button>');
                button.css({
                    "borderColor": this.config.btn[i].borderColor,
                    "backgroundColor": this.config.btn[i].bgColor,
                    "color": this.config.btn[i].color
                }).click(function () {
                    if (that.config.btn[i].autoClose) {
                        that.remove();
                    } else {
                        Layer.foundation.observer.trigger(Layer.foundation.btnEvent[i], that);
                    }
                });
                this.monster.footer.append(button);
            }
        },
        remove:function(){
            for(let i=0;i<Layer.foundation.btnEvent.length;i++){
                Layer.foundation.observer.remove(Layer.foundation.btnEvent[i])
            }
            this.monster.mask.remove();
            this.monster.modal.remove();
        },
        //创建frame
        createFrame: function () {
            let frameObj = this.proxy(Layer.foundation.frame);
            this.monster.frameName = frameObj.name;
            this.monster.frame = frameObj.frame;
            this.monster.body.html(frameObj.frame);
            //这里必须给iframe添加onload事件 因为iframe还没有加载完毕时 获取里面的内容会是空的
            //这里需要先将弹窗放到页面后 再计算弹窗的坐标才能准确
            this.offset().frameAuto();
        },
        //设置弹窗的偏移
        offset: function () {
            let area = [this.monster.modal.outerWidth(), this.monster.modal.outerHeight()];
            this.offsetLeft = ($(w).width() - area[0]) / 2;
            this.offsetTop = ($(w).height() - area[1]) / 2;
            if (typeof this.config.offset === 'object') {
                this.offsetLeft = (this.config.offset.left) ? this.config.offset.left : this.offsetLeft;
                this.offsetTop = (this.config.offset.top) ? this.config.offset.top : this.offsetTop;
            } else if (this.config.offset !== 'auto') {
                switch (this.config.offset) {
                    //居顶
                    case 't':
                        this.offsetTop = 0;
                        break;
                    //右
                    case 'r':
                        this.offsetLeft = $(w).width() - area[0];
                        break;
                    //下
                    case 'b':
                        this.offsetTop = $(w).height() - area[1];
                        break;
                    //左
                    case 'l':
                        this.offsetLeft = 0;
                        break;
                    //左上角
                    case 'lt':
                        this.offsetTop = 0;
                        this.offsetLeft = 0;
                        break;
                    //左下角
                    case 'lb':
                        this.offsetTop = $(w).height() - area[1];
                        this.offsetLeft = 0;
                        break;
                    //右上角
                    case 'rt':
                        this.offsetTop = 0;
                        this.offsetLeft = $(w).width() - area[0];
                        break;
                    //右下角
                    case  'rb':
                        this.offsetTop = $(w).height() - area[1];
                        this.offsetLeft = $(w).width() - area[0];
                        break;
                    default:
                        this.offsetTop = this.config.offset;
                }
            }
            this.monster.modal.css({top: this.offsetTop, left: this.offsetLeft});
            return this;
        },
        //获取frame的name
        getFrame: function () {
            return this.monster.frame.contents()
        },
        //设置frame的高度
        frameAuto: function () {
            let area = [this.monster.modal.innerWidth(), this.monster.modal.innerHeight()]
                , titHeight = this.monster.header.outerHeight() || 0
                , btnHeight = this.monster.footer.outerHeight() || 0;
            switch (this.config.type) {
                case Layer.foundation.type.frame:
                    this.monster.frame.height(area[1] - titHeight - btnHeight - 2 * (parseFloat(this.monster.frame.css('padding-top')) | 0));
                    break;
            }
        }
    };

    Layer.prototype.init.prototype = Layer.prototype;
    if (!w.layer) {
        w.layer = Layer;
    }
})($, window);
