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
    #attrs = ["MOSTYPE", "MOSHOOFD", "MRELGE", "MGODPR", "PPERSAUT", "MBERMIDD", "MKOOPKLA", "MOPLHOOG", "AFIETS", "PBRAND", "ALEVEN", "CARAVAN"]

    attrs = ['ServeSide','ReturnStrokeType','PointLen', 'PointDiff','GameDiff','P1DominantStrokeHand','P2DominantStrokeHand','P1DominantPlayingDepth',
             'P2DominantPlayingDepth',  'P1ShotsOutsideSidelines',
             'P2ShotsOutsideSidelines', 'P1ShortShots','P2ShortShots','Server_ServeSpeed',
             'Server_WideServe', 'Winner']
    
    infile = '89_Points_nohead.csv'
    outfile = '89_Points.dat'
    fullData(infile, outfile, attrs)
