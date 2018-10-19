({
   init: function (cmp) {
        var action = cmp.get("c.getStandardFields");
        var _this = this;
        action.setCallback(this, function(response) {
            console.log(response.getState());
            var state = response.getState();
            if (state === "SUCCESS") {
				var options = JSON.parse(response.getReturnValue());
                console.log(options.options);
                cmp.set("v.options", options.options);
            } else if (state === "ERROR") {
            } else {
                console.log("Unknown error");
            }
        });
        $A.enqueueAction(action);
       
       var actioncr = cmp.get("c.getChildRelationships");
        actioncr.setCallback(this, function(response) {
            console.log(response.getState());
            var state = response.getState();
            if (state === "SUCCESS") {
				var options = JSON.parse(response.getReturnValue());
                console.log(options.options);
                cmp.set("v.optionscr", options.options);
            } else if (state === "ERROR") {
            } else {
                console.log("Unknown error");
            }
        });
        $A.enqueueAction(actioncr);
       
       var actiongetsettings = cmp.get("c.getCustomSetting");
        actiongetsettings.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
				//var options = JSON.parse(response.getReturnValue());
                var res = response.getReturnValue();
                var fields = res.Case_Fields__c.split(',');
                var objects = res.Objects_to_Merge__c.split(',');
                cmp.set("v.selectedItems", fields);
                cmp.set("v.selectedItemscr", objects);
            } else if (state === "ERROR") {
            } else {
                console.log("Unknown error");
            }
        });
        $A.enqueueAction(actiongetsettings);
    },
    
    saveConfig : function(cmp, helper) {
        var fields = cmp.get("v.selectedItems").join(',');
        var objects = cmp.get("v.selectedItemscr").join(',');
		var self = this;
    	var actioncr = cmp.get("c.saveCustomSetting");
        actioncr.setParams({fields : fields, objects : objects});
        actioncr.setCallback(this, function(response) {
            console.log(response.getState());
            var state = response.getState();
            if (state === "SUCCESS") {
				console.log(response.getReturnValue());
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "message": 'Configuration saved successfully!',
                    "type": 'success',
                    "duration": "1000"
                });
                toastEvent.fire();
            } else if (state === "ERROR") {
            } else {
                console.log("Unknown error");
            }
        });
        $A.enqueueAction(actioncr);		    
    },
    showToast: function(message, toastType){
    	var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "message": message,
            "type": toastType,
            "duration": "1000"
        });
        toastEvent.fire();
	},
    handleChange: function (cmp, event) {
        // This will contain the string of the "value" attribute of the selected option
        var selectedOptions = cmp.get("v.selectedItems");
        var selectedOptionValue = event.getParam("value");        
        var listSelectedItems = selectedOptions;
        console.log(selectedOptionValue);
        console.log(selectedOptions);
        if(selectedOptions && selectedOptions.length) {
            listSelectedItems.push(selectedOptionValue);
            
            var selectedItemsMap = new Map();
            listSelectedItems.forEach(function(item){
                selectedItemsMap.set(item, item);	    
            });
            listSelectedItems =  Array.from(selectedItemsMap.values());
            console.log(listSelectedItems);
        } else {
            listSelectedItems = selectedOptionValue; 
            console.log(listSelectedItems);
        }
        cmp.set("v.selectedItems", listSelectedItems);
    },
    handleChildRelationshipChange: function (cmp, event) {
        // This will contain the string of the "value" attribute of the selected option
        var selectedOptions = cmp.get("v.selectedItemscr");
        var selectedOptionValue = event.getParam("value");        
        var listSelectedItems = selectedOptions;
        console.log(selectedOptionValue);
        console.log(selectedOptions);
        if(selectedOptions && selectedOptions.length) {
            listSelectedItems.push(selectedOptionValue);
            
            var selectedItemsMap = new Map();
            listSelectedItems.forEach(function(item){
                selectedItemsMap.set(item, item);	    
            });
            listSelectedItems =  Array.from(selectedItemsMap.values());
            console.log(listSelectedItems);
        } else {
            listSelectedItems = selectedOptionValue; 
            console.log(listSelectedItems);
        }
        cmp.set("v.selectedItemscr", listSelectedItems);
    },
    
    clear :function(cmp, evt, helper){
        var selectedPillId = evt.getSource().get("v.name");
        console.log(selectedPillId);
        var allPillsList = cmp.get("v.selectedItems"); 
        
        allPillsList.forEach(function(pill, index) {
            if(pill == selectedPillId) {
            	allPillsList.splice(index, 1);	    
            }
        })
        cmp.set("v.selectedItems", allPillsList);     
    },
    clearcr :function(cmp, evt, helper){
        var selectedPillId = evt.getSource().get("v.name");
        console.log(selectedPillId);
        var allPillsList = cmp.get("v.selectedItemscr"); 
        
        allPillsList.forEach(function(pill, index) {
            if(pill == selectedPillId) {
            	allPillsList.splice(index, 1);	    
            }
        })
        cmp.set("v.selectedItemscr", allPillsList);     
    },
    close : function(cmp, evt, helper) {
        helper.closeModal(cmp);
    },
})