sap.ui.define([], function() {
	"use strict";

	return {
		formatBooleanToString: function(bValue){
			if(bValue){
				return bValue.toString();
			}
			else{
				return '';
			}
			
		},
		
		formatStringToBoolean: function(bValue){
			if(bValue === 'true'){
				return true;
			}
			else{
				return false;
			}
			
		},
		
		formatFieldKey: function(sValue){
			
			var oMapper= {
				"Flex Id": 'FlexID',
				"Proto Id": 'ProtoID',
				"Generic": "Generic"
			};
			
			if(sValue && oMapper.hasOwnProperty(sValue)){
				return oMapper[sValue];
			}
			else{
				return 'NOT_FOUND';
			}
		}
	};

});