'use strict';
const dd_gridActions = {edit: "edit", delete: "delete", insert: "insert", update: "update", duplicate: "duplicate", editColumn: "editColumn", deleteColumn: "deleteColumn", insertColumn: "insertColumn"};
const dd_overFlowMethods = {grows: "grows", slides: "slides", pages: "pages"};
const dd_gridCellGrowthMethods = {square:0, downThenAcross:1, acrossThenDown:2, downOnly:3, acrossOnly:4};
//var this = null;

class ddGroup {
	
	constructor(left, top, width, height, tagsWide, tagsHigh, colValue, rowValue, col, row, label, tags) {
		this.top = top;
		this.left = left;
		this.width = width;
		this.height = height;
		this.tagsWide = tagsWide;
		this.tagsHigh = tagsHigh;
		this.colValue = colValue;
		this.rowValue = rowValue;
		this.col = col;
		this.row = row;
		if (label === undefined) {
			this.label = "";
		} else {
			this.label = label;
		}
		if (tags === undefined) {
			this.tags = [];
		} else {
			this.tags = tags;
		}
		this.renderObject = null;
		this.tagObjects = null;
		this.paintColor = "";
	}
}

/*class ddTag(group, thumbURL, label) {
	this.group = group;
	this.thumbURL = thumbURL;
	this.label = label;
}*/

class ddMenu {

	constructor(grid, options, settings) {
		this.grid = grid;
		this.options = options;
		this.left = 0;
		this.top = 0;
		this.optionWidth = 150;
		this.optionHeight = 40;
		this.optionsWide = 1;
		this.padding = 10;
		this.label = "";
		this.draggable = true;
		this.backgroundColor = 'white';
		this.borderColor = 'blue';
		this.shadowColor = 'black';
		this.borderThickness = 3;
		this.cornerRadius = 10;
		this.titleHeight = 40;
		this.titleText = "";
		this.titleFont = "Verdana";
		this.titleFontSize = 24;
		this.titleFontColor = "white";
		this.titleFontShadowColor = "black";
		this.titleBarColor = "blue";
		this.titleXSize = 36;
		this.titleXColor = "white";
		this.titleXShadowColor = "black";
		this.tagIndex = 0;
		this.tag = null;
		if (settings !== undefined) {
			var userSettings = settings;
			var userKeys = Object.keys(userSettings);
			for (var i=0;i<userKeys.length;i++) {
				if (userKeys[i] in this) {
					this[userKeys[i]] = userSettings[userKeys[i]];
				}
			}
		}
		if (this.optionsWide < 1) {
			throw ("ddMenu invalid value for optionsWide. must be at least 1.")
			return;
		}
		this.menu = null;
		//this.show.bind(this);
		this.createMenu(this);
	}
	createMenu(menuObject) {
		if (this.menu !== null) {
			this.menu.destroy();
		}
		if (this.options.length < 1) {
			throw ("ddMenu must have at least one menu option");
			return;
		}
		var numDown = Math.ceil(this.options.length / this.optionsWide);
		this.menuWidth = this.padding + (this.optionsWide * (this.optionWidth + this.padding));
		this.menuHeight = this.padding + (numDown * (this.optionHeight + this.padding)) + this.titleHeight;
		this.menu = new Konva.Group({
			x: this.left,
			y: this.top,
			width: this.menuWidth + 5,
			height: this.menuHeight + 5,
			rotation: 0,
			draggable: this.draggable,
			visible: false
		});
		this.menu.add(new Konva.Rect({
			x: 0,
			y: 0,
			width: this.menuWidth,
			height: this.menuHeight,
			fill: this.backgroundColor,
			stroke: this.borderColor,
			strokeWidth: this.borderThickness,
			cornerRadius: this.cornerRadius,
			shadowColor: this.shadowColor,
			shadowOpacity: 0.5,
			shadowBlur: 10,
			shadowOffset: {x:5,y:5},
			preventDefault: false
		}));
		this.menu.add(new Konva.Rect({
			x: 0,
			y: 0,
			width: this.menuWidth,
			height: this.titleHeight,
			fill: this.titleBarColor,
			stroke: this.borderColor,
			strokeWidth: this.borderThickness,
			cornerRadius: this.cornerRadius
		}));
		var titleXWidth = this.titleXSize * 2;
		var titleWidth = this.menuWidth - titleXWidth;
		this.menu.add(new Konva.Text({
			x: 0,
			y: Math.floor((this.titleHeight - this.titleFontSize) / 2),
			text: this.titleText,
			fontSize: this.titleFontSize,
			fontFamily: this.titleFont,
			fill: this.titleFontColor,
			shadowColor: this.titleFontShadowColor,
			shadowBlur: 0,
			shadowOffset: {x : 1, y : 1},
			shadowOpacity: 1,
			width: titleWidth,
			padding: 0,
			align: 'center'
		}));
		var exitButton = new Konva.Text({
			x: titleWidth,
			y: Math.floor((this.titleHeight - this.titleXSize) / 2),
			text: "X",
			fontSize: this.titleXSize,
			fontFamily: this.titleFont,
			fill: this.titleXColor,
			shadowColor: this.titleXShadowColor,
			shadowBlur: 0,
			shadowOffset: {x : 1, y : 1},
			shadowOpacity: 1,
			width: titleXWidth,
			padding: 0,
			align: 'center',
			onClick: this.hide
		});
		var parent = this;
		//exitButton.on('click tap', hide);
		this.menu.add(exitButton);
	
		this.grid.uiLayer.add(this.menu);
	}
	show(x,y,tagIndex,tag) {
		this.menu.x(x);
		this.menu.y(y);
		this.tagIndex = tagIndex;
		this.tag = tag;
		this.menu.show();
		this.grid.uiLayer.draw();
	}
	hide(me) {
		me.menu.hide();
		me.grid.uiLayer.draw();
	}
}

class ddGrid {
	
	constructor(containerID,overFlowMethod,width,height) {
		if (typeof Konva === 'object') {
			Konva.pixelRatio = 1;
			this.version = '2.0';
			this.stageScale = 1.0;
			this.stageHeight = height;
			this.stageWidth = width;
			this.overFlowMethod = overFlowMethod;
			this.gridBuffer = 10;
			this.welcomeText = 'Start your work here.';
			try {
				this.stage = new Konva.Stage({container: containerID, width: this.stageWidth, height: this.stageHeight});
			} catch(err) {
				throw "Error creating Konva stage. " + err.message;
			}
			this.backgroundLayer = new Konva.Layer();
			this.gridLayer = new Konva.Layer();
			this.tagLayer = new Konva.Layer({draggable: true});
			this.uiLayer = new Konva.Layer();
			this.orientation = ddGrid.getDeviceOrientation();
			this.touchDevice = ddGrid.isTouchDevice();
			//dragging
			this.tagLayer.setDragBoundFunc( function(pos) {
				var leftLimit = (Math.max(this.groups[this.groups.length-1].left + this.groups[this.groups.length-1].width + this.gridBuffer,this.stageWidth) - this.stageWidth) * -1;
				if (pos.x < 1 && pos.x > leftLimit) {
					return { x: pos.x , y: 0 };
				} else if (pos.x > 0) {
					return { x: 0 , y: 0 };
				} else if (pos.x <= leftLimit) {
					return { x: leftLimit , y: 0 };
				}
			}.bind(this));
			this.tagLayer.on('dragmove', function (pos) {
				var tagLayerPos = this.tagLayer.position();
				this.gridLayer.position({x: tagLayerPos.x, y: tagLayerPos.y});
				this.gridLayer.draw();
			}.bind(this));
			this.tagLayer.on('dragend', function (pos) {
				var tagLayerPos = this.tagLayer.position();
				this.gridLayer.position({x: tagLayerPos.x, y: tagLayerPos.y});
				this.gridLayer.draw();
			}.bind(this));
			this.eventText = new Konva.Text({
				x: 10,
				y: 0,
				fontFamily: 'Verdana',
				fontSize: 10,
				text: this.welcomeText,
				fill: 'black'
			});
			this.background = new Konva.Rect({
				width: this.stageWidth,
				height: this.stageHeight,
				fill: this.backgroundFillColor,
				preventDefault: false
			});
				
			var dragSurface = new Konva.Rect({
				width: this.stageWidth*10,
				height: this.stageHeight*2,
				fill: 'transparent',
				opacity: 0.3,
				preventDefault: false
			});			
			this.tagLayer.add(dragSurface);
			
			this.backgroundLayer.add(this.background);
			this.uiLayer.add(this.eventText);
			this.stage.add(this.backgroundLayer);
			this.stage.add(this.gridLayer);
			this.stage.add(this.tagLayer);
			this.stage.add(this.uiLayer);
			
			this.loaded = false;
			this.tagData = null;
			this.indexField = "";
			this.tagLabelField = "";
			this.tagColorField = "";
			this.tagFontColorField = "";
			this.columnField = "";
			this.rowField = "";
			this.columnValueLabelPairs = [];
			this.columnLabels = [];
			this.columnValues = [];
			this.cLabels = [];
			this.rLabels = [];
			this.rowValueLabelPairs = [];
			this.rowLabels = [];
			this.rowValues = [];
			this.colorLabelValuePairs = [];
			this.iconFieldLabelPairs = [];
			this.showNullColumn = false;
			this.showNullRow = false;
			this.showOtherColumn = false;
			this.showOtherRow = false;
			this.visibleColumns = 0;
			this.visibleRows = 0;
			this.gridCellGrowth = dd_gridCellGrowthMethods.square;
			this.gridColumns = 0;
			this.gridRows = 0;
			this.gridMinTagsWide = 1;
			this.gridMinTagsHigh = 1;
			this.gridBorderThickness = 2;
			this.gridBorderColor = "blue";
			this.gridEditMode = false;

			this.tagBorderColor = "transparent";
			this.tagBorderThickness = 1;
			this.tagCountFontSize = 12;
			this.tagCountFont = 'Verdana';
			this.tagCountFontColor = 'white';
			this.tagCountShadowColor = 'black';
			this.tagCountShadowOn = true;
			this.tagSmallLabelField = "";
			this.tagSmallLabelFloat = 'bottom';
			this.tagSmallLabelFontSize = 10;
			this.tagSmallLabelFont = 'Verdana';
			this.tagSmallLabelFontColor = 'white';
			this.tagSmallLabelShadowColor = 'black';
			this.tagSmallLabelShadowOn = true;			
			this.tagBuffer = 10; 
			this.tagWidth = 150;
			this.tagHeight = 100;
			this.tagLabelFloat = 'top';
			this.tagLabelFontSize = 12;
			this.tagLabelFont = 'Verdana';
			this.tagLabelFontStyle = 'Bold';
			this.tagLabelFontColor = 'white';
			this.tagLabelShadowColor = 'black';
			this.tagLabelShadowOn = true;
			this.tagLabelStrokeColor = 'black';
			this.tagLabelStrokeWidth = 1;
			this.tagLabelStrokeOn = false;
			this.tagFillColor = "blue";
			this.tagHoverColor = "gray";
			this.tagDefaultColor = 'blue';
			this.tagFillOpacity = 1.0;
			this.tagColumnBound = false;
			this.tagRowBound = false;
			this.tagCheckBoxFloat = 'top-right';
			this.tagCheckBoxSize = 10;
			this.tagCheckBoxColor = "#ddd";
			this.tagCheckColor = "black";
			this.tagCheckBoxFillColor = 'transparent';

			this.filterGrid = false;
			this.filterColumnField = "";
			this.filterRowField = "";
			this.filterColumnValue = null;
			this.filterRowValue = null;
			this.filterDataField = "";
			this.filterDataValue = null;
			
			this.gridTitle = null;
			this.gridTitleThickness = 40;
			this.gridTitleText = "";
			this.gridTitleFont = 'Verdana';
			this.gridTitleFontColor = 'blue';
			this.gridTitleFontSize = 24;
			this.gridColumnWidth = 170;
			this.gridLabelThickness = 30;
			this.gridLabelFontSize = 16;
			this.gridLabelFont = 'Verdana';
			this.gridLabelFontColor = "blue";
			this.gridLabelFontShadowColor = "black";
			this.gridRowHeight = 120;
			this.gridRowLabelFontSize = 16;
			this.gridRowLabelFont = 'Verdana';
			this.gridRowLabelFontColor = "blue";
			this.gridRowLabelFontShadowColor = "black";
			this.gridDeleteOnDragOff = false;
			
			this.groups = [];
			this.groupLabelFontSize = 20;
			this.groupLabelFont = 'Verdana';
			this.groupLabelFontColor = "blue";
			this.groupTotalFontSize = 12;
			this.groupTotalFont = 'Verdana';
			this.groupTotalFontColor = "blue";
			this.groupTotalsHeight = 0;
			this.groupFillColor = 'transparent';
			this.showGroupTotals = false;
			this.showGroupLabels = false;
			this.showIcons = false;
			this.iconSize = 24;
			this.pageGroups = [];
			this.pageColumns = [];
			this.paging = false;
			this.page = 0;
			this.ticks = [];
			this.navarrows = [];
			
			this.legend = null;
			this.showLegend = false;
			this.showLegendCount = false;
			this.legendTitle = "LEGEND";
			this.legendFilterField = "";
			this.legendFilterValue = null;
			this.legendIsTagPalette = true;
			this.legendFillColor = 'transparent';
			this.legendTagWidth = 150;
			this.legendTagHeight = 50;
			this.legendTagLabelFontSize = 12;
			this.legendMaxTagsHigh = 10;
			this.legendIconBaseURL = '/images/';
			this.legendIconHeight = 30;
			this.legendTagBorderColor = "transparent";
			this.legendTagBorderThickness = 1;
			this.legendTagFillOpacity = 1.0;
			this.getTagColorFromLegend = false;
			
			this.scrollTween = null;
			this.scrollTimer = null;
			this.dragScrollTestTimer = null;			
			this.mouse = {x: 0, y: 0};
			this.gridOffset = {x: 0, y: 0};
			this.gridScrollHotSpots = [];
			this.gridDragging = false;
			this.draggedTag = null;
			//interface handlers for site
			this.postEachGridEdit = false;
			this.tagEditMenu = function() {return;};
			this.tagReadOnlyContextMenu = function() {return;};
			this.groupEditFunction = function() {return -1;};
			//this.closeEditFunction = (function() {return;});
			this.gridEditFunction = function() {return -1;};
			this.legendCountClickFunction = null;
			this.checkBoxEditFunction = function() {return -1;};
		} else {
			throw "Konva not found. DragDropGrid requires KonvaJS to work.";
		}
	}
	
