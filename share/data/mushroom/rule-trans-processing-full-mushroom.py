import json
from string import ascii_uppercase
import itertools
import pdb



def projectionData(cls1InFile, cls2InFile, obsInFile, outRuleFile, outObsFile):
    outputRule = {}
    outputRule["name"] = "Mushroom"
    outputRule["dimensions"] = 22
    outputRule["instances"] = 8124
    outputRule["source"] = "https://archive.ics.uci.edu/ml/datasets/Mushroom"

    
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

            ruleData.append({"id": ruleID, "cls": "Yes", "it":it, "m":[round(float(measures[0].split("/")[0]), 4), round(float(measures[1])/100, 4), float(measures[2])]})


                 
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

            ruleData.append({"id": ruleID, "cls": "No", "it":it, "m":[round(float(measures[0].split("/")[0]), 4), round(float(measures[1])/100, 4), float(measures[2])]})

            
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

                            
            if "e" in lab:
                di["lab"] = 'Yes'
                
            else:
                di["lab"] = 'No'
     
                
            
            
         
            di["item"] = obs_list
            di['idx'] = idx
       
            idx = idx + 1
            
            outObs.append(di)
            


                
        
        outf.write('var obsCoverage = '+json.dumps(outObs) + ";\n")
        outf.close()


if __name__ == "__main__":

    obsFile = "mushroom.dat"
    outObsFile = "obs_mushroom.js"
    outRuleFile = "rules_mushroom.js"
    class1RuleInputFile = "rules_edible.txt"
    class2RuleInputFile = "rules_poisonous.txt"

    projectionData(class1RuleInputFile, class2RuleInputFile, obsFile, outRuleFile, outObsFile)
    
    
    

    
    



