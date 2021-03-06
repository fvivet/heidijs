(function()	{
	//---Class Definition---//
	Ext.define("Heidi.tab.Table", {
		extend:"Ext.panel.Panel",
		
		title:"Table",
		iconCls:"icon-tab-table",
		layout:"border",
		
		initComponent:function()	{
			//---Set Docked Items---//
			this.dockedItems = [
				{
					xtype:"toolbar",
					dock:"top",
					items:[
						{
							text:"Save",
							iconCls:"icon-tab-table-save",
							handler:function()	{
debugger;
							}
						},
						{
							text:"Discard",
							iconCls:"icon-tab-table-close",
							handler:function()	{
debugger;
							}
						}
					]
				}
			];
		
		
			//---Call Parent---//
			this.callParent(arguments);
			
			
			//---Constants---//;
			var TABLE_GRID_MODEL_NAME = "TableGridModelName",
				TABLE_INDEXES_GRID_MODEL_NAME = "TableIndexesGridModelName",
				TABLE_FOREIGN_KEYS_GRID_MODEL_NAME = "TableForeignKeysGridModelName",
				TABLE_EDITOR_DATATYPE_COMBO_MODEL_NAME = "TableEditorDatatypeComboModelName",
				TABLE_EDITOR_BASE_CLS = "tab-table-data-type-";
			
			
			//---Column Variables---//
			function isNumberDataType(inRecord)	{
				var dataType = inRecord.get("data_type");
				
				return (dataType.indexOf("INT") != -1 || dataType == "FLOAT" || dataType == "DOUBLE" || dataType == "DECIMAL");
			};
			
			var numberColumnApplies = {
				renderer:function(inValue, inMeta, inRecord)	{
					if(!isNumberDataType(inRecord))	{
						return "";
					}
					
					return Ext.ux.CheckColumn.prototype.renderer.apply(this, arguments);
				},
				listeners:{
					checkchange:function(inColumn, inRecordIndex, inChecked, inRecord)	{
						if(inChecked && !isNumberDataType(inRecord))	{
							inRecord.set(this.dataIndex, 0);
						}
					}
				}
			};
			
			
			//---Create Basic Form---//
			this.basicForm = Ext.create("Ext.form.Panel",	{
				title:"Basic",
				iconCls:"icon-tab-table-basic-form",
				cls:"tab-table-body",
				layout:"fit",
				items:[
					{
						xtype:"container",
						
						layout:"border",
						cls:"tab-table-body-border-container",
						border:false,
						
						defaults:{
							xtype:"container",
							border:false,
							layout:"fit",
							defaults:{
								anchor:"100%",
								border:false
							}
						},
						items:[
							{
								region:"north",
								height:25,
								items:[
									{
										xtype:"textfield",
										name:"name",
										fieldLabel:"Name"
									}
								]
							},
							{
								region:"center",
								layout:"fit",
								items:[
									{
										xtype:"textarea",
										name:"comments",
										fieldLabel:"Comments"
									}
								]
							}
						]
					}
				]
			});
			
			
			//---Create Tab Panel---//
			this.add({
				xtype:"tabpanel",
				
				title:"Table Editor",
				region:"north",
				resizable:true,
				collapsible:true,
				height:150,
				minHeight:125,
				
				items:[
					this.basicForm
				]
			});
			
			
			//---Create Grid---//
			if(!Ext.ModelManager.getModel(TABLE_GRID_MODEL_NAME))	{
				Ext.define(TABLE_GRID_MODEL_NAME, {
					extend:"Ext.data.Model",
					fields:[
						"primary_key",
						"field_name",
						"data_type",
						"length",
						"unsigned",
						"allow_null",
						"zerofill",
						"default"
					]
				});
			}
			
			if(!Ext.ModelManager.getModel(TABLE_EDITOR_DATATYPE_COMBO_MODEL_NAME))	{
				Ext.define(TABLE_EDITOR_DATATYPE_COMBO_MODEL_NAME, {
					extend:"Ext.data.Model",
					fields:[
						"display",
						"selectable",
						"cls",
						"qtip"
					]
				});
			}
			
			var gridPanel = this.gridPanel = this.add({
				xtype:"gridpanel",
				
				region:"center",
				store:{
					model:TABLE_GRID_MODEL_NAME
				},
				columns:[
					{
						text:"#",
						width:4,
						cls:"tab-table-basic-number-column",
						renderer:function(inValue, inMeta, inRecord, inRowIndex, inColumnIndex)	{
							inMeta.tdCls = "tab-table-basic-number-column-cell";
							inValue = inRowIndex + 1;
							
							return tableEditorGenericColumnRenderer(inValue, inMeta, inRecord, inRowIndex, inColumnIndex);
						}
					},
					{
						text:"Name",
						dataIndex:"field_name",
						width:21,
						renderer:tableEditorGenericColumnRenderer,
						editor:{
							xtype:"textfield",
							allowBlank:false
						}
					},
					{
						text:"Data Type",
						dataIndex:"data_type",
						width:18,
						renderer:tableEditorGenericColumnRenderer,
						editor:{
							xtype:"combo",
							store:{
								proxy:{
									type:"memory",
									reader:{
										type:"json"
									}
								},
								model:TABLE_EDITOR_DATATYPE_COMBO_MODEL_NAME,
								data:[
									{
										display:"Integer",
										selectable:false,
										cls:TABLE_EDITOR_BASE_CLS + "category"
									},
									{
										display:"TINYINT",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "integer",
										qtip:"Storage: 1B<br><br>Signed: -128 to 127<br>Unsigned: 0 to 255"
									},
									{
										display:"SMALLINT",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "integer",
										qtip:"Storage: 2B<br><br>Signed: -32,768 to 32,767<br>Unsigned: 0 to 65,535"
									},
									{
										display:"MEDIUMINT",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "integer",
										qtip:"Storage: 3B<br><br>Signed: -8,388,608 to 8,388,607<br>Unsigned: 0 to 16,777,215"
									},
									{
										display:"INT",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "integer",
										qtip:"Storage: 4B<br><br>Signed: -2,147,483,648 to 2,147,483,647<br>Unsigned: 0 to 4,294,967,295"
									},
									{
										display:"BIGINT",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "integer",
										qtip:"Storage: 8B<br><br>Signed: -9,223,372,036,843,774,808 to 9,233,372,036,843,744,807<br>Unsigned: 0 to 18,446,744,073,709,551,615"
									},
									{
										display:"Integer, named (nonstandard)",
										selectable:false,
										cls:TABLE_EDITOR_BASE_CLS + "category"
									},
									{
										display:"ENUM",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "integer-named"
									},
									{
										display:"Real",
										selectable:false,
										cls:TABLE_EDITOR_BASE_CLS + "category"
									},
									{
										display:"FLOAT",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "real",
										qtip:"Length: M, D<br>M: total number of digits<br>D: number of digits follow the decimal"
									},
									{
										display:"DOUBLE",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "real",
										qtip:"Length: M, D<br>M: total number of digits<br>D: number of digits follow the decimal"
									},
									{
										display:"DECIMAL",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "real",
										qtip:"Length: M, D<br>M: total number of digits<br>D: number of digits follow the decimal"
									},
									{
										display:"Text",
										selectable:false,
										cls:TABLE_EDITOR_BASE_CLS + "category"
									},
									{
										display:"CHAR",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "char",
										qtip:"Fixed length string with right-padded spaces.<br>Max length: 255 characters"
									},
									{
										display:"VARCHAR",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "char",
										qtip:"Variable length string.<br>Max length: 255 characters"
									},
									{
										display:"TINYTEXT",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "char",
										qtip:"Max length: 255 characters"
									},
									{
										display:"TEXT",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "char",
										qtip:"Max length: 65,535 characters"
									},
									{
										display:"MEDIUMTEXT",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "char",
										qtip:"Max length: 16,777,215 characters"
									},
									{
										display:"LONGTEXT",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "char",
										qtip:"Max length: 4,294,967,295 characters"
									},
									{
										display:"Binary",
										selectable:false,
										cls:TABLE_EDITOR_BASE_CLS + "category"
									},
									{
										display:"BINARY",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "binary"
									},
									{
										display:"VARBINARY",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "binary"
									},
									{
										display:"TINYBLOB",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "binary",
										qtip:"Max length: 255 bytes"
									},
									{
										display:"BLOB",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "binary",
										qtip:"Max length: 65,535 bytes"
									},
									{
										display:"MEDIUMBLOB",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "binary",
										qtip:"Max length: 16,777,215 bytes"
									},
									{
										display:"LONGBLOB",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "binary",
										qtip:"Max length: 4,294,967,295 bytes"
									},
									{
										display:"Temporal (time)",
										selectable:false,
										cls:TABLE_EDITOR_BASE_CLS + "category"
									},
									{
										display:"DATE",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "temporal",
										qtip:"Format: YYYY-MM-DD<br><br>Minimum: 1000-01-01<br>Maximum: 9999-12-31"
									},
									{
										display:"TIME",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "temporal",
										qtip:"Format: HH:MM:SS<br><br>Minimum: -838:59:59<br>Maximum: 838:59:59"
									},
									{
										display:"YEAR",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "temporal",
										qtip:"Formats: two or four digits<br><br>Two digit range: 70 to 69<br>Four digit range: 1970 to 2069"
									},
									{
										display:"DATETIME",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "temporal",
										qtip:"Format: YYYY-MM-DD HH:MM:SS<br><br>Minimum: 1000-01-01 00:00:00<br>Maximum: 9999-12-31 23:59:59"
									},
									{
										display:"TIMESTAMP",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "temporal",
										qtip:"Format: YYYY-MM-DD HH:MM:SS<br><br>Minimum: 1970-01-01 00:00:01<br>Maximum: 2038-01-19 03:14:07"
									},
									{
										display:"Spatial (gemoetry)",
										selectable:false,
										cls:TABLE_EDITOR_BASE_CLS + "category"
									},
									{
										display:"POINT",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "spatial"
									},
									{
										display:"LINESTRING",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "spatial"
									},
									{
										display:"POLYGON",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "spatial"
									},
									{
										display:"GEOMETRY",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "spatial"
									},
									{
										display:"MULTIPOINT",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "spatial"
									},
									{
										display:"MULTILINESTRING",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "spatial"
									},
									{
										display:"MULTIPOLYGON",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "spatial"
									},
									{
										display:"GEOMETRYCOLLECTION",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "spatial"
									},
									{
										display:"Set of Bits (nonstandard)",
										selectable:false,
										cls:TABLE_EDITOR_BASE_CLS + "category"
									},
									{
										display:"BIT",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "set-of-bits"
									},
									{
										display:"Set of Bits, named (nonstandard)",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "category"
									},
									{
										display:"SET",
										selectable:true,
										cls:TABLE_EDITOR_BASE_CLS + "set-of-bits-named"
									}
								]
							},
							valueField:"display",
							displayField:"display",
							typeAhead:true,
							forceSelection:true,
							listConfig:{
								cls:TABLE_EDITOR_BASE_CLS + "list",
								minWidth:125,
								tpl:Ext.create('Ext.XTemplate',
									'<ul><tpl for=".">',
										'<li role="option" class="' + Ext.view.BoundList.prototype.itemCls + ' ' + TABLE_EDITOR_BASE_CLS + 'list-field {cls}" {[values.qtip ? "data-qtip=" + Ext.encode(values.qtip) : ""]}>{display}</li>',
									'</tpl></ul>'
								)
							},
							listeners:{
								beforeselect:function(inCombo, inRecord)	{
									return inRecord.get("selectable");
								}
							}
						}
					},
					{
						text:"Length",
						dataIndex:"length",
						width:12.5,
						renderer:tableEditorGenericColumnRenderer,
						beforeEdit:function(inRecord)	{
							return (inRecord.get("data_type").indexOf("TEXT") == -1);
						},
						editor:{
							xtype:"numberfield",
							allowBlank:true,
							minValue:0,
							allowDecimals:false
						}
					},
					Ext.apply({
						xtype:"checkcolumn",
						text:"Unsigned",
						dataIndex:"unsigned",
						width:12.5
					}, numberColumnApplies),
					{
						xtype:"checkcolumn",
						text:"Allow Null",
						dataIndex:"allow_null",
						width:12.5
					},
					Ext.apply({
						xtype:"checkcolumn",
						text:"Zerofill",
						dataIndex:"zerofill",
						width:12.5
					}, numberColumnApplies),
					{
						text:"Default",
						dataIndex:"default",
						width:12.5,
						renderer:function(inValue, inMeta, inRecord)	{
							var tdCls = "",
								val = (inValue + "").toUpperCase();
						
							switch(val)	{
								case "AUTO_INCREMENT":
									tdCls = "tab-table-editor-default-auto-increment";
									break;
								case "NULL":
								case null:
									if(!inRecord.get("allow_null"))	{
										tdCls = "tab-table-editor-default-no-default";
										val = "No default value";
										break;
									}
								case "CURRENT_TIMESTAMP":
								case "ON UPDATE CURRENT_TIMESTAMP":
									tdCls = "tab-table-editor-default-null-current-timestamp";
									break;
								default:
									tdCls = "tab-table-editor-default-custom-value";
									
									if(inRecord.get("data_type").indexOf("CHAR") != -1)	{
										val = "'" + val + "'";
									}
									break;
							}
							
							inMeta.tdCls += (inMeta.tdCls || "") + " " + tdCls;
							
							return val;
						},
						cellSelected:function(inRecord, inEvent)	{
							if(inRecord.preventCellSelected)	{
								return false;
							}
							
							inRecord.preventCellSelected = true;
						
							var currentValue = inRecord.get("default"),
								dataType = inRecord.get("data_type"),
								dataTypeIsInt = (dataType.indexOf("INT") != -1),
								dataTypeIsTimestamp = (dataType == "TIMESTAMP"),
								dataTypeIsBlobOrText = (dataType.indexOf("BLOB") != -1 || dataType.indexOf("TEXT") != -1),
								allowNull = inRecord.get("allow_null"),
								isDefaultValue = (currentValue === null),
								isNullValue = (currentValue == "null" && allowNull),
								isCurrentTimestampValue = (currentValue.indexOf("CURRENT_TIMESTAMP") != -1),
								isCurrentTimestampOnUpdateValue = (isCurrentTimestampValue && currentValue.indexOf("ON UPDATE CURRENT_TIMESTAMP")),
								isAutoIncrementValue = (currentValue == "auto_increment"),
								isCustomValue = !isDefaultValue && !isNullValue && !isCurrentTimestampValue && !isAutoIncrementValue,
								menuItems = [],
								separator = false;
							
							menuItems.push({
								text:"No default value",
								checked:isDefaultValue,
								updateRecord:function()	{
									inRecord.set("default", null);
								}
							});
							separator = true;
							
							if(!dataTypeIsBlobOrText)	{
								if(separator)	{
									menuItems.push({
										xtype:"menuseparator"
									});
								}
								separator = true;
								
								menuItems.push({
									text:"Custom",
									checked:isCustomValue,
									checkChanged:function(inChecked)	{
										this.nextSibling()[inChecked ? "show" : "hide"]();
									},
									updateRecord:function()	{
										inRecord.set("default", this.nextSibling().getValue());
									}
								});
								menuItems.push({
									xtype:"textarea",
									name:"custom",
									anchor:"100%",
									height:75,
									hidden:true,
									value:(isCustomValue ? currentValue : "")
								});
							}
							
							if(allowNull || dataTypeIsTimestamp)	{
								if(separator)	{
									menuItems.push({
										xtype:"menuseparator"
									});
								}
								separator = true;
								
								if(allowNull)	{
									menuItems.push({
										text:"NULL",
										checked:isNullValue,
										updateRecord:function()	{
											inRecord.set("default", null);
										}
									});
								}
								if(dataTypeIsTimestamp)	{
									menuItems.push({
										text:"CURRENT_TIMESTAMP",
										checked:isCurrentTimestampValue,
										checkChanged:function(inChecked)	{
											this.nextSibling()[inChecked ? "show" : "hide"]();
										},
										updateRecord:function()	{
											inRecord.set("default", (this.nextSibling().checked ? "ON UPDATE " : "") + "CURRENT_TIMESTAMP");
										}
									});
									menuItems.push({
										group:"tabTableEditorDefaultColumnMenuUnique",
										text:"On Update CURRENT_TIMESTAMP",
										name:"onUpdateCurrentTimestamp",
										checked:isCurrentTimestampOnUpdateValue,
										hidden:!isCurrentTimestampValue
									});
								}
							}
							
							if(dataTypeIsInt)	{
								if(separator)	{
									menuItems.push({
										xtype:"menuseparator"
									});
								}
								separator = true;
								
								menuItems.push({
									text:"AUTO_INCREMENT",
									checked:isAutoIncrementValue,
									updateRecord:function()	{
										inRecord.set("default", "auto_increment");
									}
								});
							}
							
								
							var newMenu = Ext.create("Ext.menu.Menu", {
								defaults:{
									xtype:"menucheckitem",
									group:"tabTableEditorDefaultColumnMenu",
									hideOnClick:false,
									listeners:{
										checkchange:function(inItem, inChecked, inOptions)	{
											if(!inItem.checkChanged)	{
												return false;
											}
											
											inItem.checkChanged(inChecked);
										}
									}
								},
								items:menuItems,
								dockedItems:[
									{
										xtype:"toolbar",
										dock:"bottom",
										defaults:{
											xtype:"button"
										},
										items:[
											{
												text:"OK",
												handler:function()	{
													var checkedMenuItem = newMenu.items.findBy(function(inMenuItem) { return inMenuItem.checked; });
													if(!checkedMenuItem)	{
														return Ext.MessageBox.alert("Error", "Please select at least one option.");
													}
													
													checkedMenuItem.updateRecord();
													newMenu.hide();
												}
											},
											{
												text:"Cancel",
												handler:function()	{
													newMenu.hide();
												}
											}
										]
									}
								],
								listeners:{
									hide:function()	{
										inRecord.preventCellSelected = false;
									}
								}
							});
							
							newMenu.showAt(inEvent.xy[0], inEvent.xy[1]);
						}
					}
				],
				forceFit:true,
				selModel:{
					selType:"cellmodel",
					listeners:{
						select:function(inCelModel, inRecord, inRow, inColumn)	{
							var column = inCelModel.view.headerCt.getComponent(inColumn);
							
							if(column.cellSelected && inCelModel.view.lastMouseDownEvent)	{
								column.cellSelected(inRecord, inCelModel.view.lastMouseDownEvent);
							}
						}
					}
				},
				plugins:[
					Ext.create("Ext.grid.plugin.CellEditing", {
						clicksToEdit:1,
						listeners:{
							beforeedit:function(inEditObject)	{
								return (typeof(inEditObject.column.beforeEdit) == "function" ? inEditObject.column.beforeEdit(inEditObject.record) : true);
							}
						}
					})
				],
				dockedItems:[
					{
						xtype:"toolbar",
						dock:"top",
						items:[
							{
								text:"Add",
								iconCls:"icon-tab-table-add",
								handler:function()	{
									gridPanel.store.add({});
									gridPanel.plugins[0].startEditByPosition({row:gridPanel.store.getCount() - 1, column:1});
								}
							},
							{
								text:"Remove",
								iconCls:"icon-tab-table-remove",
								handler:function()	{
									getSelectionAndExecute(function(inSelection)	{
										Ext.MessageBox.confirm("Confirm Remove", "Are you sure you want to remove the selected column?", function(inButton)	{
											if(inButton != "yes")	{
												return false;
											}
											
											gridPanel.store.remove(inSelection);
										});
									});
								}
							},
							{
								xtype:"tbseparator"
							},
							{
								text:"Up",
								iconCls:"icon-tab-table-up",
								handler:function()	{
									getSelectionAndExecute(function(inSelection)	{
										changeRecordPosition(inSelection, -1);
									});
								}
							},
							{
								text:"Down",
								iconCls:"icon-tab-table-down",
								handler:function()	{
									getSelectionAndExecute(function(inSelection)	{
										changeRecordPosition(inSelection, 1);
									});
								}
							},
							{
								xtype:"tbfill"
							},
							{
								text:"Help",
								iconCls:"icon-tab-table-help",
								handler:function()	{
debugger;
								}
							}
						]
					}
				]
			});
			
			
			//---Selection Functions---//
			function getSelectionAndExecute(inCallback)	{
				var currentPosition = gridPanel.getSelectionModel().getCurrentPosition(),
					record = (currentPosition && gridPanel.store.getAt(currentPosition.row));
				
				if(!record)	{
					return false;
				}
				
				inCallback(record);
			}
			
			function changeRecordPosition(inRecord, inIncrement)	{
				var recordIndex = gridPanel.store.indexOf(inRecord),
					newRecordIndex = recordIndex + inIncrement;
				
				if(newRecordIndex < 0 || newRecordIndex == gridPanel.store.getCount())	{
					return false;
				}
				
				var selectionModel = gridPanel.getSelectionModel(),
					currentPosition = selectionModel.getCurrentPosition();
				
				gridPanel.store.remove(inRecord);
				gridPanel.store.insert(newRecordIndex, inRecord);
				selectionModel.setCurrentPosition({row:newRecordIndex, column:currentPosition.column});
			}
		},
		
		syncWithTreeNode:function(inTreeNode)	{
			//---Variables---//
			var proxyInstance = inTreeNode.get("proxyInstance"),
				grid = this.gridPanel,
				formPanel = this.basicForm,
				database = inTreeNode.get("database"),
				table = inTreeNode.get("table");
				
				
			//---Sync Tab---//
			this.setTitle("Table: " + table);
			this.proxyInstance = proxyInstance;
			
			
			//---Update Table Editor Grid---//
			grid.store.setProxy(proxyInstance.getTableStructureProxyConfig());
			Ext.apply(grid.store.proxy.extraParams, {
				database:database,
				table:table
			});
			
			grid.store.load();
			
			
			//---Update Editor Tabs---//
			var form = formPanel.getForm();
			form.setValues({
				name:table
			});
			
			if(formPanel.el)	{
				formPanel.el.mask("Loading...");
			}
			
			var detailedTableStructureProxyInstance = proxyInstance.getDetailedTableStructureProxyInstance();
			detailedTableStructureProxyInstance.load({
				params:{
					database:database,
					table:table
				},
				callback:function(inData)	{
					if(formPanel.el)	{
						formPanel.el.unmask();
					}
					
					form.setValues(inData);
				}
			});
		}
	});
	
	
	//---Renderers---//
	function tableEditorGenericColumnRenderer(inValue, inMeta, inRecord, inRowIndex, inColumnIndex, inStore, inView)	{
		var tdCls = "",
			tdAttr = "";
	
		if(inView)	{
			var column = inView.headerCt.getComponent(inColumnIndex),
				editor = column.getEditor();
			
			if(editor && editor.store && editor.displayField && editor.valueField)	{
				var editorRecordIndex = editor.store.findBy(function(inEditorRecord) { return inEditorRecord.get(editor.valueField) == inValue; });
				
				if(editorRecordIndex != -1)	{
					var editorRecord = editor.store.getAt(editorRecordIndex),
						editorRecordCls = editorRecord.get("cls"),
						editorRecordQtip = editorRecord.get("qtip");
					
					if(editorRecordCls)	{
						tdCls += " " + editorRecordCls;
					}
					if(editorRecordQtip)	{
						tdAttr += " data-qtip=" + Ext.encode(editorRecordQtip);
					}
				}
			}
		}
	
		if(inRecord.get("primary_key"))	{
			tdCls += " tab-table-basic-primary-key-row-cell" + (inColumnIndex == 0 ? " tab-table-basic-primary-key-number-cell" : "")
		}
		
		if(tdCls)	{
			inMeta.tdCls = (inMeta.tdCls || "") + " " + tdCls;
		}
		if(tdAttr)	{
			inMeta.tdAttr = (inMeta.tdAttr || "") + " " + tdAttr;
		}
		
		return inValue;
	}
})();