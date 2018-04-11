import json
from string import ascii_uppercase
import itertools
import pdb



def projectionData(cls1InFile, cls2InFile, obsInFile, outRuleFile, outObsFile):
    outputRule = {}
    outputRule["name"] = "Voting"
    outputRule["dimensions"] = 16
    outputRule["instances"] = 435
    outputRule["source"] = "https://archive.ics.uci.edu/ml/datasets/Congressional+Voting+Records"

    
    freqItems = set()
    attrs = set()
    ruleData = []  
    
    with open(cls1InFile) as infcls1, \
         open(cls2InFile) as infcls2, \
         open(obsInFile) as obsfile, \
         open(outRuleFile, 'w') as outRuleF:


        infcls1.seek(0)
        infcls2.seek(0)

        
        ruleID = -1
        for line in infcls1:
            ruleID = ruleID + 1
            
            lhs = line.split('<-')[1]
            lhsList = lhs.strip().split('(')
            itemsets = lhsList[0].split(',')
            measures = lhsList[1][:-1].split(',')
            
            it = []
            for i in itemsets:
                if "=" in i:
                    oneItem = i.split("=")    
                    attrName = oneItem[0]                
                    attrVal = oneItem[1]

                    freqItems.add(i)
                    attrs.add(attrName)

                    it.append(i)

            ruleData.append({"id": ruleID, "cls": "R", "it":it, "m":[round(float(measures[0].split("/")[0]), 4), round(float(measures[1])/100, 4), float(measures[2])]})


                 
        for line in infcls2:
            ruleID = ruleID + 1
            
            lhs = line.split('<-')[1]
            lhsList = lhs.strip().split('(')
            itemsets = lhsList[0].split(',')
            measures = lhsList[1][:-1].split(',')
            
            it = []
            for i in itemsets:
                if "=" in i:
                    oneItem = i.split("=")    
                    attrName = oneItem[0]                
                    attrVal = oneItem[1]

                    freqItems.add(i)
                    attrs.add(attrName)

                    it.append(i)

            ruleData.append({"id": ruleID, "cls": "D", "it":it, "m":[round(float(measures[0].split("/")[0]), 4), round(float(measures[1])/100, 4), float(measures[2])]})

            
        outputRule["data"] = ruleData
        outputRule["freqItems"] = list(freqItems)
        outputRule["attributes"] = list(attrs)
    
        #print(outputRule)
        outRuleF.write('var ruleStats ='+json.dumps(outputRule) + ";\n")
        outRuleF.close()
        
    obsCoverage(obsInFile, ruleData, outObsFile, freqItems)
  
def obsCoverage(transFile, ruleData, outObsFile, allFreqItems):
    with open(transFile) as obsf, \
         open(outObsFile, 'w') as outf:


        outObs = []
        idx = 0
        for o in obsf:                           
            di = {}   
            
            obs_lists = o.split(',')
            obs_list = [x.replace('\n', '') for x in obs_lists[1:]]
            # assume label index is 0
            lab = obs_lists[0]

                            
            if "republican" in lab:
                di["lab"] = 'R'
                
            else:
                di["lab"] = 'D'
     
                
            
            
         
            di["item"] = obs_list
            di['idx'] = idx
       
            idx = idx + 1
            
            outObs.append(di)
            


                
        
        outf.write('var obsCoverage = '+json.dumps(outObs) + ";\n")
        outf.close()


if __name__ == "__main__":

    obsFile = "voting_for_AR.dat"
    outObsFile = "obs_voting.js"
    outRuleFile = "rules_voting.js"
    class1RuleInputFile = "rules_republican.txt"
    class2RuleInputFile = "rules_democrat.txt"

    projectionData(class1RuleInputFile, class2RuleInputFile, obsFile, outRuleFile, outObsFile)
    
    
    

    
    



