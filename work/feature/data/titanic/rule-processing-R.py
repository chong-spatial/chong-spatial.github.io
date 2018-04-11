import json
from string import ascii_uppercase
import itertools
import pdb

def projectionData(ruleFile, obsInFile, outRuleFile, outObsFile):
    outputRule = {}
    outputRule["name"] = "Titanic"
    outputRule["dimensions"] = 4
    outputRule["instances"] = 2201
    outputRule["source"] = "http://ww2.amstat.org/publications/jse/datasets/titanic.txt"

    
    freqItems = set()
    attrs = set()
    ruleData = []  
    
    with open(ruleFile) as ruleF, \
         open(obsInFile) as obsfile, \
         open(outRuleFile, 'w') as outRuleF:


        ruleF.seek(0)


    
        for line in ruleF:
            
            left = line.split('=>')[0]
            right = line.split('=>')[1]

            lefts = left.split()
            rights = right.split()

            ruleID = lefts[0]
            lhsList = lefts[1][1:-1].split(',')
            cls = rights[0][1:-1].split('=')[1]
            measures = rights[1:]

            #pdb.set_trace()
            
            it = []
            for i in lhsList:
                if "=" in i:
                    oneItem = i.split("=")    
                    attrName = oneItem[0]                
                    attrVal = oneItem[1]

                    freqItems.add(i)
                    attrs.add(attrName)

                    it.append(i)

            ruleData.append({"id": ruleID, "cls": cls, "it":it, "m":[round(float(measures[0]), 4), round(float(measures[1]), 4), round(float(measures[2]))]})

            
        outputRule["data"] = ruleData
        outputRule["freqItems"] = list(freqItems)
        outputRule["attributes"] = list(attrs)
    
        #print(outputRule)
        outRuleF.write('var ruleStats ='+json.dumps(outputRule) + ";\n")
        outRuleF.close()
        
    obsOutput(obsInFile, ruleData, outObsFile, freqItems)


def obsOutput(transFile, ruleData, outObsFile, allFreqItems):
    with open(transFile) as obsf, \
         open(outObsFile, 'w') as outf:


        outObs = []
        #rawList = []
        idx = 0
        for o in obsf:
            #pdb.set_trace()
            
            di = {}   
            
            obs_lists = o.split(',')
            obs_list = obs_lists[:-1]
            # assume label index is -1
            lab = obs_lists[-1]

            
            #pdb.set_trace()   
            if "Yes" in lab:
                di["lab"] = 'Yes'
                
                
            else:
                di["lab"] = 'No'
           
                
            
            
         
            di["item"] = obs_list
            di['idx'] = idx
           
            idx = idx + 1
            
            outObs.append(di)
           

       
        outf.write('var obsCoverage = '+json.dumps(outObs) + ";\n")
        outf.close()
  
def obsCoverage(transFile, ruleData, outObsFile, allFreqItems):
    with open(transFile) as obsf, \
         open(outObsFile, 'w') as outf:


        outObs = []
        #rawList = []
        idx = 0
        for o in obsf:
            #pdb.set_trace()
            
            di = {}   
            rawD = {}
            
            obs_lists = o.split(',')
            obs_list = obs_lists[:-1]
            # assume label index is -1
            lab = obs_lists[-1]

            obs_lists_plain = []
            for i in obs_list:
                ori_attr_val = i.split('=')
                oriAttrName = ori_attr_val[0].replace('\n', '')
                oriAttrVal = ori_attr_val[1].replace('\n', '')
                obs_lists_plain.append(oriAttrName + "=" + oriAttrVal)
                #rawD[oriAttrName] = oriAttrVal
                
    
                
            if "1" in lab:
                di["lab"] = 'Yes'
                rawD['cls'] = '1'
                
            else:
                di["lab"] = 'No'
                rawD['cls'] = '0'
                
            
            
         
            cls1ruleid = set()
            cls2ruleid = set()
            obs_set = set(obs_lists_plain)
            
            for r in ruleData:
                #pdb.set_trace()
                if set(r['it']).issubset(obs_set):
                    if(r['cls'] == 'Yes'):
                        cls1ruleid.add(r['id'])
                    elif (r['cls'] == 'No'):
                        cls2ruleid.add(r['id'])

      
                
            #di['coveredRules'] = {'cls1': list(cls1ruleid), 'cls2': list(cls2ruleid)}
            di["freqItem"] = list(obs_set.intersection(allFreqItems))
            di['idx'] = idx
            #d['d'] = rawD
            idx = idx + 1
            if len(cls1ruleid) != 0 or len(cls2ruleid) != 0:
                outObs.append(di)
            #rawList.append(rawD)


                
        #outf.write('var rawObs ='+json.dumps(rawList) + ";\n")
       
        outf.write('var obsCoverage = '+json.dumps(outObs) + ";\n")
        outf.close()


if __name__ == "__main__":

    obsFile = "titanic.dat"
    outObsFile = "obs_titanic.js"
    outRuleFile = "rules_titanic.js"
    inRuleFile = "rules_r.txt"


    projectionData(inRuleFile, obsFile, outRuleFile, outObsFile)
    

