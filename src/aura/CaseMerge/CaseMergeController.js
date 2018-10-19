({
    init : function (cmp, event, helper) {
        helper.initCases(cmp);
    },
    refresh: function(cmp, event, helper){
    	helper.initCases(cmp);
    },
    closeModalDialog: function(cmp, event, helper){
    	helper.closeModal(cmp, event, helper);
    },
    handleActionMenu: function(cmp, event, helper) {
        var selectedMenuItemValue = event.getParam("value");
        var target = event.getSource().get("v.value");
        switch (selectedMenuItemValue) {
            case 'edit': {
                var editRecordEvent = $A.get("e.force:editRecord");
                editRecordEvent.setParams({
                    "recordId": target.Id
                });
                editRecordEvent.fire();
            }
                break;
            case 'delete': {
                var action = cmp.get("c.deleteTarget");
                action.setParams({
                    "targetId": target.Id
                });
                action.setCallback(this, function(response) {
                    var state = response.getState();
                    if (state === "SUCCESS") {
                        var toastEvent = $A.get("e.force:showToast");
                        toastEvent.setParams({
                            "message": "Target " + target.Target_Name__c +  " was deleted successfully!",
                            "type": "success",
                        });
                        helper.initTargets(cmp);
                        toastEvent.fire();
                    }else{
                        var toastEvent = $A.get("e.force:showToast");
                        toastEvent.setParams({
                            "message": response.getErrors(),
                            "type": "error",
                        });
                        toastEvent.fire();
                    }
                });
                $A.enqueueAction(action);
            }
                break;
        }
    },
    //For select all Checkbox
    selectAll : function(component, event, helper) {
        helper.selectAllTargets(component, event);
    },
    mergeSelectedCases : function(cmp, event, helper){
        helper.getSelectedTargets(cmp);
        var selectedTargets = cmp.get('v.selectedCases');
        console.log(selectedTargets);
        if(!selectedTargets.length) {
            helper.showToast('No case(s) selected!', 'error');
        } else {
        	helper.endTargetsSelected(cmp, selectedTargets);    
        }
    },
    mergeAllCases : function(cmp, event, helper){
        console.log('Merge all cases....');
        var allTargets = cmp.get('v.mydata');
        console.log(allTargets);
       	helper.endTargetsSelected(cmp, allTargets);    
    },
    
    // this function automatic call by aura:waiting event  
    showSpinner: function(component, event, helper) {
       // make Spinner attribute true for display loading spinner 
        component.set("v.Spinner", true); 
   },
    
 // this function automatic call by aura:doneWaiting event 
    hideSpinner : function(component,event,helper){
     // make Spinner attribute to false for hide loading spinner    
       component.set("v.Spinner", false);
    }
    
})