/**
 * Collabora integration javascript
 *
 * @link http://www.egroupware.org
 * @author Nathan Gray
 * @package collabora
 * @copyright (c) 2017  Nathan Gray
 */
/*egw:uses
	/filemanager/js/app.js;
 */

/**
 * UI for filemanager
 *
 * @augments AppJS
 */
app.classes.filemanager = app.classes.filemanager.extend(
{

	discovery: {},

	/**
	 * Constructor
	 *
	 * @memberOf app.filemanager
	 */
	init: function()
	{
		this._super.apply(this, arguments);
	},

	/**
	 * This function is called when the etemplate2 object is loaded
	 * and ready.  If you must store a reference to the et2 object,
	 * make sure to clean it up in destroy().
	 *
	 * @param et2 etemplate2 Newly ready object
	 * @param {string} name template name
	 */
	et2_ready: function(et2,name)
	{
		// call parent
		this._super.apply(this, arguments);
	},

	/**
	 * Open a file in collabora
	 * @param {egwAction} action
	 * @param {egwActionObject[]} selected
	 */
	open: function open(action, selected)
	{
		var data = egw.dataGetUIDdata(selected[0].id);
		var mime = data.data.mime || '';
		var is_collabora = this.et2.getArrayMgr('content').getEntry('is_collabora');

		// Check to see if it's something we can handle
		if (is_collabora && this.isEditable(action, selected))
		{
			// Open the editor in a new window, still under our control
			window.open(egw.link('/index.php', {
				'menuaction': 'collabora.EGroupware\\collabora\\Ui.editor',
				'path': data.data.path
			}));
		}
		else
		{
			return this._super.apply(this, arguments);
		}
	},

	/**
	 * Check to see if the file is editable
	 *
	 * @param {egwAction} _egwAction
	 * @param {egwActionObject[]} _senders
	 * @returns {boolean} returns true if is editable otherwise false
	 */
	isEditable: function isEditable(_egwAction, _senders) {
		var data = egw.dataGetUIDdata(_senders[0].id);
		var mime = data.data.mime || '';
		if(data && mime && this.discovery && this.discovery[mime])
		{
			return ['edit'].indexOf(this.discovery[mime].name) !== -1;
		}
		else
		{
			return this._super.apply(this, arguments);
		}
	},

	/**
	 * Set the list of what the collabora server can handle.
	 *
	 * The list is indexed by mimetype
	 *
	 * @param {Object[]} settings
	 * @param {string} settings[].name The name of the action (edit)
	 * @param {string} settings[].ext File extension
	 * @param {string} settings[].urlsrc URL to edit the file.  It still needs
	 *	a WOPISrc parameter added though.
	 */
	set_discovery: function set_discovery(settings)
	{
		this.discovery = settings;
	},

	/**
	 * Build a dialog to get name and ext of new file
	 *
	 * @param {string} _type = document type of file, document is default
	 *  Types:
	 *		-document
	 *		-spreadsheet
	 *		-presentation
	 *		-mores
	 * @param {string} _openasnew path of file to be opened as new
	 */
	_dialog_create_new: function (_type, _openasnew)
	{
		var current_path = this.et2.getWidgetById('path').get_value();
		var extensions = {};
		var type = _type || 'document';
		var self = this;
		var ext_default = 'odt';
		var title = _openasnew ? egw.lang('Open as new') :
				egw.lang('Create new %1', type == 'more'? egw.lang('file'): type);
		switch (type)
		{
			case 'document':
				extensions = {odt:'(.odt) OpenDocument Text', docx: '(.docx) MS Word'}; break;
			case 'spreadsheet':
				extensions = {ods:'(.ods) OpenDocument spreadsheet', xls: '(.xls) MS Excel'}; break;
				ext_default = 'ods';
			case 'presentation':
				extensions = {odp:'(.odp) OpenDocument Presentation', ppt: '(.ppt) MS PowerPoint'}; break;
				ext_default = 'odp';
			case 'more':
				Object.entries(this.discovery).forEach(function(i){
					if (i[1].name == 'edit') extensions[i[1]['ext']] = '(.'+i[1]['ext']+') '+ i[0];
				});
				break;
		}
		et2_createWidget("dialog",
		{
			callback: function(_button_id, _val)
			{
				if (_button_id == 'create' && _val && _val.name != '')
				{
					self._request_createNew({
						name: _val.name,
						openasnew: _openasnew,
						ext: _openasnew ? _openasnew.split('.').pop(): _val.extension,
						dir: current_path
					});
				}
			},
			title: title,
			buttons: [
				{id:'create', text:egw.lang('Create'), image:'new', default: true},
				{id:'cancel', text:egw.lang('Cancel'), image:'close'}
			],
			minWidth: 300,
			minHeight: 200,
			value:{content:{extension:ext_default, openasnew:_openasnew}, 'sel_options':{extension:extensions}},
			template: egw.webserverUrl+'/collabora/templates/default/new.xet?1',
			resizable: false
		}, et2_dialog._create_parent('collabora'));
	},

	/**
	 * Method to request create new file or open as new file
	 * @param {object} data
	 *	data: {
	 *		name: //filename
	 *		ext: //file extension
	 *		dir: //directory
	 *		openasnew: //path of the file to be opened as new
	 *	}
	 */
	_request_createNew: function(data)
	{
		egw.json('EGroupware\\collabora\\Ui::ajax_createNew', [data.ext, data.dir, data.name, data.openasnew], function(_data){
			if (_data.path)
			{
				self.egw.refresh('', 'filemanager');
				window.open(egw.link('/index.php', {
					'menuaction': 'collabora.EGroupware\\collabora\\Ui.editor',
					'path': egw.encodePath(_data.path)
				}));
			}
			egw.message(_data.message);
		}).sendRequest(true);
	},

	/**
	 * Method to create a new document
	 *
	 * @param {object} _action either action or node
	 * @param {object} _selected either widget or selected row
	 *
	 * @return {boolean} returns true
	 *
	 * @TODO Implementing of create new type of the file for collabora
	 */
	create_new: function (_action, _selected) {
		var is_collabora = this.et2.getArrayMgr('content').getEntry('is_collabora');
		var type = (typeof _selected._type != 'undefined')? _selected.get_value(): _action.id;
		if (is_collabora)
		{
			if (_action.id == 'openasnew')
			{
				var data = egw.dataGetUIDdata(_selected[0].id);
			}
			this._dialog_create_new(type, data? data.data.path: undefined);
		}
		else
		{
			return this._super.apply(this, arguments);
		}
		return true;
	}
});

