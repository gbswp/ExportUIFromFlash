/**
 * 君游H5项目的代码生成器
 * JunyouH5Generator
 */
class JunyouH5GeneratorV2 implements IPanelGenerator {

    /**
     * 面板模板
     */
    private _panelTmp: string;
    /**
     * 内部容器的模板
     */
    private _containerTmp: string;
    /**
     * mediator的模板
     */
    private _mediatorTmp: string;


    /**
     * View Render的模板
     * 
     * @private
     * @type {string}
     */
    private _viewTmp: string;
    /**
     * 解决方案
     */
    private _solution: Solution;

    constructor(solution: Solution) {
        this._solution = solution;
        this.init();
    }

    private init() {
        let prefix = "junyouh5/v2/";
        this._panelTmp = FileUtils.loadTemplate(prefix + "Panel.template");
        this._containerTmp = FileUtils.loadTemplate(prefix + "Container.template");
        this._mediatorTmp = FileUtils.loadTemplate(prefix + "Mediator.template");
        this._viewTmp = FileUtils.loadTemplate(prefix + "View.template");
    }

    /**
     * 生成面板代码
     */
    generateOnePanel(className: string, pInfo: any[], size: number[]) {
        let result = /^ui[.](.*?)[.](.*?(Panel|Dele|Render|View))$/.exec(className);
        // /^ui[.](.*?)[.]((.*?)(Panel|Dele))$/.exec("ui.ShangCheng.ShangChengPanel")
        // ["ui.ShangCheng.ShangChengPanel", "ShangCheng", "ShangChengPanel", "ShangCheng", "Panel"]
        if (result) {
            let mod = result[1];
            let modFolder = classRoot + mod;
            if (!FLfile.exists(modFolder)) {
                FLfile.createFolder(modFolder);
            }
            let panelName = result[2];
            // data[0] ComponentType
            // data[1] BaseData
            // data[2] ComponentData
            // data[3] lib

            // [[3,["btn2", 14.5, 139, 79, 28, 0], 0, 0],
            // [3, ["btn3", 24.5, 139, 79, 28, 0], 0, 0], 
            // [1, ["txtLabel", 33, 149.55, 156, 17.45, 0],[1, "Times New Roman", 0, "#0066CC", 12, 0, 0, 0]],
            // [3, ["btn4", 103.5, 133.45, 79, 28, 0], 0, 0], 
            // [3, ["btn1", 24.5, 121.55, 79, 28, 0], 0, 0]]
            // template;
            let classInfo = { classes: {}, depends: [] };
            let classes = classInfo.classes;
            let createtime = new Date().format("yyyy-MM-dd HH:mm:ss");
            if (panelName.indexOf("View") != -1 || panelName.indexOf("Render") != -1) {
                this.generateClass(this._viewTmp, panelName, pInfo, classInfo);
            } else {
                this.generateClass(this._panelTmp, panelName, pInfo, classInfo);
            }

            let otherDepends = "";
            if (classInfo.depends.length) {
                otherDepends = ", " + classInfo.depends.join(", ");
            }
            let classStr: string = classes[panelName];
            delete classes[panelName];
            classStr = classStr.replace("@className@", className)
                .replace(/@otherDepends@/g, otherDepends)
                .replace(/@lib@/g, flaname)
                .replace(/@className@/g, className);
            let str = "module " + moduleName + " {\n\t" + classStr.replace(/\n/g, "\n\t") + "\n";
            for (let className in classes) {
                str += "\t" + classes[className].replace(/\n/g, "\n\t") + "\n";
            }
            str += "\n}";
            FLfile.write(modFolder + "/" + panelName + ".ts", str.replace(/@createTime@/g, createtime));
            // 生成mediator
            let mediatorName = panelName + "Mediator";
            str = "module " + moduleName + " {\n" +
                this._mediatorTmp.replace(/@mediatorName@/g, mediatorName)
                    .replace(/@panelName@/g, panelName)
                    .replace(/@createTime@/g, createtime)
                    .replace(/@otherDepends@/g, otherDepends)
                    .replace(/@lib@/g, flaname)
                    .replace(/@className@/g, className)
                    .replace(/\n/g, "\n\t")
                + "\n}";
            let mediatorOut = modFolder + "/" + mediatorName + ".ts";
            let flag = true;

            if (panelName.indexOf("Panel") != -1 || panelName.indexOf("Dele") != -1) {
                if (FLfile.exists(mediatorOut)) {
                    flag = confirm("指定目录下，已经有：" + FLfile.uriToPlatformPath(mediatorOut) + "，是否保留原先的代码？？？");
                    if (!flag) {
                        FLfile.copy(mediatorOut, mediatorOut + "_" + new Date().valueOf() + ".bak");//增加一个备份
                        FLfile.write(mediatorOut, str);
                    }
                }
                else {
                    FLfile.write(mediatorOut, str);
                }
            }
        } else {
            Log.throwError("面板名字有误！", name);
        }
    }

