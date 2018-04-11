import json
from string import ascii_uppercase
import itertools
import pdb
 
def strSeq():
    for n in itertools.count(1):    
        for s in itertools.product(ascii_uppercase, repeat=n):
            yield "".join(s)


def compressAndCoverageRule(cls1InFile, cls2InFile, cls1RuleOutFile, cls2RuleOutFile, obsFile, outObsFile, attrVals, attrMap):
    with open(cls1InFile) as infcls1, \
         open(cls2InFile) as infcls2, \
         open(cls1RuleOutFile, 'w') as outcls1f, \
         open(cls2RuleOutFile, 'w') as outcls2f:

        infcls1.seek(0)
        infcls2.seek(0)

        allFreqItem = set()
        cls1Rule = []
        rid = -1
        for r in infcls1:
            rid = rid + 1
            lhs = r.split('<-')[1]
            lhsList = lhs.strip().split('(')
            itemsets = lhsList[0].split(',')
            measures = lhsList[1][:-1].split(',')

            it = []
            for i in itemsets:
                if "=" in i:
                    oneItem = i.split("=")    
                    attrName = oneItem[0]                
                    attrVal = oneItem[1]

                    allFreqItem.add(attrMap[attrName] + "=" + str(attrVals[attrName].index(attrVal) ) )
                    
                    it.append(attrMap[attrName] + "=" + str(attrVals[attrName].index(attrVal) ) )
            cls1Rule.append({"id": rid, "cls": "cls1", "it":it, "m":[[round(float(measures[0].split("/")[0]), 4), int(measures[0].split("/")[1])], round(float(measures[1]), 4), float(measures[2])]})


        cls2Rule = []
        rid = -1
        for r in infcls2:
            rid = rid + 1
            lhs = r.split('<-')[1]
            lhsList = lhs.strip().split('(')
            itemsets = lhsList[0].split(',')
            measures = lhsList[1][:-1].split(',')

            it = []
            for i in itemsets:
                if "=" in i:
                    oneItem = i.split("=")    
                    attrName = oneItem[0]                
                    attrVal = oneItem[1]

                    allFreqItem.add(attrMap[attrName] + "=" + str(attrVals[attrName].index(attrVal) ) )
                    
                    it.append(attrMap[attrName] + "=" + str(attrVals[attrName].index(attrVal) ) )
            cls2Rule.append({"id": rid, "cls": "cls2", "it":it, "m":[[round(float(measures[0].split("/")[0]), 4), int(measures[0].split("/")[1])], round(float(measures[1]), 4), float(measures[2])]})

        json.dump(cls1Rule, outcls1f)
        json.dump(cls2Rule, outcls2f)

        compressObs(obsFile, outObsFile, cls1Rule, cls2Rule, attrVals, attrMap, list(allFreqItem))


def compressObs(transFile, outF, cls1Rule, cls2Rule, attrVals, attrMap, allFreqItem):
    with open(transFile) as obsf, \
         open(outF, 'w') as outf:

        print( allFreqItem)
        outList = []
        idx = 0
        for o in obsf:
            d={}
            
            obs_lists = o.split(' ')
            obs_list = obs_lists[:-1]
            lab = obs_lists[-1]
            compressed_obs = []
            for i in obs_list:
                ori_attr_val = i.split('=')
                compressed_obs.append(attrMap[ori_attr_val[0]] + "=" + str(attrVals[ori_attr_val[0]].index(ori_attr_val[1]) ))
          
            #d["obs"] = compressed_obs
            if "<" in lab:
                d["lab"] = 2
            else:
                d["lab"] = 1

            d["freqItem"] = list(set(compressed_obs).intersection(allFreqItem))
            cls1ruleidset = set()
            cls2ruleidset = set()
            compressed_obs_set = set(compressed_obs)
            for r in cls1Rule:
                if set(r['it']).issubset(compressed_obs_set):
                    cls1ruleidset.add(r['id'])
                    

            for r in cls2Rule:
                if set(r['it']).issubset(compressed_obs_set):
                    cls2ruleidset.add(r['id'])

            d['ruleid'] = {'cls1': list(cls1ruleidset), 'cls2': list(cls2ruleidset)}
            d['idx'] = idx
            idx = idx + 1
            
            outList.append(d)

            
        outf.write('var allObs ='+json.dumps(outList) + ";\n")
        outf.write('var allFreqItem ='+json.dumps(allFreqItem) + ";\n")
        outf.close()  

