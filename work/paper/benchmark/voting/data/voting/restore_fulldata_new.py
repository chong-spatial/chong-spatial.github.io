import pdb


def fullData(inFile, outFile, attrs, allowMissingData):
    with open(inFile) as inf, \
         open(outFile, 'w') as ouf:

        print(attrs)
        for l in inf:
            newl = []
            index = 0
            r = l.strip().split(',')
            for a in r:
                #pdb.set_trace()
                if not allowMissingData and hasMissingData(r):
                    break
                else:
                    if a == '?':
                        a='u'
                    newl.append(attrs[index] + '=' + a)
                    index = index + 1
                
                #newl.append(attrs[index] + '=' + a)
                #index = index + 1
            if newl:
                ouf.write(','.join(newl)+'\n')

    ouf.close()
   
                      
def hasMissingData(l):    
    for i in l:
        if i == '?':
            return True            

    return False
        
        

if __name__ == "__main__":
    attrs = [
        "Class",
        "infants",#"handicapped-infants",
        "water", #"water-project-cost-sharing",
        "budget", #"adoption-of-the-budget-resolution",
        "fee-freeze",#"physician-fee-freeze",
        "el-salvador", #"el-salvador-aid",
        "religious", #"religious-groups-in-schools",
        "satellite", #"anti-satellite-test-ban",
        "nicaraguan", #"aid-to-nicaraguan-contras",
        "mx-missile", #"mx-missile",
        "immigration", #"immigration",
        "synfuels", #"synfuels-corporation-cutback",
        "education", #"education-spending",
        "superfund", #"superfund-right-to-sue",
        "crime", #"crime",
        "duty-free", #"duty-free-exports",
        "export" #"export-administration-act-south-africa"
        ]
        
    infile = 'raw.txt'
    outfile = 'voting_for_AR.dat'
    allow_missingData = True
    fullData(infile, outfile, attrs, allow_missingData)
