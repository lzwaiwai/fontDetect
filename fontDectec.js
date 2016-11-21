		(function() {
			var BODY = document.body,
				RULE = /^[a-zA-Z0-9_\[\]\- ]+$/;

			var support = {

				goRemote: function (elem) {
					elem.style.position = "absolute";
					elem.style.top = "10000px";
					elem.style.left = "10000px";
					BODY.appendChild(elem);
				},

				getDefaultFont: function () {
					var elem = document.createElement("span"),
						font = "";
					this.goRemote(elem);

		    		if (window.getComputedStyle) {
		    			font = elem.ownerDocument.defaultView.getComputedStyle(elem, null).getPropertyValue("font-family");
		    		} else if(document.documentElement.currentStyle) {
		    			font = elem.currentStyle["fontFamily"];
		    		}
		    		this.remove(elem);
		    		return font;
		    	},

		    	remove: function (elem) {
		    		elem.remove ? elem.remove() : elem.parentNode.removeChild(elem);
		    	}
			}

			FontDetect = function () {
				this.word = "我0M";   // 中文加汉子加数字 调整canvas的width
				this.canvasWidth = 27;
				this.canvasHeight = 6;
			};

			FontDetect.prototype = {

		    	getImgData: function (ctx, font) {
					ctx.font = "12px " + font;
					ctx.fillText(this.word, -2, 6);
					return ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
		    	},

		    	imgDataCompare: function (dataDefault, dataFont) {
					for (var i = 0, len = dataDefault.data.length; i < len; i++) { //描点优化
						if(dataDefault.data[i] != dataFont.data[i]) {
							return true;
						}
					}	
					return false;
	 	    	},

				createCanvas: function () {
					var canvas = document.createElement("canvas");
					canvas.width = this.canvasWidth;
	    			canvas.height = this.canvasHeight;
	    			support.goRemote(canvas);
					return canvas;
				},

				createObject: function () {
		    		var object = document.createElement("object");
		    		object.style.width = "0px";
		    		object.style.height = "0px";	    		
		    		object.classid = "clsid:3050f819-98b5-11cf-bb82-00aa00bdce0b";
		    		support.goRemote(object);
		    		return object;
				},

				canvasDetect: function (ctxDefault, fonts) {
					var fontDefault = support.getDefaultFont(),  // 获取当前页面支持的默认字体
						imgDataDefault = this.getImgData(ctxDefault, fontDefault),  // 获取默认字体所画的字的像素信息
						font = "",
						i  = 0;

					while (fonts[i]) {
						if (fonts[i].toLocaleLowerCase() == fontDefault.toLocaleLowerCase()) {  // 与默认字体名一致
							support.remove(this.canvasDefault);
							return true;
						}

						if (RULE.test(fonts[i])) { // 非中文名，字体渲染都是用英文名
							font = fonts[i];
						}

						i++;
					}

					if (!font) {
						throw "need English name of font!";
						return;
					} 
					

					this.canvasCur = this.createCanvas();
					var ctxCur = this.canvasCur.getContext('2d'),
						imgDataCur = this.getImgData(ctxCur, font + "," + fontDefault),
						compareResult = this.imgDataCompare(imgDataDefault, imgDataCur);

					support.remove(this.canvasDefault);
					support.remove(this.canvasCur);

					return compareResult
				},

				ieFontDetect: function (ieFonts, fonts) { // ie 678
					var re = [],
						match = false;
					//var f = "";
					for (var i = 1, len = ieFonts.count; i <= len; i++) {
						//f += ( ieFonts(i) + ",");
						re[i - 1] = ieFonts(i);
					}
					//alert(f);

					for (var i = 0, len = re.length; i < len; i++) {  // 查找优化?
						for(var j = 0, lon = fonts.length; j < lon; j++) {
							if (fonts[j].toLocaleLowerCase() === re[i].toLocaleLowerCase()) {
								match = true;break;
							}
						}
					}

					return match;
				},

				detect: function (fonts) { // 输入字体名称，中文字体：[英文，中文]，英文字体：[英文]
					if (fonts.length > 2 || fonts.length == 0) {
						throw "params error!";
					}

					var ctxDefault = null,
						ieFonts = null,
						isInstalled = false;

					// 如果支持canvas，使用canvas检测字体
					this.canvasDefault = this.createCanvas();
					if (this.canvasDefault.getContext) {  
						ctxDefault = this.canvasDefault.getContext('2d');
						isInstalled = this.canvasDetect(ctxDefault, fonts);
						return isInstalled;				
					}

					// 如果是ie678，使用其内置的方法
					this.objElem = this.createObject();
					ieFonts = this.objElem.fonts || undefined;
					if (ieFonts) {
						isInstalled = this.ieFontDetect(ieFonts, fonts);
						return isInstalled;	
					} 

					throw "detect error!";
				}

			};

		})();