def output(cls1InFile, cls2InFile, outStatFile, outCls1File, outCls2File, obsFile, outObsFile):
    outDict = {}
    outDict["name"] = "Census Income"
    outDict["dimensions"] = 14
    outDict["instances"] = 48842
    outDict["source"] = "https://archive.ics.uci.edu/ml/datasets/Census+Income"

    
    
    with open(cls1InFile) as infcls1, \
         open(cls2InFile) as infcls2, \
         open(obsFile) as obsfile, \
         open(outStatFile, 'w') as outf:


        attrs = {}
        data = {}

        maxLen = 0

        for o in obsfile:
            itemsets = o.split(' ')[:-1]
            for i in itemsets:
                if "=" in i:
                    oneItem = i.split("=")    
                    attrName = oneItem[0]                
                    attrVal = oneItem[1].replace('\n', '')
                    
                    if attrName in attrs:
                        attrs[attrName].add(attrVal)
                    else:
                        attrs[attrName] = set([attrVal])
            


        for line in infcls1:            
            lhs = line.split('<-')[1]
            lhsList = lhs.strip().split('(')
            itemsets = lhsList[0].split(',')

            maxLen = max(maxLen, len(itemsets))
           
            
        for line in infcls2:
            lhs = line.split('<-')[1]
            lhsList = lhs.strip().split('(')
            itemsets = lhsList[0].split(',')

            maxLen = max(maxLen, len(itemsets))
          

            

        for a in attrs:
            attrs[a] = list(attrs[a])
    
  
        outDict["attributes"] = attrs
        outDict["attrMap"] = dict(zip(attrs.keys(), list(itertools.islice(strSeq(),len(attrs)))))
        
        # print(outDict)

        

        ''' aggregate length info'''
        infcls1.seek(0)
        infcls2.seek(0)
        
        for l in range(1, maxLen + 1):
            data["len" + str(l)] = {}
            
        outDict["data"] = data
        print(outDict)
        
        ruleID = -1
        for line in infcls1:
            ruleID = ruleID + 1
            
            lhs = line.split('<-')[1]
            lhsList = lhs.strip().split('(')
            itemsets = lhsList[0].split(',')
            #measures = lhsList[1][:-1].split(',')

            curLen = data["len" + str(len(itemsets))] 

            for i in itemsets:
                if "=" in i:
                    oneItem = i.split("=")    
                    attrName = oneItem[0]                
                    attrVal = oneItem[1]
                    
                    if outDict["attrMap"][attrName] in curLen:
                        attrVals = curLen[outDict["attrMap"][attrName]]
                        if outDict["attrMap"][attrName] + "="+str(attrs[attrName].index(attrVal)) in attrVals:
                            specificNameVal = attrVals[outDict["attrMap"][attrName] + "="+str(attrs[attrName].index(attrVal))]
                            if "cls1" in specificNameVal:
                                specificNameVal["cls1"].append(ruleID)
                            else:
                                specificNameVal["cls1"] = [ruleID]
                        else:
                            attrVals[outDict["attrMap"][attrName] +"="+ str(attrs[attrName].index(attrVal))] = {"cls1":[ruleID]}
                    else:
                        tmp ={}
                        tmp[outDict["attrMap"][attrName] + "="+str(attrs[attrName].index(attrVal))] = {"cls1":[ruleID]}
                        curLen[outDict["attrMap"][attrName]] = tmp


        ruleID = -1             
        for line in infcls2:
            ruleID = ruleID + 1
            lhs = line.split('<-')[1]
            lhsList = lhs.strip().split('(')
            itemsets = lhsList[0].split(',')
            #measures = lhsList[1][:-1].split(',')

            curLen = data["len" + str(len(itemsets))] 

            for i in itemsets:
                if "=" in i:
                    oneItem = i.split("=")    
                    attrName = oneItem[0]                
                    attrVal = oneItem[1]
                    
                    if outDict["attrMap"][attrName] in curLen:
                        attrVals = curLen[outDict["attrMap"][attrName]]
                        if outDict["attrMap"][attrName] + "=" + str(attrs[attrName].index(attrVal)) in attrVals:
                            specificNameVal = attrVals[outDict["attrMap"][attrName] + "="+str(attrs[attrName].index(attrVal))]
                            if "cls2" in specificNameVal:
                                specificNameVal["cls2"].append(ruleID)
                            else:
                                specificNameVal["cls2"] = [ruleID]
                        else:
                            attrVals[outDict["attrMap"][attrName] + "="+str(attrs[attrName].index(attrVal))] = {"cls2":[ruleID]}
                    else:
                        tmp ={}
                        tmp[outDict["attrMap"][attrName] + "=" + str(attrs[attrName].index(attrVal))] = {"cls2":[ruleID]}
                        curLen[outDict["attrMap"][attrName]] = tmp
            
       
        json.dump(outDict, outf)

    # attrMap only contains attributes and values from the two class
    # may need iterate over the original observation file to get all attr/val mapped
    ''' use the attribute dict to compress rules'''
    compressAndCoverageRule(cls1InFile, cls2InFile, outCls1File, outCls2File, obsFile, outObsFile, outDict["attributes"], outDict["attrMap"])
   
    
    

if __name__ == "__main__":

    obsFile = "census.dat"
    outObsFile = "obs_census.js"
    class1RuleInputFile = "rules_gt_50k.txt"
    class2RuleInputFile = "rules_lt_50k.txt"
    outStatFile = "ruleStats.json"
    outClass1CompressedFile = "cls1.json"
    outClass2CompressedFile = "cls2.json"
  
    
    output(class1RuleInputFile, class2RuleInputFile, outStatFile, outClass1CompressedFile, outClass2CompressedFile, obsFile, outObsFile)
    

    
    



