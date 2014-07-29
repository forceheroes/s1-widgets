/**	Calendar widget for Android:
	We need a way to reliably fetch the JavaScript date variable from the input field whether it's a HTML5 native field or the enhanced datepicker one.
	
	@param selector A valid jQuery selector for the date field.
	@return Miliseconds since Jan 1st 1970 UTC
*/
function getDate(selector){
	var field = jQuery(selector);
	if(field.length == 1){
		return (field.attr('type') == 'date' ? new Date(field.val()) : field.date('getDate')).getTime();
	}
	return null;
}

/** Function enables/disables the submit button depending on whether all required fields are filled in.
	In Salesforce1 context it calls appropriate publisher function.
*/
function checkRequiredFields(){
	var enable = true;
	jQuery(':input[required]').each(function(){
		var s = jQuery(this).val();
		if(s == null || s.trim().length == 0){
			return enable = false;
		}
	});

	if(typeof sforce != 'undefined'){
		Sfdc.canvas.publisher.publish({name:'publisher.setValidForSubmit', payload: enable});
	} else {
		if(enable){
			jQuery('#submit').removeClass('ui-state-disabled');
		} else {
			jQuery('#submit').addClass('ui-state-disabled');
		}
	}
}

/* 	Generic function to handle the result of hitting "Submit" button
	(assuming it's called to handle a Visualforce Remoting call; if you intend to use it in different context - fake / adapt the params accordingly?)
	
	On error - displays the error, duh.
	On success:
		commented out versions will navigate to previous page (whatever was under the "cancel" link) or if we're in S1 context - close the publisher.
		the uncommented versions navigate to newly created record's page.
*/
function onSubmitComplete(result, event){
	if(event.status){
		jQuery('#success').text('Success!');
		if(typeof sforce != 'undefined'){
			// Sfdc.canvas.publisher.publish({ name: 'publisher.close', payload:{ refresh:'true'}});
			sforce.one.navigateToSObject(result, 'detail');
		} else {
			// top.location.href = jQuery('#cancel').attr('href'); // "top" takes care of being called in iframe (the Chatter action as seen in regular browser)
			top.location.href = '/' + result;
		}
	} else if (event.type === 'exception'){
		jQuery('#error').text(event.message);
	}
}

/* 	Initialize the form.
	In S1 context - hide the "homemade" title bar & attach function that should be called when publisher's submit button is clicked.
	In desktop context - attach same function to the regular submit button.
*/
function init(makeDateInputsReadonly){
	if(typeof sforce != 'undefined'){
		jQuery('div#header').hide();
		Sfdc.canvas.publisher.subscribe({name: 'publisher.post', onData: onSubmit});
	} else {
		jQuery('#mainForm').submit(onSubmit); // this is better than binding to button's onclick as it'll handle submit by hitting Enter too
	}
	// On Android disable the onscreen keyboard for date inputs forcing the user to use the calendar widget.
	// Otherwise the combined popup + fullscreen keyboard will really annoy your users.
	if(makeDateInputsReadonly){
		$("input[type='text'][data-role='date']").attr('readonly', 'readonly');
	}
	jQuery(':input[required]').change(checkRequiredFields);
}