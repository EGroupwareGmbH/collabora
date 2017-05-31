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
		switch(name)
		{
			case 'collabora.editor':
				this.init_editor();
				break;
		}
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

		// Check to see if it's something we can handle
		if (action.id === 'collabora' && mime && this.discovery && this.discovery[mime])
		{
			/*
			var request = egw.json('EGroupware\\collabora\\Ui::ajax_get_token', [data.data.ino],
				function(token) {
					debugger;
					// Open editor
					if(typeof token === 'string')
					{
						window.open(this.discovery[mime].urlsrc +
							'WOPISrc=' + egw.link('/collabora/wopi/files/'+data.data.ino) +
							'&token=' + token
						);
					}
				}, this, true, this
			).sendRequest();
			*/
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
	 * Initialize editor and post the form that starts it
	 *
	 * @see https://wopi.readthedocs.io/en/latest/hostpage.html
	 */
	init_editor: function init_editor()
	{
		debugger;
		var values = this.et2.getValues(this.et2.getRoot());
		var form_html = `
		<form id="form" name="form" target="editor_frame"
				action="${values['url']}" method="post">
			<input name="access_token" value="${values['token']}" type="hidden"/>
			<input name="access_token_ttl" value="${values['token_ttl']}>" type="hidden"/>
		</form>`;
		jQuery('body').append(form_html);
		document.getElementById('form').submit();
	}
});