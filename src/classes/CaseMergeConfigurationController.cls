public class CaseMergeConfigurationController {
    
    @AuraEnabled
    public static void saveCustomSetting(String fields, String objects) {
        System.debug(fields);
        System.debug(objects);
        CaseMergeSettings__c cs = CaseMergeSettings__c.getOrgDefaults();
        cs.Case_Fields__c = fields;
        cs.Objects_to_Merge__c = objects;
        upsert cs;
    }
    
    @AuraEnabled
    public static CaseMergeSettings__c getCustomSetting() {
        CaseMergeSettings__c cs = CaseMergeSettings__c.getOrgDefaults();
        return cs; 
    }
    
    @AuraEnabled
    public static String getStandardFields() {
        FieldOptions fo = new FieldOptions();
        List<Option> options = new List<Option>();
        Map <String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
        Map <String, Schema.SObjectField> fieldMap = schemaMap.get('Case').getDescribe().fields.getMap();
        for(Schema.SObjectField sfield : fieldMap.Values())
        {
            schema.describefieldresult dfield = sfield.getDescribe();
            if(!dfield.isCustom()) {
            	Option op = new Option(dfield.getLabel(), dfield.getLocalName());
            	options.add(op);    
            }
        }
        fo.options = options;
        return System.JSON.serialize(fo);
    }
    
    @AuraEnabled
    public static String getChildRelationships() {
        String[] types = new String[]{'Case'};
        FieldOptions fo = new FieldOptions();
        Schema.DescribeSobjectResult[] results = Schema.describeSObjects(types);
        for(Schema.DescribeSobjectResult res : results) {
            //System.debug('sObject Label: ' + res.getLabel());
            //System.debug('Number of fields: ' + res.fields.getMap().size());
            //System.debug(res.isCustom() ? 'This is a custom object.' : 'This is a standard object.');
            // Get child relationships
            Schema.ChildRelationship[] rels = res.getChildRelationships();
            if (rels.size() > 0) {
                System.debug(res.getName() + ' has ' + rels.size() + ' child relationships.');
                
        		List<Option> options = new List<Option>();
                for(Schema.ChildRelationship ch : rels) {
                    System.debug('Object: ' + ch.getChildSObject() + ' relationshipName: ' + ch.getRelationshipName() + ' Field: ' + ch.getField());
                    if(ch.getRelationshipName() != null) {
                        Option op = new Option(ch.getRelationshipName(), ch.getRelationshipName());
            			options.add(op); 
                    }
                }
                fo.options = options;
            }
        }
        return JSON.serialize(fo);
    }
    
    public class FieldOptions {
    	List<Option> options;	
    }
    
    public class Option {
    	String label;
        String value;
        
        Option(String label, String value) {
            this.label = label;
            this.value = value;
        }    
    }
}