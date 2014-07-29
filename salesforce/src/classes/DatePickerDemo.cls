global with sharing class DatePickerDemo {

	public String deviceType {get; private set;}

	public DatePickerDemo(){
		String userAgent = ApexPages.currentPage().getHeaders().get('User-Agent').toLowerCase();
		if (userAgent.contains('iphone') || userAgent.contains('ipad') || userAgent.contains('ipod')){
			deviceType = 'iPhone';
		}else if (userAgent.contains('android')){
			deviceType = 'Android';
		} else {
			deviceType = 'Desktop';
		}
	}
	
	/* This method has to be global or the Chatter Publisher will throw errors when used in regular browser window:
		"Visualforce Remoting: 
		Javascript proxies were not generated for controller DatePickerDemo: may not use public remoted methods inside an iframe."
		
		This means the whole class has to be global too.
	*/
	@RemoteAction
	global static Id create(sObject o){
		insert o;
		return o.Id;
	}
}