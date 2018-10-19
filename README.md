# CaseMerge

Installation:
1. Make sure lightning is enabled in your org
2. Clone the repo on your local machine and create a build.properties file as below:
    dev.username = <Username>
    dev.password = <Password>
    dev.serverurl = https://test.salesforce.com (in case of production/dev org, use https://login.salesforce.com)
    dev.maxPoll = 600
3. Run ant deploy 
