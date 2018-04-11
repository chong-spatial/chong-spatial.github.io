def fullData(inFile, outFile, attrs):
    with open(inFile) as inf, \
         open(outFile, 'w') as ouf:

        for l in inf:
            newl = []
            index = 0
            r = l.split(',')
            for a in r:
                '''
                if a =='?':
                    break
                else:
                    newl.append(attrs[index] + '=' + a)
                    index = index + 1
                '''
                newl.append(attrs[index] + '=' + a)
                index = index + 1
            ouf.write(','.join(newl))
   
                      
                

if __name__ == "__main__":
    attrs = [
        'cls',
        'cap-shape',
        'cap-surface',
        'cap-color',
        'bruises',
        'odor',
        'gill-attachment',
        'gill-spacing',
        'gill-size',
        'gill-color',
        'stalk-shape',
        'stalk-root',
        'stalk-surface-above-ring',
        'stalk-surface-below-ring',
        'stalk-color-above-ring',
        'stalk-color-below-ring',
        'veil-type',
        'veil-color',
        'ring-number',
        'ring-type',
        'spore-print-color',
        'population',
        'habitat'
        ]
    infile = 'agaricus-lepiota.data'
    outfile = 'mushroom.dat'
    fullData(infile, outfile, attrs)