/**
 * UI for collabora stuff
 *
 * @augments AppJS
 */
app.classes.collabora = AppJS.extend(
{

	// Handy reference to iframe
	editor_iframe: null,

	// Flag for if we've customized & bound the editor
	loaded: false,

	/**
	 * Constructor
	 *
	 * @memberOf app.collabora
	 */
	init: function()
	{
		this._super.apply(this, arguments);

		// Filemanager has some handy utilites, but we need to be careful what
		// we use, since it's not actually available
		if(typeof app.filemanager === 'undefined')
		{
			app.filemanager = new app.classes.filemanager;
		}
	},

	/**
	 * This function is called when the etemplate2 object is loaded
	 * and ready.  If you must store a reference to the et2 object,
	 * make sure to clean it up in destroy().
	 *
	 * @param et2 etemplate2 Newly ready object
	 * @param {string} name template name
	 */
	et2_ready: function(et2,name)
	{
		// call parent
		this._super.apply(this, arguments);
		switch(name)
		{
			case 'collabora.editor':
				this.init_editor();
				break;
		}
	},

	/**
	 * Override the default to use the file name as title
	 */
	getWindowTitle: function getWindowTitle()
	{
		return egw.config('site_title','phpgwapi') + '[' +
				this.et2.getArrayMgr('content').getEntry('path', true) +
				']';
	},

	/**
	 * Initialize editor and post the form that starts it
	 *
	 * @see https://wopi.readthedocs.io/en/latest/hostpage.html
	 */
	init_editor: function init_editor(values)
	{
		// We allow additional calls and reset, since we're replacing the editor
		this.loaded = false;

		if(typeof values == 'undefined')
		{
			values = this.et2.getArrayMgr('content').data || {};
		}
		var form_html = `
		<form id="form" name="form" target="loleafletframe"
				action="${values['url']}" method="post">
			<input name="access_token" value="${values['token']}" type="hidden"/>
		</form>`;

		jQuery('body').append(form_html);

		var frameholder = jQuery('.editor_frame');
		var frame = '<iframe id="loleafletframe" name= "loleafletframe" allowfullscreen style="height:100%;position:absolute;"/>';

		jQuery('iframe',frameholder).remove();
		frameholder.append(frame);

		// Listen for messages
		window.addEventListener('message', jQuery.proxy(function(e){
			this._handle_messages(e);
		}, this));

		this.editor_iframe = jQuery('#loleafletframe')[0];
		jQuery(frame).on('load', function(){
			// Tell the iframe that we are ready now
			app.collabora.WOPIPostMessage('Host_PostmessageReady', {});
		});

		document.getElementById('form').submit();
	},

	/**
	 * Handle messages sent from the editor
	 *
	 * @see https://www.collaboraoffice.com/collabora-online-editor-api-reference/#loleaflet-postmessage-actions
	 *	for allowed actions
	 * @param Object e
	 * @param String e.MessageId
	 * @param Object e.Values Depends on the message, but always an object, if present
	 */
	_handle_messages: function(e)
	{
		var message = JSON.parse(e.data);

		if (message.MessageId == 'App_LoadingStatus' && message.Values.Status === 'Document_Loaded' && !this.loaded)
		{
			// Tell the iframe that we are ready now
			app.collabora.WOPIPostMessage('Host_PostmessageReady', {});

			this._customize_editor();
			this.load = true;
		}
		else if (message.MessageId === 'UI_Close')
		{
			this.on_close();
		}
		else if (message.MessageId === "rev-history")
		{
			this.show_revision_history();
		}
		else if (message.MessageId === 'Clicked_Button' || message.MessageId === 'UI_SaveAs')
		{
			if(message.Values.Id === 'egwSaveAs' || message.MessageId === 'UI_SaveAs')
			{
				this.on_save_as();
			}
		}
	},

	/**
	 * Pass a message into the editor
	 *
	 * @see https://www.collaboraoffice.com/collabora-online-editor-api-reference/#loleaflet-postmessage-actions
	 *	for allowed actions
	 */
	WOPIPostMessage: function(msgId, values)
	{
		if(this.editor_iframe)
		{
			var msg = {
				'MessageId': msgId,
				'SendTime': Date.now(),
				'Values': values
			};

			this.editor_iframe.contentWindow.postMessage(JSON.stringify(msg), '*');
		}
	},

	/**
	 * Do our customizations of the editor
	 *
	 * This is where we add buttons and menu actions and such
	 */
	_customize_editor: function() {

		this.WOPIPostMessage('Insert_Button', {
			id: 'egwSaveAs',
			imgurl: 'images/lc_saveas.svg',
			hint: 'Save As'
		});
	},

	/**
	 * Handle close button
	 *
	 * This is just the default, not sure if we need any more
	 */
	on_close: function on_close() {
		window.close();
	},

	/**
	 * Handle click on Save As
	 *
	 * @TODO: This needs to be finished so it actually works
	 */
	on_save_as: function on_save_as() {
		var filepath = this.et2.getArrayMgr('content').getEntry('path', true);
		var filename = app.filemanager.basename(filepath);
		var path = app.filemanager.dirname(filepath);

		// Get the new name / path
		this._save_as_dialog(path, filename);

		// Update current values
		filepath = path + '/' + filename;

		// Save
		this.WOPIPostMessage('Action_SaveAs', {
			Name: filename,
			Path: path
		});
	},

	/**
	 * Create & show the dialog
	 *
	 * @TODO This implementation is a work arround because of SaveAs feature in
	 * Collabora RC not yet been working. It needs re-implementation as soon as
	 * Collabora SaveAs feature is available.
	 */
	_save_as_dialog: function(path, filename)
	{
		// create file selector
		var vfs_select = et2_createWidget('vfs-select', {
			id:'savefile',
			mode: 'saveas',
			button_caption:"",
			button_label:"save as",
		}, this.et2);
		var self = this;
		var content = self.et2.getArrayMgr('content');

		// try to save before calling Save as
		this.WOPIPostMessage("Action_Save");

		// bind change handler for setting the selected path and calling save
		window.setTimeout(function() {
			jQuery(vfs_select.getDOMNode()).on('change', function (){
			var file_path = vfs_select.get_value();
			if (file_path)
			{
				var parts = file_path.split('/');
				var name = parts.pop();
				var ext = content.getEntry('filename').split('.').pop();
				app.filemanager._request_createNew({
					name: name,
					openasnew: content.getEntry('path'),
					ext: ext,
					dir: parts.join('/')
				});
			}
		})}, 1);
		// start the file selector dialog
		jQuery(vfs_select.getDOMNode()).click();
	},

	/**
	 * Show the revision history list for the file
	 */
	show_revision_history: function show_revision_history()
	{
		jQuery(this.et2.getInstanceManager().DOMContainer).addClass('revisions');
	},

	/**
	 * Hide the revision history list
	 */
	close_revision_history: function hide_revision_history()
	{
		jQuery(this.et2.getInstanceManager().DOMContainer).removeClass('revisions');
	},

	/**
	 * Edit a particular revision of a file, selected from a list
	 */
	edit_revision: function edit_revision(event, widget)
	{
		var row = widget.getArrayMgr('content').explodeKey(widget.id).pop()||0;
		var revision = widget.getArrayMgr('content').getEntry(row);
		egw.json(
			'EGroupware\\collabora\\Ui::ajax_getInfo',
			[revision.path],
			jQuery.proxy(this.init_editor,this),
			this
		).sendRequest(true);
	}
});