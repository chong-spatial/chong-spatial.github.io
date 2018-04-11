import pdb


def fullData(inFile, outFile, attrs):
    labDict = {
  'Class': {'0': 'Crew', '1': '1st', '2': '2nd', '3': '3rd'},
  'Age': {'0': 'Child', '1': 'Adult'},
  'Sex': {'0': 'Female', '1': 'Male'},
  'Survived': {'0': 'No', '1': 'Yes'}

}
    with open(inFile) as inf, \
         open(outFile, 'w') as ouf:

 
        
        for l in inf:
            newl = []
            index = 0

            r = l.split()
            
            for v in r:
                '''
                if a =='?':
                    break
                else:
                    newl.append(attrs[index] + '=' + a)
                    index = index + 1
                '''
                newl.append(attrs[index] + '=' + labDict[attrs[index]][v])                
                index = index + 1
        
            ouf.write(','.join(newl)+'\n')
   
                      
                

if __name__ == "__main__":
    attrs = ["Class", "Age", "Sex", "Survived"]
    infile = 'titanic_nohead.csv'
    outfile = 'titanic.dat'
    fullData(infile, outfile, attrs)
