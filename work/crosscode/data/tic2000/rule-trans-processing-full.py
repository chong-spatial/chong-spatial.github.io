import json
from string import ascii_uppercase
import itertools
import pdb
 
def strSeq():
    for n in itertools.count(1):    
        for s in itertools.product(ascii_uppercase, repeat=n):
            yield "".join(s)


def processRule(cls1InFile, cls2InFile, cls1RuleOutFile, cls2RuleOutFile, obsFile, outObsFile, outRuleFile, attrVals, ruleStats):            
    with open(cls1InFile) as infcls1, \
         open(cls2InFile) as infcls2, \
         open(cls1RuleOutFile, 'w') as outcls1f, \
         open(outRuleFile, 'w') as outRulesf, \
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

                    allFreqItem.add(i.replace('\n', ''))
                    
                    it.append(i)
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

                    allFreqItem.add(i)
                    
                    it.append(i)
            cls2Rule.append({"id": rid, "cls": "cls2", "it":it, "m":[[round(float(measures[0].split("/")[0]), 4), int(measures[0].split("/")[1])], round(float(measures[1]), 4), float(measures[2])]})

        json.dump(cls1Rule, outcls1f)
        json.dump(cls2Rule, outcls2f)

        
        outRulesf.write('var ruleStats ='+json.dumps(ruleStats) + ";\n")
        outRulesf.write('var cls1Rule ='+json.dumps(cls1Rule) + ";\n")
        outRulesf.write('var cls2Rule ='+json.dumps(cls2Rule) + ";")
        outRulesf.close()
        
        summerizeObs(obsFile, outObsFile, cls1Rule, cls2Rule, attrVals, list(allFreqItem))


def summerizeObs(transFile, outF, cls1Rule, cls2Rule, attrVals, allFreqItem):
    with open(transFile) as obsf, \
         open(outF, 'w') as outf:

        print( allFreqItem)
        outList = []
        rawList = []
        idx = 0
        for o in obsf:                           
            d={}   
            rawD = {}
            
            obs_lists = o.split(',')
            obs_list = obs_lists[1:]
            lab = obs_lists[0]

            obs_lists_good = []
            for i in obs_list:
                ori_attr_val = i.split('=')
                obs_lists_good.append(ori_attr_val[0].replace('\n', '') + "=" + ori_attr_val[1].replace('\n', '') )
                rawD[ori_attr_val[0]] = ori_attr_val[1].replace('\n', '')
    
                
            if "1" in lab:
                d["lab"] = 1
                rawD['cls'] = '1'
                
            else:
                d["lab"] = 2
                rawD['cls'] = '0'
                
            
            
            d["freqItem"] = list(set(obs_lists_good).intersection(allFreqItem))
            cls1ruleidset = set()
            cls2ruleidset = set()
            obs_set = set(obs_lists_good)
            for r in cls1Rule:
                if set(r['it']).issubset(obs_set):
                    cls1ruleidset.add(r['id'])

            for r in cls2Rule:
                if set(r['it']).issubset(obs_set):
                    cls2ruleidset.add(r['id'])
                
            d['ruleid'] = {'cls1': list(cls1ruleidset), 'cls2': list(cls2ruleidset)}
            d['idx'] = idx
            d['d'] = rawD
            idx = idx + 1
            outList.append(d)
            #rawList.append(rawD)

        #outf.write('var rawObs ='+json.dumps(rawList) + ";\n")
        outf.write('var allObs ='+json.dumps(outList) + ";\n")
        outf.write('var allFreqItem ='+json.dumps(allFreqItem) + ";\n")
        outf.close()  

def output(cls1InFile, cls2InFile, outStatFile, outCls1File, outCls2File, obsFile, outObsFile, outRuleFile):
    outDict = {}
    outDict["name"] = "COIL2000"
    outDict["dimensions"] = 86
    outDict["instances"] = 9822
    outDict["source"] = "http://archive.ics.uci.edu/ml/datasets/Insurance+Company+Benchmark+(COIL+2000)"

    
    
    with open(cls1InFile) as infcls1, \
         open(cls2InFile) as infcls2, \
         open(obsFile) as obsfile, \
         open(outStatFile, 'w') as outf:


        attrs = {}
        data = {}

        maxLen = 0

        for o in obsfile:
            itemsets = o.split(',')[1:]
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
        #outDict["attrMap"] = dict(zip(attrs.keys(), list(itertools.islice(strSeq(),len(attrs)))))
        
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
                    
                    if attrName in curLen:
                        attrVals = curLen[attrName]
                        if attrName + "=" + attrVal in attrVals:
                            specificNameVal = attrVals[attrName + "=" + attrVal]
                            if "cls1" in specificNameVal:
                                specificNameVal["cls1"].append(ruleID)
                            else:
                                specificNameVal["cls1"] = [ruleID]
                        else:
                            attrVals[attrName + "=" + attrVal] = {"cls1":[ruleID]}
                    else:
                        tmp ={}
                        tmp[attrName + "=" + attrVal] = {"cls1":[ruleID]}
                        curLen[attrName] = tmp


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
                    
                    if attrName in curLen:
                        attrVals = curLen[attrName]
                        if attrName + "=" + attrVal in attrVals:
                            specificNameVal = attrVals[attrName + "=" + attrVal]
                            if "cls2" in specificNameVal:
                                specificNameVal["cls2"].append(ruleID)
                            else:
                                specificNameVal["cls2"] = [ruleID]
                        else:
                            attrVals[attrName + "=" + attrVal] = {"cls2":[ruleID]}
                    else:
                        tmp ={}
                        tmp[attrName + "=" + attrVal] = {"cls2":[ruleID]}
                        curLen[attrName] = tmp
            
       
        json.dump(outDict, outf) # rule states

  
    processRule(cls1InFile, cls2InFile, outCls1File, outCls2File, obsFile, outObsFile, outRuleFile, outDict["attributes"],outDict)
   
    
    

if __name__ == "__main__":

    obsFile = "ticdata2000.dat"
    outObsFile = "obs_coil.js"
    outRuleFile = "rules_coil.js"
    class1RuleInputFile = "caravan1_new.txt"
    class2RuleInputFile = "caravan0.txt"
    outStatFile = "ruleStats.json"
    outClass1CompressedFile = "caravanyes.json"
    outClass2CompressedFile = "caravanno.json"
  
    
    output(class1RuleInputFile, class2RuleInputFile, outStatFile, outClass1CompressedFile, outClass2CompressedFile, obsFile, outObsFile, outRuleFile)
    

    
    



