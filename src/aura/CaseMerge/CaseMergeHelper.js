({
	initCases : function(cmp) {
		var self = this;
        self.getSavedTargets(cmp);
	},
    closeModal: function(cmp, event, helper){
    	var modal = cmp.find("modalEndTargetsDialog");
        $A.util.removeClass(modal,'slds-fade-in-open');

        var backdrop = cmp.find("backdrop");
        $A.util.removeClass(backdrop,'slds-backdrop_open');
    },
    selectAllTargets : function(component, event){
        var selectedHeaderCheck = event.getSource().get("v.value");
        var getAllId = component.find("target");
        if(! Array.isArray(getAllId)){
            if(selectedHeaderCheck == true){
                component.find("target").set("v.value", true);
            }else{
                component.find("target").set("v.value", false);
            }
        }else{
            // check if select all (header checkbox) is true then true all checkboxes on table in a for loop
            // if value is false then make all checkboxes false in else part with play for loop
            if (selectedHeaderCheck == true) {
                for (var i = 0; i < getAllId.length; i++) {
                    component.find("target")[i].set("v.value", true);
                }
            } else {
                for (var i = 0; i < getAllId.length; i++) {
                    component.find("target")[i].set("v.value", false);
                }
            }
        }
    },
    getSelectedTargets: function(cmp){
        var getAllId = cmp.find("target");
        var selectedTargets = [];
        if(!Array.isArray(getAllId)){
            if (getAllId.get("v.value") == true) {
                selectedTargets.push(getAllId.get("v.text"));
            }
        }else{
            // play a for loop and check every checkbox values
            // if value is checked(true) then add those Id (store in Text attribute on checkbox) in delId var.
            for (var i = 0; i < getAllId.length; i++) {
                if (getAllId[i].get("v.value") == true) {
                    selectedTargets.push(getAllId[i].get("v.text"));
                }
            }
        }
    	cmp.set('v.selectedTargets', selectedTargets);
    },
    endTargetsSelected: function(cmp, selectedTargets){
        var childCaseIds = [];
        selectedTargets.forEach(function(target){
        	childCaseIds.push(target.Id);	    
        });
        var self = this;
        var action = cmp.get("c.mergeCases");
        action.setParams({
            masterCaseId: cmp.get("v.recordId"),
            childCases: selectedTargets  
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            console.log(response.getState());
            console.log(response.getReturnValue());
            if (state === "SUCCESS") {
                //Fetch updated targets to display
                self.showToast('Cases(s) ended successfully.', 'success');
                self.getSavedTargets(cmp);
            }
            else {
                console.log(state);
                console.log(response.getError());
                self.showToast(response.getError()[0].message, 'error');
            }
        });
        $A.enqueueAction(action);
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
    getSavedTargets: function(cmp){
        var self = this;
        var action = cmp.get("c.searchDuplicates");
        action.setParams({ recordId : cmp.get("v.recordId") });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                cmp.set('v.mydata', response.getReturnValue());
            }
            else if (state === "INCOMPLETE") {
                //do something
            }
            else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " +
                                 errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });
        $A.enqueueAction(action);
    },
})