    private generateClass(tempate: string, panelName: string, pInfo: any[], classInfo: { classes: any, depends: any[] }, ident = "\t") {
        let pros = [];
        let idx = 0;
        let compCheckers = this._solution.compCheckers;
        for (let i = 0, len = pInfo.length; i < len; i++) {
            let data = pInfo[i];
            let type = data[0];
            let baseData = data[1];
            let instanceName = baseData[0];
            if (!instanceName && type != ExportType.Container) {
                continue;
            }
            switch (type) {
                case ExportType.Rectangle:
                    pros.push(`${ident}${instanceName}: egret.Rectangle;`);
                    break;
                case ExportType.Sprite:
                    pros.push(`${ident}${instanceName}: egret.Sprite;`);
                    break;
                case ExportType.ImageLoader:
                    pros.push(`${ident}${instanceName}: sui.Image;`);
                    break;
                case ExportType.Image:
                    pros.push(`${ident}${instanceName}: egret.Bitmap;`);
                    break;
                case ExportType.Text:
                    pros.push(`${ident}${instanceName}: egret.TextField;`);
                    break;
                case ExportType.Container:
                    pros.push(`${ident}${instanceName}: egret.Sprite;`);
                    // if (instanceName.indexOf("$") == -1) {
                    //     let cName = panelName + "_" + idx;
                    //     this.generateClass(this._containerTmp, cName, data[2], classInfo);
                    //     if (instanceName) {
                    //         pros.push(`${instanceName}: cName;`);
                    //     }
                    //     idx++;
                    // } else {//弃用，由ui.Rectangel和ui.Sprite代替，单张图片也已经增加了检测功能
                    //     let tp = instanceName.split("$")[0];
                    //     let tmpname = instanceName.split("$")[1];
                    //     let tmpd = data[2][0];
                    //     if (tp == "con") {
                    //         if (tmpd) {
                    //             pros.push(`${ident}${tmpname}: egret.Rectangle;`);
                    //         } else {
                    //             pros.push(`${ident}${tmpname}: egret.Sprite;`);
                    //         }
                    //     } else {
                    //         pros.push(`${ident}${tmpname}: egret.Sprite;`);
                    //     }
                    // }

                    break;
                default: // 控件
                    let strKey = data[3];
                    if (strKey && strKey != 1) {
                        if (!~classInfo.depends.indexOf(strKey)) {
                            classInfo.depends.push(strKey);
                        }
                    }
                    if (instanceName) {
                        if (data[0] in compCheckers) {
                            let ctype = data[0];
                            let c = compCheckers[ctype];
                            if (c) {
                                pros.push(`${ident}${instanceName}: ${c.componentName};`);

                            } else {
                                Log.throwError("面板进行生成代码，无法找到类型:", JSON.stringify(data));
                            }
                        }
                    }
                    break;
            }
        }
        let properties = pros.join("\n");
        let classStr;
        if (panelName.indexOf("View") != -1 || panelName.indexOf("Render") != -1) {
            classStr = tempate.replace("@export@", "export ");
        } else {
            classStr = tempate.replace("@export@", "");
        }
        classStr = classStr
            .replace("@panelName@", panelName)
            .replace("@properties@", properties);


        classInfo.classes[panelName] = classStr;
    }
}