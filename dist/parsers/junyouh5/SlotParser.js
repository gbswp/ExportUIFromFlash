var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * 格位解析器
 *
 * @class SlotParser
 * @extends {ComWillCheck}
 * @author pb
 */
var SlotParser = (function (_super) {
    __extends(SlotParser, _super);
    function SlotParser() {
        var _this = _super.call(this, 13 /* Slot */, /^ui[.](slot)/, null, "sui.Slot") || this;
        _this.parseHandler = _this.slotParser;
        return _this;
    }
    /**
     * 用于处理格位
     * 支持2图层 bg tf
     * 支持1图层 tf
     * 必须有九宫线
     */
    SlotParser.prototype.slotParser = function (checker, item, list, solution) {
        // 检查帧
        var timeline = item.timeline;
        // 多图层
        var layers = timeline.layers;
        var len = layers.length;
        if (len > 2) {
            Log.throwError("slot最多可有两个图层", item.name);
            return;
        }
        var sacle9 = item.scalingGrid;
        if (!sacle9) {
            Log.throwError("此控件没有设置九宫信息", item.name);
            return;
        }
        var data = [];
        list[item.$idx] = data;
        //九宫信息
        var gridRect = item.scalingGridRect;
        var gx = Math.round(gridRect.left);
        var gy = Math.round(gridRect.top);
        var gr = Math.round(gridRect.right);
        var gb = Math.round(gridRect.bottom);
        data[0] = [gx, gy, gr - gx, gb - gy];
        var layer;
        var name;
        var frame;
        var elements;
        var e;
        // 遍历图层
        for (var i = 0; i < len; i++) {
            layer = layers[i];
            name = layer.name;
            if (name) {
                frame = layer.frames[0];
                elements = frame.elements;
                e = elements[0];
                //文本
                if (name === "tf") {
                    data[1] = solution.getElementData(e);
                }
                else if (name === "bg") {
                    data[2] = solution.getElementData(e);
                }
            }
        }
    };
    return SlotParser;
}(ComWillCheck));