	closeEditFunction() {
		this.writeMessage("");
		return;
	}
	
	static getDeviceOrientation() {    
		if (window.orientation) {
			if (Math.abs(window.orientation) === 90) {
				return 'landscape';
			} else {
				return 'portrait';
			}
		} else {
			if (screen.width > screen.height) {
				return 'landscape';
			} else {
				return 'portrait';
			}
		}
	}
	
	static isTouchDevice() {
		return (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
	}
	
	setBackgroundColor(color) {
		this.background.setFill(color);
		this.backgroundLayer.draw();
	}

	setBackgroundImage(imageFilePath) {
		var imageObj = new Image();
		imageObj.onload = function () {	this.background.fillPatternImage(imageObj); this.backgroundLayer.draw(); };
		imageObj.src = imageFilePath;
	}

	writeMessage(message) {
		this.eventText.text(message);
		this.stage.draw();
	};
	
	resetLayers() {
		this.gridLayer.position({x:0,y:0});
		this.tagLayer.position({x:0,y:0});
	}

	loadGridFromJSONString(jsonGridSettings,jsonData) {
		var gridSettings = JSON.parse(jsonGridSettings);
		var userData = JSON.parse(jsonData);
		this.loadGrid(gridSettings,userData);
	}
	
	loadGrid(gridSettings,data) {
		//if (this.loaded) {
			//this.clearGrid();
		//}
		var userGridSettings = gridSettings;
		var userKeys = Object.keys(userGridSettings);
		for (var i=0;i<userKeys.length;i++) {
			if (userKeys[i] in this) {
				this[userKeys[i]] = userGridSettings[userKeys[i]];
			}
		}
		this.tagData = data;
		if (this.tagData.length == 0) {
			throw "Data source has no records.";
		}
		if (this.columnField != "" && this.columnValueLabelPairs.length == 0) {
			var uniquecols = [];
			if (this.showNullColumn) {
				uniquecols[0] = null;
			}
			for (var i=0;i<this.tagData.length;i++) {
				if (this.filterGrid) {
					if (this.filterDataField != "") {
						if (this.tagData[i][this.filterDataField] == null) {
							continue;
						}
						if (!isNaN(parseFloat(this.tagData[i][this.filterDataField])) && isFinite(this.tagData[i][this.filterDataField])) {
							if (this.tagData[i][this.filterDataField] != this.filterDataValue) {
								continue;
							}
						} else {
							if (this.tagData[i][this.filterDataField].indexOf(this.filterDataValue) == -1) {
								continue;
							}
						} 
					}
					if (this.filterColumnField != "" && this.tagData[i][this.filterColumnField] != this.filterColumnValue) {
						continue;
					}
				}
				if (uniquecols.indexOf(this.tagData[i][this.columnField])<0) {
					uniquecols[uniquecols.length] = this.tagData[i][this.columnField];
				}
			}
			if (this.showOtherColumn) {
				uniquecols[uniquecols.length] = "Other"
			}
			this.columnLabels = uniquecols;
			this.columnValues = uniquecols;
		} else if (this.columnValueLabelPairs.length > 0) {
			if (this.showNullColumn) {
				this.columnLabels[0] = "Unassigned";
				this.columnValues[0] = null;
			}
			for (var i=0;i<this.columnValueLabelPairs.length;i++) {
				if (this.filterGrid && this.filterColumnField != "" && this.columnValueLabelPairs[i][this.filterColumnField] != this.filterColumnValue) {
					continue;
				}
				this.columnLabels[this.columnLabels.length] = this.columnValueLabelPairs[i].Label;
				this.columnValues[this.columnValues.length] = this.columnValueLabelPairs[i].Value;
			}
			if (this.showOtherColumn) {
				this.columnLabels[this.columnLabels.length] = "Other";
				this.columnValues[this.columnValues.length] = "Other";
			}
		} else {
			this.columnLabels[0] = "";
			this.columnValues[0] = "";	
		}

		if (this.rowField != "" && this.rowValueLabelPairs.length ==0) {
			var uniquerows = [];
			if (this.showNullRow) {
				uniquerows[0] = null;
			}
			for (var i=0;i<this.tagData.length;i++) {
				if (this.filterGrid) {
					if (this.filterDataField != "") {
						if (this.tagData[i][this.filterDataField] == null) {
							continue;
						}
						if (!isNaN(parseFloat(this.tagData[i][this.filterDataField])) && isFinite(this.tagData[i][this.filterDataField])) {
							if (this.tagData[i][this.filterDataField] != this.filterDataValue) {
								continue;
							}
						} else {
							if (this.tagData[i][this.filterDataField].indexOf(this.filterDataValue) == -1) {
								continue;
							}
						} 
					}

					if (this.filterRowField != "" && this.tagData[i][this.filterRowField] != this.filterRowValue) {
						continue;
					}
				}
				if (uniquerows.indexOf(this.tagData[i][this.rowField])<0) {
					uniquerows[uniquerows.length] = this.tagData[i][this.rowField];
				}
			}
			if (this.showOtherRow) {
				uniquerows[uniquerows.length] = "Other";
			}
			this.rowLabels = uniquerows;
			this.rowValues = uniquerows;
		} else if (this.rowValueLabelPairs.length > 0) {
			if (this.showNullRow) {
				this.rowLabels[0] = "Unassigned";
				this.rowValues[0] = null;
			}
			for (var i=0;i<this.rowValueLabelPairs.length;i++) {
				if (this.filterGrid && this.filterRowField != "" && this.rowValueLabelPairs[i][this.filterRowField] != this.filterRowValue) {
					continue;
				}
				this.rowLabels[this.rowLabels.length] = this.rowValueLabelPairs[i].Label;
				this.rowValues[this.rowValues.length] = this.rowValueLabelPairs[i].Value;
			}
			if (this.showOtherRow) {
				this.rowLabels[this.rowLabels.length] = "Other";
				this.rowValues[this.rowValues.length] = "Other";
			}
		} else {
			this.rowLabels[0] = "";
			this.rowValues[0] = "";
		}
		
		this.gridColumns = this.columnLabels.length;
		this.gridRows = this.rowLabels.length;
		this.gridColumnWidth = this.gridBuffer + (this.gridMinTagsWide * (this.tagBuffer + this.tagWidth));
		this.gridRowHeight = this.gridBuffer + (this.gridMinTagsHigh * (this.tagBuffer + this.tagHeight));
		if (this.showGroupLabels) {
			this.gridRowHeight = this.gridRowHeight + Math.floor(this.groupLabelFontSize * 1.5);
		}
		if (this.showGroupTotals) {
			this.groupTotalsHeight = this.iconSize + this.tagBuffer;
			this.gridRowHeight = (this.gridMinTagsWide > 1) ? this.gridRowHeight + this.groupTotalsHeight : this.gridRowHeight + (this.groupTotalsHeight*2);
		} else {
			this.groupTotalsHeight = 0;	
		}
		if (this.colorLabelValuePairs.length == 0) {
			this.showLegend = false;
			this.getTagColorFromLegend = false;
		} else {
			this.createLegend();
			this.getTagColorFromLegend = true;
			this.tagDefaultColor = this.colorLabelValuePairs[0].Value;	
		}
		if (this.iconFieldLabelPairs.length == 0) {
			this.showIcons = false;
		} else {
			this.showIcons = true;
		}
		this.createGroups(false);
	}
	
	//draw() {}
	
	//clearGrid() {}
	
	createLegend() {
		var c = 0;
		if (this.filterLegend == false) {
			c = this.colorLabelValuePairs.length;
		} else {
			var c = 0;
			for (var i = 0; i < this.colorLabelValuePairs.length; i++) {
				if (this.colorLabelValuePairs[i][this.legendFilterField] == this.legendFilterValue) {
					c++;
				}
			}
		}
		var tagsWide = 1;
		var tagsHigh = 1;
		if (c > this.legendMaxTagsHigh) {
			tagsHigh = this.legendMaxTagsHigh;
			tagsWide = Math.ceil(c / this.legendMaxTagsHigh);
		} else {
			tagsHigh = Math.max(c,1);
			tagsWide = 1;
		}
		this.legend = new ddGroup(2, this.gridTitleThickness + this.gridLabelThickness, this.gridBuffer + ((this.tagBuffer + this.legendTagWidth) * tagsWide), this.gridRowHeight, tagsWide, tagsHigh, "", "", 0, 0, this.legendTitle);
	}
	
	editTagLabel(tag,newvalue) {
		
		var newLabel = "";
		var dataIndex = tag.attrs.id;
		var tagLabel = tag.find('.tagLabel')[0];
		//debugger;
		if (newvalue === undefined) {
			newLabel = tagLabel.attrs.text; // arrayData[dataIndex][tagLabelField]
			newLabel = prompt("Change Tag Label to ", newLabel);
			if (!newLabel) {
				return;
			}
		} else {
			newLabel = newvalue;
		}
		var letters = /^.*?(?=[\^.#%&$\*:\;<>\?/\{\|\}]).*$/;
		if (letters.test(newLabel)) {
			alert("The string contains invalid characters. Please use alpha-numeric characters.");
			return;
		}
		
		if (this.postEachGridEdit) {
			var fields = new Object();
			fields[this.tagLabelField] = newLabel;
			var result = this.gridEditFunction(tag,dd_gridActions.edit,null,fields);
			if (result == false) {
				//no change
				return;
			} else if (result == -1) {
				//do default
				this.tagData[dataIndex][this.tagLabelField] = newLabel;
			} else if (result) {
				//just update the tag
			}
		} else {
			this.tagData[dataIndex][this.tagLabelField] = newLabel;
		}
		tagLabel.setText(newLabel);
		tag.clearCache();
		tag.draw();
	}
	
	changeTagColor(tag,newvalue) {
		var tagColor = this.tagFillColor;
		var dataIndex = tag.attrs.id;
		if (this.getTagColorFromLegend) {
			for (var i=0;i<this.colorLabelValuePairs.length;i++) {
				if (this.colorLabelValuePairs[i].Value == newvalue) {
					tagColor = this.colorLabelValuePairs[i].Color;
					if (this.postEachGridEdit) {
						var fields = new Object();
						fields[this.tagColorField] = newvalue;
						var result = this.gridEditFunction(tag,dd_gridActions.edit,null,fields);
						if (result == false) {
							//no change
							return;
						} else if (result == -1) {
							//do default
							this.tagData[dataIndex][this.tagColorField] = newvalue;
						} else if (result) {
							//just update the tag
						}
					}
					var tagBack = tag.find('.tagBack')[0];
					tagBack.fill(tagColor);
					tag.clearCache();
					tag.draw();
					break;
				}
			}
		} else {
			tagColor = newvalue;
			if (this.tagColorField != "") {
				if (this.postEachGridEdit) {
					var fields = new Object();
					fields[this.tagColorField] = newvalue;
					var result = this.gridEditFunction(tag,dd_gridActions.edit,null,fields);
					if (result == false) {
						//no change
						return;
					} else if (result == -1) {
						//do default
						this.tagData[dataIndex][this.tagColorField] = tagColor;
					} else if (result) {
						//just update the tag
					}
				} else {
					this.tagData[dataIndex][this.tagColorField] = tagColor;
				}
			}
			var tagBack = tag.find('.tagBack')[0];
			tagBack.fill(tagColor);
			tag.clearCache();
			tag.draw();		
		}
	}
	
	updateTag(tag) {
		var groupIndex = tag.attrs.home_group;
		var dataIndex = tag.attrs.id;
		var position = this.groups[groupIndex].tags.indexOf(dataIndex);
		tag.destroy();
		this.addTag(groupIndex,position,dataIndex,true);
		this.tagLayer.draw();
	}
	
	paintColumn(columnVal, color) {
		for (var g=0;g<this.groups.length;g++) {
			if (this.groups[g].colValue == columnVal) {
				this.groups[g].paintColor = color;
			}
		}
		this.redrawGrid();
	}
	
	createGroups(justResize) {
		var g = 0;
		var columnTagWidths = [];
		var rowTagHeights = [];
		var biggest = Math.max(this.gridMinTagsWide,this.gridMinTagsHigh);
		var touchBuffer = 0;
		
		if (this.touchDevice) {
			touchBuffer = 15;
		}
		
		for (var r=0;r<this.gridRows;r++) {
			rowTagHeights[r]=this.gridMinTagsHigh;
		}
		for (var c=0;c<this.gridColumns;c++) {
			columnTagWidths[c]=this.gridMinTagsWide;
		}
				
		if (this.pageGroups != null) {
			this.pageGroups.splice(0,this.pageGroups.length);
		}
		if (this.pageColumns != null) {
			this.pageColumns.splice(0,this.pageColumns.length);
		}
		if (justResize == false) {
			var notags = true;
			for (var r=0;r<this.gridRows;r++) {
				for (var c=0;c<this.gridColumns;c++) {
					g = this.groups.length;
					if (this.showGroupTotals) {
						this.groupTotalsHeight = this.iconSize + this.tagBuffer;
					} else {
						this.groupTotalsHeight = 0;
					}
					if (this.showGroupLabels) {
						var groupLabel = this.rowLabels[r] + " " + this.columnLabels[c];
						this.groups[g] = new ddGroup(this.gridLabelThickness + (c * this.gridColumnWidth), this.gridTitleThickness + this.gridLabelThickness + (r * this.gridRowHeight), this.gridColumnWidth, this.gridRowHeight, this.gridMinTagsWide, this.gridMinTagsHigh, this.columnValues[c], this.rowValues[r], c, r, groupLabel);
					} else {
						this.groups[g] = new ddGroup(this.gridLabelThickness + (c * this.gridColumnWidth), this.gridTitleThickness + this.gridLabelThickness + (r * this.gridRowHeight), this.gridColumnWidth, this.gridRowHeight, this.gridMinTagsWide, this.gridMinTagsHigh, this.columnValues[c], this.rowValues[r], c, r);			
					}
					for (var i=0;i<this.tagData.length;i++) {
						if (this.filterGrid) {
							//when filtering just values, skip others but otherwise keep sorting
							if (this.filterDataField != "") {
								if (this.tagData[i][this.filterDataField] == null) {
									continue;
								}
								//if a number
								if (!isNaN(parseFloat(this.tagData[i][this.filterDataField])) && isFinite(this.tagData[i][this.filterDataField])) {
									if (this.tagData[i][this.filterDataField] != this.filterDataValue) {
										continue;
									}
								} else {
									if (this.tagData[i][this.filterDataField].indexOf(this.filterDataValue) == -1) {
										continue;
									}
								} 
							}
							//when filtering row or columns never do the normal population
							if (this.filterColumnField != "" || this.filterRowField != "") {
								if (this.tagData[i][this.columnField] == this.columnValues[c] && this.tagData[i][this.rowField] == this.rowValues[r]) {
									this.groups[g].tags.push(i);
									notags = false;
								}
								continue;
							}					
						}
						if (this.gridColumns > 1 && this.gridRows > 1) {
							if (this.tagData[i][this.columnField] == this.columnValues[c] && this.tagData[i][this.rowField] == this.rowValues[r]) {
								this.groups[g].tags.push(i);
								notags = false;
							}
						} else if (this.gridColumns > 1 && this.gridRows == 1) {
							if (this.tagData[i][this.columnField] == this.columnValues[c]) {
								this.groups[g].tags.push(i);
								notags = false;
							}
						} else if (this.gridColumns == 1 && this.gridRows > 1) {
							if (this.tagData[i][this.rowField] == this.rowValues[r]) {
								this.groups[g].tags.push(i);
								notags = false;
							}
						} else if (this.columnField !== "" && this.rowField !== "") {
							if (this.tagData[i][this.columnField] == this.columnValues[c] && this.tagData[i][this.rowField] == this.rowValues[r]) {
								this.groups[g].tags.push(i);
								notags = false;
							}
						} else if (this.columnField !== "") {
							if (this.tagData[i][this.columnField] == this.columnValues[c]) {
								this.groups[g].tags.push(i);
								notags = false;
							}
						} else if (this.rowField !== "") {
							if (this.tagData[i][this.rowField] == this.rowValues[r]) {
								this.groups[g].tags.push(i);
								notags = false;
							}
						}
					}
				}
			}
			if (notags) {
				this.writeMessage("Filter returned no values.");
			}
		}
		
		// adjust the group size based on tags
		for (var g = 0; g < this.groups.length; g++) {
			if (this.groups[g].tags.length > (this.gridMinTagsHigh * this.gridMinTagsWide)) {
				if (this.gridCellGrowth == dd_gridCellGrowthMethods.acrossOnly) {
					this.groups[g].tagsWide = Math.ceil((this.groups[g].tags.length / this.gridMinTagsHigh));
				} else if (this.gridCellGrowth == dd_gridCellGrowthMethods.downOnly) {
					this.groups[g].tagsHigh = Math.ceil((this.groups[g].tags.length / this.gridMinTagsWide));
				} else if (this.gridCellGrowth == dd_gridCellGrowthMethods.acrossThenDown) {
					var b = true;
					for (var a=this.gridMinTagsHigh * this.gridMinTagsWide; a<this.groups[g].tags.length; a=this.groups[g].tagsWide * this.groups[g].tagsHigh) { 
						if (b) {
							this.groups[g].tagsWide++;
							b = false;
						} else {
							this.groups[g].tagsHigh++;
							b = true;
						}
					}
				} else if (this.gridCellGrowth == dd_gridCellGrowthMethods.downThenAcross) {
					var b = false;
					for (var a=this.gridMinTagsHigh * this.gridMinTagsWide; a<this.groups[g].tags.length; a=this.groups[g].tagsWide * this.groups[g].tagsHigh) { 
						if (b) {
							this.groups[g].tagsWide++;
							b = false;
						} else {
							this.groups[g].tagsHigh++;
							b = true;
						}
					}					
				} else {
					//dd_gridCellGrowthMethods.square 
					this.groups[g].tagsWide = Math.ceil(Math.sqrt((this.groups[g].tags.length + 1)));
					this.groups[g].tagsHigh = Math.ceil(Math.sqrt((this.groups[g].tags.length + 1)));
					if (biggest < this.groups[g].tagsWide) {
						biggest = this.groups[g].tagsWide;
					}
				}
				var c = g % this.gridColumns;
				if (columnTagWidths[c] < this.groups[g].tagsWide) {
					columnTagWidths[c] = this.groups[g].tagsWide;
				}
				var r = Math.floor(g / this.gridColumns);
				if (rowTagHeights[r] < this.groups[g].tagsHigh) {
					rowTagHeights[r] = this.groups[g].tagsHigh;
				}
			}
		}

		//correct size of group based on same row / column
		if (this.showLegend) {
			var lastColumnWidth = this.legend.width + this.gridLabelThickness;
			var lastColumnLeft = this.legend.left;
		} else {
			var lastColumnWidth = this.gridLabelThickness;
			var lastColumnLeft = 0;
		}
		var lastRowTop = 0;
		var lastRowHeight = this.gridTitleThickness + this.gridLabelThickness;
		var p = 0;
		
		for (var r=0;r<this.gridRows;r++) {
			if (this.filterGrid) {
				if (this.filterRowField == this.rowField && this.rowValues[r] != this.filterRowValue) {
					continue;
				}
			}
			for (var c=0;c<this.gridColumns;c++) {
				if (this.filterGrid) {
					if (this.filterColumnField == this.columnField && this.columnValues[c] != this.filterColumnValue) {
						continue;
					}
				}
				var g = (r*this.gridColumns) + c;
				//this.groups[g].label = "w: " + this.groups[g].tagsWide + " h: " + this.groups[g].tagsHigh;
				if (this.gridCellGrowth > 0) {
					this.groups[g].tagsWide = columnTagWidths[c];
					this.groups[g].tagsHigh = rowTagHeights[r];
				} else {
					this.groups[g].tagsWide = biggest;
					this.groups[g].tagsHigh = biggest;
				}
				this.groups[g].width = this.gridBuffer + (this.groups[g].tagsWide * (this.tagBuffer + this.tagWidth));
				if (this.showGroupLabels) {
					this.groups[g].height = Math.floor(this.groupLabelFontSize * 1.5) + this.gridBuffer + (this.groups[g].tagsHigh * (this.tagBuffer + this.tagHeight)) + this.groupTotalsHeight;
				} else {
					this.groups[g].height = this.gridBuffer + (this.groups[g].tagsHigh * (this.tagBuffer + this.tagHeight)) + this.groupTotalsHeight;			
				}
				// if not paging
				if (this.overFlowMethod !== dd_overFlowMethods.pages) {
					this.groups[g].left = lastColumnLeft+lastColumnWidth;
					this.groups[g].top = lastRowTop+lastRowHeight;
					lastColumnWidth = this.groups[g].width;
					lastColumnLeft = this.groups[g].left;
					if (c == this.gridColumns - 1) {
						lastRowHeight = this.groups[g].height;
						lastRowTop = this.groups[g].top;
					}
				} else {
					this.groups[g].top = lastRowTop+lastRowHeight;
					//if going off screen 
					if (lastColumnLeft + lastColumnWidth + this.groups[g].width > this.stageWidth - touchBuffer) {
						this.paging = true;
						//put it and the Null column onto next page
						if (this.showNullColumn) { 
							p = this.pageGroups.length;
							this.pageGroups[p] = [r*this.gridColumns,g];
							this.pageColumns[p] = [0,c];
							this.groups[g].left = this.groups[r*this.gridColumns].left + this.groups[r*this.gridColumns].width;
							lastColumnWidth = this.groups[g].width;
							lastColumnLeft = this.groups[g].left;
						} else {
							p++;
							if (this.pageGroups[p] == null || this.pageGroups[p] == undefined) {
								this.pageGroups[p] = [g];
								this.pageColumns[p] = [c];
							} else {
								this.pageGroups[p].push(g);
								this.pageColumns[p].push(c);						
							}
							if (this.showLegend) {
								this.groups[g].left = this.legend.width + this.gridLabelThickness;
								lastColumnWidth = this.groups[g].width;
								lastColumnLeft = this.groups[g].left;
							} else {
								this.groups[g].left = this.gridLabelThickness;
								lastColumnWidth = this.groups[g].width;
								lastColumnLeft = this.groups[g].left;
							}
						}
					} else {
						if (this.pageGroups[p] == null || this.pageGroups[p] == undefined) {
							this.pageGroups[p] = [g];
							this.pageColumns[p] = [c];
						} else {		
							this.pageGroups[p].push(g);
							this.pageColumns[p].push(c);						
						}
						this.groups[g].left = lastColumnLeft+lastColumnWidth;
						this.groups[g].top = lastRowTop+lastRowHeight;
						lastColumnWidth = this.groups[g].width;
						lastColumnLeft = this.groups[g].left;					
					}
					if (c == this.gridColumns - 1) {
						lastRowHeight = this.groups[g].height;
						lastRowTop = this.groups[g].top;
					}
				}
			}
			if (this.showLegend) {
				lastColumnWidth = this.legend.width + this.gridLabelThickness;
				lastColumnLeft = this.legend.left;
			} else {
				lastColumnWidth = this.gridLabelThickness;
				lastColumnLeft = 0;
			}
			p = 0;
			//var lastColumnWidth = this.gridLabelThickness;
			//var lastColumnLeft = 0;
		}
		//draw
		document.body.style.cursor = 'default';
		//debugger;
		if (this.showLegend) {
			this.redrawLegendAndGrid();
		} else {
			this.redrawGrid();
		}		
	}

	redrawLegendAndGrid() { 
		if (this.legend.renderObject != null) {
			this.legend.renderObject.destroy();
		}
		if (this.legend.tagObjects != null) {
			this.legend.tagObjects.destroy();
		}

		this.legend.height = Math.floor(this.groupLabelFontSize * 1.5) + (this.tagBuffer * 2) + (this.legend.tagsHigh * (this.legendTagHeight + this.tagBuffer)) + (this.iconFieldLabelPairs.length * (this.legendIconHeight + this.tagBuffer));
		this.legend.width = this.gridBuffer + ((this.tagBuffer + this.legendTagWidth) * this.legend.tagsWide); 
		this.legend.renderObject = new Konva.Group({
			x: this.legend.left,
			y: this.legend.top,
			width: this.legend.width,
			height: this.legend.height,
			rotation: 0,
			draggable: false
		});
		var groupBack = new Konva.Rect({
			x: Math.floor(this.gridBuffer / 2),
			y: Math.floor(this.gridBuffer / 2),
			stroke: this.gridBorderColor,
			strokeWidth: this.gridBorderThickness,
			fill: this.legendFillColor,
			width: this.legend.width - this.gridBuffer,
			height: this.legend.height - this.gridBuffer,
			cornerRadius: 10,
			preventDefault: false
		});
		var groupLabel = new Konva.Text({
			x: 0,
			y: Math.floor(this.groupLabelFontSize / 2),
			text: this.legend.label,
			fontSize: this.groupLabelFontSize,
			fontFamily: this.groupLabelFont,
			fill: this.groupLabelFontColor,
			shadowColor: 'black',
			shadowBlur: 0,
			shadowOffset: {x : 1, y : 1},
			shadowOpacity: 1,
			width: this.legend.width,
			padding: 0,
			align: 'center',
			preventDefault: false
		});
		
		this.legend.renderObject.add(groupBack);
		this.legend.renderObject.add(groupLabel);
		this.gridLayer.add(this.legend.renderObject);

		this.legend.tagObjects = new Konva.Group({
			x: 0,
			y: 0,
			width: this.stageWidth,
			height: this.stageHeight,
			rotation: 0,
			draggable: false
		});
		this.tagLayer.add(this.legend.tagObjects);
		
		var tagOffsetX = this.tagBuffer;
		var tagOffsetY = this.tagBuffer;
		//add the tags
		var count = 0;
		var offsetX = tagOffsetX;
		var column = 0;
		for (var t=0;t<this.colorLabelValuePairs.length;t++) {
			if (this.filterLegend == true && this.colorLabelValuePairs[t][this.legendFilterField] != this.legendFilterValue) {
				continue;
			}
			count++;
			if (count > this.legendMaxTagsHigh) {
				column = Math.ceil(count / this.legendMaxTagsHigh)-1;
				offsetX = tagOffsetX + (column * (this.legendTagWidth + tagBuffer));
			}
			tagOffsetY = Math.floor(this.groupLabelFontSize * 1.5) + this.tagBuffer + ((count - 1 - (this.legendMaxTagsHigh * column)) * (this.legendTagHeight + this.tagBuffer));
			var tag = new Konva.Group({
				id: t,
				home_x: this.legend.left + offsetX,
				home_y: this.legend.top + tagOffsetY,
				color_index: t,
				legendCount: 0,
				x: this.legend.left + offsetX,
				y: this.legend.top + tagOffsetY,
				width: this.legendTagWidth,
				height: this.legendTagHeight,
				rotation: 0,
				draggable: (this.legendIsTagPalette && this.gridEditMode)
			});

			var tagBack = new Konva.Rect({
				x: 0,
				y: 0,
				stroke: this.legendTagBorderColor,
				strokeWidth: this.legendTagBorderThickness,
				fill: this.colorLabelValuePairs[t].Color,
				width: this.legendTagWidth,
				height: this.legendTagHeight,
				opacity: this.legendTagFillOpacity,
				lineJoin: 'round',
				cornerRadius:5
			});
		
			var labelY = Math.floor((this.legendTagHeight - this.legendTagLabelFontSize) / 2);
			var tagLabel = new Konva.Text({
				x: 0,
				y: labelY,
				text: this.colorLabelValuePairs[t].Label,
				fontSize: this.legendTagLabelFontSize,
				fontFamily: this.tagLabelFont,
				fill: this.tagLabelFontColor,
				shadowColor: this.tagLabelShadowColor,
				shadowEnabled: this.tagLabelShadowOn,
				shadowBlur: 0,
				shadowOffset: {x : 1, y : 1},
				shadowOpacity: 1,
				width: this.legendTagWidth,
				padding: 0,
				align: 'center'
			});

			tag.add(tagBack);
			tag.add(tagLabel);

			if (this.showLegendCount) {
				var tagCount = 0;
				for (var i=0;i<this.tagData.length;i++) {
					if (this.tagData[i][this.tagColorField] == this.colorLabelValuePairs[t].Value) {
						tagCount++;
					}
				}
				tag.attrs.legendCount = tagCount;
				var tagCounter = new Konva.Text({
					x: 0,
					y: labelY,
					text: tagCount,
					fontSize: this.tagCountFontSize,
					fontFamily: this.tagCountFont,
					fill: this.tagCountFontColor,
					shadowColor: this.tagCountShadowColor,
					shadowEnabled: this.tagCountShadowOn,
					shadowBlur: 0,
					shadowOffset: {x : 1, y : 1},
					shadowOpacity: 1,
					width: (this.legendTagWidth-this.tagBorderThickness)-2,
					padding: 0,
					align: 'right',
					id: 'tagCounter',
					name: 'tagCounter'
				});
				tag.add(tagCounter);
				tagCounter.on('mousedown tap', function(event) {
					if (this.legendCountClickFunction != null && event.evt.which == 1) {
						this.closeEditFunction();
						this.legendCountClickFunction(tag.attrs.color_index,tag);
					}
				}.bind(this));
			}
			
			this.legend.tagObjects.add(tag);

			tag.on('dragstart', function (evt) {
				this.gridDragging = true;
				this.draggedTag = evt.currentTarget;
			}.bind(this));
			tag.on('dragend', function (evt) {
				this.gridDragging = false;
				this.handleLegendDrop(evt);
			}.bind(this));
			tag.on('mousedown touchstart', function (evt) {
				evt.currentTarget.moveToTop();
				this.legend.tagObjects.moveToTop();
			}.bind(this))
		}
		
		if (this.showIcons) {
			tagOffsetY = tagOffsetY - this.tagBuffer;
			if (count > this.legendMaxTagsHigh) {
				tagOffsetY = Math.floor(this.groupLabelFontSize * 1.5) + this.tagBuffer + ((this.legendMaxTagsHigh - 1) * (this.legendTagHeight + this.tagBuffer)) - this.tagBuffer;
			}
			var legendIcon = [];
			for (var i=0;i<this.iconFieldLabelPairs.length;i++) {
				tagOffsetX = tagBuffer;
				//y: Math.floor(groupLabelFontSize * 1.5) + (tagBuffer*2) + ((ColorLabelValuePairs.length + i) * (legendIconHeight + tagBuffer)) + (Math.floor((legendIconHeight - tagSmallLabelFontSize) / 2)),
				var legendIconLabel = new Konva.Text({
					x: this.tagBuffer + Math.floor(this.legend.width / 4),
					y: tagOffsetY + Math.floor(this.groupLabelFontSize * 1.5) + (this.tagBuffer*2) + (i * (this.legendIconHeight + this.tagBuffer )) + (Math.floor((this.legendIconHeight - this.tagSmallLabelFontSize) / 2)),
					text: this.iconFieldLabelPairs[i].Label,
					fontSize: this.legendTagLabelFontSize,
					fontFamily: this.tagSmallLabelFont,
					fill: this.tagSmallLabelFontColor,
					shadowColor: this.tagSmallLabelShadowColor,
					shadowEnabled: this.tagSmallLabelShadowOn,
					shadowBlur: 0,
					shadowOffset: {x : 1, y : 1},
					shadowOpacity: 1,
					width: this.legendTagWidth,
					padding: 0,
					align: 'left'
				});
				var loadcount = 0;
				this.iconFieldLabelPairs[i].Image = new Image();
				this.iconFieldLabelPairs[i].Image.onload = (function(nr) {
					return function() {
						legendIcon[nr] = new Konva.Image({
							x: this.tagBuffer + Math.floor(((this.legend.width / 4) - this.iconSize) / 2),
							y: tagOffsetY + Math.floor(this.groupLabelFontSize * 1.5) + (this.tagBuffer*2) + (nr * (this.legendIconHeight + this.tagBuffer)),
							image: this.iconFieldLabelPairs[nr].Image,
							width: this.iconSize,
							height: this.iconSize
						});
						this.legend.renderObject.add(legendIcon[nr]);
						legendIcon[nr].draw();
						loadcount++;
						if (loadcount == this.iconFieldLabelPairs.length) {
							this.redrawGrid();
						}
					}
				}(i));
				this.iconFieldLabelPairs[i].Image.src = this.legendIconBaseURL + this.iconFieldLabelPairs[i].Icon;
				this.legend.renderObject.add(legendIconLabel);
			}
		} else {
			this.redrawGrid();
		}
	}
	
	redrawGrid() {

		//resize the canvas
		if (this.overFlowMethod == dd_overFlowMethods.grows) {
			//last group is presumably bottom-most left-most
			if (this.stage.attrs.width !== Math.max(this.groups[this.groups.length-1].left + this.groups[this.groups.length-1].width + this.gridBuffer,this.stageWidth)) {
				this.stage.setWidth(Math.max(this.groups[this.groups.length-1].left + this.groups[this.groups.length-1].width + this.gridBuffer,this.stageWidth));
			}
			if (this.stage.attrs.height !== Math.max(this.groups[this.groups.length-1].top + this.groups[this.groups.length-1].height + this.gridBuffer,this.stageHeight)) {
				this.stage.setHeight(Math.max(this.groups[this.groups.length-1].top + this.groups[this.groups.length-1].height + this.gridBuffer,this.stageHeight));
			}
		} else if (this.overFlowMethod == dd_overFlowMethods.slides) {
			if (this.stage.attrs.height !== Math.max(this.groups[this.groups.length-1].top + this.groups[this.groups.length-1].height + this.gridBuffer,this.stageHeight)) {
				this.stage.setHeight(Math.max(this.groups[this.groups.length-1].top + this.groups[this.groups.length-1].height + this.gridBuffer,this.stageHeight));
			}
			this.createGridScrollHotSpots();
		}
		
		if (this.gridTitle != null) {
			this.gridTitle.destroy();
		}
			
		//debugger;
		for (var g=0;g<this.groups.length;g++) {
			if (this.groups[g].renderObject != null) {
				this.groups[g].renderObject.destroy();
			}
			if (this.groups[g].tagObjects != null) {
				this.groups[g].tagObjects.destroy();
			}
		}

		for (var g=0;g<this.groups.length;g++) {
		
			//skip if group is not on page
			if (this.paging) {
				if (this.pageGroups[this.page].indexOf(g)<0) {
					continue;
				}
			}
			
			this.groups[g].renderObject = new Konva.Group({
				x: this.groups[g].left,
				y: this.groups[g].top,
				width: this.groups[g].width,
				height: this.groups[g].height,
				rotation: 0,
				draggable: false
			});
			
			this.groups[g].renderObject.on('click', this.stageClicked);
			
			var groupBack = new Konva.Rect({
				x: Math.floor(this.gridBuffer / 2),
				y: Math.floor(this.gridBuffer / 2),
				stroke: this.gridBorderColor,
				strokeWidth: this.gridBorderThickness,
				fill: this.groups[g].paintColor == "" ? this.groupFillColor : this.groups[g].paintColor,
				width: this.groups[g].width - this.gridBuffer,
				height: this.groups[g].height - this.gridBuffer,
				cornerRadius: 10,
				preventDefault: false
			});
			this.groups[g].renderObject.add(groupBack);

			if (this.showGroupTotals) {
				if (this.showIcons == false) {
					//just show the total
					var totalTags = new Konva.Text({
						x: 0,
						y: this.groups[g].height - this.groupTotalsHeight,
						text: "Count: " + this.groups[g].tags.length,
						fontSize: this.groupTotalFontSize,
						fontFamily: this.groupTotalFont,
						fill: this.groupTotalFontColor,
						shadowColor: 'black',
						shadowBlur: 0,
						shadowOffset: {x : 1, y : 1},
						shadowOpacity: 1,
						width: this.groups[g].width,
						padding: 0,
						align: 'center'
					});
					this.groups[g].renderObject.add(totalTags);
				} else {
					var groupIcons = [];
					var iconLabels = [];
					var numIcons = 0;
					//first count the number of icons we need so we can get spacing
					for (var i=0;i<this.iconFieldLabelPairs.length;i++) {
						for (var t=0;t<this.groups[g].tags.length;t++) {
							var dataIndex = this.groups[g].tags[t];
							if (this.tagData[dataIndex][this.iconFieldLabelPairs[i].Field] == this.iconFieldLabelPairs[i].FieldValue) {
								numIcons++;
								break;
							}
						}
					}
					//then draw the icons only if count is above zero do we draw the icon
					if (numIcons>0) {
						var position = -1;
						var iconsPerLine = Math.floor((this.groups[g].width - 10) / (this.groupTotalFontSize + this.iconSize+5));
						for (var i=0;i<this.iconFieldLabelPairs.length;i++) {
							//get the count
							var c = 0;
							for (var t=0;t<this.groups[g].tags.length;t++) {
								var dataIndex = this.groups[g].tags[t];
								if (this.tagData[dataIndex][this.iconFieldLabelPairs[i].Field] == this.iconFieldLabelPairs[i].FieldValue) {
									c++;
								}		
							}
							if (c>0) {
								position++;
								//	x: (groups[g].width - ((position+1) * (groupTotalFontSize + iconSize+5))) - 10,
								//	y: groups[g].height - groupTotalsHeight + Math.floor((iconSize-groupTotalFontSize)/2),
								iconLabels[position] = new Konva.Text({
									x: (this.groups[g].width - (((position % iconsPerLine)+1) * (this.groupTotalFontSize + this.iconSize+5))) - 10,
									y: (this.groups[g].height - (this.groupTotalsHeight * (Math.floor(position/iconsPerLine)+1))) + Math.floor((this.iconSize-this.groupTotalFontSize)/2),
									text: c,
									fontSize: this.groupTotalFontSize,
									fontFamily: this.groupTotalFont,
									fill: this.groupTotalFontColor,
									shadowColor: 'white',
									shadowBlur: 0,
									shadowOffset: {x : 1, y : 1},
									shadowOpacity: 1,
									width: this.groupTotalFontSize*2,
									padding: 1,
									align: 'left'					
								});						
								groupIcons[position]= new Konva.Image({
									image: this.iconFieldLabelPairs[i].Image,
									x: this.groups[g].width - (((position % iconsPerLine)+1) * (this.groupTotalFontSize + this.iconSize+5)),
									y: this.groups[g].height - (this.groupTotalsHeight * (Math.floor(position/iconsPerLine)+1)),
									width: this.iconSize,
									height: this.iconSize
								});
								this.groups[g].renderObject.add(groupIcons[position]);
								this.groups[g].renderObject.add(iconLabels[position]);
							}
						}
					}					
				}
			}
			
			if (this.showGroupLabels) {
				var groupLabel = new Konva.Text({
					x: 0,
					y: Math.floor(this.groupLabelFontSize / 2),
					text: this.groups[g].label,
					fontSize: this.groupLabelFontSize,
					fontFamily: this.groupLabelFont,
					fill: this.groupLabelFontColor,
					shadowColor: 'black',
					shadowBlur: 0,
					shadowOffset: {x : 1, y : 1},
					shadowOpacity: 1,
					width: this.groups[g].width,
					padding: 0,
					align: 'center',
					preventDefault: false
				});
				this.groups[g].renderObject.add(groupLabel);
			}
			
			//backgroundLayer.add(groups[g].renderObject);
			//groups[g].renderObject.cache();
			this.gridLayer.add(this.groups[g].renderObject);
			
			//var tagOffsetX = 0;
			//var tagOffsetY = 0;
			//var newTagIndex = 0;
			
			this.groups[g].tagObjects = new Konva.Group({
				x: 0,
				y: 0,
				width: this.stageWidth,
				height: this.stageHeight,
				rotation: 0,
				draggable: false
			});
			this.tagLayer.add(this.groups[g].tagObjects);
			
			//add the tags
			for (var t=0;t<this.groups[g].tags.length;t++) {
				this.addTag(g,t,this.groups[g].tags[t],true);
			}
		}
		
		//draw the title
		if (this.gridTitleText !== '') {
			this.gridTitle = new Konva.Text({
					x: 0,
					y: this.gridTitleThickness - this.gridTitleFontSize,
					text: this.gridTitleText,
					fontSize: this.gridTitleFontSize,
					fontFamily: this.gridTitleFont,
					fill: this.gridTitleFontColor,
					shadowColor: 'black',
					shadowBlur: 0,
					shadowOffset: {x : 1, y : 1},
					shadowOpacity: 1,
					width: this.stageWidth,
					padding: 0,
					align: 'center',
					preventDefault: false
				});
			this.backgroundLayer.add(this.gridTitle);
		}
		if (this.paging) {
			this.createHorizontalScroller();
		}
		
		//draw the column labels
		for (var c=0;c<this.columnLabels.length;c++) {

			if (this.cLabels[c] != null) {
				this.cLabels[c].destroy();
			}

			if (this.paging) {
				if (this.pageColumns[this.page].indexOf(c) < 0) {
					continue;
				}
			}
			
			this.cLabels[c] = new Konva.Text({
				x: this.groups[c].left,
				y: this.groups[c].top - this.gridLabelThickness + Math.floor((this.gridLabelThickness - this.gridLabelFontSize) / 2),
				text: this.columnLabels[c],
				fontSize: this.gridLabelFontSize,
				fontFamily: this.gridLabelFont,
				fill: this.gridLabelFontColor,
				shadowColor: this.gridLabelFontShadowColor,
				shadowBlur: 0,
				shadowOffset: {x : 1, y : 1},
				shadowOpacity: 1,
				width: this.groups[c].width,
				padding: 0,
				align: 'center',
				preventDefault: false
			});
			this.gridLayer.add(this.cLabels[c]);
		}
		//draw the row labels
		for (var r=0;r<this.rowLabels.length;r++) {
			
			if (this.rLabels[r] != null) {
				this.rLabels[r].destroy();
			}
			
			this.rLabels[r] = new Konva.Text({
				x: this.groups[0].left - this.gridLabelThickness + Math.floor((this.gridLabelThickness - this.gridLabelFontSize) / 2),
				y: this.groups[r*this.columnLabels.length].top + this.groups[r*this.columnLabels.length].height,
				text: this.rowLabels[r],
				fontSize: this.gridRowLabelFontSize,
				fontFamily: this.gridRowLabelFont,
				fill: this.gridRowLabelFontColor,
				shadowColor: this.gridRowLabelFontShadowColor,
				shadowBlur: 0,
				shadowOffset: {x : 1, y : 1},
				shadowOpacity: 1,
				width: this.groups[r*this.columnLabels.length].height,
				padding: 0,
				rotation: 270,
				align: 'center',
				preventDefault: false
			});
			this.gridLayer.add(this.rLabels[r]);
		}
		this.stage.draw();
	}
	
	handleLegendDrop(legendTagObject) {
		var self = legendTagObject.currentTarget;
		var x = self.getX();
		var y = self.getY();
		var centerx = self.getX() + Math.floor(self.getWidth() / 2);
		var centery = self.getY() + Math.floor(self.getHeight() / 2);
		var colorIndex = self.attrs.color_index;
		var xx = parseInt(self.attrs.home_x);
		var yy = parseInt(self.attrs.home_y);
		//debugger;
		var gHit = this.groupHit(centerx,centery);
		var targetIndex = -1;
			
		if (gHit == -1) {
			self.tween = new Konva.Tween({
				node: self,
				x: xx,
				y: yy,
				easing: Konva.Easings.EaseIn,
				duration: 1
			});
			self.tween.play();
			return;
		}
		var fields = new Object();
		fields[this.tagColorField] = this.colorLabelValuePairs[colorIndex].Value;
		if (this.columnField != "") {
			fields[this.columnField] = this.groups[gHit].colValue;
		}
		if (this.rowField != "") {
			fields[this.rowField] = this.groups[gHit].rowValue;
		}
		if (this.tagSmallLabelField != "") {
			if (this.colorLabelValuePairs[colorIndex][this.tagSmallLabelField] !== undefined) {
				fields[this.tagSmallLabelField] = this.colorLabelValuePairs[colorIndex][this.tagSmallLabelField];
			}
		}
		var dataIndex = 0;
		if (this.postEachGridEdit) {
			var result = this.gridEditFunction(self,dd_gridActions.insert,gHit,fields);
			if (result == false) {
				//no change
				self.position({x: xx,  y: yy});
				this.stage.draw();
				return;
			} else if (result == -1) {
				//do default
				dataIndex = this.tagData.length;
				this.tagData[dataIndex] = fields;
			} else if (result) {
				dataIndex = result;
			}
		} else {
			dataIndex = this.tagData.length;
			this.tagData[dataIndex] = fields;
		}
		this.groups[gHit].tags.push(dataIndex);
		this.addTag(gHit,this.groups[gHit].tags.length-1,dataIndex,true,x,y);
		self.position({x: xx, y: yy});
		if (this.showLegendCount) {
			this.updateLegendCount(self);
		}
		this.stage.draw();
	}

	updateLegendCount(tagObject,index) {
		var legendTag = null;
		if (tagObject == null || tagObject == undefined) {
			if (index == undefined || isNaN(index)) {
				throw("no object or number to update the legend counter");
				return;
			} else {
				var legendTags = this.legend.tagObjects.getChildren();
				for (var i=0;i<legendTags.length;i++) {
					if (legendTags[i].attrs.color_index == index) {
						legendTag = legendTags[i];
						break;
					}
				}
			}
		} else {
			legendTag = tagObject;
		}
		var legendCount = 0;
		for (var i=0;i<this.tagData.length;i++) {
			if (this.tagData[i][this.tagColorField] == this.colorLabelValuePairs[legendTag.attrs.color_index].Value) {
				legendCount++;
			}
		}
		legendTag.clearCache();
		legendTag.attrs.legendCount = legendCount;
		var tagCount = legendTag.find('.tagCounter')[0];
		tagCount.setText(legendCount);
		legendTag.draw();
	}
	
	/*stgTapped(event) {
		var x = event.changedTouches[0].pageX;
		var y = event.changedTouches[0].pageY;
		this.writeMessage("tapped " + x + "," + y);
		setTimeout(function(){ this.writeMessage(""); },1500);
	}*/

	stageClicked(event) {
		var x =  event.evt.layerX;
		var y = event.evt.layerY;
		var px = event.evt.pageX;
		var py = event.evt.pageY;
		
		if (this.gridEditMode == true && event.evt.button == 2) {
			var ghit = this.groupHit(x,y);
			if (ghit >= 0) {
				this.closeEditFunction();
				//this.groupEditFunction(px,py,ghit);
				this.groupEditFunction(this.stage.getPointerPosition().x,this.stage.getPointerPosition().y,ghit);
			}
		} else {
			this.closeEditFunction();
		}
	 }
 
	scrollStageLeft() {
		var gridLayerPos = this.gridLayer.position();
		var leftLimit = (Math.max(this.groups[this.groups.length-1].left + this.groups[this.groups.length-1].width + this.gridBuffer,this.stageWidth) - this.stageWidth) * -1;
		if (gridLayerPos.x > leftLimit) {
			var xx = Math.max(gridLayerPos.x - (this.groups[0].width + this.gridBuffer),leftLimit);
			var yy = gridLayerPos.y;
			this.scrollTween = new Konva.Tween({
				node: this.gridLayer,
				x: xx,
				y: yy,
				easing: Konva.Easings.EaseIn,
				rotation: 0,
				duration: 0.8,
				onFinish: function() { this.tagLayer.position({x: xx, y: yy}); this.tagLayer.draw(); this.tagLayer.show(); this.cancelScroll();	}.bind(this)
			});
			this.tagLayer.hide();
			this.scrollTween.play();
		}
	}

	scrollStageRight() {
		var gridLayerPos = this.gridLayer.position();
		if (gridLayerPos.x < 0) {
			var xx = Math.min(gridLayerPos.x + this.groups[0].width + this.gridBuffer,0);
			var yy = gridLayerPos.y;
			this.scrollTween = new Konva.Tween({
				node: this.gridLayer,
				x: xx,
				y: yy,
				easing: Konva.Easings.EaseIn,
				rotation: 0,
				duration: 0.8,
				onFinish: function() { this.tagLayer.position({x: xx, y: yy}); this.tagLayer.draw(); this.tagLayer.show(); this.cancelScroll();}.bind(this)
			});
			this.tagLayer.hide();
			this.scrollTween.play();
		}
	}

	cancelScroll() {
		//clearInterval(this.scrollTimer);
		//this.tagLayer.show();
		//this.scrollTimer = null;
		//this.cancelScrollTimer = null;
		//this.scrollTween.destroy();
		//this.scrollTween = null;
		//this.gridLayer.draggable(true);
	}

	dragScrollTest() {
		//check if dragging and where the mouse is
		if (this.gridDragging && this.scrollTimer === null) {
			if (this.mouse.x < 50) {
				this.gridScrollHotSpots[0].fill('white');
				this.gridScrollHotSpots[0].draw();
				this.scrollTimer = setInterval(function () {this.scrollStageRight();}.bind(this),1500);
				return;
			} else if (this.mouse.x > this.stageWidth - 50) {
				this.gridScrollHotSpots[1].fill('white');
				this.gridScrollHotSpots[1].draw();
				this.scrollTimer = setInterval(function () {this.scrollStageLeft();}.bind(this),1500);
				return;
			}
		} else if (this.gridDragging) {
			//cancel
			if ((this.mouse.x >= 50) && (this.mouse.x <= this.stageWidth - 50)) {
				this.gridScrollHotSpots[0].fill('transparent');
				this.gridScrollHotSpots[1].fill('transparent');
				this.uiLayer.draw();
				clearInterval(this.scrollTimer);
				this.scrollTimer = null;
			}
		} else if (this.scrollTimer !== null) {
				clearInterval(this.scrollTimer);
				this.scrollTimer = null;		
				this.gridScrollHotSpots[0].fill('transparent');
				this.gridScrollHotSpots[1].fill('transparent');
				this.uiLayer.draw();
		}
	}
	
	createGridScrollHotSpots() {
	
		for (var i=0;i<this.gridScrollHotSpots.length-1;i++) {
			this.gridScrollHotSpots[i].destroy();
		}
		this.gridScrollHotSpots.splice(0,this.gridScrollHotSpots.length);
		
		this.gridScrollHotSpots[0] = new Konva.Rect({
			x: 0,
			y: 0,
			width: 50,
			height: this.stageHeight,
			fill: 'transparent',
			opacity: 0.35
		});

		this.uiLayer.add(this.gridScrollHotSpots[0]);

		this.gridScrollHotSpots[1] = new Konva.Rect({
			x: this.stageWidth - 50,
			y: 0,
			width: 50,
			height: this.stageHeight,
			fill: 'transparent',
			opacity: 0.35
		});

		this.uiLayer.add(this.gridScrollHotSpots[1]);
		
		document.addEventListener('mousemove', function(e){ 
			this.mouse.x = e.clientX || e.pageX; 
			this.mouse.y = e.clientY || e.pageY;
		}.bind(this), false);

		if (this.touchDevice) {
			document.addEventListener('touchmove', function(e){ 
				this.mouse.x = e.changedTouches[0].clientX || e.changedTouches[0].pageX; 
				this.mouse.y = e.changedTouches[0].clientY || e.changedTouches[0].pageY;
			}.bind(this), false);
		}
		
		this.dragScrollTestTimer = setInterval(function () {this.dragScrollTest();}.bind(this),100);

	}
	
	groupHit(x, y) {	
		for (var i = 0; i < this.groups.length; i++) {
			var gg = this.groups[i];
			if (this.paging && this.pageGroups[this.page].indexOf(i) < 0) {
				continue;
			}
			if (x > gg.left && x < (gg.left + gg.width) && y > gg.top && y < (gg.top + gg.height)) {
				return (i);
			}
		}
		return (-1);
	}

	createHorizontalScroller() {

		while (this.ticks.length > 0) {
			this.ticks[0].destroy();
			this.ticks.splice(0,1);
		}
		while (this.navarrows.length > 0) {
			this.navarrows[0].destroy();
			this.navarrows.splice(0,1);
		}

		//create new ticks
		if (this.paging && !this.touchDevice) {
			for (var i = 0; i < this.pageGroups.length; i++) {
				if (this.page == i) {
					var left = Math.floor((this.stageWidth * 0.95) - (this.pageGroups.length * 20) + (i * 20));
					this.ticks[i] = new Konva.Rect({
						x: left - 2,
						y: 3,
						link: i,
						stroke: '#555',
						strokeWidth: 1,
						fill: 'white',
						width: 19,
						height: 19,
						cornerRadius: 3
					});
				} else {
					var left = Math.floor((this.stageWidth * 0.95) - (this.pageGroups.length * 20) + (i * 20));
					this.ticks[i] = new Konva.Rect({
						x: left,
						y: 5,
						link: i,
						stroke: '#555',
						strokeWidth: 1,
						fill: '#a0a0a0',
						width: 15,
						height: 15,
						cornerRadius: 3
					});
					this.ticks[i].on('mousedown', function(evt) {
						var tick = evt.currentTarget;
						this.page = parseInt(tick.attrs.link);
						this.createGroups(true);
					}.bind(this));
				}
				this.uiLayer.add(this.ticks[i]);
				this.ticks[i].moveToTop();
			}
			if (this.page > 0) {
				var px = Math.floor((this.stageWidth * 0.95) - (this.pageGroups.length * 20) - 15);
				var ii = this.navarrows.length;
				this.navarrows[ii] = new Konva.RegularPolygon({
					link: this.page - 1,
					x: px,
					y: 12,
					sides: 3,
					radius: 12,
					rotation: 270,
					stroke: '#555',
					fill: '#a0a0a0',
					strokeWidth: 1,
					cornerRadius: 3,
					lineJoin: 'round'
				});
				this.navarrows[ii].on('mousedown', function(evt) {
					var navArrow = evt.currentTarget;
					this.page = parseInt(navArrow.attrs.link);
					navArrow.off('mouseout');
					navArrow.off('mouseover');
					this.createGroups(true);
				}.bind(this));
				this.navarrows[ii].on('mouseover', function(evt) {
					var navArrow = evt.currentTarget;
					navArrow.fill('white');
					navArrow.draw();
				}.bind(this));
				this.navarrows[ii].on('mouseout', function(evt) {
					var navArrow = evt.currentTarget;
					navArrow.fill('#a0a0a0');
					navArrow.draw();
				}.bind(this));
				this.uiLayer.add(this.navarrows[ii]);			
			}
			if (this.page < this.pageGroups.length - 1) {
				var px = Math.floor((this.stageWidth * 0.95) + 10);
				var ii = this.navarrows.length;
				this.navarrows[ii] = new Konva.RegularPolygon({
					link: this.page + 1,
					x: px,
					y: 12,
					sides: 3,
					radius: 12,
					rotation: 90,
					stroke: '#555',
					fill: '#a0a0a0',
					strokeWidth: 1,
					cornerRadius: 3,
					lineJoin: 'round'
				});			
				this.navarrows[ii].on('mousedown', function(evt) {
					var navArrow = evt.currentTarget;
					this.page = parseInt(navArrow.attrs.link);
					navArrow.off('mouseout');
					navArrow.off('mouseover');
					this.createGroups(true);
				}.bind(this));
				this.navarrows[ii].on('mouseover', function(evt) {
					var navArrow = evt.currentTarget;
					navArrow.fill('white');
					navArrow.draw();
				}.bind(this));
				this.navarrows[ii].on('mouseout', function(evt) {
					var navArrow = evt.currentTarget;
					navArrow.fill('#a0a0a0');
					navArrow.draw();
				}.bind(this));
				this.uiLayer.add(this.navarrows[ii]);			
			}
		} else if (this.paging && this.touchDevice) {
			//create non-interactive ticks
			for (var i = 0; i < this.pageGroups.length; i++) {
				if (this.page == i) {
					var left = Math.floor((this.stageWidth * 0.95) - (this.pageGroups.length * 20) + (i * 20));
					this.ticks[i] = new Konva.Rect({
						x: left - 2,
						y: 3,
						link: i,
						stroke: '#555',
						strokeWidth: 1,
						fill: 'white',
						width: 19,
						height: 19,
						cornerRadius: 3
					});
				} else {
					var left = Math.floor((this.stageWidth * 0.95) - (this.pageGroups.length * 20) + (i * 20));
					this.ticks[i] = new Konva.Rect({
						x: left,
						y: 5,
						link: i,
						stroke: '#555',
						strokeWidth: 1,
						fill: '#a0a0a0',
						width: 15,
						height: 15,
						cornerRadius: 3
					});
				}
				this.uiLayer.add(this.ticks[i]);
				this.ticks[i].moveToTop();
			}
			//create big arrows on the side (non-gesture tap)

			var px = this.stageWidth - 50;
			var py = this.gridTitleThickness + this.gridLabelThickness;
			var ii = this.navarrows.length;
			this.navarrows[ii] = new Konva.Line({
				link: this.page - 1,
				points: [px+30,py,px,py+50,px+30,py+100],
				closed: true,
				stroke: '#555',
				fill: this.page > 0 ? '#a0a0a0' : 'white',
				strokeWidth: 1
			});
			if (this.page > 0) {
				this.navarrows[ii].on('tap', function(evt) {
					this.page = parseInt(evt.currentTarget.attrs.link);
					this.createGroups(true);
				}.bind(this));
			}
			this.uiLayer.add(this.navarrows[ii]);	

			var ii = this.navarrows.length;
			py = py + 150;
			this.navarrows[ii] = new Konva.Line({
				link: this.page + 1,
				points: [px,py,px+30,py+50,px,py+100],
				closed: true,
				stroke: '#555',
				fill: (this.page < this.pageGroups.length - 1) ? '#a0a0a0': 'white',
				strokeWidth: 1
			});
			if (this.page < this.pageGroups.length - 1) {
				this.navarrows[ii].on('tap', function(evt) {
					this.page = parseInt(evt.currentTarget.attrs.link);
					this.createGroups(true);
				}.bind(this));
			}
			this.uiLayer.add(this.navarrows[ii]);			
		}
	}
	
	refreshGrid() {
		this.closeEditFunction();
		this.createGroups(true);
	}
	
	newTag(groupIndex) {
		var newData = new Object();
		var newLabel = prompt("Enter new label", "New_Label");
		if (newLabel != null && newLabel != "") {
			var letters = /^.*?(?=[\^.#%&$\*:\;<>\?/\{\|\}]).*$/;
			if (letters.test(newLabel)) {
				alert("The string contains invalid characters. Please use alpha-numeric characters.");
				return;
			}
			newData[tagLabelField] = newLabel;
		}
		if (this.columnField != "") {
			newData[this.columnField] = this.groups[groupIndex].colValue;
		}
		if (this.rowField != "") {
			newData[this.rowField] = this.groups[groupIndex].rowValue;
		}
		if (this.tagColorField != "") {
			newData[this.tagColorField] = this.tagDefaultColor;
		}
		var dataIndex = 0;
		if (this.postEachGridEdit) {
			var result = this.gridEditFunction(null,dd_gridActions.insert,groupIndex,newData);
			if (result == false) {
				//no change
				return;
			} else if (result == -1) {
				//do default
				dataIndex = this.tagData.length;
				this.tagData[dataIndex] = newData;
			} else if (result) {
				dataIndex = result;
			}
			
			this.groups[groupIndex].tags.push(dataIndex);
			this.addTag(groupIndex,this.groups[groupIndex].tags.length-1,dataIndex,true);
			this.tagLayer.draw();
		} else {
			dataIndex = this.tagData.length;
			this.tagData[dataIndex] = newData;
		}
		this.groups[groupIndex].tags.push(dataIndex);
		this.addTag(groupIndex,this.groups[groupIndex].tags.length-1,dataIndex,true);
		this.tagLayer.draw();
	}
	
	addTag(groupIndex,position,dataIndex,init,fromX,fromY) {

		var group = this.groups[groupIndex];
		var tagOffsetX = this.tagBuffer + ((position % group.tagsWide) * (this.tagBuffer + this.tagWidth));
		if (this.showGroupLabels) {
			var tagOffsetY = Math.floor(this.groupLabelFontSize * 1.5) + this.tagBuffer + (Math.floor(position / group.tagsWide) * (this.tagBuffer + this.tagHeight));
		} else {
			var tagOffsetY = this.tagBuffer + (Math.floor(position / group.tagsWide) * (this.tagBuffer + this.tagHeight));	
		}
		var posX;
		var posY;
		var snapTo = false;
		var legendColorIndex = 0;
		 
		if (fromX === undefined || fromY === undefined) {
			posX = group.left + tagOffsetX;
			posY = group.top + tagOffsetY;
		} else {
			posX = fromX;
			posY = fromY;
			snapTo = true;
		}
		var tagColor = this.tagFillColor;
		if (this.getTagColorFromLegend) {
			for (var i=0;i<this.colorLabelValuePairs.length;i++) {
				if (this.colorLabelValuePairs[i].Value == this.tagData[dataIndex][this.tagColorField]) {
					tagColor = this.colorLabelValuePairs[i].Color;
					legendColorIndex = i;
					break;
				}
			}
		} else {
			if (this.tagColorField != "") {
				tagColor = this.tagData[dataIndex][this.tagColorField];
			}
		}
		var tagFontColor = this.tagLabelFontColor;
		if (this.tagFontColorField != "") {
			tagFontColor = this.tagData[dataIndex][this.tagFontColorField];
		}
		var tag = new Konva.Group({
			id: dataIndex,
			home_x: group.left + tagOffsetX,
			home_y: group.top + tagOffsetY,
			home_group: groupIndex,
			legendColorIndex: legendColorIndex,
			group_position: position,
			copymode: false,
			x: posX,
			y: posY,
			width: this.tagWidth,
			height: this.tagHeight,
			rotation: 0,
			draggable: this.gridEditMode
		});
		// if not initializing, then adjust the data
		if (init == false) {
			group.tags[group.tags.length] = dataIndex;
			if (this.postEachGridEdit) {
				var fields = new Object();
				if (this.columnField != "" && this.tagData[dataIndex][this.columnField] != group.colValue) {
					fields[this.columnField] = group.colValue;
				}
				if (this.rowField != "" && this.tagData[dataIndex][this.rowField] != group.rowValue) {
					fields[this.rowField] = group.rowValue;
				}
				var result = this.gridEditFunction(tag,dd_gridActions.edit,groupIndex,fields);
				if (result == false) {
					//no change
					this.refreshGrid();
					return;
				} else if (result == -1) {
					//do default
					this.tagData[dataIndex][this.columnField] = group.colValue;
					this.tagData[dataIndex][this.rowField] = group.rowValue;
				} else if (result) {
					//update grid only
				}
			} else {
				this.tagData[dataIndex][this.columnField] = group.colValue;
				this.tagData[dataIndex][this.rowField] = group.rowValue;
			}
		}
		//expandgrid
		if (group.tagsHigh * group.tagsWide < group.tags.length) {
			this.refreshGrid();
			return;
		}
		if (this.gridEditMode) {
			if (this.tagColumnBound == true) {
				tag.setDragBoundFunc( function(pos) {
					if (this.gridDraggable) {
						return { x: posX, y: posY };
					} else {
						return { x: posX, y: pos.y };
					}
				});
			} else if (this.tagRowBound == true) {
				tag.setDragBoundFunc( function(pos) {
					if (this.gridDraggable) {
						return { x: posX, y: posY };
					} else {
						return { x: pos.x, y: posY };
					}
				});	
			}
		}
		var tagBack = new Konva.Rect({
			x: 0,
			y: 0,
			stroke: this.tagBorderColor,
			strokeWidth: this.tagBorderThickness,
			fill: tagColor,
			width: this.tagWidth,
			height: this.tagHeight,
			opacity: this.tagFillOpacity,
			cornerRadius: this.tagCornerRadius,
			lineJoin: 'round',
			id: 'tagBack',
			name: 'tagBack'
		});
		var labelY = 0;
		if (this.tagLabelFloat == "top") {
			labelY = 3 + this.tagBorderThickness;
		} else if (this.tagLabelFloat == "middle") {
			labelY = Math.floor((this.tagHeight - this.tagLabelFontSize) / 2);
		} else if (tagLabelFloat == "bottom") {
			labelY = this.tagHeight - this.tagLabelFontSize - this.tagBorderThickness - 1;
		}
		var tagLabel = new Konva.Text({
			x: 0,
			y: labelY,
			text: this.tagData[dataIndex][this.tagLabelField],
			fontSize: this.tagLabelFontSize,
			fontFamily: this.tagLabelFont,
			fontStyle: this.tagLabelFontStyle,
			fill: tagFontColor,
			shadowColor: this.tagLabelShadowColor,
			shadowEnabled: this.tagLabelShadowOn,
			shadowBlur: 0,
			shadowOffset: {x : 1, y : 1},
			shadowOpacity: 1,
			width: this.tagWidth,
			padding: 0,
			align: 'center',
			id: 'tagLabel',
			name: 'tagLabel'
		});
		if (this.tagLabelStrokeOn) {
			tagLabel.stroke(this.tagLabelStrokeColor);
			tagLabel.strokeWidth(this.tagLabelStrokeWidth);
		}
		tag.add(tagBack);
		tag.add(tagLabel);
		// Icons
		var iconCount = 0;
		var tagIcons = [];
		// icons are bottom right aligned
		if (this.showIcons) {
			for (var i=0;i<this.iconFieldLabelPairs.length;i++) {
				if (this.tagData[dataIndex][this.iconFieldLabelPairs[i].Field] == this.iconFieldLabelPairs[i].FieldValue) {
					iconCount++;
					tagIcons[iconCount-1]= new Konva.Image({
						image: this.iconFieldLabelPairs[i].Image,
						x: this.tagWidth - (iconCount * (this.iconSize + this.tagBorderThickness + 1)),
						y: this.tagHeight - (this.iconSize + this.tagBorderThickness + 1),
						width: this.iconSize,
						height: this.iconSize
					});
					tag.add(tagIcons[iconCount-1]);
				}
			}
		}

		// Small Label
		if (this.tagSmallLabelField != "" && this.tagSmallLabelField != null) {
			var smallLabelText = "";
			if (this.tagData[dataIndex][this.tagSmallLabelField] != null) {
				smallLabelText = this.tagData[dataIndex][this.tagSmallLabelField];
			}
			var smalllabelY = 0;
			if (this.tagSmallLabelFloat == "top") {
				smalllabelY = 1 + this.tagBorderThickness;
			} else if (this.tagSmallLabelFloat == "middle") {
				smalllabelY = Math.floor((this.tagHeight - this.tagSmallLabelFontSize) / 2);
			} else if (this.tagSmallLabelFloat == "bottom") {
				smalllabelY = this.tagHeight - this.tagSmallLabelFontSize - this.tagBorderThickness - 1;
			}
			var tagSmallLabel = new Konva.Text({
				x: 0,
				y: smalllabelY,
				text: smallLabelText,
				fontSize: this.tagSmallLabelFontSize,
				fontFamily: this.tagSmallLabelFont,
				fill: this.tagSmallLabelFontColor,
				shadowColor: this.tagSmallLabelShadowColor,
				shadowEnabled: this.tagSmallLabelShadowOn,
				shadowBlur: 0,
				shadowOffset: {x : 1, y : 1},
				shadowOpacity: 1,
				width: this.tagWidth,
				padding: 0,
				align: 'center'
			});
			tag.add(tagSmallLabel);
		}

		// Check Box
		if (this.tagCheckBoxField != "" && this.tagCheckBoxField != null) {

			var checkBoxX = 0;
			var checkBoxY = 0;
			if (this.tagCheckBoxFloat.match(/top/i) != null) {
				checkBoxY = 2 + this.tagBorderThickness;
			} else if (this.tagCheckBoxFloat.match(/middle/i) != null) {
				checkBoxY = Math.floor((this.tagHeight - this.tagCheckBoxSize) / 2);
			} else if (this.tagCheckBoxFloat.match(/bottom/i) != null) {
				checkBoxY = this.tagHeight - this.tagCheckBoxSize - this.tagBorderThickness - 1;
			}
			if (this.tagCheckBoxFloat.match(/left/i) != null) {
				checkBoxX = 2 + this.tagBorderThickness;
			} else if (this.tagCheckBoxFloat.match(/center/i) != null) {
				checkBoxX = Math.floor((this.tagWidth - this.tagCheckBoxSize) / 2);
			} else if (this.tagCheckBoxFloat.match(/right/i) != null) {
				checkBoxX = this.tagWidth - this.tagCheckBoxSize - this.tagBorderThickness - 2;
			}
			
			//Draw the check
			var tagCheckGroup = new Konva.Group({
				checkstatus: this.tagData[dataIndex][this.tagCheckBoxField],
				x: checkBoxX,
				y: checkBoxY,
				width: this.tagCheckBoxSize,
				height: this.tagCheckBoxSize,
				rotation: 0,
				draggable: false
			});
			
			var tagCheckBox = new Konva.Rect({
				x: 0,
				y: 0,
				stroke: this.tagCheckBoxColor,
				strokeWidth: Math.max(1,Math.floor(this.tagCheckBoxSize / 5)),
				fill: this.tagCheckBoxFillColor,
				width: this.tagCheckBoxSize,
				height: this.tagCheckBoxSize,
				lineCap: "round"
			});
				
			var tagCheck = new Konva.Line({
				points: [0, Math.floor(this.tagCheckBoxSize / 2), Math.floor(this.tagCheckBoxSize / 2), this.tagCheckBoxSize, this.tagCheckBoxSize, 0],
				stroke: this.tagCheckColor,
				strokeWidth: Math.max(1,Math.floor(this.tagCheckBoxSize / 3)),
				lineJoin: 'round',
				visible: this.tagData[dataIndex][this.tagCheckBoxField],
				id: 'tagCheck',
				name: 'tagCheck'
			});
			tagCheckGroup.add(tagCheckBox);
			tagCheckGroup.add(tagCheck);
			tagCheckGroup.on('click tap', function(event) {
				var tagCheckGrp = event.currentTarget;
				var checkStatus = tagCheckGrp.attrs.checkstatus;
				var myTag = tagCheckGroup.getParent();
				if (this.checkEditMode == true) {
					if (this.postEachGridEdit == true) {
						//this.checkBoxEditFunction(tag);
						var fields = new Object();
						fields[this.tagCheckBoxField] = checkStatus;
						var result = this.gridEditFunction(myTag,dd_gridActions.edit,null,fields);
						if (result == false) {
							//no change
							return;
						} else if (result == -1) {
							//do default
							checkStatus = !checkStatus;
							this.tagData[dataIndex][this.tagCheckBoxField] = checkStatus;
						} else if (result) {
							//update visuals only
							checkStatus = this.tagData[dataIndex][this.tagCheckBoxField];
						}
					} else {
						checkStatus = !checkStatus;
						this.tagData[dataIndex][this.tagCheckBoxField] = checkStatus;
					}
					tagCheckGrp.attrs.checkstatus = checkStatus;
					var check = tagCheckGrp.find('.tagCheck')[0];
					if (checkStatus) {
						check.hide();
					} else {
						check.show();
					}
					myTag.clearCache();
					this.tagLayer.draw();
				}
			}.bind(this));
			tag.add(tagCheckGroup);
		}
		
		// Hover Text
		if (this.tagHoverTextField != "" && this.tagHoverTextField != null) {
			var tagHoverText = "";
			if (this.tagData[dataIndex][this.tagHoverTextField] != null) {
				tagHoverText = this.tagData[dataIndex][this.tagHoverTextField];
			}
			var tagHoverSmallText = "";
			if (this.tagHoverSmallTextField != "" && this.tagHoverSmallTextField != null) {
				tagHoverSmallText = this.tagData[dataIndex][this.tagHoverSmallTextField];
			}

			var hoverLabelY = 0;
			if (this.tagHoverLabelFloat == "top") {
				hoverLabelY = 3 + this.tagBorderThickness;
			} else if (this.tagHoverLabelFloat == "middle") {
				hoverLabelY = Math.floor((this.tagHoverHeight - this.tagLabelFontSize) / 2);
			} else if (this.tagHoverLabelFloat == "bottom") {
				hoverLabelY = this.tagHoverHeight - this.tagLabelFontSize - this.tagBorderThickness - 1;
			}

			var smallHoverLabelY = 0;		
			if (this.tagHoverSmallLabelFloat == "top") {
				smallHoverLabelY = 1 + this.tagBorderThickness;
			} else if (this.tagHoverSmallLabelFloat == "middle") {
				smallHoverLabelY = Math.floor((this.tagHoverHeight - this.tagSmallLabelFontSize) / 2);
			} else if (this.tagHoverSmallLabelFloat == "bottom") {
				smallHoverLabelY = this.tagHoverHeight - this.tagSmallLabelFontSize - this.tagBorderThickness - 1;
			}

			if (tagHoverText != "") {
				var tagHoverGroup = new Konva.Group({
					x: 20,
					y: -20,
					width: this.tagWidth,
					height: this.tagHoverHeight,
					rotation: 0,
					visible: false
				});
				var tagHoverBack = new Konva.Rect({
					x: 0,
					y: 0,
					stroke: this.tagBorderColor,
					strokeWidth: this.tagBorderThickness,
					fill: this.tagHoverColor,
					width: this.tagWidth,
					height: this.tagHoverHeight,
					opacity: this.tagFillOpacity,
					cornerRadius:5,
					lineJoin: 'round'
				});
				var tagHoverLabel = new Konva.Text({
					x: 0,
					y: hoverLabelY,
					text: tagHoverText,
					fontSize: this.tagLabelFontSize,
					fontFamily: this.tagLabelFont,
					fill: this.tagLabelFontColor,
					shadowColor: this.tagLabelShadowColor,
					shadowEnabled: this.tagLabelShadowOn,
					shadowBlur: 0,
					shadowOffset: {x : 1, y : 1},
					shadowOpacity: 1,
					width: this.tagWidth,
					padding: 0,
					align: 'center'
				});
				var tagHoverSmallLabel = new Konva.Text({
					x: 0,
					y: smallHoverLabelY,
					text: tagHoverSmallText,
					fontSize: this.tagSmallLabelFontSize,
					fontFamily: this.tagSmallLabelFont,
					fill: this.tagSmallLabelFontColor,
					shadowColor: this.tagSmallLabelShadowColor,
					shadowEnabled: this.tagSmallLabelShadowOn,
					shadowBlur: 0,
					shadowOffset: {x : 1, y : 1},
					shadowOpacity: 1,
					width: this.tagWidth,
					padding: 0,
					align: 'center'
				});

				tagHoverGroup.add(tagHoverBack);
				tagHoverGroup.add(tagHoverLabel);
				tagHoverGroup.add(tagHoverSmallLabel);
				tag.add(tagHoverGroup);
				tag.on('mouseover', function(evt) {
					//start timer
					this.hoverTimer = setTimeout(function(){
						tagHoverGroup.show();
						evt.currentTarget.clearCache();
						evt.currentTarget.moveToTop();
						this.tagLayer.draw();
					},2000);
				}.bind(this));
				tag.on('mouseout', function(evt) {
					clearTimeout(this.hoverTimer);
					if (tagHoverGroup.isVisible()) {
						tagHoverGroup.hide();
						this.tagLayer.draw();
					}
				}.bind(this));
			}
		}
		
		// Status Dot
		if (this.showStatusDot) {
			var dotColor = 'lightblue';
			if (this.statusColorField !== "" && this.tagData[dataIndex][this.statusColorField] !== null && this.tagData[dataIndex][this.statusColorField] !== "") {
				dotColor = this.tagData[dataIndex][this.statusColorField];
			}
			var statusLabel = 'STATUS';
			if (this.statusPopupLabelField !== "" && this.tagData[dataIndex][this.statusPopupLabelField] !== null && this.tagData[dataIndex][this.statusPopupLabelField] !== "") {
				statusLabel = this.tagData[dataIndex][this.statusPopupLabelField];
			}
			var statusComment = '...';
			if (this.statusPopupCommentField !== "" && this.tagData[dataIndex][this.statusPopupCommentField] !== null && this.tagData[dataIndex][this.statusPopupCommentField] !== "") {
				statusComment = this.tagData[dataIndex][this.statusPopupCommentField];
			}
			var statusDot = new Konva.Circle({
				x: 9 + this.tagBorderThickness,
				y: 9 + this.tagBorderThickness,
				radius: 7,
				fill: dotColor,
				stroke: 'black',
				strokeWidth: 1
			});
			var statusHoverGroup = new Konva.Group({
				x: 0,
				y: 0,
				width: this.tagWidth,
				height: this.tagHoverHeight,
				rotation: 0,
				visible: false
			});
			var statusHoverBack = new Konva.Rect({
				x: 0,
				y: 0,
				stroke: dotColor,
				strokeWidth: this.tagBorderThickness,
				fill: this.tagHoverColor,
				width: this.tagWidth,
				height: this.tagHoverHeight,
				opacity:this. tagFillOpacity,
				cornerRadius:5
			});
			var statusHoverLabel = new Konva.Text({
				x: 0,
				y: this.tagBorderThickness + 2,
				text: statusLabel,
				fontSize: this.tagLabelFontSize,
				fontFamily: this.tagLabelFont,
				fill: dotColor,
				shadowColor: this.tagLabelShadowColor,
				shadowEnabled: this.tagLabelShadowOn,
				shadowBlur: 0,
				shadowOffset: {x : 1, y : 1},
				shadowOpacity: 1,
				width: this.tagWidth,
				padding: 0,
				align: 'center'
			});
			var statusHoverComment = new Konva.Text({
				x: 0,
				y: this.tagLabelFontSize + this.tagBorderThickness + 4,
				text: statusComment,
				fontSize: this.tagSmallLabelFontSize,
				fontFamily: this.tagSmallLabelFont,
				fill: this.tagSmallLabelFontColor,
				shadowColor: this.tagSmallLabelShadowColor,
				shadowEnabled: this.tagSmallLabelShadowOn,
				shadowOffsetX: 1,
				shadowOffsetY: 1,
				shadowBlur: 2,
				width: this.tagWidth,
				padding: 0,
				align: 'center'
			});

			statusHoverGroup.add(statusHoverBack);
			statusHoverGroup.add(statusHoverLabel);
			statusHoverGroup.add(statusHoverComment);
			tag.add(statusHoverGroup);
			tag.add(statusDot);
		
			statusDot.on('mouseover', function() {
				//start timer
				clearTimeout(this.hoverTimer);
				this.statusHoverTimer = setTimeout(function(){
					statusHoverGroup.show();
					tag.clearCache();
					tag.moveToTop();
					this.tagLayer.draw();
				},1000);
			}.bind(this));
			statusDot.on('mouseout', function() {
				clearTimeout(this.statusHoverTimer);
				if (statusHoverGroup.isVisible()) {
					statusHoverGroup.hide();
					this.tagLayer.draw();
				}
			}.bind(this));
		}
		tag.on('mousedown', function(event) {
			clearTimeout(this.hoverTimer);
			if (event.evt.which != 1) {
				this.closeEditFunction();
				if (this.gridEditMode == true && this.tagEditMenu !== null) {
					//this.tagEditFunction(event.evt.pageX,event.evt.pageY,dataIndex,tag);
					this.tagEditMenu(this.stage.getPointerPosition().x,this.stage.getPointerPosition().y,dataIndex,tag); 
				} else {
					if (this.tagReadOnlyContextMenu !== null) {
						this.tagReadOnlyContextMenu(this.stage.getPointerPosition().x,this.stage.getPointerPosition().y,dataIndex,tag);
					}
				}
			} else {
				//closeEditFunction();
				this.closeEditFunction();
				//this.closeEditFunction(); errors
			}
			if (this.gridEditMode == false) {
				return;
			}
			if (event.shiftKey==1) {
				this.shiftSelectTag(this);
			} else {
				this.shiftUnselect();
			}
			if (event.ctrlKey==1) {
				tag.attrs.copymode = true;
			} else {
				tag.attrs.copymode = false;
			}
			event.currentTarget.moveToTop();
			group.tagObjects.moveToTop();
		}.bind(this));	
		
		tag.on('touchstart', function(event) {
			event.currentTarget.moveToTop();
			group.tagObjects.moveToTop();
		}.bind(this));	
		tag.on('dragstart', function (event) {
			if (this.gridDraggable) {
				event.currentTarget.stopDrag();
				this.tagLayer.startDrag();
			} else {
				this.gridDragging = true;
				this.draggedTag = event.currentTarget;
			}
		}.bind(this));
		tag.on('dragend', function (tag) {
			if (this.gridDraggable) {
				/*tag.tween = new Konva.Tween({
					node: tag,
					x: parseInt(tag.attrs.home_x),
					y: parseInt(tag.attrs.home_y),
					easing: Konva.Easings.EaseIn,
					duration: 0.5
				});
				tag.tween.play();*/
			} else {
				this.gridDragging = false;
				this.handleTagDrop(tag,dataIndex,groupIndex,posX,posY)
			}
		}.bind(this));
		group.tagObjects.add(tag);
		
		//tag.cache({width: tagWidth, height: tagHeight});
		tag.cache();
		//tagLayer.add(tag);
		if (snapTo) {
			posX = group.left + tagOffsetX;
			posY = group.top + tagOffsetY
			group.tagObjects.moveToTop();
			tag.tween = new Konva.Tween({
				node: tag,
				x: posX,
				y: posY,
				easing: Konva.Easings.EaseIn,
				duration: 1
			});
			tag.tween.play();
			setTimeout(function () {this.redrawGrid();}.bind(this),1);
		}
		
	}	
	
	
	shiftSelectTag(tag) {
	
	}

	shiftUnselect() {

	}

	getTargetIndex(groupIndex,centerx,centery,tag) {

		var group = this.groups[groupIndex];
		var fromx = tag.attrs.home_x + Math.floor(this.tagWidth / 2);
		var fromy = tag.attrs.home_y + Math.floor(this.tagHeight / 2);
		var fromposition = tag.attrs.group_position;

		// look at each tag in the group and check center vs. center
		var kids = group.tagObjects.getChildren();
		var closestTag = null;
		var lowestTag = null;
		var lowestTagX = 0;
		var lowestTagY = 0;
		for (var i=0;i<kids.length;i++) {
			var posX = kids[i].attrs.home_x + Math.floor(this.tagWidth / 2);
			var posY = kids[i].attrs.home_y + Math.floor(this.tagHeight / 2);
			//if center points within one tag of eachother
			if ((group.tagsWide == 1) || (Math.abs(posX - centerx) < this.tagWidth)) {
				if ((group.tagsHigh == 1) || (Math.abs(posY - centery) < this.tagHeight)) {
					closestTag = kids[i];
					break;
				}
			}
			if (posY > lowestTagY) {
				lowestTagX = posX;
				lowestTagY = posY;
				lowestTag = kids[i];
			} else if (posY == lowestTagY && posX > lowestTagX) {
				lowestTagX = posX;
				lowestTagY = posY;
				lowestTag = kids[i];				
			}
		}
		//if no closest but tag dropped below lowest tag
		if ((kids.length > 0) && (closestTag === null)) {
			if (lowestTagY + Math.floor(this.tagHeight / 2) < centery) {
				closestTag = lowestTag;
			}
		}
		
		if (closestTag != null) {
			//default to the closest tag's position
			var targetPosition = closestTag.attrs.group_position;

			if (fromposition < targetPosition) {
				targetPosition = Math.max(targetPosition - 1,0);
			}
			// if group is single columnm, focus on Y
			if (group.tagsWide == 1) {
				if (centery <= posY) {
					return targetPosition;
				} else {
					return targetPosition + 1;			
				}
			}
			// if group is single row, focus on X
			if (group.tagsHigh == 1) {
				if (centerx <= posX) {
					return targetPosition;
				} else {
					return targetPosition + 1;			
				}		
			}
			// else fuzzy logic to read intent
			// if moved within the same column, ignore the X
			if (Math.abs(centerx - fromx) <= (tagWidth / 2)) {

				if (centery <= posY) {
					return targetPosition;
				} else {
					return targetPosition + 1;			
				}			
			}
			// if moved with the same row
			if (Math.abs(centery - fromy) <= (tagHeight / 2)) {
				if (centerx <= posX) {
					return targetPosition;
				} else {
					return targetPosition + 1;			
				}			
			}
			return targetPosition;

		} else {
			return false;
		}
			
	}
		
	handleTagDrop(tagObject,dataIndex,groupIndex,posX,posY) {
		//var self = tag;
		var tag = tagObject.currentTarget;
		var x = tag.getX();
		var y = tag.getY();
		var centerx = tag.getX() + Math.floor(tag.getWidth() / 2);
		var centery = tag.getY() + Math.floor(tag.getHeight() / 2);
		var xx = parseInt(tag.attrs.home_x);
		var yy = parseInt(tag.attrs.home_y);
		var gHit = this.groupHit(centerx,centery);
		var targetIndex = -1;
		var index = this.groups[groupIndex].tags.indexOf(dataIndex);
			
		if (gHit == groupIndex) {
			//targetIndex = getTargetIndex(groupIndex,centerx,centery,index);
			targetIndex = this.getTargetIndex(groupIndex,centerx,centery,tag);
			if ((targetIndex != index) && (targetIndex > -1)) {
				this.groups[groupIndex].tags.splice(index, 1); //remove
				this.groups[groupIndex].tags.splice(targetIndex, 0, dataIndex); // insert
				this.rearrangeTags(groupIndex);
			} else {
				tag.tween = new Konva.Tween({
					node: tag,
					x: xx,
					y: yy,
					easing: Konva.Easings.EaseIn,
					duration: 0.5
				});
				tag.tween.play();
			}
		} else if (gHit == -1) {
			if (this.gridDeleteOnDragOff == true) {
				this.deleteTag(tag);
			} else {
				tag.tween = new Konva.Tween({
					node: tag,
					x: xx,
					y: yy,
					easing: Konva.Easings.EaseIn,
					duration: 1
				});
				tag.tween.play();
			}
		} else {
			this.removeTag(tag,groupIndex,dataIndex,false);
			this.addTag(gHit,this.groups[gHit].tags.length,dataIndex,false,x,y);
		}
	}

	deleteTag(tag) {
		var groupIndex = tag.attrs.home_group;
		var dataIndex = tag.attrs.id;
		if (this.postEachGridEdit) {
			var result = this.gridEditFunction(tag,dd_gridActions.delete,groupIndex,null);
			if (result == false) {
				//no change
				return;
			} else if (result == -1) {
				//do default
				this.removeTag(tag,groupIndex,dataIndex,true);
				this.tagLayer.draw();
			} else if (result) {
				//visuals only
				this.removeTag(tag,groupIndex,dataIndex,false);
				this.tagLayer.draw();
			}
		} else {
			this.removeTag(tag,groupIndex,dataIndex,true);
			this.tagLayer.draw();
		}
		if (this.showLegendCount) {
			this.updateLegendCount(null,tag.attrs.legendColorIndex);
		}
		if (this.showGroupTotals) {
			setTimeout(function () {this.redrawGrid();},1);
		}
	}

	deleteColumn(columnValue) {
		var c = this.columnValues.indexOf(columnValue);
		if (c == -1) {
			throw ("Column " + columnValue + " not found.");
			return;
		}
		if (this.postEachGridEdit) {
			var result = this.gridEditFunction(null,dd_gridActions.deleteColumn,c,null);
			if (result == false) {
				//no change
				return;
			} else if (result == -1) {
				//do default
				this.columnValues.splice(c,1);
				this.columnLabels.splice(c,1);
				this.cLabels[c].destroy();
				this.cLabels.splice(c,1);
				this.gridColumns--;
				for (var g=this.groups.length-1;g>=0;g--) {
					if (this.groups[g].colValue == columnValue) {
						this.groups[g].renderObject.destroy();
						this.groups[g].tagObjects.destroy();
						this.groups.splice(g,1);
					}
				}
				this.refreshGrid();
			} else if (result) {
				//redraw grid only
				this.refreshGrid();
				return;
			}
		} else {
			this.columnValues.splice(c,1);
			this.columnLabels.splice(c,1);
			this.cLabels[c].destroy();
			this.cLabels.splice(c,1);
			this.gridColumns--;
			for (var g=this.groups.length-1;g>=0;g--) {
				if (this.groups[g].colValue == columnValue) {
					this.groups[g].renderObject.destroy();
					this.groups[g].tagObjects.destroy();
					this.groups.splice(g,1);
				}
			}
			this.refreshGrid();		
		}
	}

	deleteRow(rowValue) {
		var r = this.rowValues.indexOf(rowValue);
		if (r == -1) {
			alert("Row " + rowValue + " not found.");
			return;
		}
		if (this.postEachGridEdit) {
			var result = this.gridEditFunction(tag,dd_gridActions.deleteRow,r,null);
			if (result == false) {
				//no change
				return;
			} else if (result == -1) {
				//do default
				this.rowValues.splice(r,1);
				this.rowLabels.splice(r,1);
				this.gridRows--;
				for (var g=this.groups.length-1;g>0;g--) {
					if (this.groups[g].rowValue == rowValue) {
						this.groups[g].renderObject.destroy();
						this.groups[g].tagObjects.destroy();
						this.groups.splice(g,1);
					}
				}
				this.refreshGrid();
			} else if (result) {
				//update grid only
				this.refreshGrid();
			}
		} else {
			this.rowValues.splice(r,1);
			this.rowLabels.splice(r,1);
			this.gridRows--;
			for (var g=this.groups.length-1;g>0;g--) {
				if (this.groups[g].rowValue == rowValue) {
					this.groups[g].renderObject.destroy();
					this.groups[g].tagObjects.destroy();
					this.groups.splice(g,1);
				}
			}
			this.refreshGrid();
		}
	}

	removeTag(tag,groupIndex,dataIndex,updateData) {	
		var index = this.groups[groupIndex].tags.indexOf(dataIndex);
		this.groups[groupIndex].tags.splice(index, 1);
		tag.destroy();
		if (updateData) {
			this.tagData[dataIndex][this.columnField] = "";
			this.tagData[dataIndex][this.rowField] = "";
			if (this.getTagColorFromLegend) {
				this.tagData[dataIndex][this.tagColorField] = "";
			}
		}
		this.rearrangeTags(groupIndex);
	}

	removeTagsFromGroup(groupIndex,updateData) {
		if (updateData) {
			for (var t = 0; t < this.groups[groupIndex].tags.length; t++) {
				this.tagData[this.groups[groupIndex].tags[t]][this.columnField] = "";
				this.tagData[this.groups[groupIndex].tags[t]][this.rowField] = "";
				if (this.getTagColorFromLegend) {
					this.tagData[this.groups[groupIndex].tags[t]][this.tagColorField] = "";
				}
			}
		}
		this.groups[groupIndex].tags.splice(0,this.groups[groupIndex].tags.length);
		this.groups[groupIndex].tagObjects.destroy();
		this.tagLayer.draw();
	}

	rearrangeTags(groupIndex) {	
		var group = this.groups[groupIndex];
		var kids = group.tagObjects.getChildren();
		for (var j=0;j<group.tags.length;j++) {
			for (var i=0;i<kids.length;i++) {
				if (parseInt(kids[i].attrs.id) == group.tags[j]) {
					var posX = group.left + this.tagBuffer + ((j % group.tagsWide) * (this.tagBuffer + this.tagWidth));
					if (this.showGroupLabels) {
						var posY = Math.floor(this.groupLabelFontSize * 1.5) + group.top + this.tagBuffer + (Math.floor(j / group.tagsWide) * (this.tagBuffer + this.tagHeight));
					} else {
						var posY = group.top + this.tagBuffer + (Math.floor(j / group.tagsWide) * (this.tagBuffer + this.tagHeight));				
					}
					kids[i].attrs.home_x = posX;
					kids[i].attrs.home_y = posY;
					kids[i].attrs.group_position = j;
					kids[i].tween = new Konva.Tween({
						node: kids[i],
						x: posX,
						y: posY,
						easing: Konva.Easings.EaseIn,
						duration: 1
						})
					kids[i].tween.play();
					break;
				}
			}
		}
	}

}