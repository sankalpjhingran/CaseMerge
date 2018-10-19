public class CaseMergeController {
    
    @AuraEnabled
    public static void mergeCases(String masterCaseId, List<Case> childCases) {
        System.debug(masterCaseId);
        Case masterCase = (Case)Database.query('SELECT Id, CaseNumber FROM Case WHERE Id =: masterCaseId')[0];
        SavePoint sv = Database.setSavepoint();
        System.debug('mergeCases====>');
        try {
        //Step1: Change parent case if for child cases to master case id
        Set<Id> childCaseIds = new Set<Id>();
        for(Case childCase : childCases) {
            childCase.ParentId = masterCaseId;
            childCase.Status = 'Closed - Duplicate';
            childCaseIds.add(childCase.Id);
        }
        update childCases;
            
        //Step2: Update case relationship field on child relationships of child records to mastercaseid
		CaseMergeSettings__c cs = CaseMergeSettings__c.getOrgDefaults();
        List<String> objectsToMerge = cs.Objects_to_Merge__c.split(',');
        Map<String, String> objNameToFieldNameMapToUpdate = new Map<String, String>();
       	Map<String, String> objNameToFieldNameMapToCreate = new Map<String, String>();
        Map<String, Schema.SObjectType> objRelationshipNameToSObjectTypeMap = new Map<String, Schema.SObjectType>();
            
        // sObject types to describe
        String[] types = new String[]{'Case'};
        
        // Make the describe call
        Schema.DescribeSobjectResult[] results = Schema.describeSObjects(types);
            
        // For each returned result, get some info
        for(Schema.DescribeSobjectResult res : results) {
            Schema.ChildRelationship[] rels = res.getChildRelationships();
            if (rels.size() > 0) {
                for(Schema.ChildRelationship ch : rels) {
                    if(objectsToMerge.contains(ch.getRelationshipName())) {
                        objRelationshipNameToSObjectTypeMap.put(ch.getRelationshipName(), ch.getChildSObject());
                        if(ch.getChildSObject().getDescribe().isUpdateable() && 
                           						ch.getField().getDescribe().isUpdateable()) {
                        	objNameToFieldNameMapToUpdate.put(ch.getRelationshipName(), ch.getField().getDescribe().getName());    
                        }else if(ch.getChildSObject().getDescribe().isCreateable()) {
                        	objNameToFieldNameMapToCreate.put(ch.getRelationshipName(), ch.getField().getDescribe().getName());	    
                        }
                        
                    }
                }
            }
        }
            
            if(objectsToMerge.size() < 20) {
                //Prepare a dynamic soql
                String fields = 'SELECT Id, ';
                
                String childobjects = '';
                for(String objectName : objNameToFieldNameMapToUpdate.keySet()) {
                    childobjects+= '(SELECT Id, ' + objNameToFieldNameMapToUpdate.get(objectName) + ' FROM ' + objectName + '), ';	    
                }
                
                for(String objectName : objNameToFieldNameMapToCreate.keySet()) {
                    if(objectName == 'CaseComments') {
                    	childobjects+= '(SELECT Id, CommentBody, ' + objNameToFieldNameMapToCreate.get(objectName) + ' FROM ' + objectName + '), ';	    
                    } else {
     					childobjects+= '(SELECT Id, ' + objNameToFieldNameMapToCreate.get(objectName) + ' FROM ' + objectName + '), ';	    
                    }
                }
                String whereFilter = ' CaseNumber FROM Case WHERE Id IN: childCaseIds';
                String finalQuery = fields + childobjects + whereFilter;
                System.debug(finalQuery);
                List<Case> casesToUpdate = Database.query(finalQuery);
                
                List<Sobject> objectsToUpdate = new List<SObject>();
                List<Sobject> objectsToCreate = new List<SObject>();
                for(Case c : casesToUpdate) {
                    for(String relationshipObj : objNameToFieldNameMapToUpdate.keySet()) {
                        for(SObject sobj : c.getSObjects(relationshipObj)) {
                        	sobj.put(objNameToFieldNameMapToUpdate.get(relationshipObj), masterCaseId);
                            objectsToUpdate.add(sobj);
                        }    
                    }
                    
                    for(String relationshipObj : objNameToFieldNameMapToCreate.keySet()) {
                        for(SObject sobj : c.getSObjects(relationshipObj)) {
                            SObject newSObj = sobj.clone(false, true, true, false);
                            newSObj.put(objNameToFieldNameMapToCreate.get(relationshipObj), masterCaseId);
                            System.debug('relationshipObj===> ' + relationshipObj);
                            if(relationshipObj == 'CaseComments') {
                                String newComment = '===Merged from Case#' + c.CaseNumber + ' === \n';
                            	newSObj.put('CommentBody', newComment + sobj.get('CommentBody'));
                                System.debug('relationshipObj===> ' + relationshipObj);
                            }
                            objectsToCreate.add(newSObj);
                        }    
                    }
                }
                update objectsToUpdate;
                insert objectsToCreate; 
            }
        
        } catch(Exception e) {
            Database.rollback(sv);
            throw new AuraHandledException(e.getMessage());
        } 
    }

    @AuraEnabled
    public static void deleteTarget(String targetId){
    	Target__c tgt = new Target__c(id=targetId);
        delete tgt;
    }

    @AuraEnabled
    public static void updateChangeStatus(String changeId, String status){
    	Change__c change = new Change__c(id=changeId);
        change.Status__c = status;
        update change;
    }

    @AuraEnabled
    public static void updateTargets(List<Target__c> targets){
        if(!targets.isEmpty()) update targets;
    }

    @AuraEnabled
    public static List<Case> searchDuplicates(String recordId){
        CaseMergeSettings__c cs = CaseMergeSettings__c.getOrgDefaults();
        Case c = (Case)Database.query('SELECT Id,' + cs.Case_fields__c + ' FROM Case WHERE Id =: recordId')[0];
        
        List<String> fields = cs.Case_Fields__c.split(',');
        String query =  ' SELECT id,casenumber, subject, status, origin, description, createddate, createdby.id ';
        String whereFilter = ' FROM Case WHERE ';
        
        for(String str : fields) {
            whereFilter+= ' ' + str + ' LIKE ' + '\'%' + c.get(str) + '%\'' + ' AND '; 
        }
        
        whereFilter+= ' isClosed = false AND Id != : recordId';
		String limitFilter = ' LIMIT 100 ';
		String finalQuery = query + whereFilter + limitFilter;
        
        List<Case> searchedCases = new List<Case>();
        
        try{
            searchedCases = Database.query(finalQuery);
        }catch(Exception ex){
            System.debug('Error: ' + ex.getMessage());
            return null;
        }
        return searchedCases;
    }
}